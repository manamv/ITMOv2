import React from 'react'
import type { FingerType } from '../../types'

interface HandsVisualizerProps {
  activeChar?: string
  activeFinger?: FingerType | null
}

interface FingerItem {
  id: FingerType
  hand: 'left' | 'right'
  name: string
  homeKey: string
  zoneColor: string
  glowColor: string
  accentBorder: string
  textColor: string
  heightClass: string
}

const LEFT_FINGERS: FingerItem[] = [
  {
    id: 'pinky-l',
    hand: 'left',
    name: 'Мизинец',
    homeKey: 'a',
    zoneColor: 'bg-rose-500',
    glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]',
    accentBorder: 'border-rose-500',
    textColor: 'text-rose-400',
    heightClass: 'h-20'
  },
  {
    id: 'ring-l',
    hand: 'left',
    name: 'Безымянный',
    homeKey: 's',
    zoneColor: 'bg-orange-500',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
    accentBorder: 'border-orange-500',
    textColor: 'text-orange-400',
    heightClass: 'h-24'
  },
  {
    id: 'mid-l',
    hand: 'left',
    name: 'Средний',
    homeKey: 'd',
    zoneColor: 'bg-yellow-500',
    glowColor: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
    accentBorder: 'border-yellow-500',
    textColor: 'text-yellow-400',
    heightClass: 'h-28'
  },
  {
    id: 'index-l',
    hand: 'left',
    name: 'Указательный',
    homeKey: 'f',
    zoneColor: 'bg-emerald-500',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    accentBorder: 'border-emerald-500',
    textColor: 'text-emerald-400',
    heightClass: 'h-24'
  },
  {
    id: 'thumb',
    hand: 'left',
    name: 'Большой',
    homeKey: '␣',
    zoneColor: 'bg-slate-400',
    glowColor: 'shadow-[0_0_20px_rgba(148,163,184,0.6)]',
    accentBorder: 'border-slate-400',
    textColor: 'text-slate-300',
    heightClass: 'h-16'
  }
]

const RIGHT_FINGERS: FingerItem[] = [
  {
    id: 'thumb',
    hand: 'right',
    name: 'Большой',
    homeKey: '␣',
    zoneColor: 'bg-slate-400',
    glowColor: 'shadow-[0_0_20px_rgba(148,163,184,0.6)]',
    accentBorder: 'border-slate-400',
    textColor: 'text-slate-300',
    heightClass: 'h-16'
  },
  {
    id: 'index-r',
    hand: 'right',
    name: 'Указательный',
    homeKey: 'j',
    zoneColor: 'bg-cyan-500',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.6)]',
    accentBorder: 'border-cyan-500',
    textColor: 'text-cyan-400',
    heightClass: 'h-24'
  },
  {
    id: 'mid-r',
    hand: 'right',
    name: 'Средний',
    homeKey: 'k',
    zoneColor: 'bg-blue-500',
    glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    accentBorder: 'border-blue-500',
    textColor: 'text-blue-400',
    heightClass: 'h-28'
  },
  {
    id: 'ring-r',
    hand: 'right',
    name: 'Безымянный',
    homeKey: 'l',
    zoneColor: 'bg-purple-500',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
    accentBorder: 'border-purple-500',
    textColor: 'text-purple-400',
    heightClass: 'h-24'
  },
  {
    id: 'pinky-r',
    hand: 'right',
    name: 'Мизинец',
    homeKey: ';',
    zoneColor: 'bg-pink-500',
    glowColor: 'shadow-[0_0_20px_rgba(236,72,153,0.6)]',
    accentBorder: 'border-pink-500',
    textColor: 'text-pink-400',
    heightClass: 'h-20'
  }
]

export const HandsVisualizer: React.FC<HandsVisualizerProps> = ({
  activeChar,
  activeFinger
}) => {
  const normalizedChar = (activeChar || '').toLowerCase()

  // Get active finger label
  const getActiveInstruction = () => {
    if (!activeFinger) return null

    const leftMatch = LEFT_FINGERS.find(f => f.id === activeFinger && f.id !== 'thumb')
    const rightMatch = RIGHT_FINGERS.find(f => f.id === activeFinger && f.id !== 'thumb')

    if (activeFinger === 'thumb') {
      return {
        hand: 'Любая рука',
        finger: 'Большой палец',
        key: '␣ Пробел',
        color: 'text-slate-300'
      }
    }

    if (leftMatch) {
      return {
        hand: 'Левая рука',
        finger: leftMatch.name,
        key: normalizedChar,
        color: leftMatch.textColor
      }
    }

    if (rightMatch) {
      return {
        hand: 'Правая рука',
        finger: rightMatch.name,
        key: normalizedChar === 'backspace' ? '⌫ Backspace' : normalizedChar,
        color: rightMatch.textColor
      }
    }

    return null
  }

  const instruction = getActiveInstruction()

  return (
    <div className="pt-4 border-t border-slate-800/80 space-y-4" data-testid="hands-visualizer">
      {/* Live Interactive Guidance Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-sm">👐</span>
          <span className="font-semibold text-slate-300">Положение рук и пальцев для слепой печати:</span>
        </div>

        {instruction && (
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 animate-pulse font-mono text-xs shadow-inner">
            <span className="text-slate-400">{instruction.hand}:</span>
            <span className={`font-bold ${instruction.color}`}>
              {instruction.finger}
            </span>
            <span className="text-slate-500">→</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              [{instruction.key}]
            </span>
          </div>
        )}
      </div>

      {/* Hands Container */}
      <div className="flex justify-center items-end gap-8 sm:gap-16 pt-2 pb-1 select-none">
        {/* LEFT HAND */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Левая рука (A S D F)
          </div>
          
          <div className="relative flex items-end gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 shadow-lg">
            {LEFT_FINGERS.map((finger, idx) => {
              const isActive = activeFinger === finger.id
              const displayChar = isActive
                ? (normalizedChar === ' ' ? '␣' : normalizedChar)
                : finger.homeKey

              return (
                <div
                  key={`left-${finger.id}-${idx}`}
                  className="flex flex-col items-center group transition-all duration-150"
                  style={{
                    transform: isActive ? 'translateY(-10px)' : 'translateY(0)'
                  }}
                  data-testid={`finger-${finger.id}`}
                >
                  {/* Floating Target Badge for active finger */}
                  <div
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mb-1 transition-all duration-150 ${
                      isActive
                        ? `${finger.zoneColor} text-slate-950 shadow-md ${finger.glowColor} scale-110`
                        : 'opacity-0 scale-75'
                    }`}
                  >
                    {displayChar}
                  </div>

                  {/* Finger Bar */}
                  <div
                    className={`w-6 sm:w-7 rounded-t-xl transition-all duration-150 flex flex-col justify-between items-center py-1.5 border ${
                      finger.heightClass
                    } ${
                      isActive
                        ? `${finger.zoneColor} ${finger.accentBorder} ${finger.glowColor} text-slate-950 font-bold`
                        : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {/* Fingertip Home Key Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-slate-950 text-white animate-pulse'
                          : 'bg-slate-900/80 text-slate-400'
                      }`}
                    >
                      {finger.homeKey}
                    </div>

                    {/* Subtitle / Finger initial */}
                    <span className="text-[8px] uppercase tracking-tighter opacity-80">
                      {finger.name.slice(0, 3)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT HAND */}
        <div className="flex flex-col items-center">
          <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
            Правая рука (J K L ;)
          </div>

          <div className="relative flex items-end gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 shadow-lg">
            {RIGHT_FINGERS.map((finger, idx) => {
              const isActive = activeFinger === finger.id
              const displayChar = isActive
                ? (normalizedChar === ' ' ? '␣' : normalizedChar === 'backspace' ? '⌫' : normalizedChar)
                : finger.homeKey

              return (
                <div
                  key={`right-${finger.id}-${idx}`}
                  className="flex flex-col items-center group transition-all duration-150"
                  style={{
                    transform: isActive ? 'translateY(-10px)' : 'translateY(0)'
                  }}
                  data-testid={`finger-${finger.id}`}
                >
                  {/* Floating Target Badge for active finger */}
                  <div
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mb-1 transition-all duration-150 ${
                      isActive
                        ? `${finger.zoneColor} text-slate-950 shadow-md ${finger.glowColor} scale-110`
                        : 'opacity-0 scale-75'
                    }`}
                  >
                    {displayChar}
                  </div>

                  {/* Finger Bar */}
                  <div
                    className={`w-6 sm:w-7 rounded-t-xl transition-all duration-150 flex flex-col justify-between items-center py-1.5 border ${
                      finger.heightClass
                    } ${
                      isActive
                        ? `${finger.zoneColor} ${finger.accentBorder} ${finger.glowColor} text-slate-950 font-bold`
                        : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {/* Fingertip Home Key Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-slate-950 text-white animate-pulse'
                          : 'bg-slate-900/80 text-slate-400'
                      }`}
                    >
                      {finger.homeKey}
                    </div>

                    {/* Subtitle / Finger initial */}
                    <span className="text-[8px] uppercase tracking-tighter opacity-80">
                      {finger.name.slice(0, 3)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
