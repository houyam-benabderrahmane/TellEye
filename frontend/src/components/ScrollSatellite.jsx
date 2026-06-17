import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValue, animate } from 'framer-motion'
import SatelliteIcon from './SatelliteIcon'

export default function ScrollSatellite({ heroInView = true, active = false }) {
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { scrollYProgress } = useScroll()

  // Enhanced scroll milestones for orbital path
  const scrollMilestones = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  const angleMilestones = [
    Math.PI * 0.05,  // Top right
    Math.PI * 0.15,  // Upper right
    Math.PI * 0.35,  // Right - near Alger
    Math.PI * 0.55,  // Lower right
    Math.PI * 0.75,  // Bottom center
    Math.PI * 0.95,  // Lower left
    Math.PI * 1.15,  // Left - near Oran
    Math.PI * 1.35,  // Upper left
    Math.PI * 1.55,  // Top left
    Math.PI * 1.75,  // Mid-top
    Math.PI * 1.95,  // Return
  ]

  const angle = useTransform(scrollYProgress, scrollMilestones, angleMilestones)

  // Parametric ellipse calculations - creates smooth orbital motion
  const cx = isMobile ? 50 : 52
  const cy = isMobile ? 50 : 45
  const rx = isMobile ? 40 : 35
  const ry = isMobile ? 30 : 32

  const xRaw = useTransform(angle, a => cx + rx * Math.cos(a))
  const yRaw = useTransform(angle, a => cy + ry * Math.sin(a))
  const rotateRaw = useTransform(angle, a => (a * 180) / Math.PI + 90)

  // Premium spring physics
  const springConfig = { stiffness: 80, damping: 30, mass: 0.5 }
  const xSpring = useSpring(xRaw, springConfig)
  const ySpring = useSpring(yRaw, springConfig)
  const rotateSpring = useSpring(rotateRaw, springConfig)

  // Trail particle system - 5 levels creating beautiful depth
  const xTrail1 = useSpring(xSpring, { stiffness: 90, damping: 35 })
  const yTrail1 = useSpring(ySpring, { stiffness: 90, damping: 35 })

  const xTrail2 = useSpring(xTrail1, { stiffness: 80, damping: 30 })
  const yTrail2 = useSpring(yTrail1, { stiffness: 80, damping: 30 })

  const xTrail3 = useSpring(xTrail2, { stiffness: 70, damping: 25 })
  const yTrail3 = useSpring(yTrail2, { stiffness: 70, damping: 25 })

  const xTrail4 = useSpring(xTrail3, { stiffness: 60, damping: 20 })
  const yTrail4 = useSpring(yTrail3, { stiffness: 60, damping: 20 })

  const xTrail5 = useSpring(xTrail4, { stiffness: 50, damping: 15 })
  const yTrail5 = useSpring(yTrail4, { stiffness: 50, damping: 15 })

  // Idle drift animation
  const driftY = useMotionValue(0)
  useEffect(() => {
    const controls = animate(driftY, [-8, 8, -8], {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    })
    return () => controls.stop()
  }, [driftY])

  const driftX = useMotionValue(0)
  useEffect(() => {
    const controls = animate(driftX, [-5, 5, -5], {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut"
    })
    return () => controls.stop()
  }, [driftX])

  // Combined transforms
  const xCombined = useTransform(xSpring, x => `${x}vw`)
  const yCombined = useTransform([ySpring, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  const xTrail1Combined = useTransform(xTrail1, x => `${x}vw`)
  const yTrail1Combined = useTransform([yTrail1, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  const xTrail2Combined = useTransform(xTrail2, x => `${x}vw`)
  const yTrail2Combined = useTransform([yTrail2, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  const xTrail3Combined = useTransform(xTrail3, x => `${x}vw`)
  const yTrail3Combined = useTransform([yTrail3, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  const xTrail4Combined = useTransform(xTrail4, x => `${x}vw`)
  const yTrail4Combined = useTransform([yTrail4, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  const xTrail5Combined = useTransform(xTrail5, x => `${x}vw`)
  const yTrail5Combined = useTransform([yTrail5, driftY], ([y, d]) => `calc(${y}vh + ${d}px)`)

  // Trail dynamics
  const scrollVelocity = useVelocity(scrollYProgress)
  const trailOpacity = useTransform(scrollVelocity, [-1, 0, 1], [0.9, 0.2, 0.9])
  const trailScale = useTransform(scrollVelocity, [-1, 0, 1], [1.5, 0.5, 1.5])

  // Pixel calculations
  const satXPixels = useTransform(xSpring, xVal => xVal * windowDimensions.width / 100)
  const satYPixels = useTransform(ySpring, yVal => yVal * windowDimensions.height / 100)

  const pinX = isMobile ? windowDimensions.width * 0.5 : windowDimensions.width * 0.76
  const pinY = isMobile ? windowDimensions.height * 0.52 : windowDimensions.height * 0.56

  // Waypoint labels
  const algerOpacity = useTransform(scrollYProgress, [0.18, 0.26, 0.34], [0, 1, 0])
  const oranOpacity = useTransform(scrollYProgress, [0.58, 0.66, 0.74], [0, 1, 0])

  // Beam animation
  const beamOpacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 0.7, 0.7, 0])
  const beamY = useTransform(scrollYProgress, [0, 1], ['-50%', '150%'])

  return (
    <>
      {/* Fixed Viewport Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden w-screen h-screen"
      >
        {/* Premium signal beam from satellite */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        >
          <defs>
            <filter id="beamGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="beamGradient">
              <stop offset="0%" stopColor="#E8941A" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#F5B041" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E8941A" stopOpacity="0" />
            </linearGradient>
          </defs>

          <motion.line
            x1={satXPixels}
            y1={satYPixels}
            x2={pinX}
            y2={pinY}
            stroke="url(#beamGradient)"
            strokeWidth="3"
            strokeDasharray="12 12"
            opacity={0.7}
            filter="url(#beamGlow)"
            animate={{ strokeDashoffset: [0, -60] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 2.5 }}
          />
        </motion.svg>

        {/* Trail 5 - outermost, faintest */}
        <motion.div
          style={{
            left: xTrail5Combined,
            top: yTrail5Combined,
            opacity: useTransform(trailOpacity, o => o * 0.3),
            scale: useTransform(trailScale, s => s * 0.25)
          }}
          className="absolute w-2 h-2 rounded-full bg-emerald-500/20 blur-[2px] transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Trail 4 */}
        <motion.div
          style={{
            left: xTrail4Combined,
            top: yTrail4Combined,
            opacity: useTransform(trailOpacity, o => o * 0.5),
            scale: useTransform(trailScale, s => s * 0.4)
          }}
          className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500/40 blur-[1px] transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Trail 3 */}
        <motion.div
          style={{
            left: xTrail3Combined,
            top: yTrail3Combined,
            opacity: useTransform(trailOpacity, o => o * 0.7),
            scale: useTransform(trailScale, s => s * 0.6)
          }}
          className="absolute w-3 h-3 rounded-full bg-emerald-400/60 transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Trail 2 */}
        <motion.div
          style={{
            left: xTrail2Combined,
            top: yTrail2Combined,
            opacity: useTransform(trailOpacity, o => o * 0.85),
            scale: useTransform(trailScale, s => s * 0.75)
          }}
          className="absolute w-3.5 h-3.5 rounded-full bg-emerald-300/80 transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Trail 1 - main trail, brightest */}
        <motion.div
          style={{
            left: xTrail1Combined,
            top: yTrail1Combined,
            opacity: trailOpacity,
            scale: trailScale
          }}
          className="absolute w-4 h-4 rounded-full bg-emerald-400 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(52,211,153,0.7)]"
        />

        {/* Main Satellite */}
        <motion.div
          style={{
            left: xCombined,
            top: yCombined,
            rotate: rotateSpring
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center z-50"
        >
          {/* Floating animation */}
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <SatelliteIcon className="w-full h-full drop-shadow-[0_0_30px_rgba(232,148,26,0.8)]" color="amber" />
          </motion.div>

          {/* Premium glow aura */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
          />
        </motion.div>

        {/* Alger Waypoint Label */}
        <motion.div
          style={{
            left: isMobile ? '45vw' : '60vw',
            top: isMobile ? '68vh' : '81vh',
            opacity: algerOpacity
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="glass-panel px-5 py-3 rounded-2xl max-w-[200px] text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">Satellite Link</span>
            </div>
            <div className="text-sm font-bold text-white">Télémesure Alger</div>
            <div className="text-[10px] text-emerald-400/80">SOC: 1.84% · pH: 7.2</div>
          </div>
          {/* Connector line */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 w-px h-6 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </motion.div>

        {/* Oran Waypoint Label */}
        <motion.div
          style={{
            left: isMobile ? '30vw' : '48vw',
            top: isMobile ? '32vh' : '26vh',
            opacity: oranOpacity
          }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="glass-panel px-5 py-3 rounded-2xl max-w-[200px] text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300">Satellite Link</span>
            </div>
            <div className="text-sm font-bold text-white">Télémesure Oran</div>
            <div className="text-[10px] text-emerald-400/80">SOC: 1.42% · pH: 7.4</div>
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 w-px h-6 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </motion.div>

        {/* Scan line overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.05) 50%, transparent)',
            animation: 'scanBeam 8s linear infinite'
          }}
        />

      </motion.div>
    </>
  )
}
