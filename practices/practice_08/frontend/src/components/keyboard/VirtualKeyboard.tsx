import React from 'react'
import type { FingerType } from '../../types'

interface KeyDef {
  key: string
  display?: string
  width?: string
  finger: FingerType
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 1: Numbers
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
    { key: 'backspace', display: '⌫', width: 'w-14 text-xs', finger: 'pinky-r' }
  ],
  // Row 2: QWERTY
  [
    { key: 'tab', display: 'Tab', width: 'w-12 text-xs', finger: 'pinky-l' },
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
    { key: 'caps', display: 'Caps', width: 'w-14 text-xs', finger: 'pinky-l' },
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
    { key: 'enter', display: 'Enter ⏎', width: 'w-16 text-xs', finger: 'pinky-r' }
  ],
  // Row 4: ZXCV
  [
    { key: 'shift-l', display: 'Shift', width: 'w-16 text-xs', finger: 'pinky-l' },
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
    { key: 'shift-r', display: 'Shift', width: 'w-18 text-xs', finger: 'pinky-r' }
  ],
  // Row 5: Space
  [
    { key: ' ', display: 'Пробел (Space)', width: 'w-64 text-xs', finger: 'thumb' }
  ]
]

const FINGER_NAMES: Record<FingerType, string> = {
  'pinky-l': 'Левый мизинец',
  'ring-l': 'Левый безымянный',
  'mid-l': 'Левый средний',
  'index-l': 'Левый указательный',
  'index-r': 'Правый указательный',
  'mid-r': 'Правый средний',
  'ring-r': 'Правый безымянный',
  'pinky-r': 'Правый мизинец',
  'thumb': 'Большой палец'
}

interface VirtualKeyboardProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number> // error rate 0..1
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar,
  heatmapMode = false,
  heatmapData = {}
}) => {
  const normalizedTarget = activeChar ? activeChar.toLowerCase() : ''

  // Find active key def and finger
  let targetFinger: FingerType | null = null
  if (normalizedTarget === ' ') {
    targetFinger = 'thumb'
  } else {
    for (const row of KEYBOARD_ROWS) {
      const match = row.find(k => k.key.toLowerCase() === normalizedTarget)
      if (match) {
        targetFinger = match.finger
        break
      }
    }
  }

  const fingerClassMap: Record<FingerType, string> = {
    'pinky-l': 'finger-pinky-l',
    'ring-l': 'finger-ring-l',
    'mid-l': 'finger-mid-l',
    'index-l': 'finger-index-l',
    'index-r': 'finger-index-r',
    'mid-r': 'finger-mid-r',
    'ring-r': 'finger-ring-r',
    'pinky-r': 'finger-pinky-r',
    'thumb': 'finger-thumb'
  }

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Finger Legend & Active Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/80 pb-3">
        {/* Finger Zones Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 overflow-x-auto py-0.5">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Л. Мизинец</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>Л. Безымянный</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Л. Средний</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Л. Указательный</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>П. Указательный</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>П. Средний</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>П. Безымянный</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>П. Мизинец</span>
        </div>

        {/* Current Target Finger Guidance */}
        {targetFinger && (
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 font-mono text-xs">
            <span className="text-slate-400">Символ:</span>
            <span className="font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-emerald-500/30">
              {normalizedTarget === ' ' ? '␣ space' : normalizedTarget === 'backspace' ? '⌫ backspace' : normalizedTarget.toLowerCase()}
            </span>
            <span className="text-emerald-400 font-medium">
              ← {FINGER_NAMES[targetFinger]}
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="max-w-4xl mx-auto space-y-1.5 font-mono select-none">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((item, keyIndex) => {
              const isMatch = normalizedTarget === item.key.toLowerCase()
              const errorRate = heatmapData[item.key.toLowerCase()]

              let keyExtraClass = fingerClassMap[item.finger]
              let customStyle: React.CSSProperties = {}

              if (heatmapMode && errorRate !== undefined) {
                if (errorRate > 0.25) {
                  keyExtraClass = 'bg-rose-500/25 border-rose-500/60 text-rose-300'
                } else if (errorRate > 0.1) {
                  keyExtraClass = 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                } else {
                  keyExtraClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                }
              } else if (isMatch) {
                keyExtraClass = 'key-pulse-active'
              }

              const widthClass = item.width || 'w-10'

              return (
                <div
                  key={keyIndex}
                  style={customStyle}
                  className={`h-10 ${widthClass} rounded-lg border flex items-center justify-center font-semibold text-xs transition-all duration-100 ${keyExtraClass}`}
                  data-testid={item.key === ' ' ? 'key-space' : `key-${item.key.toLowerCase()}`}
                >
                  {item.display || item.key.toLowerCase()}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
