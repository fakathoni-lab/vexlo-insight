// src/hooks/useStarfield.ts
import { useEffect, useRef } from 'react'

export function useStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let stars: { x:number; y:number; r:number; speed:number; phase:number }[] = []

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      stars = Array.from({ length: 100 }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.1 + 0.1,
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const alpha = 0.12 + 0.2 * Math.sin(t * 0.001 * s.speed * 250 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,240,238,${alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    resize()
    animId = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return canvasRef
}
