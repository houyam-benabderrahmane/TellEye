import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useAnimation } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AlgeriaMap from '../components/AlgeriaMap'

// ── Animation variants ─────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// ── Animated section wrapper ───────────────────────────────────
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref  = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Stats ticker data ──────────────────────────────────────────
const TICKER_ITEMS = [
  { value: '100 000+', label: 'échantillons de sol en bibliothèque' },
  { value: 'R²=0.65',  label: 'précision SOC' },
  { value: '0',        label: 'campagnes terrain nécessaires' },
  { value: 'Sentinel-2', label: 'imagerie satellite 13 bandes' },
  { value: '48',       label: 'wilayas couvertes' },
  { value: '24–72h',   label: 'délai de livraison rapport' },
]

// ── Solution cards ─────────────────────────────────────────────
const SOLUTIONS = [
  {
    icon: '👨‍🌾',
    titleFr: 'Je suis Agriculteur',
    titleAr: 'أنا فلاح',
    descFr: 'Obtenez une analyse complète de votre parcelle. Recevez votre rapport PDF en 24 à 72h.',
    descAr: 'احصل على تحليل كامل لقطعتك الأرضية. استلم تقريرك PDF في 24 إلى 72 ساعة.',
    cta: 'Demander une Analyse →',
    ctaAr: 'طلب تحليل →',
    to: '/farmer',
    accent: 'maroon',
    bg: 'bg-maroon-500',
    border: 'border-maroon-300',
  },
  {
    icon: '🏛️',
    titleFr: 'Je représente une Institution',
    titleAr: 'أمثل مؤسسة',
    descFr: "Cartes sol à l'échelle wilaya pour politique agricole, planification et surveillance.",
    descAr: 'خرائط التربة على مستوى الولاية للسياسة الزراعية والتخطيط والرصد.',
    cta: 'Voir les Plans Gouvernementaux →',
    ctaAr: 'مشاهدة الخطط الحكومية →',
    to: '/institution',
    accent: 'forest',
    bg: 'bg-forest-500',
    border: 'border-forest-300',
  },
  {
    icon: '🔬',
    titleFr: 'Je suis Chercheur / Développeur',
    titleAr: 'أنا باحث / مطور',
    descFr: 'Accès gratuit pour usage académique. Intégration API pour les agri-tech.',
    descAr: 'وصول مجاني للاستخدام الأكاديمي. تكامل API لشركات التكنولوجيا الزراعية.',
    cta: 'Explorer le Free Tier →',
    ctaAr: 'استكشاف الطبقة المجانية →',
    to: '/pricing',
    accent: 'amber',
    bg: 'bg-amber-telleye',
    border: 'border-amber-light',
  },
]

// ── Key metric cards ───────────────────────────────────────────
const METRICS = [
  { value: '100K+',  label: 'Échantillons\nen bibliothèque', icon: '🗂️' },
  { value: 'R²=0.65', label: 'Précision\nSOC prédiction',   icon: '📊' },
  { value: '13',     label: 'Bandes spectrales\nSentinel-2', icon: '🛰️' },
  { value: '48',     label: 'Wilayas\ncouverture nationale', icon: '🗺️' },
]

// ── How it works ───────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    icon: '🛰️',
    titleFr: 'Imagerie Sentinel-2',
    descFr:  'Sentinel-2 capture les images sol nu de l\'Algérie avec 13 bandes spectrales à 10 m de résolution.',
  },
  {
    step: '02',
    icon: '🧪',
    titleFr: 'Bibliothèque OSSL',
    descFr:  'La bibliothèque spectrale mondiale OSSL/USDA fournit la connaissance sol de référence.',
  },
  {
    step: '03',
    icon: '🧠',
    titleFr: 'Modèle DANN',
    descFr:  'Notre modèle d\'adaptation de domaine (DANN) transfère la connaissance lab vers les données satellite.',
  },
  {
    step: '04',
    icon: '🗺️',
    titleFr: 'Cartes livrées',
    descFr:  'Cartes SOC, argile, pH et texture livrées — sans aucune campagne terrain.',
  },
]

// ── Partners ───────────────────────────────────────────────────
const PARTNERS = ['ASAL', 'Université Constantine 2', 'ESA Copernicus', 'Google Earth Engine', 'OSSL / USDA']

// ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState('fr')
  const navigate = useNavigate()

  const ar = lang === 'ar'

  return (
    <div className={`min-h-screen ${ar ? 'font-arabic' : ''}`} dir={ar ? 'rtl' : 'ltr'}>
      <Navbar lang={lang} onLangChange={setLang} />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Satellite-style background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(160deg, #060E06 0%, #0C1A10 35%, #0A1A1A 65%, #080E08 100%)',
          }}
        />

        {/* Animated terrain-like overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="g1" cx="30%" cy="40%">
                <stop offset="0%"   stopColor="#2D6A3F" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#2D6A3F" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g2" cx="70%" cy="60%">
                <stop offset="0%"   stopColor="#6B1F1F" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#6B1F1F" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g3" cx="50%" cy="20%">
                <stop offset="0%"   stopColor="#E8941A" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#E8941A" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g1)"/>
            <rect width="100%" height="100%" fill="url(#g2)"/>
            <rect width="100%" height="100%" fill="url(#g3)"/>
          </svg>
        </div>

        {/* Noise texture */}
        <div className="noise-overlay z-0"/>

        {/* Floating satellite dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left:   `${Math.random() * 100}%`,
              top:    `${Math.random() * 100}%`,
              background: ['#E8941A','#2D6A3F','#fff'][i % 3],
              opacity: 0.4,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-3xl">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-forest-400/50 bg-forest-500/10 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-forest-DEFAULT animate-pulse"/>
              <span className="text-forest-200 text-xs font-medium tracking-wide uppercase">
                Precision Soil Mapping · Algeria
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {ar ? (
                <>
                  ذكاء التربة للجزائر.<br />
                  <span className="text-amber-telleye">بدون أخذ عينات. بدون تخمين.</span>
                </>
              ) : (
                <>
                  Intelligence du Sol<br /> pour l'Algérie.<br />
                  <span className="text-amber-telleye">Zéro terrain. Zéro approximation.</span>
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-lg text-white/65 leading-relaxed mb-8 max-w-xl"
            >
              {ar
                ? 'يستخدم TellEye الاستشعار عن بُعد والتعلم العميق لرسم خرائط SOC والطين ودرجة الحموضة والقوام عبر الجزائر — في أيام، لا أشهر.'
                : 'TellEye utilise l\'imagerie satellite Sentinel-2 et le deep transfer learning pour cartographier SOC, argile, pH et texture à travers l\'Algérie — en jours, pas en mois.'
              }
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(232,148,26,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/farmer')}
                className="btn-amber flex items-center gap-2"
              >
                <span>🌱</span>
                {ar ? 'تحليل مجاني ←' : 'Essai Gratuit →'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/institution')}
                className="btn-outline-white flex items-center gap-2"
              >
                <span>🏛️</span>
                {ar ? 'أمثل مؤسسة' : 'Je représente une institution'}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator ──────────────────────────────── */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS TICKER
      ══════════════════════════════════════════════════════ */}
      <div className="bg-charcoal py-4 overflow-hidden border-y border-white/5">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center gap-6 px-10 flex-shrink-0">
              <span className="text-amber-telleye font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                {item.value}
              </span>
              <span className="text-white/55 text-sm">{item.label}</span>
              <span className="text-forest-DEFAULT text-lg">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3-CARD SOLUTIONS
      ══════════════════════════════════════════════════════ */}
      <section id="solutions" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="text-forest-DEFAULT text-sm font-semibold uppercase tracking-widest">
              {ar ? 'بيئة متكاملة' : 'Écosystème Complet'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mt-2"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {ar ? 'حلول لكل الفاعلين' : 'Solutions pour Tous les Acteurs'}
            </h2>
            <p className="text-charcoal/60 mt-3 max-w-xl mx-auto">
              {ar
                ? 'استكشف حلول TellEye المصممة لكل فاعل في النظام الزراعي الجزائري.'
                : 'Explorez les solutions TellEye conçues pour chaque acteur de l\'écosystème agricole algérien.'
              }
            </p>
          </AnimatedSection>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}
                className="telleye-card bg-white p-8 cursor-pointer group"
                onClick={() => navigate(sol.to)}
              >
                <div className={`w-14 h-14 rounded-xl ${sol.bg} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform`}>
                  {sol.icon}
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {ar ? sol.titleAr : sol.titleFr}
                </h3>
                <p className="text-charcoal/65 text-sm leading-relaxed mb-6">
                  {ar ? sol.descAr : sol.descFr}
                </p>
                <div className={`inline-flex items-center gap-1 text-sm font-semibold ${
                  sol.accent === 'maroon' ? 'text-maroon-DEFAULT'
                  : sol.accent === 'forest' ? 'text-forest-DEFAULT'
                  : 'text-amber-dark'
                } group-hover:gap-2 transition-all`}>
                  {ar ? sol.ctaAr : sol.cta}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          INTERACTIVE MAP DEMO
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sage">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="text-forest-DEFAULT text-sm font-semibold uppercase tracking-widest">
              Démo Interactive
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mt-2"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {ar ? 'جرّب الآن — انقر في أي مكان بالجزائر' : 'Essayez maintenant — Cliquez n\'importe où en Algérie'}
            </h2>
            <p className="text-charcoal/60 mt-3 max-w-lg mx-auto text-sm">
              {ar
                ? 'اختر نقطة → احصل على تنبؤ تربة فوري (مجاني، بدون تسجيل)'
                : 'Cliquez un point → obtenez une prédiction sol instantanée (gratuit, sans connexion)'
              }
            </p>
          </AnimatedSection>

          <AnimatedSection delay={1}>
            <AlgeriaMap lang={lang} />
          </AnimatedSection>

          <AnimatedSection delay={2} className="text-center mt-8">
            <p className="text-charcoal/55 text-sm mb-3">
              {ar ? 'هل تريد تحليلاً كاملاً للمنطقة؟' : 'Vous voulez une analyse complète d\'une zone ?'}
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="btn-amber"
            >
              {ar ? 'إنشاء حساب مجاني →' : 'Créer un compte gratuit →'}
            </motion.button>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          KEY METRICS
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {METRICS.map((m, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform inline-block">
                  {m.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-telleye mb-1"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  {m.value}
                </div>
                <div className="text-white/50 text-sm whitespace-pre-line leading-snug">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <span className="text-forest-DEFAULT text-sm font-semibold uppercase tracking-widest">
              {ar ? 'العلم وراء TellEye' : 'La Science derrière TellEye'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mt-2"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {ar ? 'كيف نحوّل الضوء إلى معرفة بالتربة' : 'Comment transformer la lumière en intelligence sol'}
            </h2>
            <p className="text-charcoal/60 mt-3 text-sm max-w-lg mx-auto">
              {ar
                ? 'نستخدم التعلم العميق المتقدم للتنبؤ بخصائص التربة من صور الأقمار الاصطناعية.'
                : 'Nous utilisons le deep learning d\'adaptation de domaine pour prédire les propriétés du sol depuis les satellites.'
              }
            </p>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-maroon-DEFAULT via-amber-telleye to-forest-DEFAULT z-0"/>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
            >
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step circle */}
                  <div className="relative mb-5">
                    <div className="w-16 h-16 rounded-full bg-sage border-2 border-forest-DEFAULT/30 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-forest-DEFAULT transition-all duration-300 shadow-md">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-forest-DEFAULT flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-charcoal mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {step.titleFr}
                  </h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed">{step.descFr}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARTNERS
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-sage border-t border-forest-DEFAULT/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-8">
            <p className="text-charcoal/50 text-xs uppercase tracking-widest font-semibold">
              {ar ? 'طوّرنا بالتعاون مع' : 'Développé en partenariat avec'}
            </p>
          </AnimatedSection>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-6 lg:gap-10"
          >
            {PARTNERS.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="px-5 py-3 rounded-lg border border-forest-DEFAULT/20 bg-white/60 text-charcoal/70 text-sm font-semibold hover:border-forest-DEFAULT hover:text-charcoal hover:bg-white transition-all cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {p}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}