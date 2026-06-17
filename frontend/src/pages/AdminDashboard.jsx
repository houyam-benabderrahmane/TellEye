import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Design tokens ──────────────────────────────────────────────
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

// ── Mock data ──────────────────────────────────────────────────
const MOCK_INSTITUTIONS = [
  {
    id: 1,
    name: 'Client 1',
    short_name: 'Client 1',
    type: 'ministry',
    contact_email: '—',
    plan: 'pilot',
    wilaya_access: [],
    is_active: false,
    contract_end: null,
    total_predictions: 0,
    total_reports: 0,
    created_at: '—',
  },
]

const ALL_WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla',
  'Naâma','Aïn Témouchent','Ghardaïa','Relizane',
]

const PLAN_LABELS = {
  pilot:    { label: 'Pilote',   color: C.mid    },
  standard: { label: 'Standard', color: C.forest  },
  national: { label: 'National', color: C.maroon  },
  custom:   { label: 'Custom',   color: C.amber   },
}

const TYPE_LABELS = {
  ministry:           'Ministère',
  research_institute: 'Institut de Recherche',
  wilaya:             'Direction Wilaya',
  agency:             'Agence',
  other:              'Autre',
}

// ── Fade animation ─────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22,1,0.36,1], delay: i * 0.06 },
  }),
}

// ── Small components ───────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold"
      style={{ background: color + '18', color, fontFamily:'var(--font-heading)' }}>
      {label}
    </span>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl p-5 border"
      style={{ background: C.white, borderColor: C.border, boxShadow:'0 1px 6px rgba(0,0,0,0.05)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: C.mid }}>{label}</p>
      <p className="text-3xl font-black mb-0.5"
        style={{ color: accent || C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.03em' }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: C.mid }}>{sub}</p>}
    </div>
  )
}

function Input({ label, name, type='text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
        {label} {required && <span style={{ color: C.maroon }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{
          border: `1.5px solid ${C.border}`,
          background: C.white,
          color: C.charcoal,
          fontFamily: 'var(--font-body)',
        }}
        onFocus={e => e.target.style.borderColor = C.forest}
        onBlur={e  => e.target.style.borderColor = C.border}
      />
    </div>
  )
}

function Select({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
        {label} {required && <span style={{ color: C.maroon }}>*</span>}
      </label>
      <select name={name} value={value} onChange={onChange} required={required}
        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none appearance-none transition-all"
        style={{
          border: `1.5px solid ${C.border}`,
          background: C.white,
          color: C.charcoal,
          fontFamily: 'var(--font-body)',
        }}
        onFocus={e => e.target.style.borderColor = C.forest}
        onBlur={e  => e.target.style.borderColor = C.border}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  VIEWS
// ══════════════════════════════════════════════════════════════

// ── Mock data for other segments (replace with real API calls later) ──
const MOCK_PLATFORM_STATS = {
  farmers:     { total: 0, active: 0, requests: 0,  revenue: '—' },
  researchers: { total: 0, active: 0, api_calls: 0 },
  agritech:    { total: 0, active: 0, api_calls: 0,  revenue: '—' },
}

function OverviewView({ institutions }) {
  const instActive  = institutions.filter(i => i.is_active).length
  const totalPred   = institutions.reduce((s, i) => s + i.total_predictions, 0)
  const s = MOCK_PLATFORM_STATS

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-1"
          style={{ color: C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
          Vue d&apos;ensemble
        </h2>
        <p className="text-sm" style={{ color: C.mid }}>
          Etat global de la plateforme TellEye — tous les segments clients.
        </p>
      </div>

      {/* ── Global totals ───────────────────────────────── */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
        Plateforme globale
      </p>
      <motion.div variants={{ visible:{ transition:{ staggerChildren:0.06 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Utilisateurs totaux',    value: institutions.length + s.farmers.total + s.researchers.total + s.agritech.total, sub:'tous segments confondus', accent: C.charcoal },
          { label:'Prédictions totales',    value: totalPred + s.farmers.requests + s.researchers.api_calls, sub:'depuis le lancement', accent: C.maroon },
          { label:'Wilayas couvertes',      value: '48', sub:'couverture nationale', accent: C.forest },
          { label:'Revenu total estimé',    value: '287 000 DA', sub:'ce mois', accent: C.amber },
        ].map((card, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}>
            <StatCard {...card}/>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Per-segment breakdown ───────────────────────── */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
        Par segment client
      </p>
      <motion.div variants={{ visible:{ transition:{ staggerChildren:0.07 } } }}
        initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">

        {/* B2G — Institutions */}
        <motion.div variants={fadeUp} custom={0}
          className="rounded-xl border p-5"
          style={{ background: C.white, borderColor: C.border,
            boxShadow:'0 1px 6px rgba(0,0,0,0.05)', borderTop:`3px solid ${C.maroon}` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: C.maroon, fontFamily:'var(--font-heading)' }}>
            B2G — Institutions
          </p>
          <div className="space-y-2">
            {[
              ['Comptes',    institutions.length],
              ['Actifs',     instActive],
              ['Prédictions',totalPred],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: C.mid }}>{k}</span>
                <span className="font-bold" style={{ color: C.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs font-semibold"
            style={{ borderColor: C.border, color: C.maroon }}>
            Ministères · INRAA · Wilayas
          </div>
        </motion.div>

        {/* B2C — Agriculteurs */}
        <motion.div variants={fadeUp} custom={1}
          className="rounded-xl border p-5"
          style={{ background: C.white, borderColor: C.border,
            boxShadow:'0 1px 6px rgba(0,0,0,0.05)', borderTop:`3px solid ${C.forest}` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: C.forest, fontFamily:'var(--font-heading)' }}>
            B2C — Agriculteurs
          </p>
          <div className="space-y-2">
            {[
              ['Comptes',       s.farmers.total],
              ['Actifs',        s.farmers.active],
              ['Demandes sol',  s.farmers.requests],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: C.mid }}>{k}</span>
                <span className="font-bold" style={{ color: C.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs font-semibold"
            style={{ borderColor: C.border, color: C.forest }}>
            Revenu : {s.farmers.revenue}
          </div>
        </motion.div>

        {/* Free — Chercheurs */}
        <motion.div variants={fadeUp} custom={2}
          className="rounded-xl border p-5"
          style={{ background: C.white, borderColor: C.border,
            boxShadow:'0 1px 6px rgba(0,0,0,0.05)', borderTop:`3px solid ${C.mid}` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
            Free — Chercheurs
          </p>
          <div className="space-y-2">
            {[
              ['Comptes',      s.researchers.total],
              ['Actifs',       s.researchers.active],
              ['Appels API',   s.researchers.api_calls],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: C.mid }}>{k}</span>
                <span className="font-bold" style={{ color: C.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs font-semibold"
            style={{ borderColor: C.border, color: C.mid }}>
            Universités · Etudiants
          </div>
        </motion.div>

        {/* B2B — Agri-tech */}
        <motion.div variants={fadeUp} custom={3}
          className="rounded-xl border p-5"
          style={{ background: C.white, borderColor: C.border,
            boxShadow:'0 1px 6px rgba(0,0,0,0.05)', borderTop:`3px solid ${C.amber}` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: C.amber, fontFamily:'var(--font-heading)' }}>
            B2B — Agri-tech
          </p>
          <div className="space-y-2">
            {[
              ['Comptes',     s.agritech.total],
              ['Actifs',      s.agritech.active],
              ['Appels API',  s.agritech.api_calls],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: C.mid }}>{k}</span>
                <span className="font-bold" style={{ color: C.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-xs font-semibold"
            style={{ borderColor: C.border, color: C.amber }}>
            Revenu : {s.agritech.revenue}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Recent institutions ─────────────────────────── */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
        Institutions récentes
      </p>
      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: C.border, background: C.white }}>
        {institutions.map((inst, i) => (
          <div key={inst.id}
            className={`flex items-center justify-between px-5 py-4 ${i < institutions.length - 1 ? 'border-b' : ''}`}
            style={{ borderColor: C.border }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.charcoal }}>{inst.name}</p>
              <p className="text-xs mt-0.5" style={{ color: C.mid }}>
                {TYPE_LABELS[inst.type]} · {inst.total_predictions} prédictions · créé le {inst.created_at}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge {...PLAN_LABELS[inst.plan]} />
              <Badge
                label={inst.is_active ? 'Actif' : 'Inactif'}
                color={inst.is_active ? C.forest : C.mid}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Institutions list ──────────────────────────────────────────
function InstitutionsView({ institutions, onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.contact_email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black mb-1"
            style={{ color: C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
            Institutions
          </h2>
          <p className="text-sm" style={{ color: C.mid }}>
            {institutions.length} compte{institutions.length > 1 ? 's' : ''} enregistré{institutions.length > 1 ? 's' : ''}
          </p>
        </div>
        <input
          placeholder="Rechercher..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg text-sm outline-none"
          style={{ border:`1.5px solid ${C.border}`, background:C.white,
            color:C.charcoal, width:220, fontFamily:'var(--font-body)' }}
        />
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: C.border, background: C.white }}>

        {/* Table header */}
        <div className="grid px-5 py-3 border-b"
          style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 80px', borderColor: C.border,
            background: C.cream }}>
          {['Institution','Type','Plan','Wilayas','Statut'].map(h => (
            <span key={h} className="text-xs font-bold uppercase tracking-wide"
              style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm" style={{ color: C.mid }}>
            Aucune institution trouvée.
          </div>
        )}

        {filtered.map((inst, i) => (
          <motion.div key={inst.id}
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            transition={{ delay: i * 0.05 }}
            className="grid items-center px-5 py-4 cursor-pointer transition-colors"
            style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}
            onClick={() => onSelect(inst)}
            onMouseEnter={e => e.currentTarget.style.background = C.cream}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div>
              <p className="text-sm font-semibold" style={{ color: C.charcoal }}>
                {inst.short_name || inst.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.mid }}>{inst.contact_email}</p>
            </div>

            <span className="text-sm" style={{ color: C.mid }}>
              {TYPE_LABELS[inst.type]}
            </span>

            <Badge {...PLAN_LABELS[inst.plan]} />

            <span className="text-sm" style={{ color: C.mid }}>
              {inst.wilaya_access.length === 0
                ? 'Nationale'
                : `${inst.wilaya_access.length} wilaya${inst.wilaya_access.length > 1 ? 's' : ''}`
              }
            </span>

            <Badge
              label={inst.is_active ? 'Actif' : 'Inactif'}
              color={inst.is_active ? C.forest : C.mid}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Institution detail ─────────────────────────────────────────
function InstitutionDetailView({ institution, onBack }) {
  if (!institution) return null
  return (
    <div>
      <button onClick={onBack} className="text-sm mb-6 flex items-center gap-2 transition-colors"
        style={{ color: C.mid, fontFamily:'var(--font-heading)' }}
        onMouseEnter={e => e.currentTarget.style.color = C.charcoal}
        onMouseLeave={e => e.currentTarget.style.color = C.mid}>
        ← Retour à la liste
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <StatCard label="Prédictions" value={institution.total_predictions} accent={C.maroon}/>
        <StatCard label="Rapports livrés" value={institution.total_reports} accent={C.forest}/>
        <StatCard label="Fin de contrat" value={institution.contract_end || '—'} accent={C.amber}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Info card */}
        <div className="rounded-xl border p-6"
          style={{ borderColor: C.border, background: C.white }}>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-5"
            style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
            Informations
          </h3>
          <div className="space-y-3">
            {[
              ['Nom complet',    institution.name],
              ['Type',           TYPE_LABELS[institution.type]],
              ['Email',          institution.contact_email],
              ['Plan',           PLAN_LABELS[institution.plan]?.label],
              ['Statut',         institution.is_active ? 'Actif' : 'Inactif'],
              ['Créé le',        institution.created_at],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: C.border }}>
                <span className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: C.mid }}>{k}</span>
                <span className="text-sm font-medium" style={{ color: C.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wilayas card */}
        <div className="rounded-xl border p-6"
          style={{ borderColor: C.border, background: C.white }}>
          <h3 className="text-sm font-bold uppercase tracking-wide mb-5"
            style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
            Wilayas assignées
          </h3>
          {institution.wilaya_access.length === 0 ? (
            <div className="py-4 px-4 rounded-lg text-sm text-center"
              style={{ background: C.sage, color: C.forest }}>
              Accès national — toutes les wilayas
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {institution.wilaya_access.map(w => (
                <span key={w} className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: C.sage, color: C.forest, fontFamily:'var(--font-heading)' }}>
                  {w}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 pt-5 border-t" style={{ borderColor: C.border }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: C.mid }}>Actions rapides</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: C.forest, color: '#fff', fontFamily:'var(--font-heading)' }}>
                Envoyer les credentials
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: C.amber, color: '#fff', fontFamily:'var(--font-heading)' }}>
                Modifier le plan
              </button>
              <button className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ border:`1.5px solid ${C.border}`, color: C.maroon,
                  fontFamily:'var(--font-heading)', background:'transparent' }}>
                Désactiver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Create institution form ────────────────────────────────────
function CreateView({ onCreated }) {
  const EMPTY = {
    full_name:'', email:'', password:'', name:'', short_name:'',
    type:'ministry', plan:'pilot', contact_person:'', contact_phone:'',
    annual_fee_da:'', wilaya_access:[], notes:'',
  }
  const [form, setForm]       = useState(EMPTY)
  const [selectedW, setSelW]  = useState([])
  const [nationalAccess, setNational] = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const toggleWilaya = (w) => {
    setSelW(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password || !form.name) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    const payload = {
      ...form,
      wilaya_access: nationalAccess ? [] : selectedW,
      annual_fee_da: form.annual_fee_da ? parseFloat(form.annual_fee_da) : null,
    }

    // ── Build new institution object for local state ──
    const newInstitution = {
      id:                Date.now(),
      name:              payload.name,
      short_name:        payload.short_name || payload.name,
      type:              payload.type,
      contact_email:     payload.email,
      plan:              payload.plan,
      wilaya_access:     payload.wilaya_access,
      is_active:         true,
      contract_end:      null,
      total_predictions: 0,
      total_reports:     0,
      created_at:        new Date().toLocaleDateString('fr-DZ'),
    }

    // ── Real API call ──
    const res = await fetch('http://localhost:8000/api/institutions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json()
      setError(err.detail || 'Erreur lors de la création du compte.')
      return
    }
    const created = await res.json()
    newInstitution.id = created.id

    setSubmitted(true)
    onCreated?.(newInstitution)
    setTimeout(() => { setSubmitted(false); setForm(EMPTY); setSelW([]) }, 2000)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black mb-1"
          style={{ color: C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
          Créer un compte institution
        </h2>
        <p className="text-sm" style={{ color: C.mid }}>
          Le compte sera accessible via telleye.dz/gov/login
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Left column */}
          <div className="space-y-5">
            {/* Section: Compte utilisateur */}
            <div className="rounded-xl border p-6"
              style={{ borderColor: C.border, background: C.white }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Compte utilisateur
              </h3>
              <div className="space-y-4">
                <Input label="Nom du référent" name="full_name" value={form.full_name}
                  onChange={set} placeholder="Ex: Ahmed Benali" required/>
                <Input label="Email de connexion" name="email" type="email" value={form.email}
                  onChange={set} placeholder="contact@agriculture.gov.dz" required/>
                <Input label="Mot de passe temporaire" name="password" type="password"
                  value={form.password} onChange={set} placeholder="Min. 8 caractères" required/>
              </div>
            </div>

            {/* Section: Institution */}
            <div className="rounded-xl border p-6"
              style={{ borderColor: C.border, background: C.white }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Informations institution
              </h3>
              <div className="space-y-4">
                <Input label="Nom complet" name="name" value={form.name}
                  onChange={set} placeholder="Ministère de l'Agriculture et du Développement Rural" required/>
                <Input label="Nom court" name="short_name" value={form.short_name}
                  onChange={set} placeholder="Min. Agriculture"/>
                <Select label="Type" name="type" value={form.type} onChange={set}
                  options={[
                    { value:'ministry',           label:'Ministère'             },
                    { value:'research_institute', label:'Institut de Recherche' },
                    { value:'wilaya',             label:'Direction Wilaya'      },
                    { value:'agency',             label:'Agence'                },
                    { value:'other',              label:'Autre'                 },
                  ]}/>
                <Select label="Plan" name="plan" value={form.plan} onChange={set}
                  options={[
                    { value:'pilot',    label:'Pilote (gratuit / symbolique)' },
                    { value:'standard', label:'Standard — par wilaya'         },
                    { value:'national', label:'National — couverture totale'  },
                    { value:'custom',   label:'Custom — projet sur mesure'    },
                  ]}/>
                <Input label="Contact téléphone" name="contact_phone" value={form.contact_phone}
                  onChange={set} placeholder="+213 xxx xxx xxx"/>
                <Input label="Frais annuels (DA)" name="annual_fee_da" type="number"
                  value={form.annual_fee_da} onChange={set} placeholder="ex: 150000"/>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Wilaya access */}
            <div className="rounded-xl border p-6"
              style={{ borderColor: C.border, background: C.white }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Accès wilayas
              </h3>
              <p className="text-xs mb-4" style={{ color: C.mid }}>
                Laissez vide = accès national complet.
              </p>

              {/* National toggle */}
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only"
                    checked={nationalAccess}
                    onChange={e => { setNational(e.target.checked); setSelW([]) }}/>
                  <div className="w-10 h-5 rounded-full transition-colors"
                    style={{ background: nationalAccess ? C.forest : C.border }}/>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: nationalAccess ? 'translateX(20px)' : 'translateX(0)' }}/>
                </div>
                <span className="text-sm font-medium" style={{ color: C.charcoal }}>
                  Accès national — toutes les wilayas
                </span>
              </label>

              {/* Wilaya grid */}
              {!nationalAccess && (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs" style={{ color: C.mid }}>
                      {selectedW.length} wilaya{selectedW.length > 1 ? 's' : ''} sélectionnée{selectedW.length > 1 ? 's' : ''}
                    </span>
                    {selectedW.length > 0 && (
                      <button type="button" onClick={() => setSelW([])}
                        className="text-xs" style={{ color: C.maroon }}>
                        Tout effacer
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {ALL_WILAYAS.map(w => (
                      <button key={w} type="button" onClick={() => toggleWilaya(w)}
                        className="px-2 py-1.5 rounded text-xs font-medium text-left transition-all"
                        style={{
                          background: selectedW.includes(w) ? C.forest : C.cream,
                          color:      selectedW.includes(w) ? '#fff'    : C.charcoal,
                          fontFamily: 'var(--font-body)',
                          border:     `1px solid ${selectedW.includes(w) ? C.forest : C.border}`,
                        }}>
                        {w}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-xl border p-6"
              style={{ borderColor: C.border, background: C.white }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: C.mid, fontFamily:'var(--font-heading)' }}>
                Notes internes
              </h3>
              <textarea name="notes" value={form.notes} onChange={set}
                placeholder="Notes sur le contrat, la négociation, le référent..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
                style={{ border:`1.5px solid ${C.border}`, background:C.cream,
                  color:C.charcoal, fontFamily:'var(--font-body)' }}
                onFocus={e => e.target.style.borderColor = C.forest}
                onBlur={e  => e.target.style.borderColor = C.border}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5 flex items-center gap-4">
          {error && (
            <p className="text-sm" style={{ color: C.maroon }}>{error}</p>
          )}
          <motion.button type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="ml-auto px-8 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: submitted ? C.forest : C.maroon,
              color:'#fff', fontFamily:'var(--font-heading)' }}>
            {submitted ? 'Compte créé avec succès' : 'Créer le compte institution'}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════

const NAV = [
  { id:'overview',     label:"Vue d'ensemble" },
  { id:'institutions', label:'Institutions'   },
  { id:'demandes',     label:'Demandes'       },
  { id:'create',       label:'Créer un compte'},
]

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label:'En attente',   color:'#E8941A' },
  processing: { label:'En cours',     color:'#4A90D9' },
  done:       { label:'Traité',       color:'#2D9E5A' },
  cancelled:  { label:'Annulé',       color:'#6B7280' },
}

// ── Demandes View ──────────────────────────────────────────────
function DemandesView() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('all')
  const [updating, setUpdating] = useState(false)
  const [notes,    setNotes]    = useState('')
  const [predResult, setPredResult] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  const API = 'http://localhost:8000/api'

  const handleAdminPredict = async () => {
    if (!selected) return
    setPredicting(true)
    setPredResult(null)
    try {
      let res
      if (selected.zone_type === 'polygon' && selected.coordinates) {
        const coords = JSON.parse(selected.coordinates.replace(/'/g, '"'))
        res = await fetch(`${API}/predict/gee/polygon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinates: coords }),
        })
      } else if (selected.lat && selected.lng) {
        res = await fetch(`${API}/predict/gee/point`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: selected.lat, longitude: selected.lng }),
        })
      }
      if (res && res.ok) {
        const data = await res.json()
        setPredResult(data)
        await updateStatus(selected.id, 'processing')
      }
    } catch (err) {
      console.error('Prediction failed:', err)
    } finally {
      setPredicting(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const url = filter === 'all'
        ? `${API}/orders/`
        : `${API}/orders/?status=${filter}`
      const res  = await fetch(url)
      const data = await res.json()
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    setUpdating(true)
    try {
      await fetch(`${API}/orders/${id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, notes }),
      })
      await fetchOrders()
      setSelected(prev => prev ? { ...prev, status, notes } : null)
    } finally {
      setUpdating(false)
    }
  }

  const PAYMENT_LABELS = {
    cib:       'CIB / EDAHABIA',
    baridimob: 'BaridiMob',
    virement:  'Virement',
  }

  if (selected) {
    const scfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending
    return (
      <div>
        <button onClick={() => setSelected(null)}
          className="text-sm mb-6 transition-colors"
          style={{ color:C.mid }}
          onMouseEnter={e => e.target.style.color = C.charcoal}
          onMouseLeave={e => e.target.style.color = C.mid}>
          ← Retour aux demandes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Info card */}
          <div className="lg:col-span-2 rounded-xl border p-6"
            style={{ background:C.white, borderColor:C.border }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black" style={{ color:C.charcoal, fontFamily:'var(--font-heading)' }}>
                  {selected.full_name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color:C.mid }}>
                  Ref: {selected.reference} · {new Date(selected.created_at).toLocaleDateString('fr-DZ')}
                </p>
              </div>
              <Badge label={scfg.label} color={scfg.color}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Wilaya',     selected.wilaya],
                ['Commune',    selected.commune || '—'],
                ['Culture',    selected.crop],
                ['Téléphone',  selected.phone],
                ['Email',      selected.email],
                ['Paiement',   PAYMENT_LABELS[selected.payment] || selected.payment],
                ['Zone',       selected.zone_type === 'polygon'
                  ? `Polygone${selected.area_ha ? ` (~${selected.area_ha} ha)` : ''}`
                  : selected.lat ? `${selected.lat}°N, ${selected.lng}°E` : '—'],
                ['Prix',       `${selected.price_da?.toLocaleString()} DA`],
              ].map(([k,v]) => (
                <div key={k} className="py-2 border-b" style={{ borderColor:C.border }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                    style={{ color:C.mid }}>{k}</p>
                  <p className="text-sm font-medium" style={{ color:C.charcoal }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Farmer notes */}
            {selected.notes && (
              <div className="rounded-xl border p-5"
                style={{ background:C.sage, borderColor:C.forest+'30' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color:C.forest, fontFamily:'var(--font-heading)' }}>
                  Description du farmer
                </p>
                <p className="text-sm" style={{ color:C.forest }}>
                  {selected.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions card */}
          <div className="space-y-4">
            <div className="rounded-xl border p-5"
              style={{ background:C.white, borderColor:C.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
                Changer le statut
              </p>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button key={key}
                    onClick={() => updateStatus(selected.id, key)}
                    disabled={updating || selected.status === key}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      background:  selected.status === key ? cfg.color + '15' : 'transparent',
                      borderColor: selected.status === key ? cfg.color : C.border,
                      color:       selected.status === key ? cfg.color : C.mid,
                      cursor:      selected.status === key ? 'default' : 'pointer',
                    }}>
                    {selected.status === key ? `✓ ${cfg.label}` : cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-5"
              style={{ background:C.white, borderColor:C.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
                Notes internes
              </p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Ajouter une note..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ border:`1.5px solid ${C.border}`, color:C.charcoal,
                  background:C.cream }}/>
            </div>

            {/* Prediction card */}
            <div className="rounded-xl border p-5"
              style={{ background:C.white, borderColor:C.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
                Prédiction SOC
              </p>

              {!predResult && !predicting && (
                <div className="space-y-2">
                  <p className="text-xs mb-2" style={{ color:C.mid }}>
                    Zone: {selected.zone_type === 'polygon'
                      ? `Polygone — ${selected.area_ha || '?'} ha`
                      : selected.lat ? `${selected.lat}°N, ${selected.lng}°E` : 'Non définie'}
                  </p>
                  {(selected.lat || selected.coordinates) && (
                    <button onClick={handleAdminPredict}
                      className="w-full py-2.5 rounded-lg text-sm font-bold transition-all"
                      style={{ background:C.maroon, color:C.white, fontFamily:'var(--font-heading)' }}>
                      Prédire via Sentinel-2
                    </button>
                  )}
                  {!selected.lat && !selected.coordinates && (
                    <p className="text-xs p-3 rounded-lg" style={{ background:C.cream, color:C.mid }}>
                      Pas de coordonnées disponibles.
                    </p>
                  )}
                </div>
              )}

              {predicting && (
                <div className="py-3 text-center text-sm"
                  style={{ color:C.forest }}>
                  <motion.span animate={{ opacity:[1,0.4,1] }}
                    transition={{ repeat:Infinity, duration:1.2 }}>
                    Récupération Sentinel-2...
                  </motion.span>
                </div>
              )}

              {predResult && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg" style={{ background:C.charcoal }}>
                    <p className="text-xs mb-1" style={{ color:'rgba(255,255,255,0.4)' }}>SOC prédit</p>
                    <p className="text-2xl font-black" style={{ color:C.amber, fontFamily:'var(--font-heading)' }}>
                      {predResult.soc_value}%
                    </p>
                    <p className="text-xs mt-1" style={{ color:'rgba(255,255,255,0.5)' }}>
                      Régime: {predResult.regime} · Confiance: {Math.round(predResult.confidence*100)}%
                    </p>
                  </div>
                  <button onClick={() => setPredResult(null)}
                    className="w-full py-1.5 rounded-lg text-xs border"
                    style={{ borderColor:C.border, color:C.mid }}>
                    Nouvelle prédiction
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="rounded-xl border p-5"
              style={{ background:C.white, borderColor:C.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color:C.mid, fontFamily:'var(--font-heading)' }}>
                Actions
              </p>
              <div className="space-y-2">
                {reportSent ? (
                  <motion.div
                    initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                    className="w-full py-3 rounded-lg text-sm font-bold text-center"
                    style={{ background:C.sage, color:C.forest }}>
                    ✓ Rapport envoyé par email
                  </motion.div>
                ) : (
                  <a href={`mailto:${selected.email}?subject=Votre rapport TellEye - ${selected.reference}${predResult ? `&body=Bonjour,%0D%0A%0D%0AVotre analyse sol est prête.%0D%0A%0D%0ASOC: ${predResult.soc_value}%%0D%0ARégime: ${predResult.regime}%0D%0AConfiance: ${Math.round(predResult.confidence*100)}%%0D%0A%0D%0ACordialement,%0D%0AEquipe TellEye` : ''}`}
                    onClick={() => { setReportSent(true); setTimeout(() => setReportSent(false), 5000) }}
                    className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center border transition-all"
                    style={{ borderColor:C.forest, color:C.forest, background:'transparent' }}>
                    {predResult ? 'Envoyer résultat par email' : 'Envoyer email'}
                  </a>
                )}
                <button
                  onClick={() => updateStatus(selected.id, 'done')}
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-all"
                  style={{ background:C.forest, color:C.white, fontFamily:'var(--font-heading)' }}>
                  Marquer comme traité
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black mb-1"
            style={{ color:C.charcoal, fontFamily:'var(--font-heading)', letterSpacing:'-0.02em' }}>
            Demandes Agriculteurs
          </h2>
          <p className="text-sm" style={{ color:C.mid }}>
            {orders.length} demande{orders.length > 1 ? 's' : ''} reçue{orders.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[['all','Toutes'],['pending','En attente'],['processing','En cours'],['done','Traitées']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{
                background:  filter === v ? C.charcoal : C.white,
                color:       filter === v ? C.white    : C.mid,
                borderColor: filter === v ? C.charcoal : C.border,
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-sm" style={{ color:C.mid }}>
          Chargement...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16 rounded-xl border"
          style={{ borderColor:C.border, background:C.white }}>
          <p className="text-sm font-semibold mb-1" style={{ color:C.charcoal }}>
            Aucune demande
          </p>
          <p className="text-xs" style={{ color:C.mid }}>
            Les demandes des agriculteurs apparaîtront ici.
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor:C.border, background:C.white }}>

          {/* Header */}
          <div className="grid px-5 py-3 border-b text-xs font-bold uppercase tracking-wide"
            style={{ gridTemplateColumns:'80px 1fr 1fr 1fr 100px 100px 80px',
              borderColor:C.border, background:C.cream, color:C.mid,
              fontFamily:'var(--font-heading)' }}>
            {['Ref','Nom','Wilaya','Culture','Paiement','Statut',''].map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>

          {orders.map((order, i) => {
            const scfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            return (
              <motion.div key={order.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ delay:i*0.04 }}
                className="grid items-center px-5 py-4 cursor-pointer transition-colors text-sm"
                style={{ gridTemplateColumns:'80px 1fr 1fr 1fr 100px 100px 80px',
                  borderBottom: i < orders.length-1 ? `1px solid ${C.border}` : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = C.cream}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                <span className="font-mono text-xs" style={{ color:C.mid }}>
                  {order.reference}
                </span>
                <div>
                  <p className="font-semibold" style={{ color:C.charcoal }}>{order.full_name}</p>
                  <p className="text-xs" style={{ color:C.mid }}>{order.email}</p>
                </div>
                <span style={{ color:C.mid }}>{order.wilaya}</span>
                <span style={{ color:C.mid }}>{order.crop?.split(' ')[0]}</span>
                <span style={{ color:C.mid }}>
                  {PAYMENT_LABELS[order.payment] || order.payment}
                </span>
                <Badge label={scfg.label} color={scfg.color}/>
                <button onClick={() => { setSelected(order); setNotes(order.notes || '') }}
                  className="text-xs font-semibold transition-colors"
                  style={{ color:C.forest }}
                  onMouseEnter={e => e.target.style.color = C.charcoal}
                  onMouseLeave={e => e.target.style.color = C.forest}>
                  Voir →
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [activeNav,    setActiveNav]    = useState('overview')
  const [institutions, setInstitutions] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/api/institutions/')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setInstitutions(data) : setInstitutions([]))
      .catch(() => setInstitutions([]))
  }, [])
  const [selected,     setSelected]     = useState(null)

  const handleSelect = (inst) => {
    setSelected(inst)
    setActiveNav('detail')
  }

  return (
    <div className="min-h-screen flex" style={{ background: C.cream, fontFamily:'var(--font-body)' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ background: C.white, borderColor: C.border, minHeight:'100vh' }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
          <p className="text-lg font-black" style={{ color: C.charcoal, fontFamily:'var(--font-heading)' }}>
            Tell<span style={{ color: C.amber }}>Eye</span>
          </p>
          <p className="text-xs mt-0.5 font-semibold uppercase tracking-widest"
            style={{ color: C.mid }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSelected(null) }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeNav === item.id ? C.maroon + '12' : 'transparent',
                color:      activeNav === item.id ? C.maroon          : C.mid,
                fontFamily: 'var(--font-heading)',
                fontWeight: activeNav === item.id ? 700 : 500,
              }}>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom info */}
        <div className="px-5 py-4 border-t" style={{ borderColor: C.border }}>
          <p className="text-xs font-semibold" style={{ color: C.mid }}>TellEye Admin</p>
          <p className="text-xs" style={{ color: C.border }}>v1.0 — local</p>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b"
          style={{ background: C.white, borderColor: C.border }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.mid }}>
              {activeNav === 'overview'     ? 'Vue d\'ensemble'
               : activeNav === 'institutions' ? 'Institutions'
               : activeNav === 'create'       ? 'Créer un compte'
               : activeNav === 'detail'       ? selected?.short_name || selected?.name
               : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: C.sage, color: C.forest }}>
              {institutions.filter(i => i.is_active).length} actives
            </span>
            <span className="text-xs font-medium" style={{ color: C.mid }}>
              {new Date().toLocaleDateString('fr-DZ', { day:'2-digit', month:'long', year:'numeric' })}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeNav + (selected?.id || '')}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.25 }}>

              {activeNav === 'overview' && (
                <OverviewView institutions={institutions} />
              )}
              {activeNav === 'institutions' && (
                <InstitutionsView institutions={institutions} onSelect={handleSelect} />
              )}
              {activeNav === 'demandes' && (
                <DemandesView />
              )}
              {activeNav === 'create' && (
                <CreateView onCreated={(newInst) => {
                  if (newInst) setInstitutions(prev => [...prev, newInst])
                  setActiveNav('institutions')
                }} />
              )}
              {activeNav === 'detail' && selected && (
                <InstitutionDetailView
                  institution={selected}
                  onBack={() => { setSelected(null); setActiveNav('institutions') }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}