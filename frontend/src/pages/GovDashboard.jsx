// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useAuth } from '../context/AuthContext'

// // ── Design tokens ──────────────────────────────────────────────
// const C = {
//   maroon:   '#6B1F1F',
//   forest:   '#2D6A3F',
//   amber:    '#E8941A',
//   cream:    '#F9F6F0',
//   sage:     '#EAF2EB',
//   charcoal: '#1C1C1C',
//   mid:      '#6B7280',
//   border:   '#E5E7EB',
//   white:    '#FFFFFF',
//   good:     '#2D9E5A',
//   medium:   '#E8941A',
//   poor:     '#C0392B',
// }

// const fadeUp = {
//   hidden:  { opacity: 0, y: 20 },
//   visible: (i = 0) => ({
//     opacity: 1, y: 0,
//     transition: { duration: 0.5, ease: [0.22,1,0.36,1], delay: i * 0.08 },
//   }),
// }
// const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } }

// // ── Mock data ──────────────────────────────────────────────────
// const MOCK_WILAYAS = ['Alger','Blida','Sétif','Constantine','Oran','Annaba','Béjaïa','Médéa']

// const MOCK_REPORTS = [
//   { id:1, title:'Rapport SOC — Alger Q1 2025',     wilaya:'Alger',      quarter:1, year:2025, status:'ready',      size:'4.2 MB',  date:'2025-03-15' },
//   { id:2, title:'Rapport SOC — Blida Q1 2025',     wilaya:'Blida',      quarter:1, year:2025, status:'ready',      size:'3.8 MB',  date:'2025-03-15' },
//   { id:3, title:'Rapport SOC — Sétif Q4 2024',     wilaya:'Sétif',      quarter:4, year:2024, status:'ready',      size:'5.1 MB',  date:'2024-12-20' },
//   { id:4, title:'Rapport SOC — Constantine Q4 2024',wilaya:'Constantine',quarter:4, year:2024, status:'ready',      size:'4.7 MB',  date:'2024-12-20' },
//   { id:5, title:'Rapport SOC — Oran Q2 2025',      wilaya:'Oran',       quarter:2, year:2025, status:'generating', size:'—',       date:'—' },
// ]

// const MOCK_UPDATES = [
//   { id:1, wilaya:'Alger',       quarter:1, year:2025, status:'delivered', trend:'stable',    change:'+0.2%', date:'2025-03-15' },
//   { id:2, wilaya:'Blida',       quarter:1, year:2025, status:'delivered', trend:'improving', change:'+0.8%', date:'2025-03-15' },
//   { id:3, wilaya:'Sétif',       quarter:4, year:2024, status:'delivered', trend:'degrading', change:'-0.3%', date:'2024-12-20' },
//   { id:4, wilaya:'Constantine', quarter:4, year:2024, status:'delivered', trend:'stable',    change:'+0.1%', date:'2024-12-20' },
//   { id:5, wilaya:'Oran',        quarter:2, year:2025, status:'scheduled', trend:'—',         change:'—',     date:'En attente' },
// ]

// const MOCK_HISTORY = [
//   { id:1, wilaya:'Alger',  lat:36.74, lng:3.06,  soc:2.1, clay:32, ph:7.2, conf:0.82, date:'2025-03-10' },
//   { id:2, wilaya:'Blida',  lat:36.47, lng:2.82,  soc:2.7, clay:35, ph:7.0, conf:0.85, date:'2025-03-09' },
//   { id:3, wilaya:'Sétif',  lat:36.19, lng:5.41,  soc:1.8, clay:28, ph:7.5, conf:0.79, date:'2025-03-08' },
//   { id:4, wilaya:'Alger',  lat:36.71, lng:3.12,  soc:1.5, clay:25, ph:7.8, conf:0.77, date:'2025-03-07' },
//   { id:5, wilaya:'Oran',   lat:35.69, lng:-0.63, soc:1.6, clay:27, ph:7.4, conf:0.80, date:'2025-03-06' },
// ]

// const WILAYA_SOC = {
//   'Alger':      { soc:2.1, clay:32, ph:7.2, quality:'medium' },
//   'Blida':      { soc:2.7, clay:35, ph:7.0, quality:'good'   },
//   'Sétif':      { soc:1.8, clay:28, ph:7.5, quality:'medium' },
//   'Constantine':{ soc:2.2, clay:30, ph:7.3, quality:'medium' },
//   'Oran':       { soc:1.6, clay:27, ph:7.4, quality:'medium' },
//   'Annaba':     { soc:2.5, clay:33, ph:7.0, quality:'good'   },
//   'Béjaïa':     { soc:2.6, clay:34, ph:7.0, quality:'good'   },
//   'Médéa':      { soc:2.4, clay:32, ph:7.2, quality:'good'   },
// }

// // ── Reusable components ────────────────────────────────────────
// function StatCard({ label, value, sub, accent, i=0 }) {
//   return (
//     <motion.div variants={fadeUp} custom={i}
//       className="rounded-xl p-5 border"
//       style={{ background:C.white, borderColor:C.border, boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
//       <p className="text-xs font-semibold uppercase tracking-widest mb-2"
//         style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>{label}</p>
//       <p className="text-3xl font-black mb-0.5"
//         style={{ color:accent||C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.03em' }}>
//         {value}
//       </p>
//       {sub && <p className="text-xs" style={{ color:C.mid }}>{sub}</p>}
//     </motion.div>
//   )
// }

// function Badge({ label, color }) {
//   return (
//     <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold"
//       style={{ background:color+'18', color, fontFamily:'var(--font-heading)' }}>
//       {label}
//     </span>
//   )
// }

// const TREND_CONFIG = {
//   improving: { label:'Amélioration', color:C.good    },
//   stable:    { label:'Stable',       color:C.mid     },
//   degrading: { label:'Dégradation',  color:C.poor    },
//   '—':       { label:'En attente',   color:C.mid     },
// }

// const QUALITY_CONFIG = {
//   good:   { color:C.good,   label:'Bon'   },
//   medium: { color:C.medium, label:'Moyen' },
//   poor:   { color:C.poor,   label:'Faible'},
// }

// // ══════════════════════════════════════════════════════════════
// //  OVERVIEW VIEW
// // ══════════════════════════════════════════════════════════════
// function OverviewView({ user, wilayas }) {
//   const readyReports  = MOCK_REPORTS.filter(r => r.status === 'ready').length
//   const pendingUpdate = MOCK_UPDATES.filter(u => u.status === 'scheduled').length
//   const improving     = MOCK_UPDATES.filter(u => u.trend === 'improving').length

//   return (
//     <div>
//       {/* Welcome */}
//       <div className="rounded-xl p-6 mb-6 border"
//         style={{ background:C.charcoal, borderColor:'transparent' }}>
//         <p className="text-xs font-semibold uppercase tracking-widest mb-1"
//           style={{ color:'rgba(255,255,255,0.4)' }}>Bienvenue</p>
//         <h2 className="text-xl font-black text-white mb-1"
//           style={{ fontFamily:'var(--font-heading)' }}>
//           {user?.full_name || 'Institution'}
//         </h2>
//         <p className="text-sm" style={{ color:'rgba(255,255,255,0.5)' }}>
//           {wilayas.length === 0
//             ? 'Accès national — toutes les wilayas disponibles'
//             : `${wilayas.length} wilaya${wilayas.length > 1 ? 's' : ''} assignée${wilayas.length > 1 ? 's' : ''}`
//           }
//         </p>
//       </div>

//       {/* Stats */}
//       <motion.div variants={stagger} initial="hidden" animate="visible"
//         className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatCard label="Wilayas couvertes" value={wilayas.length || 48} sub="dans votre contrat" accent={C.forest} i={0}/>
//         <StatCard label="Rapports disponibles" value={readyReports} sub="prêts à télécharger" accent={C.maroon} i={1}/>
//         <StatCard label="Mises à jour" value={pendingUpdate} sub="en attente" accent={C.amber} i={2}/>
//         <StatCard label="En amélioration" value={improving} sub="wilayas SOC +" accent={C.good} i={3}/>
//       </motion.div>

//       {/* Recent updates */}
//       <div className="mb-6">
//         <p className="text-xs font-bold uppercase tracking-widest mb-3"
//           style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
//           Dernières mises à jour saisonnières
//         </p>
//         <div className="rounded-xl border overflow-hidden"
//           style={{ borderColor:C.border, background:C.white }}>
//           {MOCK_UPDATES.slice(0,4).map((u, i) => (
//             <div key={u.id}
//               className={`flex items-center justify-between px-5 py-3.5 ${i < 3 ? 'border-b' : ''}`}
//               style={{ borderColor:C.border }}>
//               <div>
//                 <p className="text-sm font-semibold" style={{ color:C.charcoal }}>{u.wilaya}</p>
//                 <p className="text-xs mt-0.5" style={{ color:C.mid }}>
//                   Q{u.quarter} {u.year} · {u.date}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm font-bold"
//                   style={{ color: TREND_CONFIG[u.trend]?.color || C.mid }}>
//                   {u.change}
//                 </span>
//                 <Badge
//                   label={TREND_CONFIG[u.trend]?.label || '—'}
//                   color={TREND_CONFIG[u.trend]?.color || C.mid}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent history */}
//       <div>
//         <p className="text-xs font-bold uppercase tracking-widest mb-3"
//           style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
//           Dernières prédictions
//         </p>
//         <div className="rounded-xl border overflow-hidden"
//           style={{ borderColor:C.border, background:C.white }}>
//           {MOCK_HISTORY.slice(0,3).map((h, i) => (
//             <div key={h.id}
//               className={`flex items-center justify-between px-5 py-3.5 ${i < 2 ? 'border-b' : ''}`}
//               style={{ borderColor:C.border }}>
//               <div>
//                 <p className="text-sm font-semibold" style={{ color:C.charcoal }}>
//                   {h.wilaya} · {h.lat.toFixed(2)}°N {h.lng.toFixed(2)}°E
//                 </p>
//                 <p className="text-xs mt-0.5" style={{ color:C.mid }}>{h.date}</p>
//               </div>
//               <div className="flex items-center gap-4 text-sm">
//                 <span><span style={{ color:C.mid }}>SOC </span>
//                   <span className="font-bold" style={{ color:C.charcoal }}>{h.soc}%</span>
//                 </span>
//                 <span><span style={{ color:C.mid }}>pH </span>
//                   <span className="font-bold" style={{ color:C.charcoal }}>{h.ph}</span>
//                 </span>
//                 <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
//                   style={{ background:C.sage, color:C.forest }}>
//                   {Math.round(h.conf * 100)}%
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// //  CARTE SOL VIEW
// // ══════════════════════════════════════════════════════════════
// function CarteView({ wilayas }) {
//   const [selectedWilaya, setSelectedWilaya] = useState(wilayas[0] || 'Alger')
//   const data = WILAYA_SOC[selectedWilaya]
//   const qcfg = data ? QUALITY_CONFIG[data.quality] : null

//   // City positions on the image (approximate %)
//   const CITY_POSITIONS = {
//     'Alger':       { x:'42%', y:'12%' },
//     'Blida':       { x:'38%', y:'16%' },
//     'Sétif':       { x:'60%', y:'11%' },
//     'Constantine': { x:'65%', y:'9%'  },
//     'Oran':        { x:'22%', y:'14%' },
//     'Annaba':      { x:'72%', y:'8%'  },
//     'Béjaïa':      { x:'55%', y:'10%' },
//     'Médéa':       { x:'40%', y:'18%' },
//   }

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-black mb-1"
//           style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
//           Carte Solllllll
//         </h2>
//         <p className="text-sm" style={{ color:C.mid }}>
//           Sélectionnez une wilaya pour voir les propriétés sol détaillées.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

//         {/* Wilaya selector */}
//         <div className="rounded-xl border p-5"
//           style={{ background:C.white, borderColor:C.border }}>
//           <p className="text-xs font-bold uppercase tracking-widest mb-3"
//             style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
//             Vos wilayas
//           </p>
//           <div className="space-y-1">
//             {wilayas.map(w => (
//               <button key={w} onClick={() => setSelectedWilaya(w)}
//                 className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
//                 style={{
//                   background: selectedWilaya === w ? C.forest+'15' : 'transparent',
//                   color:      selectedWilaya === w ? C.forest        : C.mid,
//                   fontWeight: selectedWilaya === w ? 700             : 500,
//                   borderLeft: selectedWilaya === w ? `3px solid ${C.forest}` : '3px solid transparent',
//                 }}>
//                 {w}
//                 {WILAYA_SOC[w] && (
//                   <span className="float-right text-xs"
//                     style={{ color: QUALITY_CONFIG[WILAYA_SOC[w].quality]?.color }}>
//                     SOC {WILAYA_SOC[w].soc}%
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Map — col 2 */}
//         <div className="lg:col-span-2">
//           {/* Satellite map image */}
//           <div className="relative rounded-xl overflow-hidden border mb-4"
//             style={{ borderColor:C.border, aspectRatio:'16/7' }}>
//             <img src="/algeria-map.jpg" alt="Carte Algérie"
//               className="w-full h-full object-cover"/>

//             {/* Overlay */}
//             <div className="absolute inset-0"
//               style={{ background:'linear-gradient(to right, rgba(8,15,8,0.6) 0%, rgba(8,15,8,0.2) 60%)' }}/>

//             {/* Scan line */}
//             <motion.div className="absolute left-0 right-0 h-px pointer-events-none"
//               style={{ background:'linear-gradient(90deg, transparent, #E8941A60, transparent)' }}
//               animate={{ top:['5%','95%','5%'] }}
//               transition={{ duration:5, repeat:Infinity, ease:'linear' }}/>

//             {/* City dots */}
//             {wilayas.map((w) => {
//               const pos  = CITY_POSITIONS[w]
//               const wdat = WILAYA_SOC[w]
//               if (!pos) return null
//               const color = wdat ? QUALITY_CONFIG[wdat.quality]?.color : C.mid
//               return (
//                 <div key={w}
//                   onClick={() => setSelectedWilaya(w)}
//                   className="absolute flex flex-col items-center cursor-pointer"
//                   style={{ left:pos.x, top:pos.y, transform:'translate(-50%,-50%)' }}>
//                   <motion.div className="absolute rounded-full"
//                     style={{ background:color, opacity:0.25 }}
//                     animate={{ width:selectedWilaya===w?[12,26,12]:[8,16,8], height:selectedWilaya===w?[12,26,12]:[8,16,8] }}
//                     transition={{ duration:2, repeat:Infinity }}/>
//                   <div className="w-3 h-3 rounded-full relative z-10 border-2 border-white"
//                     style={{ background:color, boxShadow:`0 0 8px ${color}` }}/>
//                   <span className="text-xs mt-1 font-semibold whitespace-nowrap"
//                     style={{ color:'rgba(255,255,255,0.9)', textShadow:'0 1px 4px rgba(0,0,0,0.8)',
//                       fontSize: selectedWilaya === w ? '11px' : '9px' }}>
//                     {w}
//                   </span>
//                 </div>
//               )
//             })}

//             {/* Bottom bar */}
//             <div className="absolute bottom-0 left-0 right-0 px-4 py-2"
//               style={{ background:'linear-gradient(to top, rgba(8,15,8,0.8), transparent)' }}>
//               <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>
//                 Sentinel-2 · 10m · TellEye SOC Overlay
//               </p>
//             </div>
//           </div>

//           {/* Selected wilaya detail */}
//           <AnimatePresence mode="wait">
//             {data && qcfg && (
//               <motion.div key={selectedWilaya}
//                 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
//                 exit={{ opacity:0 }} transition={{ duration:0.3 }}
//                 className="rounded-xl border p-5"
//                 style={{ background:C.white, borderColor:C.border }}>

//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-black" style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
//                       {selectedWilaya}
//                     </h3>
//                     <p className="text-xs mt-0.5" style={{ color:C.mid }}>
//                       Dernière mise à jour: Q1 2025
//                     </p>
//                   </div>
//                   <Badge label={qcfg.label} color={qcfg.color}/>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   {[
//                     { label:'SOC',    value:`${data.soc}%`,  color:qcfg.color,  max:5  },
//                     { label:'Argile', value:`${data.clay}%`, color:'#4A90D9',   max:60 },
//                     { label:'pH',     value:data.ph,         color:'#9B59B6',   max:14 },
//                   ].map(prop => (
//                     <div key={prop.label} className="text-center">
//                       <p className="text-xs font-semibold uppercase tracking-wide mb-2"
//                         style={{ color:C.mid }}>{prop.label}</p>
//                       <div className="w-full h-1.5 rounded-full mb-2"
//                         style={{ background:C.border }}>
//                         <motion.div className="h-full rounded-full"
//                           style={{ background:prop.color }}
//                           initial={{ width:0 }}
//                           animate={{ width:`${Math.min(100,(parseFloat(prop.value)/prop.max)*100)}%` }}
//                           transition={{ duration:0.6 }}/>
//                       </div>
//                       <p className="text-lg font-black"
//                         style={{ color:prop.color, fontFamily:'var(--font-heading)' }}>
//                         {prop.value}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// //  MISES À JOUR VIEW
// // ══════════════════════════════════════════════════════════════
// function UpdatesView() {
//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-black mb-1"
//           style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
//           Mises à jour saisonnières
//         </h2>
//         <p className="text-sm" style={{ color:C.mid }}>
//           Suivi des mises à jour trimestrielles de vos cartes sol.
//         </p>
//       </div>

//       <div className="rounded-xl border overflow-hidden"
//         style={{ borderColor:C.border, background:C.white }}>

//         {/* Header */}
//         <div className="grid px-5 py-3 border-b text-xs font-bold uppercase tracking-wide"
//           style={{ gridTemplateColumns:'1fr 80px 80px 100px 120px 100px',
//             borderColor:C.border, background:C.cream, color:C.mid, fontFamily:'var(--font-heading)' }}>
//           {['Wilaya','Q','Année','Statut','Tendance','Variation'].map(h => (
//             <span key={h}>{h}</span>
//           ))}
//         </div>

//         {MOCK_UPDATES.map((u, i) => {
//           const tcfg = TREND_CONFIG[u.trend] || { label:'—', color:C.mid }
//           const statusColor = u.status === 'delivered' ? C.good : u.status === 'scheduled' ? C.amber : C.mid
//           return (
//             <motion.div key={u.id}
//               initial={{ opacity:0 }} animate={{ opacity:1 }}
//               transition={{ delay:i*0.05 }}
//               className="grid items-center px-5 py-4 text-sm"
//               style={{ gridTemplateColumns:'1fr 80px 80px 100px 120px 100px',
//                 borderBottom: i < MOCK_UPDATES.length-1 ? `1px solid ${C.border}` : 'none' }}>
//               <span className="font-semibold" style={{ color:C.charcoal }}>{u.wilaya}</span>
//               <span style={{ color:C.mid }}>Q{u.quarter}</span>
//               <span style={{ color:C.mid }}>{u.year}</span>
//               <Badge
//                 label={u.status === 'delivered' ? 'Livré' : 'Planifié'}
//                 color={statusColor}/>
//               <Badge label={tcfg.label} color={tcfg.color}/>
//               <span className="font-bold"
//                 style={{ color: u.change.startsWith('+') ? C.good
//                   : u.change.startsWith('-') ? C.poor : C.mid }}>
//                 {u.change}
//               </span>
//             </motion.div>
//           )
//         })}
//       </div>

//       {/* Info box */}
//       <div className="mt-4 p-4 rounded-xl border text-sm"
//         style={{ background:C.sage, borderColor:C.forest+'30', color:C.forest }}>
//         Les mises à jour saisonnières sont générées automatiquement chaque trimestre.
//         Contactez contact@telleye.dz pour demander une mise à jour anticipée.
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// //  RAPPORTS VIEW
// // ══════════════════════════════════════════════════════════════
// function RapportsView() {
//   const [downloading, setDownloading] = useState(null)

//   const handleDownload = (report, format) => {
//     setDownloading(`${report.id}-${format}`)
//     // TODO: call GET /api/institutions/me/reports/{id}/download?format={format}
//     setTimeout(() => setDownloading(null), 1500)
//   }

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-black mb-1"
//           style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
//           Rapports
//         </h2>
//         <p className="text-sm" style={{ color:C.mid }}>
//           Téléchargez vos rapports PDF et exports GeoTIFF.
//         </p>
//       </div>

//       <div className="space-y-3">
//         {MOCK_REPORTS.map((r, i) => (
//           <motion.div key={r.id}
//             initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
//             transition={{ delay:i*0.06 }}
//             className="rounded-xl border p-5 flex items-center justify-between"
//             style={{ background:C.white, borderColor:C.border }}>

//             <div className="flex-1">
//               <div className="flex items-center gap-3 mb-1">
//                 <p className="text-sm font-semibold" style={{ color:C.charcoal }}>{r.title}</p>
//                 <Badge
//                   label={r.status === 'ready' ? 'Prêt' : 'En cours'}
//                   color={r.status === 'ready' ? C.good : C.amber}/>
//               </div>
//               <p className="text-xs" style={{ color:C.mid }}>
//                 {r.date} · {r.size}
//               </p>
//             </div>

//             {r.status === 'ready' && (
//               <div className="flex items-center gap-2 ml-4">
//                 {[['PDF','pdf'],['GeoTIFF','geotiff'],['SHP','shp']].map(([label, fmt]) => (
//                   <motion.button key={fmt}
//                     whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
//                     onClick={() => handleDownload(r, fmt)}
//                     disabled={downloading === `${r.id}-${fmt}`}
//                     className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
//                     style={{
//                       borderColor: C.border,
//                       color:       downloading === `${r.id}-${fmt}` ? C.mid : C.forest,
//                       background:  downloading === `${r.id}-${fmt}` ? C.cream : 'transparent',
//                       fontFamily:  'var(--font-heading)',
//                     }}>
//                     {downloading === `${r.id}-${fmt}` ? '...' : `↓ ${label}`}
//                   </motion.button>
//                 ))}
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// //  PARAMETRES VIEW
// // ══════════════════════════════════════════════════════════════
// function ParamsView({ user, wilayas, onLogout }) {
//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-black mb-1"
//           style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
//           Paramètres
//         </h2>
//         <p className="text-sm" style={{ color:C.mid }}>Informations de votre compte institution.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         {/* Account info */}
//         <div className="rounded-xl border p-6"
//           style={{ background:C.white, borderColor:C.border }}>
//           <p className="text-xs font-bold uppercase tracking-widest mb-5"
//             style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
//             Compte
//           </p>
//           <div className="space-y-3">
//             {[
//               ['Nom',      user?.full_name || '—'],
//               ['Role',     'Institution partenaire'],
//               ['Accès',    wilayas.length === 0 ? 'National' : `${wilayas.length} wilayas`],
//               ['Plan',     'Standard'],
//             ].map(([k,v]) => (
//               <div key={k} className="flex justify-between items-center py-2 border-b"
//                 style={{ borderColor:C.border }}>
//                 <span className="text-xs font-semibold uppercase tracking-wide"
//                   style={{ color:C.mid }}>{k}</span>
//                 <span className="text-sm font-medium" style={{ color:C.charcoal }}>{v}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Wilayas */}
//         <div className="rounded-xl border p-6"
//           style={{ background:C.white, borderColor:C.border }}>
//           <p className="text-xs font-bold uppercase tracking-widest mb-5"
//             style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
//             Wilayas assignées
//           </p>
//           {wilayas.length === 0 ? (
//             <div className="py-3 px-4 rounded-lg text-sm text-center"
//               style={{ background:C.sage, color:C.forest }}>
//               Accès national — toutes les wilayas
//             </div>
//           ) : (
//             <div className="flex flex-wrap gap-2">
//               {wilayas.map(w => (
//                 <span key={w} className="px-3 py-1 rounded-lg text-xs font-semibold"
//                   style={{ background:C.sage, color:C.forest }}>
//                   {w}
//                 </span>
//               ))}
//             </div>
//           )}

//           <div className="mt-5 pt-5 border-t" style={{ borderColor:C.border }}>
//             <p className="text-xs mb-3" style={{ color:C.mid }}>
//               Pour modifier vos wilayas ou votre plan, contactez TellEye.
//             </p>
//             <a href="mailto:contact@telleye.dz"
//               className="text-sm font-semibold" style={{ color:C.forest }}>
//               contact@telleye.dz
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Logout */}
//       <div className="mt-6">
//         <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
//           onClick={onLogout}
//           className="px-6 py-3 rounded-xl text-sm font-bold border transition-all"
//           style={{ borderColor:C.maroon, color:C.maroon, background:'transparent',
//             fontFamily:'var(--font-heading)' }}>
//           Se déconnecter
//         </motion.button>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════
// //  MAIN GOV DASHBOARD
// // ══════════════════════════════════════════════════════════════
// const NAV = [
//   { id:'overview', label:'Vue d\'ensemble' },
//   { id:'carte',    label:'Carte Sol'       },
//   { id:'updates',  label:'Mises à jour'    },
//   { id:'reports',  label:'Rapports'        },
//   { id:'settings', label:'Paramètres'      },
// ]

// export default function GovDashboard() {
//   const [activeNav, setActiveNav] = useState('overview')
//   const { user, logout, isAuthenticated } = useAuth()
//   const navigate = useNavigate()

//   // Mock wilayas — replace with real API data
//   const wilayas = MOCK_WILAYAS

//   useEffect(() => {
//     if (!isAuthenticated) navigate('/gov/login', { replace:true })
//   }, [isAuthenticated, navigate])

//   const handleLogout = () => {
//     logout()
//     navigate('/gov/login', { replace:true })
//   }

//   return (
//     <div className="min-h-screen flex" style={{ background:C.cream, fontFamily:'var(--font-body)' }}>

//       {/* ── Sidebar ─────────────────────────────────────── */}
//       <aside className="w-56 flex-shrink-0 flex flex-col border-r"
//         style={{ background:C.white, borderColor:C.border, minHeight:'100vh' }}>

//         {/* Logo */}
//         <div className="px-6 py-5 border-b" style={{ borderColor:C.border }}>
//           <p className="text-lg font-black"
//             style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
//             Tell<span style={{ color:C.amber }}>Eye</span>
//           </p>
//           <p className="text-xs mt-0.5 font-semibold uppercase tracking-widest"
//             style={{ color:C.mid }}>
//             Espace Institution
//           </p>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 px-3 py-4 space-y-0.5">
//           {NAV.map(item => (
//             <button key={item.id} onClick={() => setActiveNav(item.id)}
//               className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
//               style={{
//                 background: activeNav === item.id ? C.forest+'12' : 'transparent',
//                 color:      activeNav === item.id ? C.forest        : C.mid,
//                 fontFamily: 'var(--font-heading)',
//                 fontWeight: activeNav === item.id ? 700             : 500,
//               }}>
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         {/* Bottom */}
//         <div className="px-5 py-4 border-t" style={{ borderColor:C.border }}>
//           <p className="text-xs font-semibold truncate" style={{ color:C.mid }}>
//             {user?.full_name || 'Institution'}
//           </p>
//           <button onClick={handleLogout}
//             className="text-xs mt-0.5 transition-colors"
//             style={{ color:C.maroon, fontFamily:'var(--font-heading)' }}>
//             Déconnexion
//           </button>
//         </div>
//       </aside>

//       {/* ── Main ─────────────────────────────────────────── */}
//       <main className="flex-1 overflow-auto">

//         {/* Top bar */}
//         <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b"
//           style={{ background:C.white, borderColor:C.border }}>
//           <p className="text-xs font-semibold uppercase tracking-widest" style={{ color:C.mid }}>
//             {NAV.find(n => n.id === activeNav)?.label}
//           </p>
//           <div className="flex items-center gap-3">
//             <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
//               style={{ background:C.sage, color:C.forest }}>
//               {wilayas.length} wilayas
//             </span>
//             <span className="text-xs font-medium" style={{ color:C.mid }}>
//               {new Date().toLocaleDateString('fr-DZ', { day:'2-digit', month:'long', year:'numeric' })}
//             </span>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="px-8 py-8">
//           <AnimatePresence mode="wait">
//             <motion.div key={activeNav}
//               initial={{ opacity:0, y:10 }}
//               animate={{ opacity:1, y:0 }}
//               exit={{ opacity:0 }}
//               transition={{ duration:0.25 }}>

//               {activeNav === 'overview' && <OverviewView user={user} wilayas={wilayas}/>}
//               {activeNav === 'carte'    && <CarteView wilayas={wilayas}/>}
//               {activeNav === 'updates'  && <UpdatesView/>}
//               {activeNav === 'reports'  && <RapportsView/>}
//               {activeNav === 'settings' && <ParamsView user={user} wilayas={wilayas} onLogout={handleLogout}/>}

//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </main>
//     </div>
//   )
// }