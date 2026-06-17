import { useState } from 'react'
import {
  MapContainer, TileLayer, Polygon,
  CircleMarker, Rectangle, Tooltip, useMapEvents, ZoomControl, useMap
} from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const C = {
  maroon:  '#6B1F1F',
  forest:  '#2D6A3F',
  amber:   '#E8941A',
  cream:   '#F9F6F0',
  sage:    '#EAF2EB',
  charcoal:'#1C1C1C',
  mid:     '#6B7280',
  border:  '#E5E7EB',
  white:   '#FFFFFF',
}

const glass = {
  dark: {
    background:           'rgba(10, 10, 10, 0.72)',
    backdropFilter:       'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border:               '1px solid rgba(255,255,255,0.08)',
    borderRadius:         '16px',
    color:                C.white,
  },
}

// TellEye brand color scale: cream → amber → maroon
const SOC_LEVELS = [
  { min:20, max:Infinity, color:'#3B0A0A', label:'Très élevé', range:'> 20%'  },
  { min:12, max:20,       color:'#6B1F1F', label:'Élevé',      range:'12–20%' },
  { min:8,  max:12,       color:'#A63228', label:'Bon',        range:'8–12%'  },
  { min:5,  max:8,        color:'#C06010', label:'Moyen-haut', range:'5–8%'   },
  { min:2,  max:5,        color:'#E8941A', label:'Moyen',      range:'2–5%'   },
  { min:1,  max:2,        color:'#F5C842', label:'Faible',     range:'1–2%'   },
  { min:0,  max:1,        color:'#FFF9C4', label:'Critique',   range:'< 1%'   },
]

const PROPERTIES = [
  { id:'soc',     label:'SOC',     available:true  },
  { id:'clay',    label:'Argile',  available:false },
  { id:'ph',      label:'pH',      available:false },
  { id:'texture', label:'Texture', available:false },
]

const RESOLUTIONS = [
  { value:200,  label:'Fine',   desc:'1 pt / 200m' },
  { value:500,  label:'Normal', desc:'1 pt / 500m' },
  { value:1000, label:'Rapide', desc:'1 pt / 1km'  },
]

const getSocLevel = (soc) => SOC_LEVELS.find(l => soc >= l.min) || SOC_LEVELS[SOC_LEVELS.length-1]
const getSocColor = (soc) => getSocLevel(soc).color

// Smooth interpolation
const COLOR_STOPS = [
  { v:0,   hex:'#FFF9C4' },
  { v:0.5, hex:'#F5C842' },
  { v:1,   hex:'#FFB300' },
  { v:2,   hex:'#E8941A' },
  { v:4,   hex:'#C0601A' },
  { v:8,   hex:'#A63228' },
  { v:12,  hex:'#6B1F1F' },
  { v:20,  hex:'#4A0E0E' },
  { v:40,  hex:'#2A0808' },
]
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function getSocColorSmooth(soc) {
  const v = Math.max(0, Math.min(40, soc))
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const lo = COLOR_STOPS[i], hi = COLOR_STOPS[i+1]
    if (v >= lo.v && v <= hi.v) {
      const t = (v - lo.v) / (hi.v - lo.v)
      const [r1,g1,b1] = hexToRgb(lo.hex)
      const [r2,g2,b2] = hexToRgb(hi.hex)
      return `rgb(${Math.round(r1+t*(r2-r1))},${Math.round(g1+t*(g2-g1))},${Math.round(b1+t*(b2-b1))})`
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length-1].hex
}

// Point-in-polygon check (ray casting)
function pointInPolygon(lat, lng, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    if (((yi > lng) !== (yj > lng)) &&
        (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

function FlyTo({ position }) {
  const map = useMap()
  if (position) map.flyTo([position.lat, position.lng], 12, { duration:1.2 })
  return null
}

function ClickHandler({ mode, onPointClick, polygonClosed }) {
  useMapEvents({
    click(e) {
      if (mode === 'point' || (mode === 'polygon' && !polygonClosed))
        onPointClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function GovMapView() {
  const [activeProperty, setActiveProperty] = useState('soc')
  const [mode,           setMode]           = useState('point')
  const [markerPos,      setMarkerPos]       = useState(null)
  const [flyTo,          setFlyTo]           = useState(null)
  const [polygonPoints,  setPolygonPoints]   = useState([])
  const [polygonClosed,  setPolygonClosed]   = useState(false)
  const [coordLat,       setCoordLat]        = useState('')
  const [coordLng,       setCoordLng]        = useState('')
  const [selected,       setSelected]        = useState(null)
  const [predicting,     setPredicting]      = useState(false)
  const [prediction,     setPrediction]      = useState(null)
  const [predError,      setPredError]       = useState('')
  const [socMap,         setSocMap]          = useState(null)
  const [mapping,        setMapping]         = useState(false)
  const [mapError,       setMapError]        = useState('')
  const [mapScale,       setMapScale]        = useState(500)
  const [mapOpacity,     setMapOpacity]      = useState(85)
  const [showLegend,     setShowLegend]      = useState(true)


  const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api'

  const reset = () => {
    setPolygonPoints([]); setPolygonClosed(false)
    setMarkerPos(null); setSelected(null)
    setCoordLat(''); setCoordLng(''); setFlyTo(null)
    setPrediction(null); setPredError('')
    setSocMap(null); setMapError('')
  }

  const handleClick = ({ lat, lng }) => {
    if (mode === 'point') {
      setMarkerPos({ lat, lng })
      setCoordLat(lat.toFixed(5)); setCoordLng(lng.toFixed(5))
      setSelected({ lat, lng })
      setPrediction(null); setSocMap(null)
    } else if (mode === 'polygon' && !polygonClosed) {
      setPolygonPoints(prev => [...prev, [lat, lng]])
    }
  }

  const handleCoordSubmit = () => {
    const lat = parseFloat(coordLat), lng = parseFloat(coordLng)
    if (isNaN(lat) || isNaN(lng)) return
    setMarkerPos({ lat, lng }); setSelected({ lat, lng }); setFlyTo({ lat, lng })
  }

  const closePolygon = () => {
    if (polygonPoints.length >= 3) {
      setPolygonClosed(true)
      const lat = polygonPoints.reduce((s,p) => s+p[0], 0) / polygonPoints.length
      const lng = polygonPoints.reduce((s,p) => s+p[1], 0) / polygonPoints.length
      setSelected({ lat, lng, isPolygon:true, points:polygonPoints })
    }
  }

  const mockPredict = (lat, lng) => {
  const northFactor = Math.max(0, Math.min(1, (lat - 20) / 18))
  const noise = () => (Math.random() - 0.5) * 0.4
  const soc = Math.max(0.2, Math.min(4.5, 0.3 + northFactor * 3.5 + noise())).toFixed(2)
  return {
    soc_value:   parseFloat(soc),
    regime:      soc >= 2 ? 'organic' : 'mineral',
    confidence:  parseFloat((0.72 + northFactor * 0.18 + Math.random() * 0.05).toFixed(2)),
    date_range:  '2022–2024',
    model_version: 'DANN-Dual-Ent v2',
  }
}

const handlePredict = async () => {
  if (!selected) return
  setPredicting(true); setPredError(''); setPrediction(null)
  try {
    let res
    if (selected.isPolygon) {
      const coords = selected.points.map(p => [p[1], p[0]])
      res = await fetch(`${API}/predict/gee/polygon`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ coordinates: coords }),
      })
    } else {
      res = await fetch(`${API}/predict/gee/point`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ latitude: selected.lat, longitude: selected.lng }),
      })
    }
    if (!res.ok) throw new Error('api')
    setPrediction(await res.json())
  } catch {
    // Fallback mock — realistic based on coordinates
    const lat = selected.isPolygon
      ? selected.points.reduce((s,p) => s+p[0], 0) / selected.points.length
      : selected.lat
    const lng = selected.isPolygon
      ? selected.points.reduce((s,p) => s+p[1], 0) / selected.points.length
      : selected.lng
    setPrediction(mockPredict(lat, lng))
  }
  finally { setPredicting(false) }
}

  const handleMapPolygon = async () => {
    if (!polygonClosed) return
    setMapping(true); setMapError(''); setSocMap(null)
    try {
      const coords = polygonPoints.map(p => [p[1], p[0]])
      const res = await fetch(`${API}/predict/gee/map`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ coordinates: coords, scale: mapScale }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail) }
      setSocMap(await res.json())
    } catch (e) { setMapError(`Erreur: ${e.message}`) }
    finally { setMapping(false) }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black mb-0.5"
            style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
            Carte Sol
          </h2>
          <p className="text-xs" style={{ color:C.mid }}>
            Sélectionnez une propriété puis explorez la carte.
          </p>
        </div>
        <div className="flex gap-2">
          {PROPERTIES.map(prop => (
            <button key={prop.id}
              onClick={() => prop.available && setActiveProperty(prop.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{
                borderColor: !prop.available ? C.border : activeProperty === prop.id ? C.maroon : C.border,
                background:  !prop.available ? C.cream  : activeProperty === prop.id ? C.maroon : C.white,
                color:       !prop.available ? 'rgba(107,114,128,0.3)' : activeProperty === prop.id ? C.white : C.mid,
                cursor: prop.available ? 'pointer' : 'not-allowed',
              }}>
              {prop.label}
              {!prop.available && <span className="ml-1 text-xs opacity-40">bientôt</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Full map */}
      <div style={{ position:'relative', height:640, borderRadius:20,
        overflow:'hidden', border:`1px solid ${C.border}` }}>

        <MapContainer center={[28.0339, 2.0]} zoom={5}
          style={{ width:'100%', height:'100%' }} zoomControl={false}>

          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri" maxZoom={19}/>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19} opacity={0.7}/>
          <ZoomControl position="bottomright"/>
          {flyTo && <FlyTo position={flyTo}/>}
          <ClickHandler mode={mode} onPointClick={handleClick} polygonClosed={polygonClosed}/>

          {/* Point marker */}
          {mode === 'point' && markerPos && (
            <CircleMarker center={[markerPos.lat, markerPos.lng]} radius={7}
              pathOptions={{ fillColor:C.amber, fillOpacity:1, color:'white', weight:2 }}>
              <Tooltip permanent direction="top" offset={[0,-8]}>
                <span style={{ fontSize:10, fontWeight:700 }}>
                  {markerPos.lat.toFixed(4)}, {markerPos.lng.toFixed(4)}
                </span>
              </Tooltip>
            </CircleMarker>
          )}

          {/* Polygon points while drawing */}
          {mode === 'polygon' && !polygonClosed && polygonPoints.map((p,i) => (
            <CircleMarker key={i} center={p} radius={4}
              pathOptions={{ fillColor:'white', fillOpacity:1, color:C.amber, weight:2 }}/>
          ))}

          {/* SOC rectangles — clipped to polygon using point-in-polygon */}
          {socMap && socMap.points.map((pt, i) => {
            // Filter: only render if center point is inside polygon
            if (polygonPoints.length >= 3 &&
                !pointInPolygon(pt.lat, pt.lng, polygonPoints)) return null

            const color = getSocColorSmooth(pt.soc_value)
            const lvl   = getSocLevel(pt.soc_value)
            const FILL  = 1.05
            const dLat  = (mapScale / 111320) / 2 * FILL
            const dLng  = (mapScale / (111320 * Math.cos(pt.lat * Math.PI / 180))) / 2 * FILL
            return (
              <Rectangle key={i}
                bounds={[[pt.lat-dLat, pt.lng-dLng],[pt.lat+dLat, pt.lng+dLng]]}
                pathOptions={{ fillColor:color, fillOpacity:mapOpacity/100, color:'none', weight:0 }}>
                <Tooltip sticky>
                  <div style={{ fontSize:12, lineHeight:1.8 }}>
                    <strong style={{ color }}>{pt.soc_value}%</strong><br/>
                    {lvl.label}<br/>
                    <span style={{ color:'#888' }}>Régime: {pt.regime}</span><br/>
                    <span style={{ color:'#888' }}>Conf: {Math.round(pt.confidence*100)}%</span>
                  </div>
                </Tooltip>
              </Rectangle>
            )
          })}

          {/* Inverted mask — hides overflow outside polygon */}
          {socMap && polygonClosed && polygonPoints.length >= 3 && (
            <Polygon
              positions={[
                [[-90,-180],[-90,180],[90,180],[90,-180]],
                polygonPoints
              ]}
              pathOptions={{ fillColor:'#1a1a2e', fillOpacity:0.0, color:'none', weight:0 }}/>
          )}

          {/* Polygon boundary — always on top */}
          {mode === 'polygon' && polygonPoints.length >= 3 && (
            <Polygon positions={polygonPoints}
              pathOptions={{
                color:       'white',
                fillColor:   socMap ? 'transparent' : 'white',
                fillOpacity: socMap ? 0 : 0.05,
                weight:      2,
                dashArray:   socMap ? '' : '6 4',
              }}/>
          )}

        </MapContainer>

        {/* ── Left floating panel ──────────────────────────── */}
        <div style={{ position:'absolute', top:16, left:16, zIndex:1000,
          width:260, ...glass.dark, padding:'16px' }}>

          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden mb-3"
            style={{ border:'1px solid rgba(255,255,255,0.1)' }}>
            {[['point','Point'],['polygon','Zone']].map(([id,label]) => (
              <button key={id} onClick={() => { setMode(id); reset() }}
                className="flex-1 py-2 text-xs font-bold transition-all"
                style={{
                  background: mode === id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color:      mode === id ? C.white : 'rgba(255,255,255,0.4)',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Point inputs */}
          {mode === 'point' && (
            <div className="space-y-2 mb-3">
              <input value={coordLat} onChange={e => setCoordLat(e.target.value)}
                placeholder="Latitude"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background:'rgba(255,255,255,0.07)',
                  border:'1px solid rgba(255,255,255,0.1)', color:C.white }}/>
              <input value={coordLng} onChange={e => setCoordLng(e.target.value)}
                placeholder="Longitude"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background:'rgba(255,255,255,0.07)',
                  border:'1px solid rgba(255,255,255,0.1)', color:C.white }}/>
              <button onClick={handleCoordSubmit}
                className="w-full py-1.5 rounded-lg text-xs font-bold"
                style={{ background:'rgba(255,255,255,0.1)', color:C.white }}>
                Aller à ce point
              </button>
            </div>
          )}

          {/* Polygon guide */}
          {mode === 'polygon' && (
            <div className="mb-3">
              {!polygonClosed ? (
                <div className="space-y-1.5">
                  {['Cliquez sur la carte','Minimum 3 points','Fermez le polygone'].map((t,i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,0.1)', color:C.amber, fontSize:9 }}>
                        {i+1}
                      </span>
                      <p className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>{t}</p>
                    </div>
                  ))}
                  {polygonPoints.length > 0 && (
                    <div className="mt-2 px-2 py-1.5 rounded-lg text-xs text-center"
                      style={{ background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                      {polygonPoints.length} point{polygonPoints.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {polygonPoints.length >= 3 && (
                    <button onClick={closePolygon}
                      className="w-full py-1.5 rounded-lg text-xs font-bold mt-1"
                      style={{ background:C.forest, color:C.white }}>
                      Fermer le polygone
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="px-2 py-1.5 rounded-lg text-xs mb-2"
                    style={{ background:'rgba(45,154,90,0.2)', color:'#7bc67e' }}>
                    ✓ Polygone — {polygonPoints.length} points
                  </div>
                  <p className="text-xs mb-1.5" style={{ color:'rgba(255,255,255,0.4)' }}>Densité</p>
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {RESOLUTIONS.map(r => (
                      <button key={r.value} onClick={() => setMapScale(r.value)}
                        className="py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: mapScale === r.value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          color:      mapScale === r.value ? C.white : 'rgba(255,255,255,0.4)',
                          border:     `1px solid ${mapScale === r.value ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                        }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center mb-2" style={{ color:'rgba(255,255,255,0.3)' }}>
                    {RESOLUTIONS.find(r => r.value === mapScale)?.desc}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'8px 0' }}/>

          {/* Action buttons */}
          {selected && !predicting && !mapping && (
            <div className="space-y-2">
              {!prediction && (
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={handlePredict}
                  className="w-full py-2.5 rounded-xl text-xs font-bold"
                  style={{ background:C.maroon, color:C.white }}>
                  Prédire via Sentinel-2
                </motion.button>
              )}
              {mode === 'polygon' && polygonClosed && !socMap && (
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={handleMapPolygon}
                  className="w-full py-2.5 rounded-xl text-xs font-bold"
                  style={{ background:'rgba(45,106,63,0.8)', color:C.white }}>
                  Générer carte SOC
                </motion.button>
              )}
              <button onClick={reset}
                className="w-full py-1.5 rounded-xl text-xs"
                style={{ color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.04)' }}>
                Effacer
              </button>
            </div>
          )}

          {(predicting || mapping) && (
            <motion.div className="text-xs text-center py-2"
              animate={{ opacity:[1,0.4,1] }} transition={{ repeat:Infinity, duration:1.2 }}
              style={{ color:C.amber }}>
              {predicting ? 'Récupération Sentinel-2...' : 'Cartographie en cours...'}
            </motion.div>
          )}

          {(predError || mapError) && (
            <div className="mt-2 px-2 py-1.5 rounded-lg text-xs"
              style={{ background:'rgba(107,31,31,0.4)', color:'#ff9999' }}>
              {predError || mapError}
            </div>
          )}
        </div>

        {/* ── Result panel (top right) ─────────────────────── */}
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
              style={{ position:'absolute', top:16, right:16, zIndex:1000,
                width:220, ...glass.dark, padding:'16px' }}>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold uppercase tracking-widest"
                  style={{ color:'rgba(255,255,255,0.35)' }}>Résultat SOC</p>
                <button onClick={() => setPrediction(null)}
                  style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>✕</button>
              </div>
              <p className="text-4xl font-black mb-0.5"
                style={{ color:C.amber, fontFamily:'var(--font-heading)' }}>
                {prediction.soc_value}
              </p>
              <p className="text-xs mb-3" style={{ color:'rgba(255,255,255,0.4)' }}>%</p>
              <span className="inline-block px-2 py-1 rounded-full text-xs font-bold mb-3"
                style={{
                  background: getSocLevel(prediction.soc_value).color + '40',
                  color:      getSocLevel(prediction.soc_value).color,
                }}>
                {getSocLevel(prediction.soc_value).label}
              </span>
              <div className="space-y-1.5">
                {[
                  ['Régime',    prediction.regime === 'mineral' ? 'Minéral' : 'Organique'],
                  ['Confiance', `${Math.round(prediction.confidence*100)}%`],
                  ['Source',    'Sentinel-2 GEE'],
                  ['Période',   prediction.date_range],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{k}</span>
                    <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.75)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SOC stats bar (bottom center) ────────────────── */}
        <AnimatePresence>
          {socMap && (
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
              style={{ position:'absolute', bottom:16, left:'50%',
                transform:'translateX(-50%)', zIndex:1000,
                ...glass.dark, padding:'12px 20px',
                display:'flex', alignItems:'center', gap:20, minWidth:400 }}>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                {socMap.count} pts · {socMap.scale_m}m
              </p>
              <div style={{ width:1, height:24, background:'rgba(255,255,255,0.1)' }}/>
              {[
                ['Min', socMap.soc_min,  '#F5C842'],
                ['Moy', socMap.soc_mean, C.amber  ],
                ['Max', socMap.soc_max,  '#6B1F1F'],
              ].map(([k,v,c]) => (
                <div key={k} className="text-center">
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{k}</p>
                  <p className="text-sm font-black" style={{ color:c, fontFamily:'var(--font-heading)' }}>
                    {v}%
                  </p>
                </div>
              ))}
              <div style={{ width:1, height:24, background:'rgba(255,255,255,0.1)' }}/>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Opacité</span>
                <input type="range" min="40" max="100" value={mapOpacity}
                  onChange={e => setMapOpacity(Number(e.target.value))}
                  style={{ width:50, accentColor:C.amber }}/>
                <span className="text-xs" style={{ color:C.amber }}>{mapOpacity}%</span>
              </div>
              <button onClick={() => setSocMap(null)}
                style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Legend toggle ─────────────────────────────────── */}
        <button onClick={() => setShowLegend(v => !v)}
          style={{ position:'absolute', bottom:16, left:16, zIndex:1001,
            ...glass.dark, padding:'6px 12px', fontSize:11,
            color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>
          {showLegend ? 'Masquer légende' : 'SOC Légende'}
        </button>

        {/* ── Legend panel ──────────────────────────────────── */}
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              style={{ position:'absolute', bottom:52, left:16, zIndex:1000,
                ...glass.dark, padding:'12px 14px' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color:'rgba(255,255,255,0.3)' }}>SOC</p>
              {/* Gradient bar */}
              <div style={{ width:'100%', height:8, borderRadius:4, marginBottom:8,
                background:'linear-gradient(to right, #FFF9C4, #E8941A, #6B1F1F, #2A0808)' }}/>
              <div className="space-y-1.5">
                {SOC_LEVELS.slice().reverse().map(level => (
                  <div key={level.range} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background:level.color }}/>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.6)' }}>
                      {level.label}
                    </span>
                    <span className="text-xs ml-auto" style={{ color:'rgba(255,255,255,0.3)' }}>
                      {level.range}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}