

# Restructure Hero Section to New Reference Design

This is a complete visual overhaul of the Hero section — switching from a centered layout with starfield/stats to a left-aligned cinematic layout with volumetric light, giant wordmark background, and a textarea search box.

---

## Summary of Changes

The new Hero design has a fundamentally different visual language:
- **Layout**: Left-aligned content (not centered)
- **Background**: Volumetric blue/magenta/purple light atmosphere (replaces starfield canvas + orange gradient)
- **Wordmark**: Giant italic "VEXLO" text as background element with gradient
- **Search**: Textarea-based search box with glassmorphism (replaces ProofScoreWidget pill input)
- **Bottom**: Announcement strip + scroll indicator (replaces trust badges + stats strip)
- **Nav**: Flat centered links + ghost CTA (replaces popover dropdowns + primary CTA)
- **Color tokens**: New accent colors (magenta/blue) alongside existing orange

---

## Implementation Steps

### 1. Add New CSS Variables + Hero Styles to index.css

Add new accent color tokens to `:root`:
```
--bg: #03040a  (update from #080808)
--accent-blue: #4169e1
--accent-magenta: #e040fb
--accent-red: #e11d48
--border: rgba(255,255,255,0.10)  (update from 0.07)
--border-strong: rgba(255,255,255,0.20)  (update from 0.13)
```

Replace existing `.hero-*` CSS classes with the new reference styles:
- `.hero-atmosphere` (dual radial gradients, blue/magenta/purple volumetric light)
- `.light-streaks` (additional light effects with rotation and blur)
- `.hero-vignette` (left-side gradient for text readability)
- `.hero-wordmark` / `.hero-wordmark-text` (giant italic serif with gradient + breathe animation)
- `.hero-content` (left-aligned, flex-end, max-width 820px)
- `.hero-eyebrow` (magenta color, gradient line `::before`)
- `.hero-tagline` (replaces subtitle)
- `.hero-search-outer` / `.search-box` (glassmorphism textarea with blur)
- `.hero-bottom` (announcement strip + scroll indicator)
- `.announcement`, `.ann-label`, `.ann-sub`, `.ann-btn`
- `@keyframes wordmark-breathe` and updated `@keyframes fade-up`

Remove old classes no longer needed:
- `.hero-bg` (replaced by `.hero-atmosphere`)
- `.hero-canvas` (no more starfield)
- `.hero-grid` (removed)
- `.hero-top` (replaced by `.hero-content`)

### 2. Rewrite Hero.tsx Component

Complete rewrite of the component structure:

```text
<section class="hero">
  <div class="hero-atmosphere" />       -- volumetric light bg
  <div class="light-streaks" />         -- additional light effects
  <div class="hero-vignette" />         -- left readability gradient
  <div class="hero-wordmark">           -- giant background text
    <span class="hero-wordmark-text">VEXLO</span>
  </div>
  <div class="hero-content">           -- left-aligned content
    <div class="hero-eyebrow">Sales Proof Intelligence</div>
    <p class="hero-tagline">...</p>
  </div>
  <div class="hero-search-outer">      -- textarea search box
    <div class="search-box">
      <textarea placeholder="..." />
      <div class="search-actions">
        <span class="search-hint">...</span>
        <button class="search-submit">arrow icon</button>
      </div>
    </div>
  </div>
  <div class="hero-bottom">            -- bottom strip
    <div class="scroll-indicator">chevron down</div>
    <div class="announcement">
      <div>
        <p class="ann-label">...</p>
        <p class="ann-sub">...</p>
      </div>
      <a class="ann-btn">Claim Your Slot</a>
    </div>
  </div>
</section>
```

**Removed elements**: starfield canvas, ProofScoreWidget, TrustStrip, CountUpStat/stats strip, hero-grid, hero-bg.

**Kept**: fade-up animations with stagger delays (0.2s, 0.5s, 0.65s, 1.0s), scroll bounce animation.

### 3. Update Navbar to Match Reference

Restructure Navbar.tsx:
- Replace popover dropdown groups with flat centered links: Features, Pricing, Use Cases, FAQ, About
- Replace dual CTAs (btn-ghost + btn-primary) with single ghost-style "Get Early Access" CTA
- Keep mobile hamburger Sheet for responsive
- Update nav link styles to match reference (10px, 0.1em tracking, 7px 14px padding)
- Replace text wordmark with SVG logo (the VEXLO logo from the reference, or keep text temporarily)

### 4. Remove Unused Components

- `ProofScoreWidget.tsx` import removed from Hero (component file kept for potential use elsewhere)
- `useStarfield` hook import removed from Hero
- `TrustStrip` and `CountUpStat` sub-components removed from Hero.tsx

### 5. Responsive Updates

Add responsive rules matching the reference:
- `< 768px`: hero-content padding 100px 20px 0, nav links hidden, hero-bottom column layout, wordmark smaller, search-outer full width padding 20px, announcement stacks vertically

---

## Technical Notes

- The `--bg` change from `#080808` to `#03040a` affects the entire site. All sections using `var(--bg)` will shift slightly darker/bluer.
- Border opacity changes (0.07 to 0.10, 0.13 to 0.20) affect all components using `var(--border)` and `var(--border-strong)`.
- The `wordmark-breathe` keyframe is a subtle 8s opacity pulse (1 to 0.85).
- Search box uses `backdrop-filter: blur(24px)` for glassmorphism — works in all modern browsers.
- The `hero-vignette` uses a multi-stop linear gradient to keep left-side text readable against the right-side volumetric light.
- No H1 element in the new reference — the headline is removed entirely in favor of eyebrow + tagline + search as the primary hero content. The giant wordmark serves as the visual anchor.

