

# Implement Gap Analysis Fixes: globals.css, tailwind.config.ts, and 3 React Hooks

Based on the uploaded `vexlo_gap_analysis.docx`, here is what needs to change and what is already handled.

---

## Current State Assessment

Before applying the doc blindly, here is what already works:

| Gap Analysis Item | Already Implemented? | Where |
|---|---|---|
| Nav scroll blur | YES -- inline in Navbar.tsx | useState + useEffect + scroll listener |
| Starfield canvas | YES -- inline in Hero.tsx | useRef + useEffect + requestAnimationFrame |
| Hero gradient/grid/eyebrow | YES -- inline styles in Hero.tsx | JSX with style props |
| Parallax understand section | NO | Not built yet |
| Hollow text (.st-line) | NO | Not in any component |
| Product card corner dots | NO | Not in any component |
| Orb pulse animation | NO | Not in any component |
| Bounce scroll icon | NO | Not in Hero |
| fade-up animation class | NO | Missing from CSS + Tailwind |

Key insight: Many visual effects from xai-redesign.html are already implemented inline in React components. The hooks in the doc would duplicate existing logic. We should only add what is genuinely missing.

---

## Plan

### 1. Update `tailwind.config.ts` -- Fix content paths + add missing config

**Changes:**
- Remove Next.js-style paths (`./pages/**`, `./components/**`, `./app/**`)
- Keep `./index.html` and `./src/**/*.{ts,tsx}` (Vite-correct paths)
- Add missing keyframes: `bounce`, `orb-pulse`, `fade-up`, `ticker-scroll`
- Add missing animations: `bounce-scroll`, `orb-pulse`, `fade-up`, `ticker`
- Add missing design token mappings: `boxShadow`, `transitionTimingFunction`, `height.taxbutton`, `borderRadius.outer/inner/button`
- Keep existing shadcn-compatible color/font mappings (they work)

### 2. Update `src/index.css` -- Add missing component CSS classes

**Add these CSS classes** (inside `@layer components`) that are missing from xai-redesign.html:
- `.hero-bg` -- radial gradient background
- `.hero-grid` -- 72px grid texture
- `.hero-canvas` -- canvas positioning
- `.hero-eyebrow` + `::before` -- eyebrow with orange line
- `.hero-headline` + `em` -- fluid typography headline
- `.hero` -- min-height 100svh
- `.nav` + `.nav.scrolled` -- nav glass effect (CSS-only, components use inline now but this enables class-based approach)
- `.nav-logo` -- logo styling
- `.st-line.solid` / `.st-line.hollow` -- hollow text effect
- `.arrow-link` -- hover gap animation
- `.product-flagship` / `.corner-dot` -- product card effects
- `.understand-orb` -- orb pulse styling
- `.fade-up` -- utility class for scroll reveal
- `@keyframes bounce`, `spin-ring`, `orb-pulse`, `fade-up` -- missing keyframes
- Scrollbar + utility classes from spec

**Important:** We will NOT add `@import url(...)` for Google Fonts -- that was already moved to `index.html` `<link>` tags (the correct approach for performance).

### 3. Create `src/hooks/useNavScroll.ts`

Extract the nav scroll detection into a reusable hook (currently duplicated inline in Navbar.tsx):

```typescript
import { useState, useEffect } from 'react'

export function useNavScroll(threshold = 16) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}
```

Then update `Navbar.tsx` to use this hook instead of its inline implementation.

### 4. Create `src/hooks/useStarfield.ts`

Extract the starfield canvas logic into a reusable hook (currently inline in Hero.tsx):

```typescript
import { useEffect, useRef } from 'react'

export function useStarfield(starCount = 100) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // ... canvas setup, resize, draw loop, cleanup
  return canvasRef
}
```

Then update `Hero.tsx` to use this hook instead of its inline implementation.

### 5. Create `src/hooks/useParallax.ts`

New hook for parallax scroll effect (not yet implemented anywhere):

```typescript
import { useEffect, useRef, useState } from 'react'

export function useParallax() {
  const sectionRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)
  // ... scroll listener, lerp calculation, rAF loop, cleanup
  return { sectionRef, offset }
}
```

This hook will be available for future "Understand" section or any parallax text section.

---

## File Summary

| File | Action |
|---|---|
| `tailwind.config.ts` | Update: fix content paths, add keyframes/animations/tokens |
| `src/index.css` | Update: add 20+ missing component CSS classes + keyframes |
| `src/hooks/useNavScroll.ts` | Create: extracted nav scroll hook |
| `src/hooks/useStarfield.ts` | Create: extracted starfield canvas hook |
| `src/hooks/useParallax.ts` | Create: new parallax scroll hook |
| `src/components/layout/Navbar.tsx` | Update: use `useNavScroll` hook |
| `src/components/sections/Hero.tsx` | Update: use `useStarfield` hook |

No new dependencies. No breaking changes. All existing inline implementations are preserved functionally -- just refactored into hooks.

