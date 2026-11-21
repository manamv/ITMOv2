import React, { useState } from 'react'
import type { FingerType } from '../../types'

interface Keyboard3DProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number>
}

interface KeyDef {
  key: string
  display?: string
  width?: string
  finger: FingerType
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 1: Numbers & Backspace
  [
    { key: '`', finger: 'pinky-l' },
    { key: '1', finger: 'pinky-l' },
    { key: '2', finger: 'ring-l' },
    { key: '3', finger: 'mid-l' },
    { key: '4', finger: 'index-l' },
    { key: '5', finger: 'index-l' },
    { key: '6', finger: 'index-r' },
    { key: '7', finger: 'index-r' },
    { key: '8', finger: 'mid-r' },
    { key: '9', finger: 'ring-r' },
    { key: '0', finger: 'pinky-r' },
    { key: '-', finger: 'pinky-r' },
    { key: '=', finger: 'pinky-r' },
    { key: 'backspace', display: '⌫', width: 'w-14', finger: 'pinky-r' }
  ],
  // Row 2: QWERTY
  [
    { key: 'tab', display: 'Tab', width: 'w-12', finger: 'pinky-l' },
    { key: 'q', finger: 'pinky-l' },
    { key: 'w', finger: 'ring-l' },
    { key: 'e', finger: 'mid-l' },
    { key: 'r', finger: 'index-l' },
    { key: 't', finger: 'index-l' },
    { key: 'y', finger: 'index-r' },
    { key: 'u', finger: 'index-r' },
    { key: 'i', finger: 'mid-r' },
    { key: 'o', finger: 'ring-r' },
    { key: 'p', finger: 'pinky-r' },
    { key: '[', finger: 'pinky-r' },
    { key: ']', finger: 'pinky-r' }
  ],
  // Row 3: Home row ASDF
  [
    { key: 'caps', display: 'Caps', width: 'w-14', finger: 'pinky-l' },
    { key: 'a', finger: 'pinky-l' },
    { key: 's', finger: 'ring-l' },
    { key: 'd', finger: 'mid-l' },
    { key: 'f', finger: 'index-l' },
    { key: 'g', finger: 'index-l' },
    { key: 'h', finger: 'index-r' },
    { key: 'j', finger: 'index-r' },
    { key: 'k', finger: 'mid-r' },
    { key: 'l', finger: 'ring-r' },
    { key: ';', finger: 'pinky-r' },
    { key: "'", finger: 'pinky-r' },
    { key: 'enter', display: 'Enter ⏎', width: 'w-16', finger: 'pinky-r' }
  ],
  // Row 4: ZXCV
  [
    { key: 'shift-l', display: 'Shift', width: 'w-16', finger: 'pinky-l' },
    { key: 'z', finger: 'pinky-l' },
    { key: 'x', finger: 'ring-l' },
    { key: 'c', finger: 'mid-l' },
    { key: 'v', finger: 'index-l' },
    { key: 'b', finger: 'index-l' },
    { key: 'n', finger: 'index-r' },
    { key: 'm', finger: 'index-r' },
    { key: ',', finger: 'mid-r' },
    { key: '.', finger: 'ring-r' },
    { key: '/', finger: 'pinky-r' },
    { key: 'shift-r', display: 'Shift', width: 'w-18', finger: 'pinky-r' }
  ],
  // Row 5: Space
  [
    { key: ' ', display: 'Пробел (Space)', width: 'w-72', finger: 'thumb' }
  ]
]

// Finger offsets from home row position when pressing keys (dx, dy in pixels)
const KEY_OFFSETS: Record<string, { dx: number; dy: number }> = {
  // Left Hand: Pinky (Home: a)
  'q': { dx: -4, dy: -42 },
  'a': { dx: 0, dy: 0 },
  'z': { dx: 6, dy: 42 },
  '1': { dx: -8, dy: -84 },
  '`': { dx: -35, dy: -84 },
  'tab': { dx: -35, dy: -42 },
  'caps': { dx: -35, dy: 0 },

  // Left Hand: Ring (Home: s)
  'w': { dx: -4, dy: -42 },
  's': { dx: 0, dy: 0 },
  'x': { dx: 6, dy: 42 },
  '2': { dx: -8, dy: -84 },

  // Left Hand: Middle (Home: d)
  'e': { dx: -4, dy: -42 },
  'd': { dx: 0, dy: 0 },
  'c': { dx: 6, dy: 42 },
  '3': { dx: -8, dy: -84 },

  // Left Hand: Index (Home: f)
  'r': { dx: -6, dy: -42 },
  't': { dx: 38, dy: -42 },
  'f': { dx: 0, dy: 0 },
  'g': { dx: 44, dy: 0 },
  'v': { dx: 6, dy: 42 },
  'b': { dx: 50, dy: 42 },
  '4': { dx: -8, dy: -84 },
  '5': { dx: 36, dy: -84 },

  // Thumbs (Home: space)
  ' ': { dx: 0, dy: 24 },

  // Right Hand: Index (Home: j)
  'u': { dx: 6, dy: -42 },
  'y': { dx: -38, dy: -42 },
  'j': { dx: 0, dy: 0 },
  'h': { dx: -44, dy: 0 },
  'm': { dx: -6, dy: 42 },
  'n': { dx: -50, dy: 42 },
  '7': { dx: 8, dy: -84 },
  '6': { dx: -36, dy: -84 },

  // Right Hand: Middle (Home: k)
  'i': { dx: 4, dy: -42 },
  'k': { dx: 0, dy: 0 },
  ',': { dx: -6, dy: 42 },
  '8': { dx: 8, dy: -84 },

  // Right Hand: Ring (Home: l)
  'o': { dx: 4, dy: -42 },
  'l': { dx: 0, dy: 0 },
  '.': { dx: -6, dy: 42 },
  '9': { dx: 8, dy: -84 },

  // Right Hand: Pinky (Home: ;)
  'p': { dx: 4, dy: -42 },
  ';': { dx: 0, dy: 0 },
  '/': { dx: -6, dy: 42 },
  '0': { dx: 8, dy: -84 },
  '-': { dx: 46, dy: -84 },
  '=': { dx: 86, dy: -84 },
  '[': { dx: 44, dy: -42 },
  ']': { dx: 84, dy: -42 },
  "'": { dx: 42, dy: 0 },
  'enter': { dx: 78, dy: 0 },
  'backspace': { dx: 95, dy: -84 }
}

const FINGER_COLORS: Record<FingerType, { bg: string; glow: string; text: string; name: string }> = {
  'pinky-l': { bg: 'bg-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.7)]', text: 'text-rose-400', name: 'Левый мизинец' },
  'ring-l': { bg: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.7)]', text: 'text-orange-400', name: 'Левый безымянный' },
  'mid-l': { bg: 'bg-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.7)]', text: 'text-yellow-400', name: 'Левый средний' },
  'index-l': { bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.7)]', text: 'text-emerald-400', name: 'Левый указательный' },
  'index-r': { bg: 'bg-cyan-500', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.7)]', text: 'text-cyan-400', name: 'Правый указательный' },
  'mid-r': { bg: 'bg-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]', text: 'text-blue-400', name: 'Правый средний' },
  'ring-r': { bg: 'bg-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.7)]', text: 'text-purple-400', name: 'Правый безымянный' },
  'pinky-r': { bg: 'bg-pink-500', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.7)]', text: 'text-pink-400', name: 'Правый мизинец' },
  'thumb': { bg: 'bg-slate-400', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.7)]', text: 'text-slate-300', name: 'Большой палец' }
}

export const Keyboard3D: React.FC<Keyboard3DProps> = ({
  activeChar,
  heatmapMode = false,
  heatmapData = {}
}) => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')
  const normalizedTarget = (activeChar || '').toLowerCase()

  // Identify target finger
  let targetFinger: FingerType | null = null
  if (normalizedTarget === ' ') {
    targetFinger = 'thumb'
  } else if (normalizedTarget === 'backspace') {
    targetFinger = 'pinky-r'
  } else {
    for (const row of KEYBOARD_ROWS) {
      const match = row.find(k => k.key.toLowerCase() === normalizedTarget)
      if (match) {
        targetFinger = match.finger
        break
      }
    }
  }

  // Active finger offset calculation
  const offset = KEY_OFFSETS[normalizedTarget] || { dx: 0, dy: 0 }

  return (
    <div className="space-y-4" data-testid="keyboard-3d-root">
      {/* 3D View Toggle and Guidance Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-base">⌨️</span>
          <span className="font-semibold text-white">Интерактивная клавиатура с 3D нажатием пальцами</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active target guidance pill */}
          {targetFinger && (
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 font-mono text-xs shadow-inner animate-pulse">
              <span className="text-slate-400">Нажатие:</span>
              <span className={`font-bold ${FINGER_COLORS[targetFinger].text}`}>
                {FINGER_COLORS[targetFinger].name}
              </span>
              <span className="text-slate-500">→</span>
              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {normalizedTarget === ' ' ? '␣ space' : normalizedTarget === 'backspace' ? '⌫ backspace' : normalizedTarget}
              </span>
            </div>
          )}

          {/* Toggle 3D / 2D */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === '3D'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D Вид
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === '2D'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Вид
            </button>
          </div>
        </div>
      </div>

      {/* 3D PERSPECTIVE STAGE */}
      <div
        className={`relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
          viewMode === '3D' ? 'perspective-[1200px]' : ''
        }`}
      >
        {/* Keyboard Chassis with 3D transform */}
        <div
          className={`space-y-1.5 font-mono select-none transition-transform duration-300 origin-bottom ${
            viewMode === '3D'
              ? 'transform rotate-x-[22deg] scale-[0.97] pb-20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
              : 'pb-4'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((item, keyIndex) => {
                const isMatch = normalizedTarget === item.key.toLowerCase()
                const errorRate = heatmapData[item.key.toLowerCase()]
                const fingerColor = FINGER_COLORS[item.finger]

                let keyBg = 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:border-slate-500'
                let keyDepth = 'border-b-4 border-b-slate-950 shadow-md'

                if (heatmapMode && errorRate !== undefined) {
                  if (errorRate > 0.25) {
                    keyBg = 'bg-rose-500/25 border-rose-500/60 text-rose-300'
                  } else if (errorRate > 0.1) {
                    keyBg = 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  } else {
                    keyBg = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  }
                } else if (isMatch) {
                  // 3D Depressed Active Keycap
                  keyBg = `${fingerColor.bg} text-slate-950 font-bold ${fingerColor.glow}`
                  keyDepth = 'translate-y-1.5 border-b-1 border-b-slate-900 shadow-inner'
                }

                const widthClass = item.width || 'w-10'

                return (
                  <div
                    key={keyIndex}
                    className={`h-10 ${widthClass} rounded-lg border flex items-center justify-center font-semibold text-xs transition-all duration-150 ${keyBg} ${keyDepth}`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isMatch ? 'translateZ(-4px)' : 'translateZ(0)'
                    }}
                    data-testid={item.key === ' ' ? 'key-space' : `key-${item.key.toLowerCase()}`}
                  >
                    {item.display || item.key.toLowerCase()}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* 3D HANDS HOVERING OVER THE KEYBOARD (visible in 3D mode) */}
        {viewMode === '3D' && (
          <div
            className="absolute inset-x-0 bottom-1 flex justify-around pointer-events-none select-none z-30"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* LEFT HAND IN 3D */}
            <div className="relative flex flex-col items-center">
              {/* Left Palm & Hand Base */}
              <div className="w-48 h-20 rounded-t-3xl bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800/90 border-t border-x border-slate-700/70 shadow-2xl flex items-center justify-center opacity-85 backdrop-blur">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Левая рука
                </span>
              </div>

              {/* Left Hand 5 Fingers reaching to keys */}
              <div className="absolute -top-10 flex items-end gap-3">
                {/* 1. Left Pinky (Home: A) */}
                {(() => {
                  const isActive = targetFinger === 'pinky-l'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-pinky-l"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-rose-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-14 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-rose-500 border-rose-400 shadow-[0_0_20px_#f43f5e] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">A</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Left Ring (Home: S) */}
                {(() => {
                  const isActive = targetFinger === 'ring-l'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-ring-l"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-orange-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-16 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-orange-500 border-orange-400 shadow-[0_0_20px_#f97316] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">S</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Left Middle (Home: D) */}
                {(() => {
                  const isActive = targetFinger === 'mid-l'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-mid-l"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-18 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_20px_#eab308] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">D</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Left Index (Home: F) */}
                {(() => {
                  const isActive = targetFinger === 'index-l'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-index-l"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-16 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_20px_#10b981] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">F</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 5. Left Thumb (Home: Space) */}
                {(() => {
                  const isActive = targetFinger === 'thumb'
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(15px, ${isActive ? '10px' : '0px'}, ${isActive ? '-10px' : '0px'}) rotate(-20deg)`
                      }}
                    >
                      <div
                        className={`w-6 h-12 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-slate-300 border-white shadow-[0_0_20px_#ffffff] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">␣</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* RIGHT HAND IN 3D */}
            <div className="relative flex flex-col items-center">
              {/* Right Palm & Hand Base */}
              <div className="w-48 h-20 rounded-t-3xl bg-gradient-to-t from-slate-950 via-slate-900 to-slate-800/90 border-t border-x border-slate-700/70 shadow-2xl flex items-center justify-center opacity-85 backdrop-blur">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Правая рука
                </span>
              </div>

              {/* Right Hand 5 Fingers reaching to keys */}
              <div className="absolute -top-10 flex items-end gap-3">
                {/* 1. Right Thumb (Home: Space) */}
                {(() => {
                  const isActive = targetFinger === 'thumb'
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(-15px, ${isActive ? '10px' : '0px'}, ${isActive ? '-10px' : '0px'}) rotate(20deg)`
                      }}
                    >
                      <div
                        className={`w-6 h-12 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-slate-300 border-white shadow-[0_0_20px_#ffffff] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">␣</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Right Index (Home: J) */}
                {(() => {
                  const isActive = targetFinger === 'index-r'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-index-r"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-16 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_#06b6d4] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">J</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Right Middle (Home: K) */}
                {(() => {
                  const isActive = targetFinger === 'mid-r'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-mid-r"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-blue-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-18 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-blue-500 border-blue-400 shadow-[0_0_20px_#3b82f6] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">K</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Right Ring (Home: L) */}
                {(() => {
                  const isActive = targetFinger === 'ring-r'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-ring-r"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-purple-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-16 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-purple-500 border-purple-400 shadow-[0_0_20px_#a855f7] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">L</span>
                      </div>
                    </div>
                  )
                })()}

                {/* 5. Right Pinky (Home: ;) */}
                {(() => {
                  const isActive = targetFinger === 'pinky-r'
                  const dx = isActive ? offset.dx : 0
                  const dy = isActive ? offset.dy : 0
                  return (
                    <div
                      className="flex flex-col items-center transition-all duration-150"
                      style={{
                        transform: `translate3d(${dx}px, ${dy}px, ${isActive ? '-12px' : '0px'})`
                      }}
                      data-testid="finger-3d-pinky-r"
                    >
                      {isActive && (
                        <div className="text-[10px] font-mono font-bold bg-pink-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg animate-bounce mb-1">
                          {normalizedTarget === 'backspace' ? '⌫' : normalizedTarget}
                        </div>
                      )}
                      <div
                        className={`w-5 h-14 rounded-t-xl border transition-all duration-150 flex flex-col items-center justify-between py-1 ${
                          isActive
                            ? 'bg-pink-500 border-pink-400 shadow-[0_0_20px_#ec4899] text-slate-950 font-bold scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/70" />
                        <span className="text-[8px] font-mono">;</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
