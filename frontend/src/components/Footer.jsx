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
    { label: 'Universite Constantine 2', to: '#' },
    { label: 'ESA Copernicus',           to: '#' },
    { label: 'USDA / OSSL',              to: '#' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ background: '#1C1C1C' }} className="text-white/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white text-lg font-bold">
                Tell<span style={{ color: '#E8941A' }}>Eye</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-4">
              Intelligence du sol pour l&apos;Algerie. Cartographie SOC, argile, pH et texture sans campagnes terrain.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ border: '1px solid rgba(45,106,63,0.4)', background: 'rgba(45,106,63,0.1)', color: '#a7d4b5' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2D6A3F' }} />
              Valide par ASAL
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Plateforme
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.platform.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segments */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Segments
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.segments.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Partenaires
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.partners.map((l) => (
                <li key={l.label}>
                  <a href={l.to} className="text-sm hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-5 text-xs text-white/35 space-y-1">
              <p>contact@telleye.dz</p>
              <p>Algerie, Constantine</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>2026 TellEye — Universite de Constantine 2. Tous droits reserves.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="hover:text-white/60 transition-colors">Confidentialite</Link>
            <Link to="#" className="hover:text-white/60 transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}