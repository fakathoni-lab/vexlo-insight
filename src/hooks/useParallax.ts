// src/hooks/useParallax.ts
import { useEffect, useRef, useState } from 'react'

export function useParallax() {
  const sectionRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let current = 0, target = 0, rafId: number

    function updateTarget() {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const progress = 1 - (rect.top + rect.height * 0.5)
                          / (window.innerHeight + rect.height)
      target = (progress - 0.5) * 100
    }

    function tick() {
      current += (target - current) * 0.055
      setOffset(current)
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', updateTarget, { passive: true })
    updateTarget()
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', updateTarget)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return { sectionRef, offset }
}
