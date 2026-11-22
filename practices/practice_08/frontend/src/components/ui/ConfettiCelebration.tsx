import React, { useEffect, useRef } from 'react'

interface ConfettiCelebrationProps {
  active: boolean
  mode?: 'light' | 'record'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  vRot: number
  alpha: number
  decay: number
  kind: 'confetti' | 'spark'
  gravity: number
}

const PALETTE = ['#38bdf8', '#fbbf24', '#34d399', '#a78bfa', '#fb7185', '#f8fafc', '#22d3ee']

/**
 * Lightweight 60-FPS Canvas Party Poppers (хлопушки) + Fireworks (салюты) overlay
 * triggered when the user beats their personal WPM speed record.
 */
export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active, mode = 'record' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return
    }
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []

    // Launch side party poppers (хлопушки) from bottom-left and bottom-right
    const popperCount = mode === 'light' ? 24 : 48
    const spawnPopper = (originX: number, dirX: number) => {
      for (let i = 0; i < popperCount; i++) {
        const speed = (mode === 'light' ? 6 : 7) + Math.random() * (mode === 'light' ? 7 : 11)
        const angle = -Math.PI / 2 + dirX * (0.25 + Math.random() * 0.65)
        particles.push({
          x: originX,
          y: canvas.height - 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (mode === 'light' ? 1.5 : 3),
          size: 5 + Math.random() * 5,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          alpha: 1,
          decay: mode === 'light' ? 0.009 + Math.random() * 0.005 : 0.006 + Math.random() * 0.004,
          kind: 'confetti',
          gravity: 0.22
        })
      }
    }

    // Launch radial firework burst (салют) in the upper viewport
    const spawnFirework = (cx: number, cy: number) => {
      const burstColor = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      for (let i = 0; i < 52; i++) {
        const angle = (Math.PI * 2 * i) / 52 + (Math.random() - 0.5) * 0.12
        const speed = 2.5 + Math.random() * 6.5
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 2.5,
          color: i % 3 === 0 ? '#ffffff' : burstColor,
          rotation: 0,
          vRot: 0,
          alpha: 1,
          decay: 0.014 + Math.random() * 0.008,
          kind: 'spark',
          gravity: 0.06
        })
      }
    }

    // Immediate dual party poppers
    spawnPopper(30, 1)
    spawnPopper(canvas.width - 30, -1)

    // Timed sky firework bursts only for full record celebration
    const timers: number[] = []
    if (mode === 'record') {
      timers.push(window.setTimeout(() => spawnFirework(canvas.width * 0.28, canvas.height * 0.24), 400))
      timers.push(window.setTimeout(() => spawnFirework(canvas.width * 0.72, canvas.height * 0.22), 950))
      timers.push(window.setTimeout(() => spawnFirework(canvas.width * 0.5, canvas.height * 0.18), 1500))
    }

    let rafId = 0
    const startTime = performance.now()
    const minRunMs = mode === 'light' ? 400 : 1800

    const render = (now: number) => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.99
        p.rotation += p.vRot
        p.alpha -= p.decay

        if (p.alpha <= 0 || p.y > canvas.height + 40) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)

        if (p.kind === 'confetti') {
          ctx.rotate(p.rotation)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowBlur = 10
          ctx.shadowColor = p.color
          ctx.fill()
        }

        ctx.restore()
      }

      if (particles.length > 0 || now - startTime < minRunMs) {
        rafId = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [active, mode])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      aria-hidden="true"
      data-testid="confetti-celebration"
    />
  )
}
