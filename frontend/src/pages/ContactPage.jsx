import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MapPin, Clock, Mail, Phone } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import sattBg from '../assets/satt.png'

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
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
    <div className="relative min-h-screen overflow-hidden text-white antialiased" style={{ background: '#03090a' }}>

      {/* ── bg ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img src={sattBg} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.45]"/>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(6,20,16,0.55) 0%, rgba(3,9,10,0.70) 60%, rgba(3,9,10,0.85) 100%)' }}/>
        <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(60% 50% at 80% 30%, rgba(16,185,129,0.12) 0%, transparent 70%), radial-gradient(50% 50% at 10% 80%, rgba(5,150,105,0.10) 0%, transparent 70%)' }}/>
      </div>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ══ HERO ══ */}
      <section className="relative pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]"/>
            Contactez-nous
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-3xl font-black leading-[1.1] tracking-tight md:text-5xl"
          >
            Parlons de{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              vos sols.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 text-sm leading-relaxed text-white/45 max-w-xl mx-auto"
          >
            Notre équipe d'agronomes et de spécialistes en données satellitaires est là pour vous accompagner.
          </motion.p>
        </div>
      </section>

      {/* ══ MAIN GRID ══ */}
      <section className="relative pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

            {/* ── FORM ── */}
            <Reveal>
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-8">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full py-16 text-center"
                  >
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/30">
                      <svg viewBox="0 0 20 20" fill="none" className="w-7 h-7 text-emerald-400">
                        <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Message envoyé !</h3>
                    <p className="text-sm text-white/45 max-w-xs">
                      Notre équipe vous répondra dans les 48h. Merci pour votre intérêt pour TelEye.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <h2 className="text-lg font-black text-white mb-6">Envoyer une demande</h2>

                    {/* row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Nom complet
                        </label>
                        <input
                          name="name" value={form.name} onChange={handle} required
                          placeholder="ex. Ahmed Benali"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Institution / Entreprise
                        </label>
                        <input
                          name="institution" value={form.institution} onChange={handle}
                          placeholder="ex. ITGC Algérie"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        />
                      </div>
                    </div>

                    {/* row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Rôle / Poste
                        </label>
                        <input
                          name="role" value={form.role} onChange={handle}
                          placeholder="ex. Ingénieur agronome"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          name="email" value={form.email} onChange={handle} required type="email"
                          placeholder="benali@example.dz"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        />
                      </div>
                    </div>

                    {/* row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Téléphone
                        </label>
                        <input
                          name="phone" value={form.phone} onChange={handle}
                          placeholder="+213 0XXXXXXX"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                          Type de demande
                        </label>
                        <select
                          name="requestType" value={form.requestType} onChange={handle}
                          className="w-full rounded-xl border border-white/[0.08] bg-[#0d1f18] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition"
                        >
                          {REQUEST_TYPES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* message */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message" value={form.message} onChange={handle} rows={5}
                        placeholder="Comment nos données satellitaires peuvent-elles vous aider ?"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 transition resize-none"
                      />
                    </div>

                    {/* submit */}
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 py-3.5 text-sm font-bold text-black shadow-[0_8px_30px_-8px_rgba(16,185,129,0.5)] transition hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.7)]"
                    >
                      Envoyer la demande
                      <ArrowRight className="w-4 h-4"/>
                    </motion.button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* ── RIGHT CARDS ── */}
            <div className="flex flex-col gap-4">

              {/* ASAL */}
              <Reveal delay={0.1}>
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-emerald-400">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white mb-1">Partenariat ASAL</p>
                      <p className="text-xs leading-relaxed text-white/40">
                        Nos données sont validées par l'Agence Spatiale Algérienne (ASAL), garantissant
                        une calibration satellite haute précision pour les conditions agricoles locales.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Constantine 2 */}
              <Reveal delay={0.15}>
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/20 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-emerald-400">
                        <path d="M10 2L2 7v11h16V7L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M7 18v-5h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-white mb-1">Université Constantine 2</p>
                      <p className="text-xs leading-relaxed text-white/40">
                        Collaboration scientifique pour des modèles de machine learning avancés
                        spécifiques à la région du Maghreb.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Response time */}
              <Reveal delay={0.2}>
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-emerald-400"/>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                      Délai de réponse
                    </p>
                  </div>
                  <p className="text-3xl font-black text-white mb-1">Sous 48h</p>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Notre équipe d'agronomes examine chaque demande institutionnelle personnellement.
                  </p>
                </div>
              </Reveal>

              {/* Contact info */}
              <Reveal delay={0.25}>
                <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-white">contact@telleye.dz</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Téléphone</p>
                      <p className="text-sm font-semibold text-white">+213 (0) 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Siège</p>
                      <p className="text-sm font-semibold text-white">Cyberparc Sidi Abdellah, Alger</p>
                    </div>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}