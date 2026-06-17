import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function StatCounter({ end, prefix = '', suffix = '', label, decimals = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  
  // Spring configuration for buttery smooth counting
  const spring = useSpring(count, {
    stiffness: 45,
    damping: 18,
    mass: 1
  })

  // Format the number dynamically
  const display = useTransform(spring, (latest) => {
    // Format large numbers with spaces if needed (e.g. 100 000)
    let valStr = latest.toFixed(decimals)
    if (decimals === 0 && latest > 9999) {
      valStr = valStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    }
    return valStr
  })

  const [displayVal, setDisplayVal] = useState('0')

  useEffect(() => {
    if (isInView) {
      // Small timeout to allow entrance transition to begin first
      const timer = setTimeout(() => {
        count.set(end)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isInView, end, count])

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayVal(latest)
    })
  }, [display])

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-6 text-center">
      <div className="text-3xl md:text-5xl font-display font-black text-cream flex items-baseline">
        {prefix && <span className="text-lg md:text-xl font-bold text-forest mr-1 select-none">{prefix}</span>}
        <span>{displayVal}</span>
        {suffix && <span className="text-lg md:text-2xl font-bold text-forest ml-0.5 select-none">{suffix}</span>}
      </div>
      <div className="mt-3 text-xs md:text-sm font-semibold uppercase tracking-widest text-forest select-none font-display">
        {label}
      </div>
    </div>
  )
}
