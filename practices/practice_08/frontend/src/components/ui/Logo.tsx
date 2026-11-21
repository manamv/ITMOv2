import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  }[size]

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }[size]

  return (
    <div className={`flex items-center space-x-3 select-none group cursor-pointer ${className}`}>
      {/* High-Tech Vector Logo Icon */}
      <div className={`relative ${iconSizes} shrink-0`}>
        {/* Ambient neon backglow */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-sky-500/30 via-cyan-400/20 to-indigo-500/30 rounded-2xl blur-md group-hover:opacity-100 opacity-70 transition duration-500" />

        {/* Vector SVG Emblem: The Sonic Keycap (Fusion of Keyboard Key + Voice Acoustic Waveform) */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_2px_12px_rgba(56,189,248,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="ltKeyBevel" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="ltKeyFace" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f192e" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>
            <linearGradient id="ltSoundwave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <radialGradient id="ltCenterGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.25)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0)" />
            </radialGradient>
          </defs>

          {/* Outer Keycap Shell with Beveled Edge */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="12"
            fill="url(#ltKeyFace)"
            stroke="url(#ltKeyBevel)"
            strokeWidth="1.75"
          />

          {/* Inner Inset Keycap Reflection */}
          <rect
            x="5.5"
            y="5.5"
            width="37"
            height="37"
            rx="9.5"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* Keycap Center Radial Illumination */}
          <rect
            x="6"
            y="6"
            width="36"
            height="36"
            rx="9"
            fill="url(#ltCenterGlow)"
          />

          {/* Dynamic Soundwave Bars inside Keycap - Representing Audio/Language Speech Waves */}
          {/* Bar 1 (Left - 'L' side anchor) */}
          <rect
            x="12"
            y="18"
            width="3.5"
            height="13"
            rx="1.75"
            fill="url(#ltSoundwave)"
            className="animate-pulse"
            style={{ animationDuration: '2.4s' }}
          />

          {/* Bar 2 (Language Wave Peak) */}
          <rect
            x="18"
            y="13"
            width="3.5"
            height="22"
            rx="1.75"
            fill="url(#ltSoundwave)"
            className="animate-pulse"
            style={{ animationDuration: '1.8s', animationDelay: '0.2s' }}
          />

          {/* Bar 3 ('T' Center Pillar) */}
          <rect
            x="24"
            y="10"
            width="3.5"
            height="27"
            rx="1.75"
            fill="#38bdf8"
          />

          {/* Bar 4 (Resonance Bar) */}
          <rect
            x="30"
            y="16"
            width="3.5"
            height="16"
            rx="1.75"
            fill="url(#ltSoundwave)"
            className="animate-pulse"
            style={{ animationDuration: '2.1s', animationDelay: '0.4s' }}
          />

          {/* Horizontal crossbar forming the 'T' and Mechanical Key Switch Click Accent */}
          <path
            d="M 20 15 H 32"
            stroke="#f8fafc"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Bottom 'L' Footer line */}
          <path
            d="M 12 31 H 17"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Micro keycap tactile dot */}
          <circle cx="24" cy="41" r="1" fill="rgba(56,189,248,0.7)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center leading-none">
            <span className={`font-extrabold tracking-tight text-white ${textSizes}`}>
              Lingua
            </span>
            <span className={`font-black tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent ${textSizes}`}>
              Type
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1 hidden sm:block">
            Touch Typing & Grammar
          </span>
        </div>
      )}
    </div>
  )
}
