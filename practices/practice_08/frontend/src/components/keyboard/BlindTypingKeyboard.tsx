import React, { useMemo } from 'react'
import type { FingerType } from '../../types'

interface BlindTypingKeyboardProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number>
}

interface KeyModel {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
  finger: FingerType
}

// Fixed dimensions for responsive SVG layout (780 x 320)
const KEY_W = 48
const KEY_H = 48
const GAP = 6

export const BlindTypingKeyboard: React.FC<BlindTypingKeyboardProps> = ({
  activeChar,
  heatmapMode = false,
  heatmapData = {}
}) => {
  const normalizedActive = (activeChar || '').toLowerCase()

  // Build key layout grid
  const keys = useMemo<KeyModel[]>(() => {
    const list: KeyModel[] = []

    // Row 0: QWERTY (12 keys)
    const r0Keys: Array<{ id: string; label: string; finger: FingerType }> = [
      { id: 'q', label: 'Q', finger: 'pinky-l' },
      { id: 'w', label: 'W', finger: 'ring-l' },
      { id: 'e', label: 'E', finger: 'mid-l' },
      { id: 'r', label: 'R', finger: 'index-l' },
      { id: 't', label: 'T', finger: 'index-l' },
      { id: 'y', label: 'Y', finger: 'index-r' },
      { id: 'u', label: 'U', finger: 'index-r' },
      { id: 'i', label: 'I', finger: 'mid-r' },
      { id: 'o', label: 'O', finger: 'ring-r' },
      { id: 'p', label: 'P', finger: 'pinky-r' },
      { id: '[', label: '[', finger: 'pinky-r' },
      { id: ']', label: ']', finger: 'pinky-r' }
    ]
    const r0StartX = (780 - (r0Keys.length * KEY_W + (r0Keys.length - 1) * GAP)) / 2
    r0Keys.forEach((k, idx) => {
      const x = r0StartX + idx * (KEY_W + GAP)
      const y = 30
      list.push({
        id: k.id,
        label: k.label,
        x,
        y,
        w: KEY_W,
        h: KEY_H,
        cx: x + KEY_W / 2,
        cy: y + KEY_H / 2,
        finger: k.finger
      })
    })

    // Row 1: ASDF (11 keys)
    const r1Keys: Array<{ id: string; label: string; finger: FingerType }> = [
      { id: 'a', label: 'A', finger: 'pinky-l' },
      { id: 's', label: 'S', finger: 'ring-l' },
      { id: 'd', label: 'D', finger: 'mid-l' },
      { id: 'f', label: 'F', finger: 'index-l' },
      { id: 'g', label: 'G', finger: 'index-l' },
      { id: 'h', label: 'H', finger: 'index-r' },
      { id: 'j', label: 'J', finger: 'index-r' },
      { id: 'k', label: 'K', finger: 'mid-r' },
      { id: 'l', label: 'L', finger: 'ring-r' },
      { id: ';', label: ';', finger: 'pinky-r' },
      { id: "'", label: "'", finger: 'pinky-r' }
    ]
    const r1StartX = (780 - (r1Keys.length * KEY_W + (r1Keys.length - 1) * GAP)) / 2
    r1Keys.forEach((k, idx) => {
      const x = r1StartX + idx * (KEY_W + GAP)
      const y = 84
      list.push({
        id: k.id,
        label: k.label,
        x,
        y,
        w: KEY_W,
        h: KEY_H,
        cx: x + KEY_W / 2,
        cy: y + KEY_H / 2,
        finger: k.finger
      })
    })

    // Row 2: ZXCV (10 keys)
    const r2Keys: Array<{ id: string; label: string; finger: FingerType }> = [
      { id: 'z', label: 'Z', finger: 'pinky-l' },
      { id: 'x', label: 'X', finger: 'ring-l' },
      { id: 'c', label: 'C', finger: 'mid-l' },
      { id: 'v', label: 'V', finger: 'index-l' },
      { id: 'b', label: 'B', finger: 'index-l' },
      { id: 'n', label: 'N', finger: 'index-r' },
      { id: 'm', label: 'M', finger: 'index-r' },
      { id: ',', label: ',', finger: 'mid-r' },
      { id: '.', label: '.', finger: 'ring-r' },
      { id: '/', label: '/', finger: 'pinky-r' }
    ]
    const r2StartX = (780 - (r2Keys.length * KEY_W + (r2Keys.length - 1) * GAP)) / 2
    r2Keys.forEach((k, idx) => {
      const x = r2StartX + idx * (KEY_W + GAP)
      const y = 138
      list.push({
        id: k.id,
        label: k.label,
        x,
        y,
        w: KEY_W,
        h: KEY_H,
        cx: x + KEY_W / 2,
        cy: y + KEY_H / 2,
        finger: k.finger
      })
    })

    // Row 3: Spacebar (1 key)
    const spaceW = 260
    const spaceX = (780 - spaceW) / 2
    const spaceY = 192
    list.push({
      id: ' ',
      label: 'SPACE',
      x: spaceX,
      y: spaceY,
      w: spaceW,
      h: KEY_H,
      cx: spaceX + spaceW / 2,
      cy: spaceY + KEY_H / 2,
      finger: 'thumb'
    })

    return list
  }, [])

  // Find active key coordinate
  const activeKey = useMemo(() => {
    if (!normalizedActive) return null
    return keys.find(k => k.id.toLowerCase() === normalizedActive) || null
  }, [keys, normalizedActive])

  // Rest positions of the 10 fingertips
  // Left hand rest on A, S, D, F, Space
  // Right hand rest on Space, J, K, L, ;
  const leftF = keys.find(k => k.id === 'f')!
  const leftD = keys.find(k => k.id === 'd')!
  const leftS = keys.find(k => k.id === 's')!
  const leftA = keys.find(k => k.id === 'a')!

  const rightJ = keys.find(k => k.id === 'j')!
  const rightK = keys.find(k => k.id === 'k')!
  const rightL = keys.find(k => k.id === 'l')!
  const rightSemi = keys.find(k => k.id === ';')!

  // Default rest coordinates
  const restPositions: Record<FingerType, { x: number; y: number }> = {
    'pinky-l': { x: leftA.cx, y: leftA.cy },
    'ring-l': { x: leftS.cx, y: leftS.cy },
    'mid-l': { x: leftD.cx, y: leftD.cy },
    'index-l': { x: leftF.cx, y: leftF.cy },
    'thumb': { x: 335, y: 216 },
    'index-r': { x: rightJ.cx, y: rightJ.cy },
    'mid-r': { x: rightK.cx, y: rightK.cy },
    'ring-r': { x: rightL.cx, y: rightL.cy },
    'pinky-r': { x: rightSemi.cx, y: rightSemi.cy }
  }

  // Active finger calculation
  const targetFinger: FingerType | null = activeKey ? activeKey.finger : null

  // Target positions: if finger is active, it moves to activeKey.cx, activeKey.cy
  const fingerPositions = useMemo(() => {
    const res = { ...restPositions }
    if (activeKey && targetFinger) {
      if (targetFinger === 'thumb') {
        res.thumb = { x: 390, y: activeKey.cy }
      } else {
        res[targetFinger] = { x: activeKey.cx, y: activeKey.cy }
      }
    }
    return res
  }, [activeKey, targetFinger, restPositions])

  // Palm knuckles anchors
  const leftKnuckles = {
    pinky: { x: 155, y: 220 },
    ring: { x: 200, y: 205 },
    mid: { x: 245, y: 200 },
    index: { x: 290, y: 205 },
    thumb: { x: 325, y: 250 }
  }

  const rightKnuckles = {
    thumb: { x: 455, y: 250 },
    index: { x: 490, y: 205 },
    mid: { x: 535, y: 200 },
    ring: { x: 580, y: 205 },
    pinky: { x: 625, y: 220 }
  }

  // Finger rendering helper: generates SVG path from knuckle to tip with rounded contour
  const renderFingerPath = (
    knuckle: { x: number; y: number },
    tip: { x: number; y: number },
    widthAtBase: number = 22,
    widthAtTip: number = 19
  ) => {
    const dx = tip.x - knuckle.x
    const dy = tip.y - knuckle.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len

    const p1x = knuckle.x + nx * (widthAtBase / 2)
    const p1y = knuckle.y + ny * (widthAtBase / 2)

    const p2x = tip.x + nx * (widthAtTip / 2)
    const p2y = tip.y + ny * (widthAtTip / 2)

    const p3x = tip.x - nx * (widthAtTip / 2)
    const p3y = tip.y - ny * (widthAtTip / 2)

    const p4x = knuckle.x - nx * (widthAtBase / 2)
    const p4y = knuckle.y - ny * (widthAtBase / 2)

    // Curved fingertip cap
    const capX = tip.x + (dx / len) * (widthAtTip / 2.2)
    const capY = tip.y + (dy / len) * (widthAtTip / 2.2)

    return `M ${p1x} ${p1y} 
            L ${p2x} ${p2y} 
            Q ${capX} ${capY} ${p3x} ${p3y} 
            L ${p4x} ${p4y} Z`
  }

  const fingerNamesRu: Record<FingerType, string> = {
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

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none" data-testid="virtual-keyboard">
      {/* Header Guidance Banner */}
      <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-slate-400 px-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold">Слепая печать (Blind Typing)</span>
        </div>

        {targetFinger && (
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700/80">
            <span className="text-slate-400">Клавиша:</span>
            <span className="font-bold text-slate-950 bg-white px-2 py-0.5 rounded shadow text-xs">
              {normalizedActive === ' ' ? '␣ SPACE' : normalizedActive.toUpperCase()}
            </span>
            <span className="text-emerald-400 font-medium">
              ← {fingerNamesRu[targetFinger]}
            </span>
          </div>
        )}
      </div>

      {/* SVG Blind Typing Keyboard with Anatomical Hand Silhouette Overlay */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-[#07090e] border border-slate-800/80 shadow-2xl p-4 flex justify-center">
        <svg
          viewBox="0 0 780 320"
          className="w-full h-auto max-h-[380px] drop-shadow-2xl"
          style={{ maxHeight: '380px' }}
        >
          <defs>
            {/* Glow filter for active illuminated key */}
            <filter id="activeKeyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.7" />
              <feDropShadow dx="0" dy="2" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.4" />
            </filter>

            {/* Hand gradient for 3D skin tone / dark translucent silhouette */}
            <linearGradient id="handGradientLeft" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#1e293b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="handGradientRight" x1="100%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#1e293b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* LAYER 1: KEYS */}
          <g id="keyboard-keys">
            {keys.map(k => {
              const isMatch = normalizedActive === k.id.toLowerCase()
              const errRate = heatmapData[k.id.toLowerCase()]

              let fill = 'rgba(15, 23, 42, 0.75)'
              let stroke = 'rgba(255, 255, 255, 0.16)'
              let textFill = '#94a3b8'
              let strokeWidth = 1.2
              let filter = undefined

              if (heatmapMode && errRate !== undefined) {
                if (errRate > 0.25) {
                  fill = 'rgba(244, 63, 94, 0.35)'
                  stroke = '#f43f5e'
                  textFill = '#fda4af'
                } else if (errRate > 0.1) {
                  fill = 'rgba(245, 158, 11, 0.3)'
                  stroke = '#f59e0b'
                  textFill = '#fde68a'
                } else {
                  fill = 'rgba(16, 185, 129, 0.25)'
                  stroke = '#10b981'
                  textFill = '#6ee7b7'
                }
              } else if (isMatch) {
                fill = '#ffffff'
                stroke = '#ffffff'
                textFill = '#0f172a'
                strokeWidth = 2
                filter = 'url(#activeKeyGlow)'
              }

              return (
                <g
                  key={k.id}
                  data-testid={k.id === ' ' ? 'key-space' : `key-${k.id.toLowerCase()}`}
                  className="cursor-default"
                >
                  <rect
                    x={k.x}
                    y={k.y}
                    width={k.w}
                    height={k.h}
                    rx={8}
                    ry={8}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    style={{ transition: 'all 0.12s ease' }}
                  />
                  <text
                    x={k.cx}
                    y={k.cy + 5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize={k.w > 100 ? '11' : '15'}
                    fontWeight={isMatch ? 'bold' : '600'}
                    fontFamily="monospace"
                    style={{ transition: 'all 0.12s ease', pointerEvents: 'none' }}
                  >
                    {k.label}
                  </text>
                </g>
              )
            })}
          </g>

          {/* LAYER 2: TRANSLUCENT HAND SILHOUETTES WITH SMOOTH EXTENDING FINGERS */}
          {/* LEFT HAND PALM & WRIST */}
          <path
            d="M 120 320 
               Q 140 260 160 220 
               Q 220 200 290 205 
               Q 330 230 335 260 
               Q 310 320 270 320 Z"
            fill="url(#handGradientLeft)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            style={{ pointerEvents: 'none' }}
          />

          {/* LEFT HAND FINGERS */}
          {/* Pinky */}
          <path
            d={renderFingerPath(leftKnuckles.pinky, fingerPositions['pinky-l'], 20, 18)}
            fill="url(#handGradientLeft)"
            stroke={targetFinger === 'pinky-l' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'pinky-l' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Ring */}
          <path
            d={renderFingerPath(leftKnuckles.ring, fingerPositions['ring-l'], 21, 19)}
            fill="url(#handGradientLeft)"
            stroke={targetFinger === 'ring-l' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'ring-l' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Middle */}
          <path
            d={renderFingerPath(leftKnuckles.mid, fingerPositions['mid-l'], 22, 20)}
            fill="url(#handGradientLeft)"
            stroke={targetFinger === 'mid-l' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'mid-l' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Index (Reaches up to T, R, etc. exactly like in screenshot!) */}
          <path
            d={renderFingerPath(leftKnuckles.index, fingerPositions['index-l'], 23, 20)}
            fill="url(#handGradientLeft)"
            stroke={targetFinger === 'index-l' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'index-l' ? 2.2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Thumb */}
          <path
            d={renderFingerPath(leftKnuckles.thumb, fingerPositions.thumb, 24, 20)}
            fill="url(#handGradientLeft)"
            stroke={targetFinger === 'thumb' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'thumb' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />

          {/* RIGHT HAND PALM & WRIST */}
          <path
            d="M 660 320 
               Q 640 260 620 220 
               Q 560 200 490 205 
               Q 450 230 445 260 
               Q 470 320 510 320 Z"
            fill="url(#handGradientRight)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            style={{ pointerEvents: 'none' }}
          />

          {/* RIGHT HAND FINGERS */}
          {/* Thumb */}
          <path
            d={renderFingerPath(rightKnuckles.thumb, { x: 445, y: fingerPositions.thumb.y }, 24, 20)}
            fill="url(#handGradientRight)"
            stroke={targetFinger === 'thumb' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'thumb' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Index */}
          <path
            d={renderFingerPath(rightKnuckles.index, fingerPositions['index-r'], 23, 20)}
            fill="url(#handGradientRight)"
            stroke={targetFinger === 'index-r' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'index-r' ? 2.2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Middle */}
          <path
            d={renderFingerPath(rightKnuckles.mid, fingerPositions['mid-r'], 22, 20)}
            fill="url(#handGradientRight)"
            stroke={targetFinger === 'mid-r' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'mid-r' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Ring */}
          <path
            d={renderFingerPath(rightKnuckles.ring, fingerPositions['ring-r'], 21, 19)}
            fill="url(#handGradientRight)"
            stroke={targetFinger === 'ring-r' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'ring-r' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
          {/* Pinky */}
          <path
            d={renderFingerPath(rightKnuckles.pinky, fingerPositions['pinky-r'], 20, 18)}
            fill="url(#handGradientRight)"
            stroke={targetFinger === 'pinky-r' ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)'}
            strokeWidth={targetFinger === 'pinky-r' ? 2 : 1.2}
            style={{ transition: 'all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}
          />
        </svg>
      </div>
    </div>
  )
}
