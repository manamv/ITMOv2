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

  // Target positions: if finger is active, it moves smoothly to activeKey.cx, activeKey.cy
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

  // Palm knuckle base anchors
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

  // Realistic Anatomical Finger Renderer
  const renderAnatomicalFinger = (
    knuckle: { x: number; y: number },
    tip: { x: number; y: number },
    isActive: boolean,
    baseW: number = 24,
    tipW: number = 19,
    gradientId: string = 'handGradientLeft',
    isThumb: boolean = false
  ) => {
    const dx = tip.x - knuckle.x
    const dy = tip.y - knuckle.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const nx = -uy
    const ny = ux

    // Joint 1: Proximal Interphalangeal (PIP) at ~42%
    const j1Len = len * 0.42
    const j1x = knuckle.x + ux * j1Len
    const j1y = knuckle.y + uy * j1Len
    const j1W = (baseW + tipW) * 0.54 // Knuckle swelling

    // Joint 2: Distal Interphalangeal (DIP) at ~74%
    const j2Len = len * 0.74
    const j2x = knuckle.x + ux * j2Len
    const j2y = knuckle.y + uy * j2Len
    const j2W = tipW * 1.05

    // Side contours
    const bL = { x: knuckle.x + nx * (baseW / 2), y: knuckle.y + ny * (baseW / 2) }
    const bR = { x: knuckle.x - nx * (baseW / 2), y: knuckle.y - ny * (baseW / 2) }

    const j1L = { x: j1x + nx * (j1W / 2), y: j1y + ny * (j1W / 2) }
    const j1R = { x: j1x - nx * (j1W / 2), y: j1y - ny * (j1W / 2) }

    const j2L = { x: j2x + nx * (j2W / 2), y: j2y + ny * (j2W / 2) }
    const j2R = { x: j2x - nx * (j2W / 2), y: j2y - ny * (j2W / 2) }

    const tL = { x: tip.x + nx * (tipW / 2), y: tip.y + ny * (tipW / 2) }
    const tR = { x: tip.x - nx * (tipW / 2), y: tip.y - ny * (tipW / 2) }
    const cap = { x: tip.x + ux * (tipW / 1.7), y: tip.y + uy * (tipW / 1.7) }

    // Organic spline path with natural finger curves
    const fingerPath = `M ${bL.x} ${bL.y}
      Q ${(bL.x + j1L.x) / 2 + nx * 0.8} ${(bL.y + j1L.y) / 2 + ny * 0.8} ${j1L.x} ${j1L.y}
      Q ${(j1L.x + j2L.x) / 2 - nx * 0.5} ${(j1L.y + j2L.y) / 2 - ny * 0.5} ${j2L.x} ${j2L.y}
      L ${tL.x} ${tL.y}
      Q ${cap.x} ${cap.y} ${tR.x} ${tR.y}
      L ${j2R.x} ${j2R.y}
      Q ${(j1R.x + j2R.x) / 2 + nx * 0.5} ${(j1R.y + j2R.y) / 2 + ny * 0.5} ${j1R.x} ${j1R.y}
      Q ${(bR.x + j1R.x) / 2 - nx * 0.8} ${(bR.y + j1R.y) / 2 - ny * 0.8} ${bR.x} ${bR.y}
      Z`

    // Subtle anatomical crease arcs across joints
    const crease1Path = `M ${j1x + nx * (j1W * 0.36)} ${j1y + ny * (j1W * 0.36)}
      Q ${j1x - ux * 1.5} ${j1y - uy * 1.5} ${j1x - nx * (j1W * 0.36)} ${j1y - ny * (j1W * 0.36)}`

    const crease2Path = `M ${j2x + nx * (j2W * 0.33)} ${j2y + ny * (j2W * 0.33)}
      Q ${j2x - ux * 1.2} ${j2y - uy * 1.2} ${j2x - nx * (j2W * 0.33)} ${j2y - ny * (j2W * 0.33)}`

    // Natural curved fingernail at the distal phalanx
    const nailBaseLen = len * 0.82
    const nBx = knuckle.x + ux * nailBaseLen
    const nBy = knuckle.y + uy * nailBaseLen
    const nTipX = tip.x + ux * (tipW * 0.18)
    const nTipY = tip.y + uy * (tipW * 0.18)
    const nW = tipW * 0.56

    const nailPath = `M ${nBx + nx * (nW / 2)} ${nBy + ny * (nW / 2)}
      Q ${nTipX + nx * (nW / 2)} ${nTipY + ny * (nW / 2)} ${nTipX} ${nTipY}
      Q ${nTipX - nx * (nW / 2)} ${nTipY - ny * (nW / 2)} ${nBx - nx * (nW / 2)} ${nBy - ny * (nW / 2)}
      Q ${nBx} ${nBy - uy * 1.5} ${nBx + nx * (nW / 2)} ${nBy + ny * (nW / 2)}`

    return (
      <g style={{ transition: 'all 0.14s cubic-bezier(0.2, 0.8, 0.2, 1)', pointerEvents: 'none' }}>
        {/* Main finger body with soft translucent shading */}
        <path
          d={fingerPath}
          fill={`url(#${gradientId})`}
          stroke={isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.22)'}
          strokeWidth={isActive ? 2.2 : 1.2}
          filter={isActive ? 'url(#activeFingerGlow)' : undefined}
        />

        {/* Anatomical phalangeal crease lines */}
        {!isThumb && (
          <>
            <path
              d={crease1Path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d={crease2Path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Natural curved fingernail */}
        <path
          d={nailPath}
          fill={isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.04)'}
          stroke={isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.28)'}
          strokeWidth={isActive ? 1.4 : 0.8}
        />

        {/* Active glowing contact pad ring */}
        {isActive && (
          <ellipse
            cx={tip.x}
            cy={tip.y}
            rx={tipW * 0.44}
            ry={tipW * 0.36}
            fill="rgba(56, 189, 248, 0.3)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        )}
      </g>
    )
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
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#07090e] border border-slate-800/80 shadow-2xl p-2 sm:p-2.5 flex justify-center">
        <svg
          viewBox="0 0 780 320"
          className="w-full h-auto max-h-[240px] drop-shadow-2xl"
          style={{ maxHeight: '240px' }}
        >
          <defs>
            {/* Glow filter for active illuminated key */}
            <filter id="activeKeyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.75" />
              <feDropShadow dx="0" dy="2" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.45" />
            </filter>

            {/* Active finger aura glow */}
            <filter id="activeFingerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>

            {/* Hand gradient for 3D translucent skin tone */}
            <linearGradient id="handGradientLeft" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#1e293b" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.68" />
            </linearGradient>

            <linearGradient id="handGradientRight" x1="100%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#1e293b" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.68" />
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

          {/* LAYER 2: TRANSLUCENT ANATOMICAL HAND SILHOUETTES */}
          {/* LEFT HAND PALM & WRIST */}
          <path
            d="M 120 320 
               Q 135 260 155 220 
               Q 175 210 200 205 
               Q 222 202 245 200 
               Q 268 202 290 205 
               Q 310 220 325 250 
               Q 335 270 330 300 
               L 270 320 Z"
            fill="url(#handGradientLeft)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            style={{ pointerEvents: 'none' }}
          />

          {/* LEFT HAND FINGERS */}
          {renderAnatomicalFinger(leftKnuckles.pinky, fingerPositions['pinky-l'], targetFinger === 'pinky-l', 20, 17, 'handGradientLeft')}
          {renderAnatomicalFinger(leftKnuckles.ring, fingerPositions['ring-l'], targetFinger === 'ring-l', 22, 18, 'handGradientLeft')}
          {renderAnatomicalFinger(leftKnuckles.mid, fingerPositions['mid-l'], targetFinger === 'mid-l', 23, 19, 'handGradientLeft')}
          {renderAnatomicalFinger(leftKnuckles.index, fingerPositions['index-l'], targetFinger === 'index-l', 24, 19, 'handGradientLeft')}
          {renderAnatomicalFinger(leftKnuckles.thumb, fingerPositions.thumb, targetFinger === 'thumb', 25, 21, 'handGradientLeft', true)}

          {/* RIGHT HAND PALM & WRIST */}
          <path
            d="M 660 320 
               Q 645 260 625 220 
               Q 605 210 580 205 
               Q 558 202 535 200 
               Q 512 202 490 205 
               Q 470 220 455 250 
               Q 445 270 450 300 
               L 510 320 Z"
            fill="url(#handGradientRight)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            style={{ pointerEvents: 'none' }}
          />

          {/* RIGHT HAND FINGERS */}
          {renderAnatomicalFinger(rightKnuckles.thumb, { x: 445, y: fingerPositions.thumb.y }, targetFinger === 'thumb', 25, 21, 'handGradientRight', true)}
          {renderAnatomicalFinger(rightKnuckles.index, fingerPositions['index-r'], targetFinger === 'index-r', 24, 19, 'handGradientRight')}
          {renderAnatomicalFinger(rightKnuckles.mid, fingerPositions['mid-r'], targetFinger === 'mid-r', 23, 19, 'handGradientRight')}
          {renderAnatomicalFinger(rightKnuckles.ring, fingerPositions['ring-r'], targetFinger === 'ring-r', 22, 18, 'handGradientRight')}
          {renderAnatomicalFinger(rightKnuckles.pinky, fingerPositions['pinky-r'], targetFinger === 'pinky-r', 20, 17, 'handGradientRight')}
        </svg>
      </div>
    </div>
  )
}
