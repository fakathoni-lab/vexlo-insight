

# Vexlo Landing Page — Complete Build Plan

## Current State vs Blueprint

### Existing components that need refactoring:

| Component | Issue |
|-----------|-------|
| **Navbar** | Missing center nav links (home/problem/pricing/FAQ), CTA says "Get Started" instead of "Early Access", wordmark should be Space Mono 14px uppercase (currently Instrument Serif 2xl), missing scroll state logic |
| **Hero** | Has domain/keyword form (belongs in dashboard). Blueprint specifies: 2 CTA buttons + founding member badge + fluid H1 clamp(40px, 8vw, 96px) + CSS grid background pattern |
| **HowItWorks** | Mostly correct but spacing should be py-32 desktop / py-20 mobile, px-10 / px-5. Max-width should be 1280px |
| **Features** | Only 4 cards, blueprint requires 6 in a 3x2 grid. Spacing needs updating |
| **CTA** | Current is a simple centered section. Blueprint requires: email input, submit button, 4 guarantee badges, full-width dark background |
| **Footer** | Current is minimal 2-col. Blueprint requires 4-column grid (Brand / Product / Company / Legal) |

### Missing sections (6 new components):

1. **Problem** — 2-col grid with 3 pain point cards + serif headline
2. **Use Cases** — 3-col cards for Founder / Developer / Indie Hacker personas
3. **Comparison** — Full-width table: Vexlo vs DIY vs Tool X checkmark matrix
4. **Demo** — Browser chrome mockup with Proof Score ring, ranking chart, AI narrative
5. **Pricing** — 3-tier grid: Starter $39 / Pro $79 (featured) / Elite $149
6. **FAQ** — Accordion list with 8-10 Q&As, expand/collapse state

---

## Implementation Plan

### Phase A: Fix global spacing and layout tokens

Update all sections to use the locked spacing system:
- Section padding: `py-32 lg:py-32 py-20` (128px desktop / 80px mobile)
- Container: `px-10 lg:px-10 px-5` with `max-w-[1280px] mx-auto`

### Phase B: Refactor existing components (6 files)

**1. Navbar** (`src/components/Navbar.tsx`)
- Wordmark: Space Mono, 14px, uppercase
- Center: anchor links (home / problem / pricing / FAQ) — hidden on mobile
- Right: "Early Access" ghost button with accent border
- Height: 64px (h-16)
- Scroll state: add useState + useEffect for scrollY > 50 backdrop-blur

**2. Hero** (`src/components/Hero.tsx`)
- Remove domain/keyword form entirely
- Add fluid H1: `clamp(40px, 8vw, 96px)` with Instrument Serif
- Add subheadline: DM Sans 18px, muted, max-w-[560px]
- CTA row: Primary "Get Early Access" (solid accent) + Secondary "See Demo" (ghost)
- Social proof badge: "17 Founding Members Joined" with dot indicator
- Background: subtle CSS grid pattern (no canvas starfield — simpler, performant)
- No hero image — typography first

**3. HowItWorks** (`src/components/HowItWorks.tsx`)
- Update spacing to locked system (py-32/py-20, px-10/px-5)
- Add Lucide icons to each step
- Max-width 1280px

**4. Features** (`src/components/Features.tsx`)
- Expand to 6 feature cards in 3x2 grid (lg:grid-cols-3)
- Add Lucide icons to each card
- Update spacing to locked system
- Cards: 2 additional features (AI Overview detection, Proof Score system)

**5. CTA** (`src/components/CTA.tsx`) — becomes Final CTA
- Full-width dark background
- Email input field + submit button
- 4 guarantee badges below: Free to Join / 5min Setup / Data Safe / Cancel Anytime
- Source tracking attribute for waitlist

**6. Footer** (`src/components/Footer.tsx`)
- 4-column grid: Brand / Product links / Company / Legal
- Proper link structure with anchor links

### Phase C: Build new sections (6 new files)

**7. Problem** (`src/components/Problem.tsx`)
- 2-col grid on lg
- 3 pain point cards with Lucide icons
- Serif headline describing agency pain points
- Cards use locked card styling: bg-surface, border, rounded-card, p-6

**8. Use Cases** (`src/components/UseCases.tsx`)
- 3-col card grid
- Personas: SEO Agency Founder / Freelance Developer / Indie Hacker
- Each card: icon + persona title + description of how they use Vexlo

**9. Comparison** (`src/components/Comparison.tsx`)
- Full-width HTML table
- Columns: Feature | Vexlo | DIY Manual | Generic Tool
- Checkmark (accent color) / X (muted) matrix
- 8-10 comparison rows
- Styled with locked border/surface tokens

**10. Demo** (`src/components/Demo.tsx`)
- Browser chrome mockup (CSS-only frame with dots + URL bar)
- Inside: static mockup of Proof Score ring (SVG), ranking bars (CSS), AI narrative text
- All static — no real data, just visual proof of concept

**11. Pricing** (`src/components/Pricing.tsx`)
- 3-tier grid: Starter $39 / Pro $79 (featured) / Elite $149
- Middle card visually elevated (accent border, slight scale or badge)
- Feature list per tier with check/x indicators
- CTA button per card
- Client Component — needs hover/interaction state

**12. FAQ** (`src/components/FAQ.tsx`)
- 8-10 Q&As
- Custom accordion with useState (no Radix — per constraints)
- Click to expand/collapse with CSS transition (max-height, 300ms)
- Lucide ChevronDown icon rotates on open
- Client Component — needs click handlers

### Phase D: Update Index.tsx

Assemble all 10 sections in correct order with proper id attributes for anchor navigation:

```text
Navbar (fixed)
#hero      -> Hero
#problem   -> Problem
#how       -> HowItWorks
#features  -> Features
#usecases  -> UseCases
#compare   -> Comparison
#demo      -> Demo
#pricing   -> Pricing
#faq       -> FAQ
#cta       -> CTA (Final)
Footer
```

---

## Technical Notes

- **No external libraries added** — all components use Tailwind + Lucide React (already installed)
- **Client Components**: Navbar (scroll listener), Hero (if counter needed), FAQ (accordion state), Pricing (hover states). All others can be static.
- **All buttons**: `font-mono text-xs uppercase tracking-widest` per locked style guide
- **All cards**: `bg-surface border border-border rounded-card p-6 hover:border-accent/25 transition-colors duration-200`
- **No shadcn/radix usage** in new components (FAQ accordion is custom)
- **CSS transitions only**, 200-400ms, no framer-motion

## Estimated file changes

| Action | File |
|--------|------|
| Modify | `src/components/Navbar.tsx` |
| Modify | `src/components/Hero.tsx` |
| Modify | `src/components/HowItWorks.tsx` |
| Modify | `src/components/Features.tsx` |
| Modify | `src/components/CTA.tsx` |
| Modify | `src/components/Footer.tsx` |
| Create | `src/components/Problem.tsx` |
| Create | `src/components/UseCases.tsx` |
| Create | `src/components/Comparison.tsx` |
| Create | `src/components/Demo.tsx` |
| Create | `src/components/Pricing.tsx` |
| Create | `src/components/FAQ.tsx` |
| Modify | `src/pages/Index.tsx` |

