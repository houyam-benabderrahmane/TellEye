"""
TellEye — Google Earth Engine Integration
==========================================
Matches EXACTLY the training pipeline from gee_validation_fixed_v2.ipynb:
  - Geometric median composite (not temporal median)
  - Bare-soil mask: NDVI < 0.25, NBR2 < 0.125, BSI > 0.021
  - SCL cloud masking
  - Months March–November only
  - All bands resampled to 20m (bilinear)
  - 100m buffer around each point
  - Automatic fallback to relaxed mask if < 3 pixels
"""

import ee
import numpy as np

# ── Config — identical to training ────────────────────────────
GEE_PROJECT    = "coherent-code-487416-f5"
BANDS          = ["B1","B2","B3","B4","B5","B6","B7","B8","B8A","B9","B11","B12"]
COLLECTION     = "COPERNICUS/S2_SR_HARMONIZED"
YEAR_START     = 2022
YEAR_END       = 2024
MONTH_START    = 3     # March
MONTH_END      = 11    # November
MAX_CLOUD_PCT  = 20
BUFFER_M       = 100   # 100m buffer around each point
SCALE          = 20    # 20m resolution (matches training)
MAX_AREA_KM2   = 50    # polygon size limit

# Bare-soil thresholds — strict (identical to training)
NDVI_MAX = 0.25
NBR2_MAX = 0.125
BSI_MIN  = 0.021

# Bare-soil thresholds — relaxed fallback
NDVI_MAX_RELAXED = 0.35
NBR2_MAX_RELAXED = 0.20
BSI_MIN_RELAXED  = 0.010

_initialized = False


def init_gee():
    global _initialized
    if _initialized:
        return
    try:
        ee.Initialize(project=GEE_PROJECT)
        _initialized = True
        print("GEE initialized successfully")
    except Exception as e:
        raise RuntimeError(f"GEE initialization failed: {e}")


# ── Date filter: March–November for each year ─────────────────
def _get_date_filter():
    filters = []
    for yr in range(YEAR_START, YEAR_END + 1):
        start     = f'{yr}-{MONTH_START:02d}-01'
        end_month = MONTH_END + 1
        end_year  = yr
        if end_month > 12:
            end_month = 1
            end_year += 1
        end = f'{end_year}-{end_month:02d}-01'
        filters.append(ee.Filter.date(start, end))
    return ee.Filter.Or(filters)


# ── SCL cloud mask ─────────────────────────────────────────────
def _mask_clouds_scl(image):
    """Remove clouds/shadows using SCL band — identical to training."""
    scl   = image.select('SCL')
    valid = (
        scl.neq(2).And(scl.neq(3)).And(scl.neq(6))
           .And(scl.neq(8)).And(scl.neq(9))
           .And(scl.neq(10)).And(scl.neq(11))
    )
    return image.updateMask(valid)


# ── Bare-soil mask + 20m resample ─────────────────────────────
def _apply_bare_soil_mask(image, ndvi_max, nbr2_max, bsi_min):
    """
    KEY: resample all bands to 20m using bilinear FIRST.
    B1 and B9 are native 60m — without this they cause
    inconsistent pixel sizes in the composite.
    Matches exactly what the training pipeline did.
    """
    # Step 1 — resample to 20m grid of B2 (bilinear)
    image = (
        image
        .resample('bilinear')
        .reproject(
            crs   = image.select('B2').projection(),
            scale = SCALE
        )
    )

    # Step 2 — scale to reflectance
    refl = image.divide(10000).float()

    # Step 3 — spectral indices
    ndvi = refl.normalizedDifference(['B8', 'B4'])
    nbr2 = refl.normalizedDifference(['B11', 'B12'])
    num  = (
        refl.select('B11').add(refl.select('B4'))
            .subtract(refl.select('B8'))
            .subtract(refl.select('B2'))
    )
    den  = (
        refl.select('B11').add(refl.select('B4'))
            .add(refl.select('B8'))
            .add(refl.select('B2'))
            .add(1e-6)
    )
    bsi = num.divide(den)

    # Step 4 — bare-soil mask
    bare = (
        ndvi.lt(ndvi_max)
            .And(nbr2.lt(nbr2_max))
            .And(bsi.gt(bsi_min))
    )

    return (
        refl.select(BANDS)
            .updateMask(bare)
            .copyProperties(image, ['system:time_start'])
    )


# ── Build collection ───────────────────────────────────────────
def _get_collection(geometry, ndvi_max, nbr2_max, bsi_min):
    """Build cloud-masked, bare-soil filtered Sentinel-2 collection."""
    date_filter = _get_date_filter()

    col = (
        ee.ImageCollection(COLLECTION)
        .filterBounds(geometry)
        .filter(date_filter)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', MAX_CLOUD_PCT))
        .map(_mask_clouds_scl)
        .map(lambda img: _apply_bare_soil_mask(img, ndvi_max, nbr2_max, bsi_min))
    )
    return col


# ── Geometric median composite ─────────────────────────────────
def _make_composite(collection):
    """
    Geometric median composite — identical to training.
    Considers all bands jointly to find the most representative observation.
    """
    return (
        collection
        .select(BANDS)
        .reduce(ee.Reducer.geometricMedian(len(BANDS)))
        .rename(BANDS)
    )


# ── Check pixel count + fallback ──────────────────────────────
def _get_composite_with_fallback(geometry):
    """
    Try strict bare-soil mask first.
    Fall back to relaxed mask if fewer than 3 valid pixels.
    """
    # Strict mask
    col   = _get_collection(geometry, NDVI_MAX, NBR2_MAX, BSI_MIN)
    comp  = _make_composite(col)
    px_cnt = comp.select('B4').reduceRegion(
        reducer  = ee.Reducer.count(),
        geometry = geometry,
        scale    = SCALE
    ).get('B4').getInfo()

    mask_used = 'strict'
    if (px_cnt or 0) < 3:
        # Relaxed mask fallback
        col   = _get_collection(geometry, NDVI_MAX_RELAXED,
                                           NBR2_MAX_RELAXED, BSI_MIN_RELAXED)
        comp  = _make_composite(col)
        mask_used = 'relaxed'
        print(f"Warning: using relaxed bare-soil mask (only {px_cnt or 0} strict pixels)")

    return comp, mask_used


# ══════════════════════════════════════════════════════════════
#  PUBLIC FUNCTIONS
# ══════════════════════════════════════════════════════════════

def get_bands_for_point(lat: float, lng: float) -> dict:
    """
    Fetch geometric-median bare-soil Sentinel-2 bands for a point.
    Uses 100m buffer around the point (matches training pipeline).
    """
    init_gee()

    pt  = ee.Geometry.Point([lng, lat])
    buf = pt.buffer(BUFFER_M)

    comp, mask_used = _get_composite_with_fallback(buf)

    # Extract mean band values inside buffer
    vals = comp.reduceRegion(
        reducer  = ee.Reducer.mean(),
        geometry = buf,
        scale    = SCALE,
        maxPixels= 1e6
    ).getInfo()

    band_values = []
    missing     = []
    for band in BANDS:
        val = vals.get(band)
        if val is None:
            missing.append(band)
            band_values.append(0.0)
        else:
            band_values.append(float(val))   # already reflectance (0-1)

    if missing:
        print(f"Warning: missing bands {missing}")

    return {
        "bands":         band_values,
        "band_names":    BANDS,
        "date_range":    f"{YEAR_START}-{MONTH_START:02d} → {YEAR_END}-{MONTH_END:02d}",
        "source":        f"Sentinel-2 geometric median composite ({mask_used} bare-soil mask)",
        "mask_used":     mask_used,
        "missing_bands": missing,
        "resolution_m":  SCALE,
        "buffer_m":      BUFFER_M,
    }


def get_bands_for_polygon(geojson_coords: list) -> dict:
    """
    Fetch geometric-median bare-soil Sentinel-2 bands for a polygon.
    Returns mean of all valid bare-soil pixels inside the polygon.
    """
    init_gee()

    polygon = ee.Geometry.Polygon(geojson_coords)

    # Size check
    area_m2  = polygon.area().getInfo()
    area_km2 = area_m2 / 1_000_000
    if area_km2 > MAX_AREA_KM2:
        raise ValueError(
            f"Zone trop grande ({area_km2:.1f} km²). "
            f"Maximum autorisé: {MAX_AREA_KM2} km². "
            f"Dessinez une zone plus petite."
        )

    comp, mask_used = _get_composite_with_fallback(polygon)

    # Mean of all pixels in polygon
    stats = comp.reduceRegion(
        reducer  = ee.Reducer.mean(),
        geometry = polygon,
        scale    = SCALE,
        maxPixels= 1e8
    ).getInfo()

    band_values = []
    missing     = []
    for band in BANDS:
        val = stats.get(band)
        if val is None:
            missing.append(band)
            band_values.append(0.0)
        else:
            band_values.append(float(val))

    # Std for quality info
    std_stats = comp.reduceRegion(
        reducer  = ee.Reducer.stdDev(),
        geometry = polygon,
        scale    = SCALE,
        maxPixels= 1e8
    ).getInfo()
    band_std = [float(std_stats.get(b, 0) or 0) for b in BANDS]

    area_ha = round(area_m2 / 10000, 2)

    return {
        "bands":         band_values,
        "band_std":      band_std,
        "band_names":    BANDS,
        "area_ha":       area_ha,
        "date_range":    f"{YEAR_START}-{MONTH_START:02d} → {YEAR_END}-{MONTH_END:02d}",
        "source":        f"Sentinel-2 geometric median composite ({mask_used} bare-soil mask)",
        "mask_used":     mask_used,
        "missing_bands": missing,
        "resolution_m":  SCALE,
    }


def get_bands_grid_for_polygon(geojson_coords: list, scale: int = 500) -> dict:
    """
    Sample a grid of points inside a polygon.
    Used for SOC map generation.
    Each point uses the geometric-median composite.
    """
    init_gee()

    polygon = ee.Geometry.Polygon(geojson_coords)
    comp, mask_used = _get_composite_with_fallback(polygon)

    samples = comp.sample(
        region     = polygon,
        scale      = scale,
        geometries = True,
        seed       = 42,
    )
    samples = samples.limit(200)

    features = samples.getInfo().get('features', [])

    points = []
    for f in features:
        try:
            coords = f['geometry']['coordinates']
            props  = f['properties']
            bands  = []
            valid  = True
            for band in BANDS:
                val = props.get(band)
                if val is None:
                    valid = False
                    break
                bands.append(float(val))   # already reflectance
            if valid and len(bands) == 12:
                points.append({
                    'lat':   coords[1],
                    'lng':   coords[0],
                    'bands': bands,
                })
        except Exception:
            continue

    return {
        'points':     points,
        'count':      len(points),
        'scale_m':    scale,
        'date_range': f"{YEAR_START}-{MONTH_START:02d} → {YEAR_END}-{MONTH_END:02d}",
        'mask_used':  mask_used,
    }