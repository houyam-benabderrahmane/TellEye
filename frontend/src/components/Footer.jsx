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

export default function Footer() {
  return (
    <footer className="relative text-white/70 pt-20 pb-12 overflow-hidden border-t border-white/[0.06]">
      {/* Premium Algeria-themed background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a111c] to-[#050b1c]" />
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(ellipse_at_50%_50%,rgba(232,148,26,0.2)_0%,transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="logo.png"
                alt="TelEye"
                className="w-10 h-10 object-contain"
              />
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Tel<span className="text-emerald-400">Eye</span>
                </span>
                <div className="text-[10px] font-medium text-emerald-400/70 uppercase tracking-[0.2em]">Satellite Intelligence</div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/50 mb-6">
              Intelligence du sol pour l'Algérie. Cartographie SOC, argile, pH et texture sans campagnes terrain.
            </p>

            {/* Premium validated badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="h-2 w-2 rounded-full flex-shrink-0 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              Validé par ASAL
            </div>

            {/* Premium stat pills */}
            <div className="mt-6 flex gap-3">
              <div className="text-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="text-lg font-black text-white">58</div>
                <div className="text-[9px] text-white/40 uppercase tracking-[0.15em]">Wilayas</div>
              </div>
              <div className="text-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div className="text-lg font-black text-white">24h</div>
                <div className="text-[9px] text-white/40 uppercase tracking-[0.15em]">Delivery</div>
              </div>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-6 uppercase tracking-[0.3em] border-b border-white/10 pb-2">
              Plateforme
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-all duration-200 group flex items-center gap-2"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Segments */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-6 uppercase tracking-[0.3em] border-b border-white/10 pb-2">
              Segments
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.segments.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-all duration-200 group flex items-center gap-2"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partenaires */}
          <div>
            <h4 className="text-white font-bold text-[10px] mb-6 uppercase tracking-[0.3em] border-b border-white/10 pb-2">
              Partenaires
            </h4>
            <ul className="space-y-3 mb-6">
              {FOOTER_LINKS.partners.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.to}
                    className="text-sm text-white/45 hover:text-emerald-300 transition-all duration-200 group flex items-center gap-2"
                  >
                    <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Contact block */}
            <div className="pt-5 border-t border-white/10">
              <h4 className="text-white font-bold text-[10px] mb-4 uppercase tracking-[0.3em]">
                Contact
              </h4>
              <div className="space-y-2 text-sm text-white/50">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href="mailto:contact@telleye.dz" className="hover:text-white/80 transition-colors">contact@telleye.dz</a>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Algérie, Constantine</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400/50" />
            <p>© 2026 TellEye — Université de Constantine 2</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-emerald-300 transition-colors">Confidentialité</Link>
            <Link to="#" className="hover:text-emerald-300 transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}