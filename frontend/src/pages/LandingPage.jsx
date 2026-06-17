import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import {
  ArrowRight, Database, Brain, FileText, ChevronDown,
  MapPin, Layers, Activity, Globe2, Crosshair, Radar, Orbit, Stars, Sparkles
} from 'lucide-react'
import * as THREE from 'three'
import createGlobe from 'cobe'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import parcels from '../assets/parcels.jpg'
import satelliteBg from '../assets/satellite-bg-2.jpg'
import satelliteSpaceGlow from '../assets/satellite-space-glow.jpg'
import satelliteSpaceGlow1 from '../assets/satellite-space-glow1.jpg'
import heroSatelliteScan from '../assets/hero-satellite-scan.png'
import heroSoil from '../assets/hero-soil.jpg'
import careImg from '../assets/care.png'

/* ─────────────────────── DATA ─────────────────────── */

const TICKER = [
  { v: '100 000+',   l: 'échantillons sol' },
  { v: 'R²=0.935',   l: 'précision SOC' },
  { v: '0',          l: 'campagnes terrain' },
  { v: 'Sentinel-2', l: '12 bandes spectrales' },
  { v: '58',         l: 'wilayas couvertes' },
  { v: '24–72h',     l: 'délai rapport' },
]

const PARTNERS = [
  'ASAL', 'Université Constantine 2', 'ESA Copernicus', 'Incubateur Université Constantine 2',
]

const STEPS = [
  { n: '01', Icon: Globe2,   t: 'Sentinel-2',  d: "Imagerie multispectrale 10m — 12 bandes sur toute l'Algérie." },
  { n: '02', Icon: Database, t: 'OSSL / USDA', d: 'Bibliothèque spectrale mondiale de 100 000+ échantillons sols.' },
  { n: '03', Icon: Brain,    t: 'Modèle DANN', d: 'Adaptation de domaine : transfert lab → satellite sans terrain.' },
  { n: '04', Icon: FileText, t: 'Rapport livré', d: 'SOC, argile, pH, texture — rapport PDF en 24 à 72h.' },
]

/* ─────────────────── PREMIUM ELEMENTS ─────────────────── */

function AlgeriaGlobe() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let phi = 0
    let globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: -0.42,          // tilt to center Algeria vertically
      dark: 1,
      diffuse: 1.2,
      mapSamples: 18000,
      mapBrightness: 12,                  // high map brightness
      baseColor: [0.18, 0.65, 0.35],      // bright emerald points for visible continents
      markerColor: [0.88, 0.58, 0.10],    // amber — brand color
      glowColor: [0.10, 0.55, 0.28],      // forest green glow
      markers: [
        { location: [28.0, 2.5], size: 0.08 },   // Algeria center
        { location: [36.7, 3.05], size: 0.05 },  // Alger
        { location: [35.69, 0.63], size: 0.04 }, // Tiaret
        { location: [36.19, 5.41], size: 0.04 }, // Sétif
      ],
      onRender(state) {
        state.phi = phi
        phi += 0.003
      },
    })
    return () => globe.destroy()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 500, height: 500, maxWidth: '100%', aspectRatio: '1' }}
      className="opacity-95"
    />
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.2 })

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-emerald-400/90"
      style={{ scaleX }}
    />
  )
}
function ScanSatellite() {
    return (
      <svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <defs>
          <radialGradient id="beam" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#4dd9b8" stopOpacity="0.32"/>
            <stop offset="100%" stopColor="#4dd9b8" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="panG" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#2a6fa8"/><stop offset="100%" stopColor="#0e3a5c"/>
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <polygon points="155,95 205,95 260,210 100,210" fill="url(#beam)" opacity="0.85"/>
        <line x1="158" y1="95" x2="100" y2="210" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.3"/>
        <line x1="202" y1="95" x2="260" y2="210" stroke="#4dd9b8" strokeWidth="0.7" opacity="0.3"/>
        <line x1="98" y1="208" x2="262" y2="208" stroke="#4dd9b8" strokeWidth="1.5" opacity="0.6">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite"/>
        </line>

        {/* Satellite body */}
        <g transform="translate(180,72)" filter="url(#glow)">
          <rect x="-24" y="-18" width="48" height="36" rx="5" fill="#1a3a55" stroke="#2a7aaa" strokeWidth="1.5"/>
          <line x1="-8"  y1="-18" x2="-8"  y2="18" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>
          <line x1="8"   y1="-18" x2="8"   y2="18" stroke="#2a7aaa" strokeWidth="0.6" opacity="0.5"/>

          {/* Left panel */}
          <rect x="-56" y="-5" width="32" height="4" fill="#0e3a5c"/>
          <rect x="-100" y="-14" width="44" height="28" rx="3" fill="url(#panG)" stroke="#3a8acc" strokeWidth="1"/>
          <line x1="-85" y1="-14" x2="-85" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
          <line x1="-70" y1="-14" x2="-70" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
          <line x1="-55" y1="-14" x2="-55" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>

          {/* Right panel */}
          <rect x="24" y="-5" width="32" height="4" fill="#0e3a5c"/>
          <rect x="56" y="-14" width="44" height="28" rx="3" fill="url(#panG)" stroke="#3a8acc" strokeWidth="1"/>
          <line x1="71"  y1="-14" x2="71"  y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
          <line x1="86"  y1="-14" x2="86"  y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>
          <line x1="101" y1="-14" x2="101" y2="14" stroke="#5aaae0" strokeWidth="0.6" opacity="0.6"/>

          {/* Antenna */}
          <line x1="0" y1="-18" x2="0" y2="-32" stroke="#4dd9b8" strokeWidth="1.5"/>
          <circle cx="0" cy="-36" r="5" fill="none" stroke="#4dd9b8" strokeWidth="1.3"/>
          <circle cx="0" cy="-36" r="2.2" fill="#4dd9b8">
            <animate attributeName="opacity" values="1;0.1;1" dur="1.5s" repeatCount="indefinite"/>
          </circle>

          {/* Belly sensor */}
          <rect x="-7" y="14" width="14" height="8" rx="2" fill="#4dd9b8" opacity="0.95"/>
          <circle cx="0" cy="18" r="2" fill="#fff" opacity="0.6">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.9s" repeatCount="indefinite"/>
          </circle>
        </g>

        <path d="M20,20 Q180,-30 340,40" fill="none" stroke="#2a8a7a" strokeWidth="0.8" strokeDasharray="5 8" opacity="0.2"/>
      </svg>
    )
  }

  /* ───────────── SCROLL SATELLITE (fixed) ───────────── */

  export function ScrollSatellite() {
    const { scrollYProgress } = useScroll()

    // Position path: arcs over the page
    const satX = useTransform(scrollYProgress,
      [0, 0.15, 0.32, 0.5, 0.7, 1],
      ['82%', '68%', '52%', '32%', '62%', '85%']
    )
    const satY = useTransform(scrollYProgress,
      [0, 0.15, 0.32, 0.5, 0.7, 1],
      ['14%', '8%', '10%', '22%', '12%', '6%']
    )
    const satTilt = useTransform(scrollYProgress,
      [0, 0.25, 0.5, 0.75, 1],
      [0, 12, 0, -14, 0]
    )
    const satOpacity = useTransform(scrollYProgress,
      [0, 0.85, 1],
      [1, 1, 0.2]
    )
    // Beam opacity — visible only when over the 3D map section
    const beamOpacity = useTransform(scrollYProgress,
      [0.28, 0.36, 0.7, 0.78],
      [0, 0.9, 0.9, 0]
    )

    return (
      <>
        {/* The satellite itself */}
        <motion.div
          style={{
            position: 'fixed', top: satY, left: satX,
            x: '-50%', rotate: satTilt, opacity: satOpacity,
            zIndex: 40, pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 220, filter: 'drop-shadow(0 0 24px rgba(77,217,184,0.45)) drop-shadow(0 0 8px rgba(77,217,184,0.25))' }}
          >
            <ScanSatellite />
          </motion.div>
        </motion.div>

        {/* Scan beam projecting from satellite down to map */}
        <motion.div
          style={{
            position: 'fixed', top: satY, left: satX, opacity: beamOpacity,
            zIndex: 25, pointerEvents: 'none',
            width: 3, height: '95vh', x: '-50%', y: '60px',
            background: 'linear-gradient(180deg, rgba(77,217,184,0.85) 0%, rgba(77,217,184,0.35) 25%, rgba(77,217,184,0.08) 60%, transparent 100%)',
            filter: 'blur(1.2px)',
            boxShadow: '0 0 30px rgba(77,217,184,0.4)',
          }}
        />
        {/* Beam soft glow */}
        <motion.div
          style={{
            position: 'fixed', top: satY, left: satX, opacity: beamOpacity,
            zIndex: 24, pointerEvents: 'none',
            width: 80, height: '95vh', x: '-50%', y: '60px',
            background: 'linear-gradient(180deg, rgba(77,217,184,0.25) 0%, transparent 70%)',
            filter: 'blur(18px)',
          }}
        />
      </>
    )
  }
export function PremiumBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep Algeria space background */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Algeria soil background image - subtle, at 50% opacity */}
      <img src={heroSoil} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.04] mix-blend-overlay pointer-events-none" />

      {/* Algeria satellite imagery gradient overlays */}
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(60%_50%_at_20%_10%,rgba(232,148,26,0.15)_0%,transparent_50%),radial-gradient(50%_40%_at_80%_80%,rgba(16,185,129,0.12)_0%,transparent_50%)]" />

      {/* Grid overlay - satellite imagery pattern */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(232,148,26,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%2523n)%22/></svg>')]" />

      {/* Floating atmospheric blobs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'radial-gradient(circle, #E8941A, transparent 70%)' }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-15"
        style={{ background: 'radial-gradient(circle, #4dd9b8, transparent 70%)' }}
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 25, 0],
          y: [0, 25, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        className="absolute top-[30%] right-[20%] w-[350px] h-[350px] rounded-full blur-[80px] opacity-10"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
      />
    </div>
  )
}

export function CursorGlow() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const blur = useMotionValue(0)

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onLeave = () => blur.set(0)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [x, y, blur])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] opacity-70"
      style={{
        '--x': useTransform(x, (currX) => `${currX}px`),
        '--y': useTransform(y, (currY) => `${currY}px`),
        background: 'radial-gradient(circle 220px at var(--x) var(--y), rgba(16,185,129,.18), transparent 65%)',
      }}
    />
  )
}

export function MagneticButton({ children, className = '', ...props }) {
  const ref = useRef(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const springX = useSpring(coords.x, { stiffness: 160, damping: 18, mass: 0.2 })
  const springY = useSpring(coords.y, { stiffness: 160, damping: 18, mass: 0.2 })

  useEffect(() => {
    springX.set(coords.x)
    springY.set(coords.y)
  }, [coords, springX, springY])

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const xVal = e.clientX - (r.left + r.width / 2)
    const yVal = e.clientY - (r.top + r.height / 2)
    setCoords({ x: xVal * 0.25, y: yVal * 0.25 })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setCoords({ x: 0, y: 0 })}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-full border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-transparent px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:border-emerald-400/50 hover:bg-emerald-400/15 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] ${className}`}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

export function PremiumCard({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        '--mx': useTransform(mx, (val) => `${val}px`),
        '--my': useTransform(my, (val) => `${val}px`),
      }}
      className={`group relative overflow-hidden rounded-[28px] border border-emerald-400/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(16,185,129,0.05)] backdrop-blur-xl transition-all hover:border-emerald-400/30 hover:shadow-[0_30px_80px_-15px_rgba(16,185,129,0.2)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-emerald-400/0 transition-all duration-500 group-hover:border-emerald-400/20" />
      <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,.1),transparent_30%,transparent_70%,rgba(255,255,255,.05))] opacity-60" />
      <div className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-all duration-500 group-hover:opacity-100 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgba(16,185,129,.15),transparent_40%)]" />

      <div className="pointer-events-none absolute top-0 left-0 h-1 w-1 rounded-tl-lg bg-emerald-400/30" />
      <div className="pointer-events-none absolute top-0 right-0 h-1 w-1 rounded-tr-lg bg-emerald-400/30" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-1 rounded-bl-lg bg-emerald-400/30" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-1 w-1 rounded-br-lg bg-emerald-400/30" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

export function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotateX.set((0.5 - py) * 10)
    rotateY.set((px - 0.5) * 12)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        rotateX.set(0)
        rotateY.set(0)
      }}
      style={{ perspective: 1200, rotateX, rotateY }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
      <Orbit className="h-3.5 w-3.5" />
      {children}
    </div>
  )
}

export function PremiumHeroCopy({ title, subtitle, cta, onCta }) {
  return (
    <div className="max-w-2xl">
      <SectionLabel>Premium satellite intelligence</SectionLabel>
      <h1 className="text-balance text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 md:text-base">
        {subtitle}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <MagneticButton onClick={onCta}>
          {cta}
          <ArrowRight className="h-4 w-4" />
        </MagneticButton>
        <button className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/[0.06] hover:text-white">
          Voir la démonstration
        </button>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          ['R²=0.935', 'model accuracy'],
          ['24–72h', 'delivery window'],
          ['58 wilayas', 'coverage'],
        ].map(([v, l]) => (
          <PremiumCard key={v} className="p-4">
            <div className="text-lg font-black text-emerald-300">{v}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/35">{l}</div>
          </PremiumCard>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────── UI PRIMITIVES ────────────────────────── */

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const PARCEL_HOTSPOTS = [
  { name: 'Wilaya de Sétif', soc: '1.84%', argile: '28.5%', ph: '7.8', texture: 'Argilo-Limoneux', x: '55%', y: '42%' },
  { name: 'Wilaya de Tiaret', soc: '1.42%', argile: '22.1%', ph: '7.4', texture: 'Limoneux-Sableux', x: '35%', y: '60%' },
  { name: 'Wilaya d\'Alger (Mitidja)', soc: '2.35%', argile: '32.0%', ph: '6.9', texture: 'Argileux', x: '45%', y: '28%' },
  { name: 'Wilaya de M\'Sila', soc: '0.92%', argile: '15.4%', ph: '8.2', texture: 'Sableux-Limoneux', x: '68%', y: '55%' },
]

/* ────────────────────────────────── PAGE ────────────────────────────────── */

export default function LandingPage() {
  const [lang, setLang] = useState('fr')
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [activeParcel, setActiveParcel] = useState(PARCEL_HOTSPOTS[0])
  const [activeAgroTab, setActiveAgroTab] = useState(0)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white antialiased selection:bg-emerald-400/30">
      <ScrollProgress />
      <CursorGlow />
      <ScrollSatellite />

      <PremiumBackground />

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex min-h-[95vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroSoil} alt="Algerian agriculture" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, rgba(2,6,23,0.92) 0%, rgba(6,15,12,0.7) 30%, rgba(2,6,23,0.95) 70%, rgba(1,3,6,0.98) 100%), radial-gradient(60%_60%_at_30%_30%, rgba(232,148,26,0.15) 0%, transparent 60%), radial-gradient(50%_50%_at_70%_70%, rgba(16,185,129,0.12) 0%, transparent 50%)'
          }} />
          <div className="absolute inset-0 animate-scan-beam opacity-30 pointer-events-none">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
          </div>
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none [background-image:radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:3px_3px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="block text-white/50 text-sm font-bold uppercase tracking-[0.3em] mb-6">
                Algérie · Sentinel-2 · DANN
              </span>
              Le sol algérien,{' '}
              <br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(270deg, #fcd34d, #fef08a, #6ee7b7)' }}
              >
                lu depuis l'espace.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="mt-8 max-w-xl text-base leading-8 text-white/60 md:text-lg"
            >
              TellEye prédit le SOC, l'argile, le pH et la texture de vos sols algériens
              depuis Sentinel-2 — sans campagne terrain, livré en 24h.
              <span className="mt-4 block text-emerald-400/80 text-sm font-medium">
                Precis · Rapide · Fiable
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <MagneticButton onClick={() => navigate('/farmer')} className="text-base px-8 py-4 shadow-lg shadow-emerald-900/30">
                Analyser ma parcelle
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </MagneticButton>
              <button
                onClick={() => navigate('/academy')}
                className="group relative overflow-hidden rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
                Voir la démo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                ['R²=0.935', 'précision SOC', 'Accuracy Model'],
                ['58', 'wilayas couvertes', 'Coverage'],
                ['24–72h', 'délai rapport', 'Delivery'],
              ].map(([v, l, desc], idx) => (
                <motion.div
                  key={v}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group"
                >
                  <div className="glass-panel relative p-5 transition-all hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.2)]">
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-emerald-500/10" />
                    <div className="relative z-10">
                      <div className="text-2xl font-black text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{v}</div>
                      <div className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/35">{l}</div>
                      <div className="mt-2 h-px w-full bg-gradient-to-r from-emerald-500/20 to-transparent" />
                      <div className="mt-2 text-[10px] text-white/25">{desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30"
          >
            <span>Scroll</span>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <div className="relative border-y border-white/5 bg-black/30 py-5 backdrop-blur-sm">
        <div className="flex overflow-hidden whitespace-nowrap">
          <motion.div
            animate={{ x: [0, -1400] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="flex shrink-0 items-center gap-16 pr-16"
          >
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <div key={i} className="flex items-center gap-5">
                <span className="bg-gradient-to-b from-amber-300 to-emerald-400 bg-clip-text text-2xl font-black tracking-tight text-transparent" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.25))' }}>
                  {t.v}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{t.l}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400/40" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

     {/* ── DETAILED MAP telemetry map ── */}
      <section className="relative py-32 overflow-hidden border-t border-white/5 bg-[#020617]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <img src={satelliteSpaceGlow} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_30%_30%,rgba(232,148,26,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_70%_70%,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-6 lg:grid-cols-2 relative z-10">
          <Reveal>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Cartographie Précise</span>
            </motion.div>

            <h2 className="text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              L'Algérie cartographiée,<br />
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(270deg, #10b981, #6ee7b7, #10b981)' }}
              >
                sol par sol.
              </motion.span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/60">
              Du Tell au Sahara, TellEye prédit les propriétés du sol de chaque parcelle depuis Sentinel-2 — sans aucun prélèvement terrain.
              <span className="mt-4 block text-emerald-400/70 text-sm font-medium">Precis · Rapide · Fiable</span>
            </p>
            <div className="mt-8 space-y-3">
              {[
                { label: 'Zone Nord',       sub: 'Tell · Mitidja · Kabylie',       soc: 'SOC > 2%',   c: '#34d399' },
                { label: 'Hauts Plateaux',  sub: "Sétif · Tiaret · M'Sila",        soc: 'SOC 1–2%',   c: '#fbbf24' },
                { label: 'Zone Saharienne', sub: 'Biskra · Ouargla · Tamanrasset', soc: 'SOC < 0.8%', c: '#f87171' },
              ].map((z, idx) => (
                <PremiumCard key={z.label} className={`flex items-center gap-4 border p-4 backdrop-blur-sm transition-all hover:shadow-[0_0_40px_-12px_rgba(45,106,63,0.3)] ${
                  idx === 0 ? 'border-emerald-400/20' : 'border-white/10 hover:border-white/20'
                }`}>
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: z.c, boxShadow: `0 0 12px ${z.c}` }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{z.label}</div>
                    <div className="text-[11px] text-white/30">{z.sub}</div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-[10px] font-bold flex-shrink-0" style={{ color: z.c, backgroundColor: z.c + '1a' }}>{z.soc}</div>
                </PremiumCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <TiltCard>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/40">
                <img src={parcels} alt="Parcelles agricoles algériennes" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-emerald-500/10" />
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', left: 0, right: 0 }}
                  className="z-20 h-px bg-emerald-300/70 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                />
                
                {/* Interactive hotspots (pins) */}
                {PARCEL_HOTSPOTS.map((hotspot) => (
                  <button
                    key={hotspot.name}
                    onClick={() => setActiveParcel(hotspot)}
                    onMouseEnter={() => setActiveParcel(hotspot)}
                    style={{ left: hotspot.x, top: hotspot.y }}
                    className="absolute z-35 -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer focus:outline-none"
                  >
                    <span className="absolute inline-flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
                    <span className={`relative block h-3 w-3 rounded-full border-2 border-white transition-all duration-300 ${
                      activeParcel.name === hotspot.name ? 'bg-amber-400 scale-125 shadow-[0_0_12px_#fbbf24]' : 'bg-emerald-500 hover:bg-amber-400'
                    }`} />
                    
                    <span className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-[9px] font-bold text-white opacity-0 transition group-hover/pin:opacity-100 whitespace-nowrap shadow-lg">
                      {hotspot.name}
                    </span>
                  </button>
                ))}

                {/* Dynamic telemetry HUD */}
                <motion.div 
                  key={activeParcel.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-6 left-6 right-6 md:right-auto rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-md min-w-[200px]"
                >
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">{activeParcel.name}</div>
                  <div className="text-xl font-black text-white">{activeParcel.soc} <span className="text-xs font-semibold text-white/50">SOC</span></div>
                  <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/10 pt-2.5 text-[10px] text-white/60">
                    <div>Argile: <span className="font-bold text-white">{activeParcel.argile}</span></div>
                    <div>pH: <span className="font-bold text-white">{activeParcel.ph}</span></div>
                    <div className="col-span-2 text-white/45">Texture: <span className="font-bold text-emerald-300">{activeParcel.texture}</span></div>
                  </div>
                </motion.div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 algeria-section-gradient" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_50%,rgba(232,148,26,0.08)_0%,transparent_50%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 z-10">
          <Reveal className="mx-auto mb-4 max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-4 backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Science & Technologie</span>
            </motion.div>
          </Reveal>
          <Reveal className="mx-auto mb-6 max-w-4xl text-center" delay={0.05}>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
              Proven in the field.{' '}
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(270deg, #10b981, #6ee7b7, #10b981)' }}
              >
                Trusted by science.
              </motion.span>
            </h2>
          </Reveal>
          <Reveal className="mx-auto mb-16 max-w-2xl text-center" delay={0.1}>
            <p className="text-base leading-relaxed text-white/60 md:text-lg max-w-3xl mx-auto">
              De l'image satellite au rapport de sol, notre technologie DANN assure un transfert de domaine précis — sans échantillonnage terrain.
              <span className="mt-4 block text-emerald-400/70 text-sm font-medium">Precis · Rapide · Fiable</span>
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.Icon
              return (
                <Reveal key={s.n} delay={i * 0.08}>
                  <TiltCard>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -8 }}
                      className="group glass-panel relative overflow-hidden h-full flex flex-col p-6 hover:border-emerald-400/40 hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.3)] transition-all"
                    >
                      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative z-10">
                        <div className="mb-6 flex items-center justify-between">
                          <motion.div
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/[0.12] ring-1 ring-emerald-400/20 shadow-lg shadow-emerald-500/10"
                          >
                            <Icon className="h-6 w-6 text-emerald-300" />
                          </motion.div>
                          <span className="text-3xl font-black text-white/10">{s.n}</span>
                        </div>
                        <h3 className="mb-3 text-lg font-bold">{s.t}</h3>
                        <p className="text-sm leading-relaxed text-white/55">{s.d}</p>
                        <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>
                    </motion.div>
                  </TiltCard>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── AGRONOMY ── */}
      <section className="relative py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
          <Reveal>
            <TiltCard>
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl shadow-black/40 animate-gpu">
                <img src={careImg} alt="Conseils agronomiques sur le terrain" className="h-full w-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-emerald-500/10" />
                
                {/* Telemetry charts overlay */}
                <div className="absolute top-6 right-6 rounded-2xl border border-white/10 bg-black/65 p-4 backdrop-blur-md w-60">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Indices Agronomiques</div>
                  <div className="space-y-3">
                    {[
                      { label: 'Indice SOC', v: activeAgroTab === 0 ? 84 : activeAgroTab === 1 ? 62 : 95 },
                      { label: 'Fertilité NPK', v: activeAgroTab === 0 ? 76 : activeAgroTab === 1 ? 92 : 81 },
                      { label: 'Rétention d\'Eau', v: activeAgroTab === 0 ? 68 : activeAgroTab === 1 ? 45 : 88 },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <div className="flex justify-between text-[9px] text-white/60">
                          <span>{stat.label}</span>
                          <span className="font-bold text-white">{stat.v}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.v}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
          <Reveal delay={0.15}>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">Au-delà de la donnée</span>
            <h2 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Conseils agronomiques{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">inclus.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
              TellEye ne livre pas seulement des chiffres. Chaque rapport inclut une interprétation agronomique concrète et actionnable pour votre parcelle.
            </p>
            <ul className="mt-7 space-y-4">
              {[
                { title: "Recommandations de rotation et d'amendement", desc: "Optimisez vos apports azotés et organo-minéraux en fonction des besoins réels de vos sols pour restaurer le taux d'humus." },
                { title: "Diagnostic de fertilité et risques d'érosion", desc: "Identifiez les zones à faible rétention d'eau et anticipez les risques d'érosion ou de salinisation des sols." },
                { title: "Suivi multi-saison de l'évolution du SOC", desc: "Mesurez l'impact de vos pratiques de semis direct et de couverts végétaux sur le stockage du carbone d'année en année." }
              ].map((t, idx) => (
                <li 
                  key={t.title} 
                  onClick={() => setActiveAgroTab(idx)}
                  className={`flex flex-col gap-1 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeAgroTab === idx 
                      ? 'bg-white/[0.04] border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.08)]' 
                      : 'bg-transparent border-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <span className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                      activeAgroTab === idx ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/30'
                    }`} />
                    {t.title}
                  </div>
                  {activeAgroTab === idx && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="pl-5 text-xs text-white/50 leading-relaxed mt-1"
                    >
                      {t.desc}
                    </motion.p>
                  )}
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
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {PARTNERS.map((p) => (
              <span key={p} data-hover className="text-sm font-semibold text-white/40 transition hover:text-emerald-300">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative pb-32 pt-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 algeria-section-gradient" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_50%,rgba(232,148,26,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.04] to-transparent p-10 md:p-16"
          >
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 mb-4 backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">Commencez maintenant</span>
                </motion.div>
                <h3 className="mt-4 text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
                  Prêt à connaître votre sol&nbsp;?
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">
                  Première analyse gratuite — aucun déplacement, aucune prise d'échantillon.
                  <span className="mt-2 block text-emerald-400/80 text-sm font-medium">
                    Precis · Rapide · Fiable
                  </span>
                </p>
              </div>
              <div className="flex-shrink-0">
                <MagneticButton onClick={() => navigate('/farmer')} className="px-8 py-4 text-lg shadow-lg shadow-emerald-900/40">
                  Démarrer
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </MagneticButton>
              </div>
            </div>
          </motion.div>
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