"""
TellEye — Predictions Router
==============================
Endpoints:
  POST /api/predict/point        → predict SOC from 12 band values
  POST /api/predict/batch        → predict SOC for multiple points
  GET  /api/predict/bands        → list expected bands + order
  GET  /api/predict/health       → check model is loaded
  POST /api/predict/gee/point    → predict from lat/lng via GEE
  POST /api/predict/gee/polygon  → predict from polygon via GEE
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from db import get_db
import models

router = APIRouter()

BANDS = ["B1","B2","B3","B4","B5","B6","B7","B8","B8A","B9","B11","B12"]


# ── Schemas ────────────────────────────────────────────────────
class BandInput(BaseModel):
    bands: list[float] = Field(..., min_length=12, max_length=12)
    latitude:       Optional[float] = None
    longitude:      Optional[float] = None
    institution_id: Optional[int]   = None

class BatchInput(BaseModel):
    points: list[BandInput] = Field(..., max_length=500)

class PredictionResult(BaseModel):
    soc_value:     float
    soc_class:     str
    regime:        str
    regime_prob:   float
    confidence:    float
    model_version: str
    latitude:      Optional[float] = None
    longitude:     Optional[float] = None
    disclaimer:    str = "Prediction via modele DANN CDAN — R²=0.935 sur jeu de test source."

class GEEPointRequest(BaseModel):
    latitude:       float = Field(..., ge=14.0, le=38.0)
    longitude:      float = Field(..., ge=-9.0, le=12.0)
    institution_id: Optional[int] = None

class GEEPolygonRequest(BaseModel):
    coordinates: list[list[float]] = Field(
        ..., description="List of [lng, lat] pairs forming the polygon"
    )
    institution_id: Optional[int] = None

class GEEPredictionResult(BaseModel):
    soc_value:     float
    soc_class:     str
    regime:        str
    confidence:    float
    model_version: str
    latitude:      Optional[float] = None
    longitude:     Optional[float] = None
    area_ha:       Optional[float] = None
    bands:         list[float]
    date_range:    str
    source:        str


# ── Endpoints ──────────────────────────────────────────────────
@router.get("/bands")
async def get_bands():
    return {"bands": BANDS, "count": len(BANDS)}


@router.get("/health")
async def model_health():
    try:
        from ml.model import load_model
        load_model()
        return {"status": "ready", "model_version": "dann_cdan_v1", "r2": 0.935, "bands": BANDS}
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model error: {str(e)}")


@router.post("/point", response_model=PredictionResult)
async def predict_point(payload: BandInput, db: Session = Depends(get_db)):
    try:
        from ml.model import predict_soc
        result = predict_soc(payload.bands)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    if payload.latitude and payload.longitude:
        db.add(models.SoilPrediction(
            latitude   = payload.latitude,
            longitude  = payload.longitude,
            soc_value  = result["soc_value"],
            soc_class  = result["soc_class"],
            confidence = result["confidence"],
            source     = result["model_version"],
        ))
        db.commit()

    return PredictionResult(latitude=payload.latitude, longitude=payload.longitude, **result)


@router.post("/batch")
async def predict_batch_endpoint(payload: BatchInput):
    try:
        from ml.model import predict_batch
        results = predict_batch([p.bands for p in payload.points])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch failed: {str(e)}")

    for i, point in enumerate(payload.points):
        results[i]["latitude"]  = point.latitude
        results[i]["longitude"] = point.longitude

    return {"count": len(results), "predictions": results}


# ── GEE endpoints ──────────────────────────────────────────────
@router.post("/gee/point", response_model=GEEPredictionResult)
async def predict_gee_point(payload: GEEPointRequest, db: Session = Depends(get_db)):
    try:
        from ml.gee   import get_bands_for_point
        from ml.model import predict_soc
        gee_result = get_bands_for_point(payload.latitude, payload.longitude)
        prediction = predict_soc(gee_result["bands"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GEE prediction failed: {str(e)}")

    db.add(models.SoilPrediction(
        latitude   = payload.latitude,
        longitude  = payload.longitude,
        soc_value  = prediction["soc_value"],
        soc_class  = prediction["soc_class"],
        confidence = prediction["confidence"],
        source     = "gee_dann_cdan_v1",
    ))
    db.commit()

    return GEEPredictionResult(
        latitude   = payload.latitude,
        longitude  = payload.longitude,
        bands      = gee_result["bands"],
        date_range = gee_result["date_range"],
        source     = gee_result["source"],
        **prediction,
    )


@router.post("/gee/polygon", response_model=GEEPredictionResult)
async def predict_gee_polygon(payload: GEEPolygonRequest, db: Session = Depends(get_db)):
    try:
        from ml.gee   import get_bands_for_polygon
        from ml.model import predict_soc
        gee_result = get_bands_for_polygon(payload.coordinates)
        prediction = predict_soc(gee_result["bands"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GEE polygon failed: {str(e)}")

    # Use centroid as lat/lng for DB storage
    lat = sum(c[1] for c in payload.coordinates) / len(payload.coordinates)
    lng = sum(c[0] for c in payload.coordinates) / len(payload.coordinates)

    db.add(models.SoilPrediction(
        latitude   = lat,
        longitude  = lng,
        soc_value  = prediction["soc_value"],
        soc_class  = prediction["soc_class"],
        confidence = prediction["confidence"],
        source     = "gee_dann_polygon",
    ))
    db.commit()

    return GEEPredictionResult(
        latitude   = lat,
        longitude  = lng,
        area_ha    = gee_result.get("area_ha"),
        bands      = gee_result["bands"],
        date_range = gee_result["date_range"],
        source     = gee_result["source"],
        **prediction,
    )


# ── SOC MAP endpoint ───────────────────────────────────────────
class GEEMapRequest(BaseModel):
    coordinates: list[list[float]] = Field(
        ..., description="List of [lng, lat] pairs forming the polygon"
    )
    scale: int = Field(default=500, ge=100, le=2000,
        description="Sampling resolution in meters (100-2000)")


class SOCPoint(BaseModel):
    lat:        float
    lng:        float
    soc_value:  float
    soc_class:  str
    regime:     str
    confidence: float


class GEEMapResult(BaseModel):
    points:     list[SOCPoint]
    count:      int
    scale_m:    int
    date_range: str
    soc_min:    float
    soc_max:    float
    soc_mean:   float


@router.post("/gee/map", response_model=GEEMapResult,
             summary="Generate SOC map for a polygon region")
async def predict_gee_map(payload: GEEMapRequest):
    """
    Sample a grid of points inside the polygon,
    predict SOC for each, return colored map data.
    """
    try:
        from ml.gee   import get_bands_grid_for_polygon
        from ml.model import predict_batch

        # Step 1 — get grid of band values from GEE
        grid = get_bands_grid_for_polygon(payload.coordinates, scale=payload.scale)

        if not grid['points']:
            raise HTTPException(status_code=404,
                detail="No valid Sentinel-2 pixels found in this region. Try a larger area.")

        # Step 2 — batch predict SOC for all points
        band_matrix = [p['bands'] for p in grid['points']]
        predictions = predict_batch(band_matrix)

        # Step 3 — combine coordinates + predictions
        result_points = []
        soc_values    = []

        for i, pred in enumerate(predictions):
            pt = grid['points'][i]
            result_points.append(SOCPoint(
                lat        = pt['lat'],
                lng        = pt['lng'],
                soc_value  = pred['soc_value'],
                soc_class  = pred['soc_class'],
                regime     = pred['regime'],
                confidence = pred['confidence'],
            ))
            soc_values.append(pred['soc_value'])

        return GEEMapResult(
            points     = result_points,
            count      = len(result_points),
            scale_m    = grid['scale_m'],
            date_range = grid['date_range'],
            soc_min    = round(min(soc_values), 3),
            soc_max    = round(max(soc_values), 3),
            soc_mean   = round(sum(soc_values) / len(soc_values), 3),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SOC map failed: {str(e)}")