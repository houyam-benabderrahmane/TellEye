import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MapPin, Clock, Mail, Phone, ShieldCheck, GraduationCap } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import sattBg from '../assets/satt.png'
import heroSoil from '../assets/hero-soil.jpg'

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const REQUEST_TYPES = [
  'Analyse de parcelle',
  'Partenariat institutionnel',
  'Accès API',
  'Demande de démonstration',
  'Support technique',
  'Autre',
]

export default function ContactPage() {
  const [lang, setLang] = useState('fr')
  const [form, setForm] = useState({
    name: '', institution: '', role: '', email: '',
    phone: '', requestType: REQUEST_TYPES[0], message: '',
  })
  const [sent, setSent] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="relative min-h-screen text-zinc-100 antialiased bg-[#020708]">
      
      {/* ── HERO BACKGROUND: Immersive Soil Texture Canopy ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img 
          src={heroSoil} 
          alt="Soil texture background" 
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45 mix-blend-luminosity scale-105"
        />
        {/* Cinematic gradient masks: preserves texture details while anchoring interactive layers */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020708]/70 to-[#020708] lg:via-[#020708]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020708]/90 via-transparent to-[#020708]" />
        <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />
        
        {/* Subtle structural grid line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.02] hidden lg:block" />
      </div>

      <Navbar lang={lang} onLangChange={setLang} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* ══ LEFT COLUMN: Context & Institutional Proofs ══ */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-xs font-medium text-emerald-400 tracking-wide mb-6">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                Bureau de Liaison
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl leading-[1.08]">
                Déployons la data spatiale au service de <span className="text-emerald-400/90 font-medium italic font-serif">vos terres</span>.
              </h1>
              
              <p className="mt-6 text-base text-zinc-300 backdrop-blur-[2px] leading-relaxed max-w-md">
                Notre équipe d'ingénieurs et de spécialistes en données satellitaires analyse vos parcelles pour concevoir des modèles prédictifs locaux.
              </p>
            </div>

            {/* Institutional Proof Points */}
            <div className="pt-4 space-y-6 border-t border-zinc-800/60">
              <div className="flex gap-4 group">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-center transition-colors group-hover:border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Validation Algorithmique ASAL</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Données étalonnées en partenariat avec l'Agence Spatiale Algérienne pour une précision d'imagerie adaptée aux micro-climats locaux.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-center transition-colors group-hover:border-emerald-500/30">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">R&D Université Constantine 2</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Collaboration continue sur l'optimisation des architectures de réseaux neuronaux appliquées à l'agriculture de précision au Maghreb.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Traitement des requêtes</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  &lt; 48 Heures
                </span>
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN: High Fidelity Interactive Form ══ */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl p-8 lg:p-10 shadow-2xl">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Transmission Réussie</h3>
                    <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                      Votre demande a été affectée à notre cellule technique. Un ingénieur conseil prendra contact sous 48h.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={submit} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Formulaire d'accès</h2>
                      <p className="text-xs text-zinc-400 mt-1">Veuillez renseigner vos paramètres professionnels pour l'ouverture de vos droits.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Nom complet</label>
                        <input
                          name="name" value={form.name} onChange={handle} required
                          placeholder="Ahmed Benali"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Institution / Entreprise</label>
                        <input
                          name="institution" value={form.institution} onChange={handle}
                          placeholder="ITGC Algérie"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Rôle / Poste</label>
                        <input
                          name="role" value={form.role} onChange={handle}
                          placeholder="Ingénieur agronome"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Adresse Email</label>
                        <input
                          name="email" value={form.email} onChange={handle} required type="email"
                          placeholder="benali@domain.dz"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Téléphone</label>
                        <input
                          name="phone" value={form.phone} onChange={handle}
                          placeholder="+213 (0) XXXXXXXX"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Nature de l'analyse</label>
                        <div className="relative">
                          <select
                            name="requestType" value={form.requestType} onChange={handle}
                            className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition cursor-pointer"
                          >
                            {REQUEST_TYPES.map(r => <option key={r} className="bg-zinc-900">{r}</option>)}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Cahier des charges / Message</label>
                      <textarea
                        name="message" value={form.message} onChange={handle} rows={4}
                        placeholder="Précisez ici les coordonnées ou la superficie de la zone d'étude..."
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:bg-zinc-950 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.99]"
                    >
                      Transmettre le dossier
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Direct contact info strip */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="text-xs font-mono text-zinc-400">contact@telleye.dz</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="text-xs font-mono text-zinc-400">+213 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="text-xs text-zinc-400 truncate">Sidi Abdellah, Alger</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </div>
  )
}