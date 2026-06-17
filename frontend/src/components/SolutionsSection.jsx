import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ── Animation helpers ──────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }

function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden"
      animate={inView ? 'visible' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

// ── SVG Icons (no emojis) ──────────────────────────────────────
const icons = {
  farmer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.95 5.05l-.707.707"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  institution: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2L2 7h20L12 2zM4 7v13h16V7M9 11v9M15 11v9M2 20h20"/>
    </svg>
  ),
  researcher: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l1.197 3.592a1 1 0 01-.743 1.302l-2.3.575a1 1 0 01-1.243-.878l-.34-3.417M5 14.5L3.803 18.09a1 1 0 00.743 1.302l2.3.575a1 1 0 001.243-.878l.34-3.417"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503-7.498l3-1.88c.486-.304 1.0-.097 1.0.52v11.69c0 .614-.504.817-.997.52l-3.003-1.877M9.003 6.752l-3-1.877C5.5 4.571 5 4.773 5 5.387v11.69c0 .614.504.817.997.52l3.006-1.878M15 6.75l-6 4.5"/>
    </svg>
  ),
  soil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
    </svg>
  ),
  satellite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
    </svg>
  ),
}

// ── CLIENT TABS DATA ───────────────────────────────────────────
const CLIENTS = [
  {
    id: 'farmer',
    label: 'Agriculteurs',
    labelAr: 'الفلاحون',
    icon: icons.farmer,
    color: '#6B1F1F',
    colorLight: 'rgba(107,31,31,0.12)',
    headline: 'Connaître son sol avant de planter',
    sub: 'Un service d\'analyse à la demande. Vous définissez votre parcelle — TellEye livre votre rapport complet en 24 à 72 heures, sans aucune visite terrain.',
    features: [
      'Analyse SOC, argile, pH et texture de votre parcelle',
      'Rapport PDF avec interprétation agronomique complète',
      'Guide de cultures adaptées à votre sol et votre wilaya',
      'Recommandations fertilisation et irrigation personnalisées',
      'Comparaison de votre sol par rapport à la moyenne régionale',
      'Suivi saisonnier — évolution de vos propriétés sol',
    ],
    deliverable: 'Rapport PDF livré par email + espace client',
    price: 'À partir de 2 000 DA',
    cta: 'Demander une analyse',
    to: '/farmer',
  },
  {
    id: 'institution',
    label: 'Institutions',
    labelAr: 'المؤسسات',
    icon: icons.institution,
    color: '#2D6A3F',
    colorLight: 'rgba(45,106,63,0.12)',
    headline: 'Cartographie nationale pour décideurs',
    sub: 'Cartes sol à l\'échelle wilaya pour la politique agricole, la sécurité alimentaire, la surveillance de la désertification et la planification territoriale.',
    features: [
      'Cartes SOC et propriétés sol à l\'échelle wilaya ou nationale',
      'Exports GeoTIFF et SHP compatibles avec vos systèmes GIS',
      'Rapports institutionnels trimestriels avec tendances',
      'Dashboard dédié avec accès multi-utilisateurs',
      'Intégration API dans vos systèmes d\'information ministériels',
      'Mise à jour saisonnière — suivi de la dégradation des sols',
    ],
    deliverable: 'Cartes GeoTIFF + PDF + Dashboard + API',
    price: 'À partir de 80 000 DA / wilaya / an',
    cta: 'Voir les plans gouvernementaux',
    to: '/institution',
  },
  {
    id: 'researcher',
    label: 'Chercheurs & Dev',
    labelAr: 'الباحثون',
    icon: icons.researcher,
    color: '#E8941A',
    colorLight: 'rgba(232,148,26,0.12)',
    headline: 'API ouverte pour l\'agri-tech algérienne',
    sub: 'Accès gratuit pour la recherche académique. API REST documentée pour intégrer les prédictions sol dans vos applications, modèles ou publications scientifiques.',
    features: [
      'Free tier : 3 prédictions/mois sans inscription',
      'API REST avec clé — 500 appels/mois en plan Pro',
      'Endpoint de prédiction ponctuelle (lat/lng → SOC, argile, pH)',
      'Batch processing — analyse de polygones multi-parcelles',
      'Documentation complète + SDK Python/JavaScript',
      'Accès aux données OSSL et aux sorties DANN pour co-publication',
    ],
    deliverable: 'API REST + Documentation + SDK',
    price: 'Free pour académique — Pro 15 000 DA/mois',
    cta: 'Explorer la documentation',
    to: '/pricing',
  },
]

// ── WILAYAS (shortened list) ───────────────────────────────────
const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane',
]

// ── SOIL PROPERTIES ────────────────────────────────────────────
const PROPERTIES = [
  { id: 'soc',     label: 'SOC',          unit: '%',     desc: 'Carbone Organique du Sol',   color: '#2D9E5A' },
  { id: 'clay',    label: 'Argile',        unit: '%',     desc: 'Teneur en argile',            color: '#4A90D9' },
  { id: 'ph',      label: 'pH',            unit: '',      desc: 'Acidité / alcalinité',        color: '#9B59B6' },
  { id: 'texture', label: 'Texture',       unit: 'classe',desc: 'Classe texturale du sol',    color: '#E8941A' },
  { id: 'sand',    label: 'Sable',         unit: '%',     desc: 'Fraction sableuse',           color: '#C0392B' },
  { id: 'silt',    label: 'Limon',         unit: '%',     desc: 'Fraction limoneuse',          color: '#6B1F1F' },
]

// ── MOCK RESULT for the interactive demo ──────────────────────
const MOCK_DATA = {
  soc:     { value: '1.82', quality: 'medium', label: 'SOC moyen — amendement conseillé' },
  clay:    { value: '28.4', quality: 'good',   label: 'Argile correcte — bonne rétention' },
  ph:      { value: '7.6',  quality: 'medium', label: 'Légèrement alcalin — surveiller' },
  texture: { value: 'Limoneux',quality:'good', label: 'Texture favorable aux céréales' },
  sand:    { value: '38.2', quality: 'medium', label: 'Sable modéré' },
  silt:    { value: '33.4', quality: 'good',   label: 'Limon équilibré' },
}

const QUALITY_STYLE = {
  good:   { color: '#2D9E5A', bg: 'rgba(45,158,90,0.1)',   dot: '#2D9E5A' },
  medium: { color: '#E8941A', bg: 'rgba(232,148,26,0.1)',  dot: '#E8941A' },
  poor:   { color: '#C0392B', bg: 'rgba(192,57,43,0.1)',   dot: '#C0392B' },
}

// ── AGRONOMIC ADVICE CARDS ─────────────────────────────────────
const ADVICE = [
  {
    icon: icons.satellite,
    title: 'Cartographie de votre parcelle',
    desc: 'TellEye délimite automatiquement votre parcelle depuis votre coordonnée GPS et génère la carte sol correspondante au pixel Sentinel-2.',
  },
  {
    icon: icons.soil,
    title: 'Conseil de cultures adapté',
    desc: 'En fonction de votre SOC, pH et texture, TellEye vous propose un tableau de cultures optimales classées par rentabilité pour votre wilaya.',
  },
  {
    icon: icons.filter,
    title: 'Plan de fertilisation',
    desc: 'Recommandations d\'apports azotés, phosphorés et potassiques calculées à partir de vos propriétés sol réelles — plus de sur-fertilisation.',
  },
  {
    icon: icons.api,
    title: 'Suivi saisonnier',
    desc: 'Comparez vos résultats sol entre saisons. TellEye détecte les tendances de dégradation ou d\'amélioration du SOC sur votre exploitation.',
  },
]

// ─────────────────────────────────────────────────────────────────
export default function SolutionsSection() {
  const [wilaya,      setWilaya]      = useState('')
  const [activeProp,  setActiveProp]  = useState('soc')
  const [showResult,  setShowResult]  = useState(false)
  const navigate = useNavigate()

  
  const prop   = PROPERTIES.find(p => p.id === activeProp)
  const result = MOCK_DATA[activeProp]
  const qs     = QUALITY_STYLE[result?.quality || 'medium']

  const handleSearch = () => {
    if (wilaya) setShowResult(true)
  }

  return (
    <section id="solutions" className="py-24" style={{ background: '#F9F6F0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ──────────────────────────────────── */}
        <Section className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2D6A3F' }}>
            Nos Services
          </span>
          <h2 className="text-4xl lg:text-5xl font-black mt-3 mb-4"
            style={{ color: '#1C1C1C', fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
            Une plateforme.<br />
            <span style={{ color: '#6B1F1F' }}>Trois types d&apos;acteurs.</span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(28,28,28,0.55)' }}>
            Que vous soyez agriculteur, décideur institutionnel ou chercheur —
            TellEye s&apos;adapte à votre besoin avec un service dédié.
          </p>
        </Section>

        {/* ── 3 Client cards — always visible ─────────────────── */}
        <motion.div variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {CLIENTS.map((c, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              whileHover={{ y: -6, boxShadow: `0 20px 50px rgba(0,0,0,0.12)` }}
              className="rounded-2xl border flex flex-col overflow-hidden transition-all"
              style={{ background: 'white', borderColor: 'rgba(0,0,0,0.07)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

              {/* Card top accent */}
              <div className="h-1 w-full" style={{ background: c.color }}/>

              <div className="p-7 flex-1">
                {/* Icon + label */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: c.colorLight, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black"
                      style={{ color: '#1C1C1C', fontFamily: 'var(--font-heading)' }}>
                      {c.label}
                    </h3>
                    <p className="text-xs" style={{ color: c.color, fontFamily: 'var(--font-arabic)' }}>
                      {c.labelAr}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-5"
                  style={{ color: 'rgba(28,28,28,0.58)' }}>{c.sub}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {c.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm"
                      style={{ color: 'rgba(28,28,28,0.72)' }}>
                      <span className="mt-0.5 flex-shrink-0" style={{ color: c.color }}>
                        {icons.check}
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="px-7 pb-7 pt-4 border-t border-black/5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(28,28,28,0.4)' }}>Livrable</span>
                  <span className="font-semibold text-right max-w-[60%]"
                    style={{ color: '#1C1C1C' }}>{c.deliverable}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(28,28,28,0.4)' }}>Tarif</span>
                  <span className="font-bold" style={{ color: c.color }}>{c.price}</span>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(c.to)}
                  className="w-full mt-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: c.color, color: '#fff' }}>
                  {c.cta} {icons.arrow}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            INTERACTIVE FILTER — Wilaya + Property
        ══════════════════════════════════════════════════════ */}
        <Section className="mb-20">
          <div className="rounded-2xl overflow-hidden border border-black/8"
            style={{ background: '#0C1A10', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/6">
              <div className="flex items-center gap-3 mb-2">
                <div style={{ color: '#E8941A' }}>{icons.filter}</div>
                <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Explorez les données sol par région et propriété
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sélectionnez une wilaya et une propriété sol — obtenez une prédiction instantanée.
              </p>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Filters */}
              <div className="space-y-6">

                {/* Wilaya selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Wilaya
                  </label>
                  <div className="relative">
                    <select
                      value={wilaya}
                      onChange={e => { setWilaya(e.target.value); setShowResult(false) }}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium appearance-none outline-none cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: wilaya ? '#fff' : 'rgba(255,255,255,0.35)',
                      }}>
                      <option value="" style={{ background: '#1C1C1C' }}>
                        -- Sélectionner une wilaya --
                      </option>
                      {WILAYAS.map((w, i) => (
                        <option key={i} value={w} style={{ background: '#1C1C1C', color: '#fff' }}>
                          {String(i + 1).padStart(2, '0')} · {w}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Property pills */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Propriété sol
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTIES.map(p => (
                      <button key={p.id}
                        onClick={() => { setActiveProp(p.id); setShowResult(false) }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200"
                        style={{
                          borderColor: activeProp === p.id ? p.color : 'rgba(255,255,255,0.1)',
                          background:  activeProp === p.id ? p.color + '22' : 'transparent',
                          color:       activeProp === p.id ? p.color        : 'rgba(255,255,255,0.45)',
                        }}>
                        {p.label}
                        {p.unit && <span className="ml-1 opacity-60">({p.unit})</span>}
                      </button>
                    ))}
                  </div>
                  {prop && (
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {prop.desc}
                    </p>
                  )}
                </div>

                {/* Search button */}
                <motion.button
                  whileHover={{ scale: wilaya ? 1.03 : 1 }}
                  whileTap={{ scale: wilaya ? 0.97 : 1 }}
                  onClick={handleSearch}
                  disabled={!wilaya}
                  className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: wilaya ? '#E8941A' : 'rgba(255,255,255,0.06)',
                    color:      wilaya ? '#fff'    : 'rgba(255,255,255,0.25)',
                    cursor:     wilaya ? 'pointer' : 'not-allowed',
                  }}>
                  Obtenir la prédiction
                  {icons.arrow}
                </motion.button>
              </div>

              {/* Result panel */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {showResult && result ? (
                    <motion.div key="result"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl p-6 border"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>

                      {/* Wilaya + property heading */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Résultat · {wilaya}
                          </p>
                          <h4 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                            {prop?.label} — {result.value} {prop?.unit !== 'classe' ? prop?.unit : ''}
                          </h4>
                        </div>
                        <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ background: qs.dot, boxShadow: `0 0 8px ${qs.dot}` }}/>
                      </div>

                      {/* Quality badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{ background: qs.bg, color: qs.color }}>
                        {result.label}
                      </div>

                      {/* Progress bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-1.5"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>
                          <span>Faible</span>
                          <span>Optimal</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                          <motion.div className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${qs.color}, ${qs.dot})` }}
                            initial={{ width: 0 }}
                            animate={{ width: result.quality === 'good' ? '75%' : result.quality === 'medium' ? '50%' : '25%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg text-xs leading-relaxed"
                        style={{ background: 'rgba(45,106,63,0.12)', color: 'rgba(255,255,255,0.55)', borderLeft: `2px solid #2D6A3F` }}>
                        Prédiction indicative gratuite via modèle DANN + Sentinel-2.
                        Pour un rapport complet avec conseils agronomiques, demandez une analyse.
                      </div>

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/farmer')}
                        className="w-full mt-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: '#2D6A3F', color: '#fff' }}>
                        Demander un rapport complet
                        {icons.arrow}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div key="placeholder"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center py-12"
                      style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div className="mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>
                        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1"
                          className="w-12 h-12 mx-auto">
                          <circle cx="24" cy="24" r="20"/>
                          <path strokeLinecap="round" d="M14 24h4m12 0h4M24 14v4m0 12v4"/>
                          <circle cx="24" cy="24" r="4"/>
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        Sélectionnez une wilaya et une propriété<br />pour voir la prédiction
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════
            AGRONOMIC ADVICE STRIP
        ══════════════════════════════════════════════════════ */}
        <Section>
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2D6A3F' }}>
              Au-delà de la donnée
            </span>
            <h3 className="text-3xl font-black mt-2"
              style={{ color: '#1C1C1C', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Conseils agronomiques inclus
            </h3>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: 'rgba(28,28,28,0.5)' }}>
              TellEye ne livre pas seulement des chiffres. Chaque rapport inclut
              une interprétation agronomique concrète et actionnable pour votre parcelle.
            </p>
          </div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ADVICE.map((a, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
                className="rounded-2xl p-6 border border-black/6 transition-all"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'rgba(45,106,63,0.1)', color: '#2D6A3F' }}>
                  {a.icon}
                </div>
                <h4 className="text-sm font-bold mb-2"
                  style={{ color: '#1C1C1C', fontFamily: 'var(--font-heading)' }}>
                  {a.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(28,28,28,0.55)' }}>
                  {a.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: '#6B1F1F' }}>
            <div>
              <h4 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                Prêt à connaître votre sol ?
              </h4>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Première analyse gratuite — aucun déplacement, aucune prise d&apos;échantillon.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/farmer')}
                className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
                style={{ background: '#E8941A', color: '#fff' }}>
                Démarrer maintenant
                {icons.arrow}
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/pricing')}
                className="px-6 py-3 rounded-xl text-sm font-bold border"
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                Voir les tarifs
              </motion.button>
            </div>
          </motion.div>
        </Section>

      </div>
    </section>
  )
}