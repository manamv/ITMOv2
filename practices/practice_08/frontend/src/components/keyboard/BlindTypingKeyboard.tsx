import React, { useMemo } from 'react'
import type { FingerType } from '../../types'

interface BlindTypingKeyboardProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number>
  mode?: 'blindtyping' | 'isometric'
  onToggleMode?: () => void
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

// Dedicated ergonomic color scheme for the 8 touch-typing finger zones + thumbs
const FINGER_ZONE_COLORS: Record<
  FingerType,
  {
    border: string
    bg: string
    text: string
    glow: string
    activeFill: string
  }
> = {
  'pinky-l': {
    border: 'rgba(244, 63, 94, 0.38)',
    bg: 'rgba(244, 63, 94, 0.09)',
    text: '#fda4af',
    glow: '#f43f5e',
    activeFill: 'rgba(244, 63, 94, 0.28)'
  },
  'ring-l': {
    border: 'rgba(249, 115, 22, 0.38)',
    bg: 'rgba(249, 115, 22, 0.09)',
    text: '#fdba74',
    glow: '#f97316',
    activeFill: 'rgba(249, 115, 22, 0.28)'
  },
  'mid-l': {
    border: 'rgba(234, 179, 8, 0.38)',
    bg: 'rgba(234, 179, 8, 0.09)',
    text: '#fde047',
    glow: '#eab308',
    activeFill: 'rgba(234, 179, 8, 0.28)'
  },
  'index-l': {
    border: 'rgba(16, 185, 129, 0.38)',
    bg: 'rgba(16, 185, 129, 0.09)',
    text: '#6ee7b7',
    glow: '#10b981',
    activeFill: 'rgba(16, 185, 129, 0.28)'
  },
  thumb: {
    border: 'rgba(56, 189, 248, 0.32)',
    bg: 'rgba(56, 189, 248, 0.07)',
    text: '#7dd3fc',
    glow: '#38bdf8',
    activeFill: 'rgba(56, 189, 248, 0.28)'
  },
  'index-r': {
    border: 'rgba(6, 182, 212, 0.38)',
    bg: 'rgba(6, 182, 212, 0.09)',
    text: '#67e8f9',
    glow: '#06b6d4',
    activeFill: 'rgba(6, 182, 212, 0.28)'
  },
  'mid-r': {
    border: 'rgba(59, 130, 246, 0.38)',
    bg: 'rgba(59, 130, 246, 0.09)',
    text: '#93c5fd',
    glow: '#3b82f6',
    activeFill: 'rgba(59, 130, 246, 0.28)'
  },
  'ring-r': {
    border: 'rgba(168, 85, 247, 0.38)',
    bg: 'rgba(168, 85, 247, 0.09)',
    text: '#d8b4fe',
    glow: '#a855f7',
    activeFill: 'rgba(168, 85, 247, 0.28)'
  },
  'pinky-r': {
    border: 'rgba(236, 72, 153, 0.38)',
    bg: 'rgba(236, 72, 153, 0.09)',
    text: '#f9a8d4',
    glow: '#ec4899',
    activeFill: 'rgba(236, 72, 153, 0.28)'
  }
}

const FINGER_NAMES_RU: Record<FingerType, string> = {
  'pinky-l': 'Левый мизинец',
  'ring-l': 'Левый безымянный',
  'mid-l': 'Левый средний',
  'index-l': 'Левый указательный',
  'index-r': 'Правый указательный',
  'mid-r': 'Правый средний',
  'ring-r': 'Правый безымянный',
  'pinky-r': 'Правый мизинец',
  thumb: 'Большой палец'
}

// Palm knuckle base anchors (ergonomically arched)
const LEFT_KNUCKLES = {
  pinky: { x: 152, y: 222 },
  ring: { x: 198, y: 204 },
  mid: { x: 244, y: 198 },
  index: { x: 290, y: 204 },
  thumb: { x: 326, y: 256 }
} as const

const RIGHT_KNUCKLES = {
  thumb: { x: 454, y: 256 },
  index: { x: 490, y: 204 },
  mid: { x: 536, y: 198 },
  ring: { x: 582, y: 204 },
  pinky: { x: 628, y: 222 }
} as const

// Precomputed keyboard geometry (constant across all renders)
const KEYBOARD_KEYS: KeyModel[] = (() => {
  const list: KeyModel[] = []

  const rows: Array<{
    y: number
    keys: Array<{ id: string; label: string; finger: FingerType }>
  }> = [
    {
      y: 26,
      keys: [
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
    },
    {
      y: 80,
      keys: [
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
    },
    {
      y: 134,
      keys: [
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
    }
  ]

  for (const row of rows) {
    const startX = (780 - (row.keys.length * KEY_W + (row.keys.length - 1) * GAP)) / 2
    row.keys.forEach((k, idx) => {
      const x = startX + idx * (KEY_W + GAP)
      list.push({
        id: k.id,
        label: k.label,
        x,
        y: row.y,
        w: KEY_W,
        h: KEY_H,
        cx: x + KEY_W / 2,
        cy: row.y + KEY_H / 2,
        finger: k.finger
      })
    })
  }

  const spaceW = 264
  const spaceX = (780 - spaceW) / 2
  const spaceY = 188
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
})()

const REST_POSITIONS: Record<FingerType, { x: number; y: number }> = (() => {
  const byId = (id: string) => KEYBOARD_KEYS.find(k => k.id === id)!
  return {
    'pinky-l': { x: byId('a').cx, y: byId('a').cy },
    'ring-l': { x: byId('s').cx, y: byId('s').cy },
    'mid-l': { x: byId('d').cx, y: byId('d').cy },
    'index-l': { x: byId('f').cx, y: byId('f').cy },
    thumb: { x: 342, y: 214 },
    'index-r': { x: byId('j').cx, y: byId('j').cy },
    'mid-r': { x: byId('k').cx, y: byId('k').cy },
    'ring-r': { x: byId('l').cx, y: byId('l').cy },
    'pinky-r': { x: byId(';').cx, y: byId(';').cy }
  }
})()

export const BlindTypingKeyboard: React.FC<BlindTypingKeyboardProps> = ({
  activeChar,
  heatmapMode = false,
  heatmapData = {},
  mode,
  onToggleMode
}) => {
  const normalizedActive = (activeChar || '').toLowerCase()

  const activeKey = useMemo(() => {
    if (!normalizedActive) return null
    return KEYBOARD_KEYS.find(k => k.id.toLowerCase() === normalizedActive) || null
  }, [normalizedActive])

  const targetFinger: FingerType | null = activeKey ? activeKey.finger : null

  const fingerPositions = useMemo(() => {
    const res = { ...REST_POSITIONS }
    if (activeKey && targetFinger) {
      if (targetFinger === 'thumb') {
        res.thumb = { x: 390, y: activeKey.cy }
      } else {
        res[targetFinger] = { x: activeKey.cx, y: activeKey.cy }
      }
    }
    return res
  }, [activeKey, targetFinger])

  /**
   * Cyber-Glass Anatomical Finger Renderer
   * Features: sculpted phalanges, dorsal 3D specular highlight, curved nail with lunula,
   * and zone-matched active contact halo.
   */
  const renderAnatomicalFinger = (
    knuckle: { x: number; y: number },
    tip: { x: number; y: number },
    fingerType: FingerType,
    isActive: boolean,
    baseW: number = 23,
    tipW: number = 17.5,
    gradientId: string = 'handGlassLeft',
    isThumb: boolean = false
  ) => {
    const zone = FINGER_ZONE_COLORS[fingerType]
    const dx = tip.x - knuckle.x
    const dy = tip.y - knuckle.y
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len
    const uy = dy / len
    const nx = -uy
    const ny = ux

    // Joint 1: Proximal Interphalangeal (PIP) at 40%
    const j1Len = len * 0.4
    const j1x = knuckle.x + ux * j1Len
    const j1y = knuckle.y + uy * j1Len
    const j1W = (baseW + tipW) * 0.52

    // Joint 2: Distal Interphalangeal (DIP) at 73%
    const j2Len = len * 0.73
    const j2x = knuckle.x + ux * j2Len
    const j2y = knuckle.y + uy * j2Len
    const j2W = tipW * 1.04

    // Outer organic silhouette points
    const bL = { x: knuckle.x + nx * (baseW / 2), y: knuckle.y + ny * (baseW / 2) }
    const bR = { x: knuckle.x - nx * (baseW / 2), y: knuckle.y - ny * (baseW / 2) }

    const j1L = { x: j1x + nx * (j1W / 2), y: j1y + ny * (j1W / 2) }
    const j1R = { x: j1x - nx * (j1W / 2), y: j1y - ny * (j1W / 2) }

    const j2L = { x: j2x + nx * (j2W / 2), y: j2y + ny * (j2W / 2) }
    const j2R = { x: j2x - nx * (j2W / 2), y: j2y - ny * (j2W / 2) }

    const tL = { x: tip.x + nx * (tipW / 2), y: tip.y + ny * (tipW / 2) }
    const tR = { x: tip.x - nx * (tipW / 2), y: tip.y - ny * (tipW / 2) }
    const cap = { x: tip.x + ux * (tipW * 0.58), y: tip.y + uy * (tipW * 0.58) }

    const fingerPath = `M ${bL.x} ${bL.y}
      Q ${(bL.x + j1L.x) / 2 + nx * 0.6} ${(bL.y + j1L.y) / 2 + ny * 0.6} ${j1L.x} ${j1L.y}
      Q ${(j1L.x + j2L.x) / 2 - nx * 0.45} ${(j1L.y + j2L.y) / 2 - ny * 0.45} ${j2L.x} ${j2L.y}
      L ${tL.x} ${tL.y}
      Q ${cap.x} ${cap.y} ${tR.x} ${tR.y}
      L ${j2R.x} ${j2R.y}
      Q ${(j1R.x + j2R.x) / 2 + nx * 0.45} ${(j1R.y + j2R.y) / 2 + ny * 0.45} ${j1R.x} ${j1R.y}
      Q ${(bR.x + j1R.x) / 2 - nx * 0.6} ${(bR.y + j1R.y) / 2 - ny * 0.6} ${bR.x} ${bR.y}
      Z`

    // Dorsal 3D specular ridge highlight along finger spine
    const ridgeStart = { x: knuckle.x + ux * (len * 0.14), y: knuckle.y + uy * (len * 0.14) }
    const ridgeEnd = { x: knuckle.x + ux * (len * 0.72), y: knuckle.y + uy * (len * 0.72) }

    // Subtle phalangeal joint crease arcs
    const crease1Path = `M ${j1x + nx * (j1W * 0.34)} ${j1y + ny * (j1W * 0.34)}
      Q ${j1x - ux * 1.4} ${j1y - uy * 1.4} ${j1x - nx * (j1W * 0.34)} ${j1y - ny * (j1W * 0.34)}`
    const crease2Path = `M ${j2x + nx * (j2W * 0.3)} ${j2y + ny * (j2W * 0.3)}
      Q ${j2x - ux * 1.1} ${j2y - uy * 1.1} ${j2x - nx * (j2W * 0.3)} ${j2y - ny * (j2W * 0.3)}`

    // Natural curved fingernail at distal phalanx
    const nailBaseLen = len * 0.8
    const nBx = knuckle.x + ux * nailBaseLen
    const nBy = knuckle.y + uy * nailBaseLen
    const nTipX = tip.x + ux * (tipW * 0.22)
    const nTipY = tip.y + uy * (tipW * 0.22)
    const nW = tipW * 0.56

    const nailPath = `M ${nBx + nx * (nW / 2)} ${nBy + ny * (nW / 2)}
      Q ${nTipX + nx * (nW / 2)} ${nTipY + ny * (nW / 2)} ${nTipX} ${nTipY}
      Q ${nTipX - nx * (nW / 2)} ${nTipY - ny * (nW / 2)} ${nBx - nx * (nW / 2)} ${nBy - ny * (nW / 2)}
      Q ${nBx - ux * 1.5} ${nBy - uy * 1.5} ${nBx + nx * (nW / 2)} ${nBy + ny * (nW / 2)}`

    return (
      <g
        key={`${fingerType}-${gradientId}`}
        style={{ transition: 'all 0.13s cubic-bezier(0.22, 1, 0.36, 1)', pointerEvents: 'none' }}
      >
        {/* Active zone-colored outer aura under the finger */}
        {isActive && (
          <path
            d={fingerPath}
            fill={zone.activeFill}
            stroke={zone.glow}
            strokeWidth={3.5}
            opacity={0.45}
            filter="url(#activeFingerGlow)"
          />
        )}

        {/* Main cyber-glass finger body */}
        <path
          d={fingerPath}
          fill={isActive ? zone.activeFill : `url(#${gradientId})`}
          stroke={isActive ? zone.glow : 'rgba(255, 255, 255, 0.2)'}
          strokeWidth={isActive ? 1.8 : 1.05}
        />

        {/* Dorsal 3D specular glass ridge */}
        <line
          x1={ridgeStart.x}
          y1={ridgeStart.y}
          x2={ridgeEnd.x}
          y2={ridgeEnd.y}
          stroke={isActive ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isActive ? 2.4 : 1.6}
          strokeLinecap="round"
        />

        {/* Subtle anatomical phalangeal creases */}
        {!isThumb && (
          <>
            <path
              d={crease1Path}
              fill="none"
              stroke={isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255, 255, 255, 0.13)'}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d={crease2Path}
              fill="none"
              stroke={isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255, 255, 255, 0.16)'}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Sculpted curved fingernail with glass reflection */}
        <path
          d={nailPath}
          fill={isActive ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.06)'}
          stroke={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'}
          strokeWidth={isActive ? 1.2 : 0.75}
        />

        {/* Active fingertip contact pulse rings */}
        {isActive && (
          <>
            <circle
              cx={tip.x}
              cy={tip.y}
              r={tipW * 0.72}
              fill="none"
              stroke={zone.glow}
              strokeWidth="1.2"
              opacity="0.55"
            />
            <ellipse
              cx={tip.x}
              cy={tip.y}
              rx={tipW * 0.4}
              ry={tipW * 0.34}
              fill="rgba(255, 255, 255, 0.35)"
              stroke="#ffffff"
              strokeWidth="1.4"
            />
          </>
        )}
      </g>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none" data-testid="virtual-keyboard">
      {/* Header Guidance Banner */}
      <div className="w-full flex items-center justify-between mb-2 text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
            <span className="text-slate-100 font-semibold text-xs sm:text-sm">Слепая печать (Blind Typing)</span>
          </div>

          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer flex items-center space-x-1"
              title="Переключить режим отображения клавиатуры"
            >
              <span>{mode === 'blindtyping' ? '🖐 Силуэты рук' : '🧊 Режим 3D'}</span>
            </button>
          )}
        </div>

        {targetFinger && (
          <div className="flex items-center space-x-2 bg-white/[0.03] px-3 py-1 rounded-xl border border-white/[0.08] shadow-sm">
            <span className="text-slate-400">Клавиша:</span>
            <span
              className="font-bold text-slate-950 bg-white px-2 py-0.5 rounded shadow text-xs border"
              style={{ borderColor: FINGER_ZONE_COLORS[targetFinger].glow }}
            >
              {normalizedActive === ' ' ? '␣ SPACE' : normalizedActive.toUpperCase()}
            </span>
            <span
              className="font-semibold text-xs"
              style={{ color: FINGER_ZONE_COLORS[targetFinger].glow }}
            >
              ← {FINGER_NAMES_RU[targetFinger]}
            </span>
          </div>
        )}
      </div>

      {/* SVG Blind Typing Keyboard with Cyber-Glass Anatomical Hand Overlay */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-[#050810] border border-white/[0.08] shadow-2xl shadow-black/90 p-2 sm:p-4 flex justify-center">
        {/* Subtle ambient top deck glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" />

        <svg
          viewBox="0 0 780 320"
          className="w-full h-auto max-h-[385px] drop-shadow-2xl"
        >
          <defs>
            {/* Glow filter for active illuminated key */}
            <filter id="activeKeyGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffffff" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="2" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.55" />
            </filter>

            {/* Soft volumetric aura for active finger */}
            <filter id="activeFingerGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Translucent Cyber-Glass Hand Gradients with smooth wrist fade-out */}
            <linearGradient id="handGlassLeft" x1="20%" y1="100%" x2="55%" y2="0%">
              <stop offset="0%" stopColor="#070b14" stopOpacity="0.05" />
              <stop offset="28%" stopColor="#0f172a" stopOpacity="0.72" />
              <stop offset="68%" stopColor="#1e293b" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="handGlassRight" x1="80%" y1="100%" x2="45%" y2="0%">
              <stop offset="0%" stopColor="#070b14" stopOpacity="0.05" />
              <stop offset="28%" stopColor="#0f172a" stopOpacity="0.72" />
              <stop offset="68%" stopColor="#1e293b" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="palmRimFade" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          {/* LAYER 1: KEYS WITH 3D BEVEL & F/J HOMING BARS */}
          <g id="keyboard-keys">
            {KEYBOARD_KEYS.map(k => {
              const isMatch = normalizedActive === k.id.toLowerCase()
              const errRate = heatmapData[k.id.toLowerCase()]
              const zone = FINGER_ZONE_COLORS[k.finger]

              let fill = zone.bg
              let stroke = zone.border
              let textFill = zone.text
              let strokeWidth = 1.15
              let filter: string | undefined

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
                stroke = zone.glow
                textFill = '#090d16'
                strokeWidth = 2.4
                filter = 'url(#activeKeyGlow)'
              }

              const isHomeKey = k.id === 'f' || k.id === 'j'

              return (
                <g
                  key={k.id}
                  data-testid={k.id === ' ' ? 'key-space' : `key-${k.id.toLowerCase()}`}
                  className="cursor-default"
                >
                  {/* Subtle keycap under-shadow */}
                  <rect
                    x={k.x}
                    y={k.y + 2}
                    width={k.w}
                    height={k.h}
                    rx={9}
                    ry={9}
                    fill="rgba(0,0,0,0.55)"
                  />

                  {/* Main keycap face */}
                  <rect
                    x={k.x}
                    y={isMatch ? k.y + 1 : k.y}
                    width={k.w}
                    height={k.h}
                    rx={9}
                    ry={9}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    style={{ transition: 'all 0.11s ease' }}
                  />

                  {/* Subtle top specular glass edge */}
                  {!isMatch && (
                    <line
                      x1={k.x + 8}
                      y1={k.y + 1.5}
                      x2={k.x + k.w - 8}
                      y2={k.y + 1.5}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Key label */}
                  <text
                    x={k.cx}
                    y={(isMatch ? k.cy + 1 : k.cy) + 5}
                    textAnchor="middle"
                    fill={textFill}
                    fontSize={k.w > 100 ? '11' : '15'}
                    fontWeight={isMatch ? '800' : '600'}
                    fontFamily="monospace"
                    style={{ transition: 'all 0.11s ease', pointerEvents: 'none' }}
                  >
                    {k.label}
                  </text>

                  {/* Authentic touch-typing homing bar on F and J */}
                  {isHomeKey && (
                    <rect
                      x={k.cx - 6}
                      y={k.y + k.h - 7}
                      width={12}
                      height={2}
                      rx={1}
                      fill={isMatch ? '#0f172a' : 'rgba(255,255,255,0.45)'}
                    />
                  )}
                </g>
              )
            })}
          </g>

          {/* LAYER 2: CYBER-GLASS ANATOMICAL HAND SILHOUETTES */}
          {/* LEFT HAND PALM & WRIST (with smooth fade-out) */}
          <g style={{ pointerEvents: 'none' }}>
            <path
              d="M 118 322
                 Q 132 262 152 222
                 Q 174 209 198 204
                 Q 221 200 244 198
                 Q 267 200 290 204
                 Q 312 222 326 256
                 Q 334 282 324 322 Z"
              fill="url(#handGlassLeft)"
              stroke="url(#palmRimFade)"
              strokeWidth="1.25"
            />
            {/* Subtle dorsal metacarpal contour lines */}
            <path d="M 178 290 Q 186 248 198 214" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 218 292 Q 230 246 244 208" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 258 292 Q 272 248 288 214" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>

          {/* LEFT HAND FINGERS */}
          {renderAnatomicalFinger(LEFT_KNUCKLES.pinky, fingerPositions['pinky-l'], 'pinky-l', targetFinger === 'pinky-l', 19, 15.5, 'handGlassLeft')}
          {renderAnatomicalFinger(LEFT_KNUCKLES.ring, fingerPositions['ring-l'], 'ring-l', targetFinger === 'ring-l', 21, 17, 'handGlassLeft')}
          {renderAnatomicalFinger(LEFT_KNUCKLES.mid, fingerPositions['mid-l'], 'mid-l', targetFinger === 'mid-l', 22.5, 18, 'handGlassLeft')}
          {renderAnatomicalFinger(LEFT_KNUCKLES.index, fingerPositions['index-l'], 'index-l', targetFinger === 'index-l', 23, 18, 'handGlassLeft')}
          {renderAnatomicalFinger(LEFT_KNUCKLES.thumb, fingerPositions.thumb, 'thumb', targetFinger === 'thumb', 24, 19.5, 'handGlassLeft', true)}

          {/* RIGHT HAND PALM & WRIST */}
          <g style={{ pointerEvents: 'none' }}>
            <path
              d="M 662 322
                 Q 648 262 628 222
                 Q 606 209 582 204
                 Q 559 200 536 198
                 Q 513 200 490 204
                 Q 468 222 454 256
                 Q 446 282 456 322 Z"
              fill="url(#handGlassRight)"
              stroke="url(#palmRimFade)"
              strokeWidth="1.25"
            />
            {/* Subtle dorsal metacarpal contour lines */}
            <path d="M 602 290 Q 594 248 582 214" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 562 292 Q 550 246 536 208" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 522 292 Q 508 248 492 214" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>

          {/* RIGHT HAND FINGERS */}
          {renderAnatomicalFinger(RIGHT_KNUCKLES.thumb, { x: 438, y: fingerPositions.thumb.y }, 'thumb', targetFinger === 'thumb', 24, 19.5, 'handGlassRight', true)}
          {renderAnatomicalFinger(RIGHT_KNUCKLES.index, fingerPositions['index-r'], 'index-r', targetFinger === 'index-r', 23, 18, 'handGlassRight')}
          {renderAnatomicalFinger(RIGHT_KNUCKLES.mid, fingerPositions['mid-r'], 'mid-r', targetFinger === 'mid-r', 22.5, 18, 'handGlassRight')}
          {renderAnatomicalFinger(RIGHT_KNUCKLES.ring, fingerPositions['ring-r'], 'ring-r', targetFinger === 'ring-r', 21, 17, 'handGlassRight')}
          {renderAnatomicalFinger(RIGHT_KNUCKLES.pinky, fingerPositions['pinky-r'], 'pinky-r', targetFinger === 'pinky-r', 19, 15.5, 'handGlassRight')}
        </svg>
      </div>
    </div>
  )
}
