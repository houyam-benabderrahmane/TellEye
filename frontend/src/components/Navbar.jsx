import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ── Satellite orbit logo icon ──────────────────────────────────
const TellEyeLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="5" fill="#E8941A"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="#E8941A" strokeWidth="1.5" fill="none"
      transform="rotate(-30 16 16)" strokeDasharray="3 2"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="#2D6A3F" strokeWidth="1.5" fill="none"
      transform="rotate(30 16 16)" strokeDasharray="3 2" opacity="0.7"/>
    <circle cx="28" cy="10" r="2.5" fill="#6B1F1F"/>
    <circle cx="5"  cy="22" r="2"   fill="#2D6A3F"/>
  </svg>
)

const NAV_LINKS = [
  { label: 'Accueil',      labelAr: 'الرئيسية',     to: '/' },
  { label: 'Comment ça marche', labelAr: 'كيف يعمل', to: '/#how-it-works' },
  { label: 'Solutions',    labelAr: 'الحلول',        to: '/#solutions' },
  { label: 'Tarifs',       labelAr: 'الأسعار',       to: '/pricing' },
  { label: 'Soil Academy', labelAr: 'أكاديمية التربة', to: '/academy' },
  { label: 'Contact',      labelAr: 'تواصل',         to: '/contact' },
 
  
]

export default function Navbar({ lang = 'fr', onLangChange }) {
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [currentLang,   setCurrentLang]   = useState(lang)
  const location = useLocation()
  const navigate  = useNavigate()

  /* ── Scroll shadow ─────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleLang = () => {
    const next = currentLang === 'fr' ? 'ar' : 'fr'
    setCurrentLang(next)
    onLangChange?.(next)
  }

  const isActive = (to) => location.pathname === to

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-charcoal/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex items-center gap-2"
            >
              <img
                src="/logo.png"
                alt="TellEye Logo"
                style={{ height: 38, width: 'auto', objectFit: 'contain' }}
              />
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
              >
                Tell<span className="text-amber-telleye">Eye</span>
              </span>
            </motion.div>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(link.to)
                    ? 'text-amber-telleye'
                    : 'text-white/80 hover:text-white hover:bg-white/8'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {currentLang === 'ar' ? link.labelAr : link.label}
              </Link>
            ))}
          </div>

          {/* ── Right side: Lang + CTA ────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-white/25 text-white/80 text-sm font-medium hover:border-white/50 hover:text-white transition-all"
            >
              <span className={currentLang === 'fr' ? 'text-amber-telleye' : ''}>FR</span>
              <span className="text-white/40 mx-0.5">|</span>
              <span className={currentLang === 'ar' ? 'text-amber-telleye' : ''}>AR</span>
            </button>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/farmer')}
              className="btn-amber text-sm px-5 py-2.5"
            >
              {currentLang === 'ar' ? 'تحليل مجاني' : 'Try Free Analysis'}
            </motion.button>
          </div>

          {/* ── Mobile burger ─────────────────────────────────── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-md text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-charcoal/98 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 rounded-md transition-colors"
                >
                  {currentLang === 'ar' ? link.labelAr : link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-white/10">
                <button onClick={toggleLang} className="text-sm text-white/60 text-left px-3">
                  Langue: <span className="text-amber-telleye">{currentLang.toUpperCase()}</span> →{' '}
                  {currentLang === 'fr' ? 'AR' : 'FR'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { navigate('/farmer'); setMenuOpen(false) }}
                  className="btn-amber text-sm text-center"
                >
                  Try Free Analysis
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}