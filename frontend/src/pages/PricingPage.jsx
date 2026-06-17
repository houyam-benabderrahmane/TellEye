import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import satelliteBg from '../assets/satellite-bg-2.jpg'
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

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
    <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15"/>
    <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const CrossIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const TIERS = [
  {
    id: 'explorer',
    badge: null,
    name: 'Explorer',
    target: 'Chercheurs & Étudiants',
    price: '0 DZD',
    period: 'gratuit',
    priceDetail: null,
    desc: "Accès libre à la carte SOC et aux outils éducatifs. Idéal pour l'exploration académique.",
    accent: '#34d399',
    features: [
      { label: 'Carte SOC interactive (58 wilayas)',  ok: true  },
      { label: 'Prédiction 500 ha / mois',            ok: true  },
      { label: 'Outil conseil cultures basique',      ok: true  },
      { label: 'Articles Soil Academy',               ok: true  },
      { label: 'Export PDF rapport complet',          ok: false },
      { label: 'Accès API',                           ok: false },
      { label: 'Comparaison saisonnière',             ok: false },
      { label: 'Support dédié',                       ok: false },
    ],
    cta: 'Commencer gratuitement',
    route: '/register',
  },
  {
    id: 'pro',
    badge: 'LE PLUS DEMANDÉ',
    name: 'Rapport Pro',
    target: 'Agriculteurs & Coopératives',
    price: 'Sur demande',
    period: 'par parcelle',
    priceDetail: 'À partir de 2 000 DA',
    desc: 'Rapport sol complet pour votre parcelle avec conseils agronomiques personnalisés.',
    accent: '#f59e0b',
    features: [
      { label: "Prédictions à l'échelle pixel",       ok: true  },
      { label: 'Carte minéral / organique parcelle',  ok: true  },
      { label: 'Comparaison saisonnière',             ok: true  },
      { label: 'Appendice méthodologie DANN',         ok: true  },
      { label: 'Rapport de précision (R² local)',     ok: true  },
      { label: 'Conseils fertilisation & irrigation', ok: true  },
      { label: 'Livraison PDF sous 24–72h',           ok: true  },
      { label: 'Accès API',                           ok: false },
    ],
    cta: 'Demander un rapport',
    route: '/farmer',
  },
  {
    id: 'institutional',
    badge: 'INSTITUTIONNEL',
    name: 'Monitoring National',
    target: 'Ministères & Wilayas',
    price: 'Contrat annuel',
    period: 'par wilaya',
    priceDetail: 'À partir de 80 000 DA / wilaya',
    desc: 'Couverture wilaya ou nationale avec mises à jour saisonnières et support dédié.',
    accent: '#34d399',
    features: [
      { label: 'Couverture nationale complète',          ok: true },
      { label: 'Mises à jour trimestrielles',            ok: true },
      { label: 'Détection de changement SOC',            ok: true },
      { label: 'Export GeoTIFF + SHP (GIS-ready)',       ok: true },
      { label: 'Dashboard dédié multi-utilisateurs',     ok: true },
      { label: 'Contact et support dédiés',              ok: true },
      { label: 'Rapport institutionnel personnalisé',    ok: true },
      { label: 'Intégration API ministérielle',          ok: true },
    ],
    cta: 'Nous contacter',
    route: '/institution',
  },
]

const API_TIERS = [
  {
    name: 'Starter API',
    price: '15 000 DA',
    period: '/mois',
    calls: '500 appels',
    highlight: false,
    features: [
      'Endpoint prédiction ponctuelle',
      'Documentation complète',
      'Support email',
      'SLA 99%',
    ],
  },
  {
    name: 'Pro API',
    price: '35 000 DA',
    period: '/mois',
    calls: '2 000 appels',
    highlight: true,
    features: [
      'Batch processing multi-parcelles',
      'SDK Python / JavaScript',
      'Support prioritaire',
      'SLA 99.5%',
    ],
  },
  {
    name: 'Enterprise API',
    price: 'Sur mesure',
    period: '',
    calls: 'Illimité',
    highlight: false,
    features: [
      'Infrastructure dédiée',
      'Accord MOU',
      'SLA garanti 99.9%',
      'Intégration systèmes existants',
    ],
  },
]

const COMPARE_ROWS = [
  { label: 'Carbone organique (SOC)',     live: true,  explorer: true,  pro: true,  inst: true  },
  { label: 'Argile',                      live: false, explorer: false, pro: false, inst: false },
  { label: 'pH',                          live: false, explorer: false, pro: false, inst: false },
  { label: 'Texture',                     live: false, explorer: false, pro: false, inst: false },
  { label: 'Résolution pixel Sentinel-2', live: true,  explorer: false, pro: true,  inst: true  },
  { label: 'Carte par wilaya',            live: true,  explorer: true,  pro: false, inst: true  },
  { label: 'Rapport PDF personnalisé',    live: true,  explorer: false, pro: true,  inst: true  },
  { label: 'Export GIS (GeoTIFF/SHP)',    live: true,  explorer: false, pro: false, inst: true  },
  { label: 'Comparaison saisonnière',     live: true,  explorer: false, pro: true,  inst: true  },
  { label: 'Accès API',                   live: true,  explorer: false, pro: false, inst: true  },
  { label: 'Support dédié',              live: true,  explorer: false, pro: false, inst: true  },
]

export default function PricingPage() {
  const [lang, setLang] = useState('fr')
  const navigate = useNavigate()

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white antialiased selection:bg-emerald-400/30"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2027 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%)' }}
    >

      {/* ── INNOVATIVE ANIMATED BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Base gradient with depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 0%, rgba(16,185,129,0.15) 0%, rgba(15,52,96,0.3) 40%, rgba(10,22,40,0.8) 100%)',
          }}
        />

        {/* Animated floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Satellite image with better opacity and blend mode */}
        <div className="absolute inset-0 opacity-20" style={{ mixBlendMode: 'screen' }}>
          <img
            src={sattBg}
            alt="satellite-background"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ opacity: 0.4 }}
          />
        </div>

        {/* Grid overlay for tech feel */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            opacity: 0.3,
          }}
        />

        {/* Final overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(120% 100% at 50% 100%, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.7) 60%, rgba(10,22,40,0.95) 100%)',
          }}
        />
      </div>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ══ HERO ══ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(60% 70% at 50% 60%, rgba(16,185,129,0.1) 0%, transparent 70%)' }}/>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-3xl font-black leading-[1.1] tracking-tight md:text-5xl"
          >
            Intelligence sol à{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              toute échelle.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 text-sm leading-relaxed text-white/45 max-w-xl mx-auto"
          >
            Choisissez le niveau de résolution adapté — agriculteur, institution ou agri-tech.
            Première analyse toujours gratuite.
          </motion.p>
        </div>
      </section>

      {/* ══ MAIN TIERS ══ */}
      <section className="relative pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col h-full rounded-3xl overflow-hidden border backdrop-blur-sm transition hover:border-opacity-60
                    ${tier.id === 'pro'
                      ? 'border-amber-400/40 bg-amber-400/[0.04]'
                      : 'border-white/[0.07] bg-white/[0.025]'
                    }`}
                  style={tier.id === 'pro' ? { boxShadow: '0 0 60px rgba(251,191,36,0.08)' } : {}}
                >
                  {tier.badge && (
                    <div
                      className="absolute top-0 right-0 px-3 py-1.5 text-[10px] font-bold rounded-bl-2xl"
                      style={{
                        background: tier.id === 'pro' ? '#f59e0b' : 'rgba(52,211,153,0.2)',
                        color: tier.id === 'pro' ? '#000' : '#34d399',
                      }}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div className="p-7 flex-1 flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: tier.accent }}>
                      {tier.target}
                    </p>
                    <h3 className="text-xl font-black text-white mb-3">{tier.name}</h3>
                    <div className="mb-1">
                      <span className="text-2xl font-black" style={{ color: tier.accent }}>{tier.price}</span>
                      {tier.period && <span className="text-xs ml-2 text-white/35">{tier.period}</span>}
                    </div>
                    {tier.priceDetail && <p className="text-xs text-white/30 mb-4">{tier.priceDetail}</p>}
                    <p className="text-sm leading-relaxed text-white/45 mb-6">{tier.desc}</p>
                    <ul className="space-y-2.5 flex-1">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2.5 text-sm"
                          style={{ color: f.ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }}>
                          <span style={{ color: f.ok ? tier.accent : 'rgba(255,255,255,0.2)' }}>
                            {f.ok ? <CheckIcon/> : <CrossIcon/>}
                          </span>
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-7 pb-7">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(tier.route)}
                      className="w-full py-3 rounded-2xl text-sm font-bold transition-all inline-flex items-center justify-center gap-2"
                      style={
                        tier.id === 'pro'
                          ? { background: '#f59e0b', color: '#000' }
                          : { background: 'transparent', border: `1px solid ${tier.accent}40`, color: tier.accent }
                      }
                    >
                      {tier.cta}
                      <ArrowRight className="w-3.5 h-3.5"/>
                    </motion.button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON TABLE ══ */}
      <section className="relative py-28 border-t border-white/[0.05]">
        <div className="relative max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Comparatif</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Comparaison des offres</h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl overflow-hidden border border-white/[0.07] backdrop-blur-sm">
              <div className="grid grid-cols-4 border-b border-white/[0.07] bg-white/[0.03]">
                <div className="p-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">Fonctionnalité</div>
                {[
                  ['Explorer', 'Gratuit', '#34d399'],
                  ['Rapport Pro', 'Sur demande', '#f59e0b'],
                  ['Monitoring', 'Annuel', '#34d399'],
                ].map(([name, sub, color]) => (
                  <div key={name} className="p-4 text-center border-l border-white/[0.05]">
                    <p className="text-sm font-black text-white">{name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color }}>{sub}</p>
                  </div>
                ))}
              </div>

              {COMPARE_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 border-b border-white/[0.04] last:border-0"
                  style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                >
                  <div className="p-4 flex items-center gap-2">
                    {row.live ? (
                      <>
                        {i === 0 ? (
                          <span className="text-sm font-black text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]">
                            {row.label}
                          </span>
                        ) : (
                          <span className="text-sm text-white/80">{row.label}</span>
                        )}
                        {i === 0 && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                          >
                            LIVE
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-white/20">{row.label}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}
                        >
                          bientôt
                        </span>
                      </>
                    )}
                  </div>
                  {[row.explorer, row.pro, row.inst].map((val, j) => (
                    <div key={j} className="p-4 flex items-center justify-center border-l border-white/[0.04]">
                      {!row.live ? (
                        <span className="text-white/10">—</span>
                      ) : val ? (
                        <span className="text-emerald-400"><CheckIcon/></span>
                      ) : (
                        <span className="text-white/15"><CrossIcon/></span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ API / AGRITECH ══ */}
      <section className="relative py-28 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400">
              Accès API · Agri-tech & Développeurs
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Intégrez la prédiction sol{' '}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                dans vos systèmes.
              </span>
            </h2>
            <p className="mt-4 text-sm text-white/40 max-w-lg mx-auto leading-relaxed">
              API REST documentée. Prédictions lat/lng →{' '}
              <span className="text-emerald-300 font-semibold">SOC</span> disponible maintenant.
              Argile, pH et texture arrivent prochainement.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {API_TIERS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`relative flex flex-col h-full rounded-3xl border p-6 backdrop-blur-sm transition
                    ${t.highlight
                      ? 'border-amber-400/40 bg-amber-400/[0.04]'
                      : 'border-white/[0.07] bg-white/[0.025]'
                    }`}
                  style={t.highlight ? { boxShadow: '0 0 50px rgba(251,191,36,0.07)' } : {}}
                >
                  {t.highlight && (
                    <span
                      className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 self-start"
                      style={{ background: '#f59e0b', color: '#000' }}
                    >
                      RECOMMANDÉ
                    </span>
                  )}
                  <h3 className="text-base font-black text-white mb-2">{t.name}</h3>
                  <div className="mb-1">
                    <span className="text-xl font-black" style={{ color: '#f59e0b' }}>{t.price}</span>
                    {t.period && <span className="text-xs ml-1.5 text-white/35">{t.period}</span>}
                  </div>
                  <p className="text-xs text-white/30 mb-5">{t.calls} appels / mois</p>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {t.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="text-amber-400"><CheckIcon/></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
                    style={
                      t.highlight
                        ? { background: '#f59e0b', color: '#000' }
                        : { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    {t.price === 'Sur mesure' ? 'Nous contacter' : 'Démarrer'} →
                  </motion.button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══ */}
      <section className="relative pb-28 pt-8">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent p-10 backdrop-blur-sm md:p-14">
              <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
                <img 
                  src={satelliteBg} 
                  alt="satellite-background-cta" 
                  className="h-full w-full object-cover opacity-[0.12]"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    console.warn('Image satellite not found, using fallback')
                  }}
                />
                <div
                  className="absolute inset-0 rounded-[32px]"
                  style={{ background: 'radial-gradient(60% 80% at 80% 20%, rgba(16,185,129,0.2) 0%, transparent 70%)' }}
                />
              </div>
              <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Commencez maintenant</span>
                  <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">Pas sûr de votre choix ?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/45 max-w-lg">
                    Commencez par l'offre gratuite — aucune carte bancaire requise.
                    Notre équipe vous guide vers la solution adaptée.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:items-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/register')}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)]"
                  >
                    Commencer gratuitement
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white/80 backdrop-blur"
                  >
                    Parler à un expert
                  </motion.button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}
