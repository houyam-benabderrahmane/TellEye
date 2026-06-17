import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  platform: [
    { label: 'Accueil',      to: '/' },
    { label: 'Solutions',    to: '/#solutions' },
    { label: 'Tarifs',       to: '/pricing' },
    { label: 'Soil Academy', to: '/academy' },
  ],
  segments: [
    { label: 'Agriculteurs', to: '/farmer' },
    { label: 'Institutions', to: '/institution' },
    { label: 'Chercheurs',   to: '/pricing' },
  ],
  partners: [
    { label: 'ASAL',                    to: '#' },
    { label: 'Université Constantine 2', to: '#' },
    { label: 'ESA Copernicus',           to: '#' },
    { label: 'USDA / OSSL',              to: '#' },
  ],
}

/* Minimal satellite icon — matches the page's SVG style */
function SatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5" aria-hidden="true">
      <rect x="7" y="6" width="6" height="8" rx="1.5" stroke="#34d399" strokeWidth="1.2"/>
      <line x1="7"  y1="10" x2="2"  y2="10" stroke="#34d399" strokeWidth="1"/>
      <line x1="13" y1="10" x2="18" y2="10" stroke="#34d399" strokeWidth="1"/>
      <rect x="1"  y="8.5" width="4" height="3" rx="0.8" fill="#34d399" opacity="0.35"/>
      <rect x="15" y="8.5" width="4" height="3" rx="0.8" fill="#34d399" opacity="0.35"/>
      <line x1="10" y1="6"  x2="10" y2="3"  stroke="#34d399" strokeWidth="1"/>
      <circle cx="10" cy="2.5" r="1.2" fill="#34d399" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="relative text-white/60 pt-16 pb-8 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <SatIcon />
              <span className="text-white text-lg font-black tracking-tight">
                Tell<span style={{ color: '#34d399' }}>Eye</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed text-white/40 mb-5">
              Intelligence du sol pour l'Algérie. Cartographie SOC, argile, pH et texture sans campagnes terrain.
            </p>

            {/* Validated badge — matches LandingPage pill style */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold"
              style={{
                border: '1px solid rgba(52,211,153,0.2)',
                background: 'rgba(52,211,153,0.07)',
                color: '#6ee7b7',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}
              />
              Validé par ASAL
            </div>

            {/* Stat pills */}
          
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-4 uppercase tracking-[0.22em]">
              Plateforme
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segments */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-4 uppercase tracking-[0.22em]">
              Segments
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.segments.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partenaires + contact */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-4 uppercase tracking-[0.22em]">
              Partenaires
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.partners.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact block */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-1.5">
              <p className="text-xs text-white/30">contact@telleye.dz</p>
              <p className="text-xs text-white/30">Algérie, Constantine</p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
          <p>© 2026 TellEye — Université de Constantine 2. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <Link to="#" className="hover:text-white/50 transition-colors">Confidentialité</Link>
            <Link to="#" className="hover:text-white/50 transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}