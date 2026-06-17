import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { useReducedMotion } from 'framer-motion'

export default function Globe({ onIntroComplete }) {
  const containerRef = useRef(null)
  
  // Animation state refs to pass smoothly into cobe onRender
  const phiRef = useRef(0)
  const thetaRef = useRef(0.3) // slight tilt
  const scaleRef = useRef(1.0)
  
  const prefersReduced = useReducedMotion()
  
  // Check if already visited in this session
  const isVisited = typeof window !== 'undefined' && sessionStorage.getItem('telleye-hero-visited') === 'true'
  const skipIntro = prefersReduced || isVisited

  useEffect(() => {
    if (!containerRef.current) return

    // Clear any previous canvas elements inside the wrapper to prevent duplicates in StrictMode
    containerRef.current.innerHTML = ''

    // Create a fresh canvas element to guarantee clean WebGL context in StrictMode
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.aspectRatio = '1'
    canvas.style.maxWidth = '100%'
    canvas.style.maxHeight = '100%'
    canvas.className = 'w-full h-full max-w-full'
    
    // Append the fresh canvas to the dedicated empty wrapper container
    containerRef.current.appendChild(canvas)

    let width = 500
    if (containerRef.current.offsetWidth > 0) {
      width = containerRef.current.offsetWidth
    }

    // Set up ResizeObserver to observe the container rather than canvas
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          width = entry.contentRect.width
        }
      }
    })
    resizeObserver.observe(containerRef.current)

    // Algeria coordinates: Lat 28.0339 (0.489 rad), Lng 1.6596 (0.029 rad)
    // In cobe, standard rotation places Algeria at phi ~ 2.45, theta ~ 0.48
    const focusPhi = 2.45
    const focusTheta = 0.48
    
    // Set initial values based on whether we skip the intro
    if (skipIntro) {
      phiRef.current = focusPhi
      thetaRef.current = focusTheta
      scaleRef.current = 1.35
      onIntroComplete()
    } else {
      phiRef.current = 0
      thetaRef.current = 0.3
      scaleRef.current = 1.0
    }

    let currentPhiValue = phiRef.current
    let currentThetaValue = thetaRef.current
    let currentScaleValue = scaleRef.current
    
    let introStartTime = null
    let introCalled = false
    let pointerInteracting = false
    let pointerInteractionStart = 0

    const globe = createGlobe(canvas, {
      devicePixelRatio: window.devicePixelRatio || 2,
      width: width * 2,
      height: width * 2,
      phi: currentPhiValue,
      theta: currentThetaValue,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6.0,
      baseColor: [0.11, 0.11, 0.11], // Charcoal rgb(28,28,28) -> [0.11, 0.11, 0.11]
      markerColor: [0.91, 0.58, 0.1], // Amber rgb(232,148,26) -> [0.91, 0.58, 0.1]
      glowColor: [0.176, 0.415, 0.247], // Forest Green rgb(45,106,63) -> [0.176, 0.415, 0.247]
      markers: [
        { location: [28.0339, 1.6596], size: 0.08 } // Algeria pulse marker
      ],
      onRender: (state) => {
        // Handle resizing if width changed
        state.width = width * 2
        state.height = width * 2

        if (!pointerInteracting && !skipIntro) {
          const now = performance.now()
          if (!introStartTime) introStartTime = now
          const elapsed = (now - introStartTime) / 1000 // elapsed seconds

          if (elapsed < 1.5) {
            // Step 1: Slow free rotation
            currentPhiValue += 0.007
            phiRef.current = currentPhiValue
          } else if (elapsed >= 1.5 && elapsed < 3.2) {
            // Step 2: Animate focus to Algeria and scale up
            const t = (elapsed - 1.5) / 1.7 // normalized transition time (0 -> 1)
            // Cubic ease-in-out curve
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
            
            // Interpolate phi, theta, scale from wherever phi ended up after 1.5s
            const startPhi = phiRef.current - (elapsed - 1.5) * 0.007
            
            const deltaPhi = focusPhi - startPhi
            currentPhiValue = startPhi + deltaPhi * ease
            currentThetaValue = 0.3 + (focusTheta - 0.3) * ease
            currentScaleValue = 1.0 + (1.35 - 1.0) * ease
          } else {
            // Step 3: Finished intro
            currentPhiValue = focusPhi
            currentThetaValue = focusTheta
            currentScaleValue = 1.35
            
            // Tell parent component intro is complete
            if (!introCalled) {
              introCalled = true
              sessionStorage.setItem('telleye-hero-visited', 'true')
              onIntroComplete()
            }
          }
        } else if (pointerInteracting) {
          // Allow interactive panning
          currentPhiValue = phiRef.current
          currentThetaValue = thetaRef.current
        } else {
          // Visited or Reduced motion state: static focus on Algeria
          currentPhiValue = focusPhi
          currentThetaValue = focusTheta
          currentScaleValue = 1.35
        }

        state.phi = currentPhiValue
        state.theta = currentThetaValue
        state.scale = currentScaleValue
      }
    })

    // Drag-to-rotate interaction handlers
    const handlePointerDown = (e) => {
      pointerInteracting = e.clientX - pointerInteractionStart
      canvas.style.cursor = 'grabbing'
    }

    const handlePointerUp = () => {
      pointerInteracting = false
      canvas.style.cursor = 'grab'
    }

    const handlePointerOut = () => {
      pointerInteracting = false
      canvas.style.cursor = 'grab'
    }

    const handlePointerMove = (e) => {
      if (pointerInteracting !== false) {
        const delta = e.clientX - pointerInteracting
        pointerInteractionStart = delta
        phiRef.current = delta / 200
      }
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerout', handlePointerOut)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.style.cursor = 'grab'

    return () => {
      globe.destroy()
      resizeObserver.disconnect()
      
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerout', handlePointerOut)
      canvas.removeEventListener('pointermove', handlePointerMove)
      
      // Let React handle deleting containerRef.current from DOM on unmount.
      // We do NOT call removeChild manually to prevent React reconciler "removeChild" NotFoundError.
    }
  }, [skipIntro, onIntroComplete])

  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      {/* Glow effect matching design theme */}
      <div className="absolute w-[80%] h-[80%] rounded-full bg-forest/10 blur-[80px] -z-10 pointer-events-none" />
      {/* Dedicated empty wrapper container for canvas DOM injection */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  )
}
