import React from 'react'

export default function SatelliteIcon({ className = "w-16 h-16", color = "amber" }) {
  // Color schemes
  const colors = {
    amber: {
      main: '#E8941A',
      glow: '#F5B041',
      panel: '#3B5998',
    },
    emerald: {
      main: '#10B981',
      glow: '#34D399',
      panel: '#1E3A8A',
    },
    deep: {
      main: '#4dd9b8',
      glow: '#6EE7B7',
      panel: '#1E40AF',
    }
  }[color]

  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Premium gradients */}
        <linearGradient id="satBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5A5A6E" />
          <stop offset="40%" stopColor="#3A3A4A" />
          <stop offset="70%" stopColor="#252535" />
          <stop offset="100%" stopColor="#121218" />
        </linearGradient>

        <linearGradient id="solarPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3E62" />
          <stop offset="30%" stopColor="#152A4A" />
          <stop offset="60%" stopColor="#0B1626" />
          <stop offset="100%" stopColor="#050B15" />
        </linearGradient>

        <linearGradient id="goldAccents" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.glow} />
          <stop offset="50%" stopColor={colors.main} />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>

        <linearGradient id="beamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={colors.main} stopOpacity="0.6" />
          <stop offset="30%" stopColor={colors.glow} stopOpacity="0.4" />
          <stop offset="70%" stopColor={colors.main} stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>

        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="colorBlur" />
          <feMerge>
            <feMergeNode in="colorBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Orbit/Beam Connection Point (top center) */}
      <circle
        cx="60"
        cy="8"
        r="2.5"
        fill="url(#goldAccents)"
        filter="url(#glow)"
        className="animate-antenna-pulse"
      />
      <line
        x1="60"
        y1="8"
        x2="60"
        y2="16"
        stroke="url(#goldAccents)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Main Body */}
      <g filter="url(#glow)">
        <rect
          x="42"
          y="22"
          width="36"
          height="36"
          rx="3"
          fill="url(#satBodyGrad)"
          stroke="#6B6B80"
          strokeWidth="1"
        />

        {/* Solar Panel Connectors */}
        <line x1="48" y1="22" x2="48" y2="18" stroke="#6B6B80" strokeWidth="1" />
        <line x1="72" y1="22" x2="72" y2="18" stroke="#6B6B80" strokeWidth="1" />
      </g>

      {/* Left Solar Panel */}
      <g>
        <rect
          x="12"
          y="24"
          width="28"
          height="48"
          rx="2"
          fill="url(#solarPanelGrad)"
          stroke={colors.main}
          strokeWidth="1"
        />
        {/* Panel Grid Lines */}
        <line x1="12" y1="36" x2="40" y2="36" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="12" y1="48" x2="40" y2="48" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="12" y1="60" x2="40" y2="60" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="26" y1="24" x2="26" y2="72" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="18" y1="24" x2="18" y2="72" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />

        {/* Panel Glint - premium shine effect */}
        <path
          d="M 12 24 L 40 48 L 40 30 L 16 24 Z"
          fill="#FFF"
          opacity="0.1"
        />
      </g>

      {/* Right Solar Panel */}
      <g>
        <rect
          x="80"
          y="24"
          width="28"
          height="48"
          rx="2"
          fill="url(#solarPanelGrad)"
          stroke={colors.main}
          strokeWidth="1"
        />
        {/* Panel Grid Lines */}
        <line x1="80" y1="36" x2="108" y2="36" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="80" y1="48" x2="108" y2="48" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="80" y1="60" x2="108" y2="60" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="94" y1="24" x2="94" y2="72" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />
        <line x1="86" y1="24" x2="86" y2="72" stroke={colors.main} strokeWidth="0.5" opacity="0.5" />

        {/* Panel Glint */}
        <path
          d="M 80 24 L 108 48 L 108 30 L 84 24 Z"
          fill="#FFF"
          opacity="0.1"
        />
      </g>

      {/* Instrument Panels - Gold Accents */}
      <g filter="url(#glow)">
        <rect x="46" y="28" width="10" height="4" rx="0.5" fill="url(#goldAccents)" opacity="0.8" />
        <rect x="60" y="28" width="10" height="4" rx="0.5" fill="url(#goldAccents)" opacity="0.8" />

        {/* Camera Lens */}
        <path d="M 46 54 L 74 54 L 76 64 L 44 64 Z" fill="#0D0D12" stroke="#333" strokeWidth="1" />
        <ellipse cx="60" cy="64" rx="6" ry="2" fill={colors.main} opacity="0.6" />

        {/* Communication Antenna Dish */}
        <path d="M 42 22 L 78 22 L 60 8 Z" fill="#1A1A25" stroke="#444" strokeWidth="0.8" />
        <circle cx="60" cy="8" r="2" fill={colors.glow} filter="url(#glow)" className="animate-antenna-pulse" />
      </g>

      {/* Data Transmission Beam (animated) */}
      <g filter="url(#beamGlow)">
        <path
          d="M 52 64 L 68 64 L 60 100"
          stroke="url(#beamGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="4 6"
          className="animate-scan-beam"
          opacity="0.4"
        />
      </g>

      {/* Premium Ring around satellite - Algeria themed */}
      <g className="animate-glint">
        <circle
          cx="60"
          cy="40"
          r="26"
          fill="none"
          stroke="url(#goldAccents)"
          strokeWidth="0.5"
          strokeDasharray="4 2"
          opacity="0.3"
        />
        <circle
          cx="60"
          cy="40"
          r="30"
          fill="none"
          stroke={colors.main}
          strokeWidth="0.3"
          strokeDasharray="2 4"
          opacity="0.2"
        />
      </g>
    </svg>
  )
}
