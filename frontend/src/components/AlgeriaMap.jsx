import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_REGIONS = [
  { name: 'Mitidja',     lat: 36.5, lng: 3.0,  soc: 2.8, clay: 35, ph: 7.1, quality: 'good'   },
  { name: 'Tlemcen',     lat: 34.9, lng: -1.3, soc: 1.9, clay: 28, ph: 7.4, quality: 'medium' },
  { name: 'Setif',       lat: 36.2, lng: 5.4,  soc: 2.1, clay: 31, ph: 7.2, quality: 'medium' },
  { name: 'Biskra',      lat: 34.8, lng: 5.7,  soc: 0.6, clay: 18, ph: 8.1, quality: 'poor'   },
  { name: 'Ouargla',     lat: 31.9, lng: 5.3,  soc: 0.3, clay: 10, ph: 8.5, quality: 'poor'   },
  { name: 'Annaba',      lat: 36.9, lng: 7.7,  soc: 2.5, clay: 33, ph: 7.0, quality: 'good'   },
  { name: 'Constantine', lat: 36.4, lng: 6.6,  soc: 2.2, clay: 30, ph: 7.3, quality: 'medium' },
  { name: 'Oran',        lat: 35.7, lng: -0.6, soc: 1.7, clay: 25, ph: 7.5, quality: 'medium' },
  { name: 'Tamanrasset', lat: 22.8, lng: 5.5,  soc: 0.1, clay: 6,  ph: 8.8, quality: 'poor'   },
  { name: 'Bejaia',      lat: 36.7, lng: 5.1,  soc: 2.6, clay: 34, ph: 7.0, quality: 'good'   },
  { name: 'Blida',       lat: 36.5, lng: 2.8,  soc: 2.7, clay: 36, ph: 7.1, quality: 'good'   },
  { name: "M'Sila",      lat: 35.7, lng: 4.5,  soc: 1.2, clay: 22, ph: 7.8, quality: 'medium' },
]

const QUALITY = {
  good:   { color: '#2D9E5A', bg: '#EDFBF1', label: 'Bon',    emoji: '🟢' },
  medium: { color: '#E8941A', bg: '#FEF3E2', label: 'Moyen',  emoji: '🟡' },
  poor:   { color: '#C0392B', bg: '#FDEEEC', label: 'Faible', emoji: '🔴' },
}

function MapSVG({ onRegionClick, selectedRegion }) {
  return (
    <svg viewBox="0 0 400 500" className="w-full h-full" style={{ cursor: 'crosshair' }}>
      <defs>
        <radialGradient id="mapBg" cx="50%" cy="40%">
          <stop offset="0%"   stopColor="#1A2E20" />
          <stop offset="100%" stopColor="#0A1410" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="400" height="500" fill="url(#mapBg)" />

      {/* Algeria outline simplified */}
      <path
        d="M 60 30 L 340 30 L 360 80 L 370 150 L 380 280 L 350 320 L 300 380 L 250 420 L 200 450 L 170 430 L 130 390 L 80 340 L 50 280 L 40 200 L 45 130 L 55 80 Z"
        fill="#162518"
        stroke="#2D6A3F"
        strokeWidth="2"
        opacity="0.9"
      />

      <text x="200" y="18" textAnchor="middle" fill="#4A90D9" fontSize="9" opacity="0.6">
        Mer Mediterranee
      </text>

      {MOCK_REGIONS.map((region, i) => {
        const x = ((region.lng + 10) / 22) * 340 + 30
        const y = ((40 - region.lat) / 22) * 380 + 30
        const cfg = QUALITY[region.quality]
        const isSelected = selectedRegion?.name === region.name

        return (
          <g key={i} onClick={() => onRegionClick(region)} style={{ cursor: 'pointer' }}>
            {isSelected && (
              <circle cx={x} cy={y} r="16" fill={cfg.color} opacity="0.2">
                <animate attributeName="r" from="10" to="22" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={x} cy={y}
              r={isSelected ? 8 : 5}
              fill={cfg.color}
              stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
              strokeWidth={isSelected ? 2 : 1}
              filter={isSelected ? 'url(#glow)' : undefined}
            />
            {isSelected && (
              <text x={x} y={y - 12} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">
                {region.name}
              </text>
            )}
          </g>
        )
      })}

      <text x="200" y="490" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9">
        Cliquez un point pour voir la prediction
      </text>
    </svg>
  )
}

export default function AlgeriaMap() {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setTimeout(() => setSelected(MOCK_REGIONS[0]), 800)
  }, [])

  const cfg = selected ? QUALITY[selected.quality] : null

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-green-900/30 shadow-xl"
      style={{ background: '#0A1410' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-96">

        {/* Map */}
        <div className="lg:col-span-2 relative p-4 min-h-80">
          <MapSVG onRegionClick={setSelected} selectedRegion={selected} />

          {/* Legend */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-1.5">
            {Object.entries(QUALITY).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: val.color }} />
                <span className="text-white/55 text-xs">{val.label} SOC</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div className="border-l border-white/8 p-6 flex flex-col" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">
            Resultat de prediction
          </p>

          <AnimatePresence mode="wait">
            {selected && cfg ? (
              <motion.div
                key={selected.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="flex-1"
              >
                <h3 className="text-white text-xl font-bold mb-1">{selected.name}</h3>

                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-5"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.emoji} {cfg.label}
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'SOC',    value: `${selected.soc} %`,          color: cfg.color,   max: 5   },
                    { label: 'Argile', value: `${selected.clay} %`,         color: '#4A90D9',   max: 60  },
                    { label: 'pH',     value: selected.ph.toFixed(1),       color: '#9B59B6',   max: 14  },
                  ].map((prop) => (
                    <div key={prop.label} className="flex items-center justify-between gap-2">
                      <span className="text-white/55 text-sm w-12">{prop.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (parseFloat(prop.value) / prop.max) * 100)}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: prop.color }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-14 text-right">
                        {prop.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-3 rounded-lg border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Prediction gratuite indicative. Pour un rapport complet, demandez une analyse.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-white/40 text-sm">
                  Cliquez sur un point pour voir la prediction
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}