import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import heroSoil from '../assets/hero-soil.jpg'
import parcels  from '../assets/parcels.jpg'
import satelliteBg from '../assets/satellite-bg-2.jpg'
import careImg from '../assets/care.png'

const TICKER = [
  { v: '100 000+',   l: 'échantillons sol' },
  { v: 'R²=0.935',   l: 'précision SOC' },
  { v: '0',          l: 'campagnes terrain' },
  { v: 'Sentinel-2', l: '12 bandes spectrales' },
  { v: '58',         l: 'wilayas couvertes' },
  { v: '24–72h',     l: 'délai rapport' },
]

const PARTNERS = [
  'ASAL', 'Université Constantine 2', 'ESA Copernicus',
  'Incubateur Universite Constantine 2',
]

const IMG_HERO    = heroSoil
const IMG_PARCELS = parcels
const IMG_AGRONOMY = careImg

/* ─── Satellite SVG — centered, scanning straight down ─── */
function ScanSatellite() {
  return (
    <svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="beam2" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#4dd9b8" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#4dd9b8" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="panG" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#2a6fa8"/>
          <stop offset="100%" stopColor="#0e3a5c"/>
        </radialGradient>
      </defs>

      {/* Wide downward beam */}
      <polygon points="155,95 205,95 260,210 100,210" fill="url(#beam2)" opacity="0.8"/>
      <line x1="158" y1="95" x2="100" y2="210" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.3"/>
      <line x1="202" y1="95" x2="260" y2="210" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.3"/>

      {/* Scan line at ground, pulsing */}
      <line x1="98" y1="208" x2="262" y2="208" stroke="#4dd9b8" strokeWidth="1.5" opacity="0.6">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite"/>
      </line>
      <ellipse cx="180" cy="208" rx="82" ry="4" fill="#4dd9b8" opacity="0.06">
        <animate attributeName="opacity" values="0.03;0.12;0.03" dur="1.8s" repeatCount="indefinite"/>
      </ellipse>

      {/* Signal pulses travelling down the beam */}
      {[0, 0.73, 1.46].map((delay, i) => (
        <g key={i}>
          <line x1="160" y1="0" x2="196" y2="0" stroke="#4dd9b8" strokeWidth="1.5" strokeLinecap="round">
            <animateMotion dur="2.2s" begin={`${delay}s`} repeatCount="indefinite" path="M0,100 L-28,115"/>
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin={`${delay}s`} repeatCount="indefinite"/>
          </line>
        </g>
      ))}

      {/* Satellite body */}
      <g transform="translate(180,72)">
        <rect x="-24" y="-18" width="48" height="36" rx="5" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1.5"/>
        <line x1="-8"  y1="-18" x2="-8"  y2="18" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
        <line x1="8"   y1="-18" x2="8"   y2="18" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
        <line x1="-24" y1="0"   x2="24"  y2="0"  stroke="#2a7aaa" strokeWidth="0.5" opacity="0.3"/>

        {/* Left strut + panel */}
        <rect x="-56" y="-5" width="32" height="4" fill="#0e3a5c"/>
        <rect x="-100" y="-14" width="44" height="28" rx="3" fill="url(#panG)" stroke="#3a8acc" strokeWidth="1"/>
        <line x1="-85" y1="-14" x2="-85" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="-70" y1="-14" x2="-70" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="-55" y1="-14" x2="-55" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="-100" y1="0" x2="-56" y2="0" stroke="#5aaae0" strokeWidth="0.5" opacity="0.5"/>
        <rect x="-100" y="-14" width="44" height="28" rx="3" fill="white" opacity="0">
          <animate attributeName="opacity" values="0;0.1;0" dur="4s" repeatCount="indefinite"/>
        </rect>

        {/* Right strut + panel */}
        <rect x="24" y="-5" width="32" height="4" fill="#0e3a5c"/>
        <rect x="56" y="-14" width="44" height="28" rx="3" fill="url(#panG)" stroke="#3a8acc" strokeWidth="1"/>
        <line x1="71"  y1="-14" x2="71"  y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="86"  y1="-14" x2="86"  y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="101" y1="-14" x2="101" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
        <line x1="56"  y1="0"   x2="100" y2="0"  stroke="#5aaae0" strokeWidth="0.5" opacity="0.5"/>
        <rect x="56" y="-14" width="44" height="28" rx="3" fill="white" opacity="0">
          <animate attributeName="opacity" values="0;0.1;0" dur="4s" begin="2s" repeatCount="indefinite"/>
        </rect>

        {/* Top antenna */}
        <line x1="0" y1="-18" x2="0" y2="-32" stroke="#4dd9b8" strokeWidth="1.5"/>
        <circle cx="0" cy="-36" r="5" fill="none" stroke="#4dd9b8" strokeWidth="1.3"/>
        <circle cx="0" cy="-36" r="2.2" fill="#4dd9b8">
          <animate attributeName="opacity" values="1;0.1;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>

        {/* Sensor belly pointing down */}
        <rect x="-7" y="14" width="14" height="8" rx="2" fill="#4dd9b8" opacity="0.9"/>
        <circle cx="0" cy="18" r="2" fill="#fff" opacity="0.6">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite"/>
        </circle>
      </g>

      {/* Orbit arc hint */}
      <path d="M20,20 Q180,-30 340,40" fill="none" stroke="#2a8a7a" strokeWidth="0.8" strokeDasharray="5 8" opacity="0.2"/>
    </svg>
  )
}

/* ─── Step card illustrations ─── */
function IlluSentinel() {
  return (
    <svg viewBox="0 0 130 110" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="pg1s" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#2a6fa8"/><stop offset="100%" stopColor="#0e3a5c"/>
        </radialGradient>
      </defs>
      <rect x="46" y="28" width="38" height="26" rx="4" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1.3"/>
      <line x1="56" y1="28" x2="56" y2="54" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
      <line x1="65" y1="28" x2="65" y2="54" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
      <line x1="74" y1="28" x2="74" y2="54" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
      <rect x="10" y="33" width="36" height="16" rx="2" fill="url(#pg1s)" stroke="#3a8acc" strokeWidth="0.9"/>
      <line x1="22" y1="33" x2="22" y2="49" stroke="#5aaae0" strokeWidth="0.5" opacity="0.6"/>
      <line x1="34" y1="33" x2="34" y2="49" stroke="#5aaae0" strokeWidth="0.5" opacity="0.6"/>
      <rect x="84" y="33" width="36" height="16" rx="2" fill="url(#pg1s)" stroke="#3a8acc" strokeWidth="0.9"/>
      <line x1="96" y1="33" x2="96" y2="49" stroke="#5aaae0" strokeWidth="0.5" opacity="0.6"/>
      <line x1="108" y1="33" x2="108" y2="49" stroke="#5aaae0" strokeWidth="0.5" opacity="0.6"/>
      <line x1="65" y1="28" x2="65" y2="16" stroke="#4dd9b8" strokeWidth="1.3"/>
      <circle cx="65" cy="14" r="3.5" fill="none" stroke="#4dd9b8" strokeWidth="1.2"/>
      <circle cx="65" cy="14" r="1.4" fill="#4dd9b8">
        <animate attributeName="opacity" values="1;0.1;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <polygon points="54,54 76,54 90,100 40,100" fill="#4dd9b8" opacity="0.06"/>
      <line x1="54" y1="54" x2="40" y2="100" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.25"/>
      <line x1="76" y1="54" x2="90" y2="100" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.25"/>
      <line x1="38" y1="100" x2="92" y2="100" stroke="#4dd9b8" strokeWidth="1.3" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2s" repeatCount="indefinite"/>
      </line>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={39 + i*9} y="93" width="7" height="5" rx="0.5" fill="#4dd9b8" opacity={0.15 + i*0.07}/>
      ))}
    </svg>
  )
}

function IlluOSSL() {
  return (
    <svg viewBox="0 0 130 110" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      {[0,1,2].map(i => (
        <g key={i} transform={`translate(0, ${i * -14})`}>
          <ellipse cx="65" cy="96" rx="36" ry="10" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1.1"/>
          <rect x="29" y="86" width="72" height="10" fill="#1a3a55"/>
          <line x1="29" y1="86" x2="29" y2="96" stroke="#2a7aaa" strokeWidth="1"/>
          <line x1="101" y1="86" x2="101" y2="96" stroke="#2a7aaa" strokeWidth="1"/>
          <ellipse cx="65" cy="86" rx="36" ry="10" fill="#1e4060" stroke="#2a7aaa" strokeWidth="1.1"/>
          <line x1="47" y1="83" x2="83" y2="83" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.4"/>
          <line x1="47" y1="87" x2="83" y2="87" stroke="#4dd9b8" strokeWidth="0.5" opacity="0.3"/>
        </g>
      ))}
      <text x="65" y="28" textAnchor="middle" fontSize="13" fill="#4dd9b8" fontFamily="system-ui" fontWeight="700">100 000+</text>
      <text x="65" y="42" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.35)" fontFamily="system-ui">échantillons sols</text>
    </svg>
  )
}

function IlluDANN() {
  return (
    <svg viewBox="0 0 130 110" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#4dd9b8" strokeWidth="1.5" strokeLinecap="round"/>
        </marker>
      </defs>
      <rect x="6" y="28" width="32" height="54" rx="4" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1"/>
      <text x="22" y="50" textAnchor="middle" fontSize="7" fill="#5aaae0" fontFamily="system-ui">Lab</text>
      <text x="22" y="60" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,.3)" fontFamily="system-ui">spectra</text>
      <circle cx="22" cy="38" r="2" fill="#2a7aaa" opacity="0.7"/>
      <circle cx="22" cy="45" r="2" fill="#2a7aaa" opacity="0.7"/>
      <circle cx="22" cy="70" r="2" fill="#2a7aaa" opacity="0.5"/>
      <path d="M38,45 Q68,30 68,55" fill="none" stroke="#4dd9b8" strokeWidth="1.1" strokeDasharray="3 2"/>
      <path d="M38,65 Q68,80 68,55" fill="none" stroke="#4dd9b8" strokeWidth="1.1" strokeDasharray="3 2" opacity="0.5"/>
      <rect x="54" y="38" width="32" height="34" rx="5" fill="#0d2a1f" stroke="#34d399" strokeWidth="1.4"/>
      <text x="70" y="57" textAnchor="middle" fontSize="8" fill="#34d399" fontFamily="system-ui" fontWeight="700">DANN</text>
      <line x1="86" y1="55" x2="98" y2="55" stroke="#4dd9b8" strokeWidth="1.3" markerEnd="url(#arr3)"/>
      <rect x="96" y="28" width="32" height="54" rx="4" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1"/>
      <text x="112" y="50" textAnchor="middle" fontSize="7" fill="#5aaae0" fontFamily="system-ui">Sat</text>
      <text x="112" y="60" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,.3)" fontFamily="system-ui">pixels</text>
      <circle cx="112" cy="38" r="2" fill="#34d399" opacity="0.8"/>
      <circle cx="112" cy="45" r="2" fill="#34d399" opacity="0.8"/>
      <circle cx="112" cy="70" r="2" fill="#34d399" opacity="0.6"/>
      <text x="65" y="102" textAnchor="middle" fontSize="9" fill="#4dd9b8" fontFamily="system-ui" fontWeight="700">R² = 0.935</text>
    </svg>
  )
}

function IlluReport() {
  return (
    <svg viewBox="0 0 130 110" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect x="30" y="10" width="70" height="88" rx="5" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1.3"/>
      <path d="M82,10 L100,28 L82,28 Z" fill="#0e2a40" stroke="#2a7aaa" strokeWidth="0.9"/>
      <rect x="35" y="14" width="18" height="10" rx="2" fill="#ef4444" opacity="0.85"/>
      <text x="44" y="22" textAnchor="middle" fontSize="6" fill="white" fontFamily="system-ui" fontWeight="700">PDF</text>
      {[
        { label: 'SOC',     w: 22 },
        { label: 'Argile',  w: 18 },
        { label: 'pH',      w: 26 },
        { label: 'Texture', w: 14 },
      ].map(({ label, w }, i) => (
        <g key={label}>
          <text x="38" y={44 + i * 13} fontSize="7" fill="#4dd9b8" fontFamily="system-ui">{label}</text>
          <rect x="60" y={38 + i * 13} width="30" height="5" rx="1" fill="#2a7aaa" opacity="0.4"/>
          <rect x="60" y={38 + i * 13} width={w} height="5" rx="1" fill="#34d399" opacity="0.7"/>
        </g>
      ))}
      <circle cx="87" cy="92" r="8" fill="#14532d" stroke="#34d399" strokeWidth="1.3"/>
      <path d="M83,92 L86,95 L91,89" fill="none" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="65" y="107" textAnchor="middle" fontSize="8.5" fill="#4dd9b8" fontFamily="system-ui" fontWeight="700">24 – 72h</text>
    </svg>
  )
}

/* ─── Step icon components ─── */
function IconSatellite() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="8" width="6" height="8" rx="1"/>
      <line x1="8" y1="12" x2="11" y2="12"/>
      <rect x="11" y="9" width="5" height="6" rx="1"/>
      <line x1="16" y1="12" x2="19" y2="12"/>
      <rect x="19" y="10" width="3" height="4" rx="1"/>
    </svg>
  )
}
function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <ellipse cx="12" cy="7" rx="8" ry="3"/>
      <path d="M4 7v5c0 1.66 3.58 3 8 3s8-1.34 8-3V7"/>
      <path d="M4 12v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5"/>
    </svg>
  )
}
function IconModel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.6-7.4-2.1 2.1M6.7 17.3l-2.1 2.1m14.8 0-2.1-2.1M6.7 6.7 4.6 4.6"/>
    </svg>
  )
}
function IconReport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
      <line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  )
}

const STEPS = [
  { n: '01', Icon: IconSatellite, Illu: IlluSentinel, t: 'Sentinel-2',    d: "Imagerie multispectrale 10m — 12 bandes sur toute l'Algérie." },
  { n: '02', Icon: IconDatabase,  Illu: IlluOSSL,     t: 'OSSL / USDA',   d: 'Bibliothèque spectrale mondiale de 100 000+ échantillons sols.' },
  { n: '03', Icon: IconModel,     Illu: IlluDANN,     t: 'Modèle DANN',   d: 'Adaptation de domaine : transfert lab → satellite sans terrain.' },
  { n: '04', Icon: IconReport,    Illu: IlluReport,   t: 'Rapport livré', d: 'SOC, argile, pH, texture — rapport PDF en 24 à 72h.' },
]

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
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

function StepConnector() {
  return (
    <div className="hidden lg:flex items-center justify-center w-10 flex-shrink-0 pt-[75px]">
      <svg width="40" height="24" viewBox="0 0 48 24" fill="none">
        <path d="M2,16 Q24,4 46,16" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
        <path d="M40,12 L46,16 L40,20" fill="none" stroke="#34d399" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const [lang, setLang] = useState('fr')
  const navigate = useNavigate()
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const satY        = useTransform(scrollYProgress, [0, 1], ['0%', '-55%'])
  const satOpacity  = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <div className="relative min-h-screen overflow-hidden text-white antialiased selection:bg-emerald-400/30">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 20% 0%, #0d2a1f 0%, #061410 45%, #03090a 100%)' }}/>
        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(60% 50% at 80% 30%, rgba(16,185,129,0.18) 0%, transparent 70%), radial-gradient(50% 50% at 10% 80%, rgba(5,150,105,0.15) 0%, transparent 70%)' }}/>
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }}/>
      </div>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex min-h-[92vh] items-center overflow-hidden">

        {/* Soil bg image */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <img src={IMG_HERO} alt="Sols agricoles d'Algérie" className="h-full w-full object-cover opacity-[0.55]"/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(3,9,10,0.45) 0%, rgba(6,30,22,0.25) 35%, rgba(3,9,10,0.85) 80%, #03090a 100%)' }}/>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 50% 40%, rgba(16,185,129,0.18) 0%, transparent 70%)' }}/>
        </motion.div>

        {/* ── SATELLITE — right side, scanning down ── */}
        <motion.div
          style={{ y: satY, opacity: satOpacity }}
          className="absolute right-0 top-[2%] z-20 pointer-events-none w-56 md:w-72 lg:w-[360px]"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 22px rgba(77,217,184,0.4)) drop-shadow(0 0 6px rgba(77,217,184,0.2))' }}
          >
            <ScanSatellite />
          </motion.div>
        </motion.div>

        {/* Hero text — left side */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <div className="max-w-xl">

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-balance text-3xl font-black leading-[1.1] tracking-tight md:text-4xl lg:text-5xl"
            >
              Régénérer les sols d'Algérie.{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Précision satellite.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
              className="mt-5 max-w-md text-sm leading-relaxed text-white/50 md:text-base"
            >
              TellEye prédit le SOC, l'argile, le pH et la texture de vos sols algériens
              depuis Sentinel-2 — sans campagne terrain, livré en 24h.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => navigate('/farmer')}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)] transition hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.8)]"
              >
                Analyser ma parcelle
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </motion.div>

            {/* compact stats row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}
              className="mt-10 flex flex-wrap gap-6"
            >
              {[
                { v: 'R²=0.935', l: 'précision SOC' },
                { v: '58',       l: 'wilayas' },
                { v: '24–72h',   l: 'délai rapport' },
              ].map(t => (
                <div key={t.l} className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-emerald-300">{t.v}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{t.l}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="relative border-y border-white/5 bg-black/20 py-4 backdrop-blur-sm">
        <div className="flex overflow-hidden whitespace-nowrap">
          <motion.div animate={{ x: [0, -1400] }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="flex shrink-0 items-center gap-16 pr-16">
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <div key={i} className="flex items-center gap-5">
                <span className="bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-xl font-black tracking-tight text-transparent">{t.v}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{t.l}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400/40" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── COVERAGE ── */}
      <section className="relative py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <Reveal>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Couverture nationale</span>
            <h2 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight md:text-4xl">
              L'Algérie cartographiée,<br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">sol par sol.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
              Du Tell au Sahara, TellEye prédit les propriétés du sol de chaque parcelle depuis Sentinel-2 — sans aucun prélèvement terrain.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { label: 'Zone Nord',       sub: 'Tell · Mitidja · Kabylie',       soc: 'SOC > 2%',   c: '#34d399' },
                { label: 'Hauts Plateaux',  sub: "Sétif · Tiaret · M'Sila",        soc: 'SOC 1–2%',   c: '#fbbf24' },
                { label: 'Zone Saharienne', sub: 'Biskra · Ouargla · Tamanrasset', soc: 'SOC < 0.8%', c: '#f87171' },
              ].map((z) => (
                <div key={z.label} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm transition hover:border-white/10 hover:bg-white/[0.04]">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: z.c, boxShadow: `0 0 12px ${z.c}` }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{z.label}</div>
                    <div className="text-[11px] text-white/30">{z.sub}</div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-[10px] font-bold flex-shrink-0" style={{ color: z.c, backgroundColor: z.c + '1a' }}>{z.soc}</div>
                </div>
              ))}
            </div>
            <motion.button whileHover={{ x: 4 }} onClick={() => navigate('/farmer')} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
              Analyser ma zone <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/40">
              <img src={IMG_PARCELS} alt="Parcelles agricoles algériennes" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-emerald-500/10" />
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', left: 0, right: 0 }}
                className="z-20 h-px bg-emerald-300/70 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
              />
              <div className="absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Wilaya de Sétif</div>
                <div className="text-xl font-black">SOC : 1.84%</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS — Boomitra style ── */}
      <section className="relative py-28">
        {/* satellite-bg as subtle section background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={satelliteBg} alt="" className="h-full w-full object-cover opacity-[0.18]"/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #03090a 0%, transparent 20%, transparent 80%, #03090a 100%)' }}/>
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto mb-3 max-w-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Science & Technologie</span>
          </Reveal>
          <Reveal className="mx-auto mb-3 max-w-3xl text-center" delay={0.05}>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Proven in the field.{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Trusted by science.
              </span>
            </h2>
          </Reveal>
          <Reveal className="mx-auto mb-14 max-w-xl text-center" delay={0.1}>
            <p className="text-sm leading-relaxed text-white/45">
              De l'image satellite au rapport de sol, notre technologie DANN assure un transfert de domaine précis — sans échantillonnage terrain.
            </p>
          </Reveal>

          <div className="flex items-start gap-0">
            {STEPS.map((s, i) => {
              const Illu = s.Illu
              const Icon = s.Icon
              return (
                <div key={s.n} className="flex items-start gap-0 flex-1 min-w-0">
                  <Reveal delay={i * 0.1} className="flex-1 min-w-0">
                    <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm transition hover:border-emerald-400/30 hover:bg-white/[0.04]">
                      <div className="relative flex items-center justify-center bg-black/20 border-b border-white/[0.05]" style={{ height: '150px' }}>
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-emerald-400/[0.12] flex items-center justify-center">
                          <Icon />
                        </div>
                        <span className="absolute top-3 right-4 text-xs font-black text-white/10">{s.n}</span>
                        <div className="w-28 h-24"><Illu /></div>
                      </div>
                      <div className="p-5 flex-1">
                        <h3 className="mb-1.5 text-sm font-bold">{s.t}</h3>
                        <p className="text-xs leading-relaxed text-white/40">{s.d}</p>
                      </div>
                    </div>
                  </Reveal>
                  {i < STEPS.length - 1 && <StepConnector />}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── AGRONOMY ── */}
      <section className="relative py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/40">
              <img src={IMG_AGRONOMY} alt="Conseils agronomiques sur le terrain" className="h-full w-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-emerald-500/10" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Au-delà de la donnée</span>
            <h2 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight md:text-4xl">
              Conseils agronomiques{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">inclus.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">
              TellEye ne livre pas seulement des chiffres. Chaque rapport inclut une interprétation agronomique concrète et actionnable pour votre parcelle.
            </p>
            <ul className="mt-7 space-y-4">
              {["Recommandations de rotation et d'amendement","Diagnostic de fertilité et risques d'érosion","Suivi multi-saison de l'évolution du SOC"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />{t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Partenaires de confiance</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {PARTNERS.map((p) => (
              <span key={p} className="text-sm font-semibold text-white/40 transition hover:text-emerald-300">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative pb-28 pt-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[32px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-transparent p-10 backdrop-blur-sm md:p-14">
            {/* satellite-bg subtle overlay inside CTA too */}
            <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
              <img src={satelliteBg} alt="" className="h-full w-full object-cover opacity-[0.12]"/>
              <div className="absolute inset-0 rounded-[32px]" style={{ background: 'radial-gradient(60% 80% at 80% 20%, rgba(16,185,129,0.2) 0%, transparent 70%)' }}/>
            </div>
            <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Commencez maintenant</span>
                <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">Prêt à connaître votre sol&nbsp;?</h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">Première analyse gratuite — aucun déplacement, aucune prise d'échantillon.</p>
              </div>
              <button onClick={() => navigate('/farmer')}
                className="group inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_-8px_rgba(16,185,129,0.6)] transition hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.8)] md:self-auto">
                Démarrer
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER with satellite-bg ── */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={satelliteBg} alt="" className="h-full w-full object-cover opacity-[0.22]"/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #03090a 0%, rgba(3,9,10,0.7) 40%, rgba(3,9,10,0.85) 100%)' }}/>
        </div>
        <div className="relative">
          <Footer lang={lang} />
        </div>
      </div>

    </div>
  )
}