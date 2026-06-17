/**
 * TellEye — Farmer Order Page
 * 3-step form: Select Zone → Your Info → Confirm & Pay
 * URL: /farmer
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, ZoomControl } from 'react-leaflet'
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

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla',
  'Naâma','Aïn Témouchent','Ghardaïa','Relizane',
]

const CROPS = [
  'Blé dur (Durum Wheat)','Blé tendre','Orge','Maïs','Tournesol',
  'Pomme de terre','Tomate','Oignon','Ail','Olivier','Vigne',
  'Agrumes','Datte (Palmier dattier)','Légumineuses','Autre',
]

const PAYMENT_METHODS = [
  { id:'cib',      label:'CIB / EDAHABIA', desc:'Carte bancaire CIB ou EDAHABIA' },
  { id:'baridimob',label:'BaridiMob',       desc:'Paiement mobile Algérie Poste'  },
  { id:'virement', label:'Virement',        desc:'Virement bancaire classique'     },
]

const STEPS = [
  { id:1, label:'Sélectionner la zone'   },
  { id:2, label:'Vos informations'       },
  { id:3, label:'Confirmation & Paiement'},
]

const polygonIcon = L.divIcon({
  className: '',
  html: `<div style="width:9px;height:9px;border-radius:50%;
    background:#2D6A3F;border:2px solid white;
    box-shadow:0 1px 5px rgba(45,106,63,0.7);"></div>`,
  iconSize:[9,9], iconAnchor:[4,4],
})

function PolygonDrawer({ points, onPoint, closed }) {
  useMapEvents({
    click(e) {
      if (!closed) onPoint([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

const fadeUp = {
  hidden:  { opacity:0, y:20 },
  visible: { opacity:1, y:0, transition:{ duration:0.4, ease:[0.22,1,0.36,1] } },
  exit:    { opacity:0, y:-10, transition:{ duration:0.2 } },
}

export default function FarmerOrder() {
  const navigate  = useNavigate()
  const [step, setStep] = useState(1)

  // Step 1 — Zone
  const [wilaya,  setWilaya]  = useState('')
  const [commune, setCommune] = useState('')
  const [points,  setPoints]  = useState([])
  const [closed,  setClosed]  = useState(false)
  const [area,    setArea]    = useState(null)
  const [zoneMode, setZoneMode] = useState('map')
  const [coordLat, setCoordLat] = useState('')
  const [coordLng, setCoordLng] = useState('')

  // Step 2 — Info
  const [fullName,     setFullName]     = useState('')
  const [phone,        setPhone]        = useState('')
  const [email,        setEmail]        = useState('')
  const [payment,      setPayment]      = useState('')
  const [farmerNotes,  setFarmerNotes]  = useState('')

  // Step 3 — Confirm
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState('')
  const [orderRef,   setOrderRef]   = useState('')   // ← CHANGE 1: real reference from DB

  const PRICE = 4500

  const closePolygon = () => {
    if (points.length >= 3) {
      setClosed(true)
      let a = 0
      for (let i=0; i<points.length; i++) {
        const j = (i+1) % points.length
        a += points[i][1] * points[j][0]
        a -= points[j][1] * points[i][0]
      }
      const areaHa = Math.abs(a / 2) * 111320 * 111320 / 10000
      setArea(areaHa.toFixed(1))
    }
  }

  const resetZone = () => {
    setPoints([]); setClosed(false); setArea(null)
    setCoordLat(''); setCoordLng('')
  }

  const canNext1 = wilaya && (closed || (coordLat && coordLng))
  const canNext2 = fullName && phone && email && payment

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      const payload = {
        wilaya, commune,
        full_name: fullName,
        phone, email, payment,
        farmer_notes: farmerNotes || null,
        price_da: PRICE,
        zone_type: closed ? 'polygon' : 'point',
        coordinates: closed ? points.map(p => [p[1], p[0]]) : null,
        area_ha: area ? parseFloat(area) : null,
        lat: coordLat ? parseFloat(coordLat) : null,
        lng: coordLng ? parseFloat(coordLng) : null,
      }
      const res = await fetch('http://localhost:8000/api/orders/', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Erreur serveur')
      }
      const data = await res.json()
      setOrderRef(data.reference)

      // ── Redirect to Chargily payment ──
      const checkoutRes = await fetch(
        `http://localhost:8000/api/payments/checkout/${data.id}`,
        { method: 'POST' }
      )
      if (checkoutRes.ok) {
        const checkoutData = await checkoutRes.json()
        window.location.href = checkoutData.checkout_url
        return
      }
      // Fallback: show success without payment
      setSubmitted(true)
    } catch (err) {
      setError(`Une erreur est survenue: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background:C.cream }}>
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="max-w-md w-full text-center p-10 rounded-2xl border"
          style={{ background:C.white, borderColor:C.border }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background:C.sage }}>
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-black mb-2"
            style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
            Demande envoyée !
          </h2>
          <p className="text-sm mb-2" style={{ color:C.mid }}>
            Votre demande d'analyse a bien été reçue.
          </p>
          <p className="text-sm mb-6" style={{ color:C.mid }}>
            Vous recevrez votre rapport à <strong>{email}</strong> dans un délai de 24 à 72 heures.
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background:C.sage }}>
            <p className="text-sm font-semibold" style={{ color:C.forest }}>
              Référence de commande
            </p>
            <p className="text-lg font-black mt-1"
              style={{ color:C.forest, fontFamily:'var(--font-heading)' }}>
              {orderRef}  {/* ← CHANGE 3: real reference from DB */}
            </p>
          </div>
          <button onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ background:C.maroon, color:C.white, fontFamily:'var(--font-heading)' }}>
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background:C.cream, fontFamily:'var(--font-body)' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between"
        style={{ background:C.white, borderColor:C.border }}>
        <button onClick={() => navigate('/')} className="text-lg font-black"
          style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
          Tell<span style={{ color:C.amber }}>Eye</span>
        </button>
        <p className="text-sm font-semibold" style={{ color:C.mid }}>
          Demande d'analyse sol
        </p>
        <button onClick={() => navigate('/')} className="text-sm" style={{ color:C.mid }}>
          Annuler
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                  style={{
                    background: step >= s.id ? C.maroon : C.white,
                    borderColor: step >= s.id ? C.maroon : C.border,
                    color:       step >= s.id ? C.white  : C.mid,
                    fontFamily:  'var(--font-heading)',
                  }}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <p className="text-xs mt-1.5 text-center w-24"
                  style={{ color: step >= s.id ? C.charcoal : C.mid, fontWeight: step === s.id ? 700 : 400 }}>
                  {s.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-24 h-0.5 mx-2 mb-5 transition-all"
                  style={{ background: step > s.id ? C.maroon : C.border }}/>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 — SELECT ZONE */}
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black mb-1"
                      style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
                      Étape 1 — Votre parcelle agricole
                    </h2>
                    <p className="text-sm" style={{ color:C.mid }}>
                      Délimitez la zone à analyser. TellEye utilisera les images satellite Sentinel-2 pour prédire le taux de carbone organique (SOC) de votre sol — sans aucune visite terrain.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                      style={{ color:C.mid }}>Wilaya *</label>
                    <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
                      style={{ border:`1.5px solid ${C.border}`, background:C.white, color:C.charcoal }}
                      onFocus={e => e.target.style.borderColor = C.forest}
                      onBlur={e  => e.target.style.borderColor = C.border}>
                      <option value="">— Sélectionner une wilaya —</option>
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                      style={{ color:C.mid }}>Commune</label>
                    <input value={commune} onChange={e => setCommune(e.target.value)}
                      placeholder="Entrez la commune"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ border:`1.5px solid ${C.border}`, background:C.white, color:C.charcoal }}
                      onFocus={e => e.target.style.borderColor = C.forest}
                      onBlur={e  => e.target.style.borderColor = C.border}/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                      style={{ color:C.mid }}>Mode de sélection</label>
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor:C.border }}>
                      {[['map','Dessiner sur la carte'],['coords','Coordonnées GPS']].map(([id,label]) => (
                        <button key={id} onClick={() => { setZoneMode(id); resetZone() }}
                          className="flex-1 py-2.5 text-sm font-semibold transition-all"
                          style={{
                            background: zoneMode === id ? C.forest : C.white,
                            color:      zoneMode === id ? C.white  : C.mid,
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {zoneMode === 'coords' && (
                    <div className="rounded-xl border p-4" style={{ background:C.white, borderColor:C.border }}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1" style={{ color:C.mid }}>Latitude</label>
                          <input value={coordLat} onChange={e => setCoordLat(e.target.value)}
                            placeholder="ex: 36.47"
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ border:`1.5px solid ${C.border}`, color:C.charcoal }}/>
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color:C.mid }}>Longitude</label>
                          <input value={coordLng} onChange={e => setCoordLng(e.target.value)}
                            placeholder="ex: 2.82"
                            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                            style={{ border:`1.5px solid ${C.border}`, color:C.charcoal }}/>
                        </div>
                      </div>
                    </div>
                  )}

                  {zoneMode === 'map' && (
                    <div className="rounded-xl border p-4" style={{ background:C.white, borderColor:C.border }}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color:C.mid }}>
                          Zone dessinée
                        </p>
                        {points.length > 0 && (
                          <button onClick={resetZone} className="text-xs" style={{ color:C.maroon }}>
                            Effacer
                          </button>
                        )}
                      </div>
                      {points.length === 0 && (
                        <p className="text-xs" style={{ color:C.mid }}>
                          Cliquez sur la carte à droite pour ajouter des points.
                        </p>
                      )}
                      {points.length > 0 && !closed && (
                        <div>
                          <p className="text-xs mb-2" style={{ color:C.mid }}>
                            {points.length} point{points.length > 1 ? 's' : ''} — minimum 3 requis
                          </p>
                          {points.length >= 3 && (
                            <button onClick={closePolygon}
                              className="w-full py-2 rounded-lg text-xs font-bold"
                              style={{ background:C.forest, color:C.white }}>
                              Fermer le polygone
                            </button>
                          )}
                        </div>
                      )}
                      {closed && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold" style={{ color:C.forest }}>✓ Zone définie</p>
                            {area && <p className="text-xs" style={{ color:C.mid }}>Surface estimée: ~{area} ha</p>}
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                            style={{ background:C.sage, color:C.forest }}>
                            {points.length} points
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: canNext1 ? 1.02 : 1 }}
                    whileTap={{ scale: canNext1 ? 0.97 : 1 }}
                    onClick={() => canNext1 && setStep(2)}
                    className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: canNext1 ? C.maroon : 'rgba(107,114,128,0.15)',
                      color:      canNext1 ? C.white  : C.mid,
                      cursor:     canNext1 ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-heading)',
                    }}>
                    Étape suivante →
                  </motion.button>
                </div>

                <div className="rounded-2xl overflow-hidden border"
                  style={{ borderColor:C.border, height:480 }}>
                  <MapContainer center={[28.0, 2.0]} zoom={5}
                    style={{ width:'100%', height:'100%' }} zoomControl={false}>
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="© Esri" maxZoom={19}/>
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                      maxZoom={19} opacity={0.8}/>
                    <ZoomControl position="bottomright"/>
                    {zoneMode === 'map' && (
                      <PolygonDrawer points={points} onPoint={p => setPoints(prev => [...prev, p])} closed={closed}/>
                    )}
                    {points.map((p,i) => <Marker key={i} position={p} icon={polygonIcon}/>)}
                    {closed && points.length >= 3 && (
                      <Polygon positions={points}
                        pathOptions={{ color:C.amber, fillColor:C.amber, fillOpacity:0.2, weight:2 }}/>
                    )}
                  </MapContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — YOUR INFO */}
          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-black mb-1"
                    style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
                    Étape 2 — Vos coordonnées
                  </h2>
                  <p className="text-sm" style={{ color:C.mid }}>
                    Votre rapport SOC sera envoyé à votre email dans un délai de 24 à 72 heures.
                  </p>
                </div>

                <div className="rounded-2xl border p-6 space-y-5 mb-6"
                  style={{ background:C.white, borderColor:C.border }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                        style={{ color:C.mid }}>Nom complet *</label>
                      <input value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="Ahmed Benali"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border:`1.5px solid ${C.border}`, color:C.charcoal }}
                        onFocus={e => e.target.style.borderColor = C.forest}
                        onBlur={e  => e.target.style.borderColor = C.border}/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                        style={{ color:C.mid }}>Téléphone *</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+213 xxx xxx xxx"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ border:`1.5px solid ${C.border}`, color:C.charcoal }}
                        onFocus={e => e.target.style.borderColor = C.forest}
                        onBlur={e  => e.target.style.borderColor = C.border}/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                      style={{ color:C.mid }}>Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="ahmed@exemple.dz"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ border:`1.5px solid ${C.border}`, color:C.charcoal }}
                      onFocus={e => e.target.style.borderColor = C.forest}
                      onBlur={e  => e.target.style.borderColor = C.border}/>
                    <p className="text-xs mt-1" style={{ color:C.mid }}>
                      Votre rapport sera envoyé à cette adresse.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border p-6 mb-6"
                  style={{ background:C.white, borderColor:C.border }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color:C.mid }}>Mode de paiement *</p>
                  <div className="grid grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map(m => (
                      <button key={m.id} onClick={() => setPayment(m.id)}
                        className="p-4 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: payment === m.id ? C.maroon : C.border,
                          background:  payment === m.id ? C.maroon+'08' : C.white,
                        }}>
                        <p className="text-sm font-bold mb-0.5"
                          style={{ color: payment === m.id ? C.maroon : C.charcoal }}>
                          {m.label}
                        </p>
                        <p className="text-xs" style={{ color:C.mid }}>{m.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color:C.mid }}>
                    Le paiement sera traité via Chargily Pay — plateforme de paiement algérienne sécurisée.
                  </p>
                </div>

                <div className="rounded-2xl border p-6 mb-6"
                  style={{ background:C.white, borderColor:C.border }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:C.mid }}>
                    Description / Question (optionnel)
                  </p>
                  <p className="text-xs mb-3" style={{ color:C.mid }}>
                    Décrivez votre parcelle, problème constaté, ou question particulière sur votre sol.
                  </p>
                  <textarea
                    value={farmerNotes} onChange={e => setFarmerNotes(e.target.value)}
                    placeholder="Ex: Ma parcelle présente des zones jaunissantes..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ border:`1.5px solid ${C.border}`, color:C.charcoal, background:C.cream }}
                    onFocus={e => e.target.style.borderColor = C.forest}
                    onBlur={e  => e.target.style.borderColor = C.border}/>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold border"
                    style={{ borderColor:C.border, color:C.mid, background:C.white }}>
                    ← Retour
                  </button>
                  <motion.button
                    whileHover={{ scale: canNext2 ? 1.02 : 1 }}
                    whileTap={{ scale: canNext2 ? 0.97 : 1 }}
                    onClick={() => canNext2 && setStep(3)}
                    className="flex-[2] py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: canNext2 ? C.maroon : 'rgba(107,114,128,0.15)',
                      color:      canNext2 ? C.white  : C.mid,
                      cursor:     canNext2 ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-heading)',
                    }}>
                    Confirmer →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — CONFIRM & PAY */}
          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-black mb-1"
                    style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
                    Étape 3 — Confirmer & Payer
                  </h2>
                  <p className="text-sm" style={{ color:C.mid }}>
                    Vérifiez votre commande avant de procéder au paiement.
                  </p>
                </div>

                <div className="rounded-2xl border p-6 mb-4"
                  style={{ background:C.white, borderColor:C.border }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:C.mid }}>
                    Récapitulatif
                  </p>
                  <div className="space-y-3">
                    {[
                      ['Wilaya',    wilaya || '—'],
                      ['Commune',   commune || '—'],
                      ['Zone',      closed ? `Polygone — ${points.length} points${area ? ` (~${area} ha)` : ''}` : coordLat ? `${coordLat}°N, ${coordLng}°E` : '—'],
                      ['Nom',       fullName],
                      ['Téléphone', phone],
                      ['Email',     email],
                      ['Paiement',  PAYMENT_METHODS.find(m => m.id === payment)?.label || '—'],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between items-center py-2 border-b"
                        style={{ borderColor:C.border }}>
                        <span className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color:C.mid }}>{k}</span>
                        <span className="text-sm font-medium" style={{ color:C.charcoal }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border p-6 mb-4"
                  style={{ background:C.sage, borderColor:C.forest+'30' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color:C.forest }}>
                    Votre rapport inclut
                  </p>
                  <div className="space-y-2">
                    {[
                      'Carte SOC de votre parcelle avec valeurs en %',
                      'Rapport PDF avec interprétation agronomique complète',
                      'Recommandations fertilisation et irrigation',
                      'Guide de cultures adaptées à votre sol et wilaya',
                      'Comparaison avec la moyenne régionale',
                      'Livraison par email dans 24 à 72 heures',
                    ].map((item,i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:C.forest }}/>
                        <p className="text-sm" style={{ color:C.forest }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border p-6"
                  style={{ background:C.charcoal, borderColor:'transparent' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color:'rgba(255,255,255,0.4)' }}>Total à payer</p>
                      <p className="text-3xl font-black"
                        style={{ color:C.amber, fontFamily:'var(--font-heading)' }}>
                        {PRICE.toLocaleString()} DA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>Paiement via</p>
                      <p className="text-sm font-bold" style={{ color:C.white }}>
                        {PAYMENT_METHODS.find(m => m.id === payment)?.label}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs mb-3 p-3 rounded-lg"
                      style={{ background:'rgba(255,0,0,0.1)', color:'#ff6b6b' }}>
                      {error}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={handleSubmit} disabled={submitting}
                    className="w-full py-4 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: submitting ? 'rgba(255,255,255,0.1)' : C.white,
                      color:      submitting ? 'rgba(255,255,255,0.4)' : C.charcoal,
                      fontFamily: 'var(--font-heading)',
                    }}>
                    {submitting ? 'Traitement en cours...' : 'Confirmer et payer →'}
                  </motion.button>

                  <p className="text-xs text-center mt-3" style={{ color:'rgba(255,255,255,0.3)' }}>
                    Paiement sécurisé via Chargily Pay
                  </p>
                </div>

                <button onClick={() => setStep(2)} className="w-full mt-3 py-2.5 text-sm"
                  style={{ color:C.mid }}>
                  ← Modifier mes informations
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}