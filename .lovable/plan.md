

# Homepage Reconstruction: VEXLO x xAI Design System

## Scope
Rebuild the entire VEXLO homepage (`/`) with 10 sections following the brief's structure, fix WCAG contrast violations, restructure navigation, and add new components. This plan covers the homepage only.

---

## Phase 1: Design Token & Contrast Fixes (index.css)

Update CSS custom properties to fix WCAG AA violations:

| Token | Current | New | Contrast on #080808 |
|-------|---------|-----|---------------------|
| `--text-dim` | `rgba(240,240,238,0.45)` | `rgba(240,240,238,0.55)` | ~5.5:1 |
| `--text-muted` | `rgba(240,240,238,0.25)` | `rgba(240,240,238,0.55)` | ~5.5:1 |

Add new accent tokens to `:root`:
```
--accent-proof: #E8FF47    (proof yellow)
--accent-danger: #FF4747   (risk/problem)
--accent-success: #47FF8F  (win states)
--surface: #111111
--surface-elevated: #1A1A1A
```

Add `@media (prefers-reduced-motion: reduce)` block to disable all animations.

Add new CSS classes: `.landing-section` base padding (if missing), `.stats-bar`, `.testimonial-card`, `.proof-score-gauge`, `.typing-animation`.

---

## Phase 2: Navbar Reconstruction

**File:** `src/components/layout/Navbar.tsx`

Replace flat 4-link nav with structured dropdown navigation:

- **Left:** VEXLO logo
- **Center (desktop):** 3 dropdown groups using shadcn Popover:
  - PRODUK: Instant Proof Engine, AI Overview Impact, Closing Narrative, Domain Intelligence, Pricing
  - DEVELOPERS: API Docs, Integrations, White-label Setup
  - COMPANY: Mission, Team, Certified Program, Blog
- **Right:** Two CTAs:
  - Primary: "Coba Gratis" (btn-primary)
  - Secondary: "Agency Sales" (btn-ghost)
- **Mobile:** Keep Sheet-based menu, add grouped sections

---

## Phase 3: Hero Section Rebuild

**File:** `src/components/sections/Hero.tsx`

Replace current atmospheric hero with information-dense hero:

1. Keep starfield canvas + grid + gradient backgrounds
2. New content structure:
   - `[SALES PROOF INTELLIGENCE]` eyebrow label
   - H1: "Prospek bilang pikir-pikir dulu. Bukan karena hargamu mahal. Karena kamu belum punya bukti."
   - H2: VEXLO's 30-second proof description
   - **Proof Score Widget:** Domain input field with animated "generating..." state showing a sample score gauge (0-100 circular)
   - Below input: "23.847 proof generated. 0 izin diminta."
   - Trust strip: 4 badges (DataForSEO-powered, AI Overview impact, White-label ready, Domain integration)

**New component:** `src/components/sections/ProofScoreWidget.tsx`
- Input field + submit button (visual demo only, no real API call)
- On "submit": animated loading state -> fake Proof Score gauge fills to 23/100
- Circular gauge component with red/yellow/green color coding
- Caption below: urgency copy based on score

---

## Phase 4: Pain Amplification Section

**File:** `src/components/sections/PainAmplification.tsx` (new)

Replaces current Problem.tsx with VEXLO's "dead loop" framing:

- Section label: `[DEAD LOOP]`
- Headline: "Dead loop yang membunuh deal agency manapun."
- 3-column grid with icons:
  1. Circular arrow icon: "Butuh akses untuk diagnosa" + body
  2. Hourglass icon: "Audit manual 30-60 menit" + body
  3. Disappearing message icon: "'Nanti saya pikir-pikir dulu.'" + body
- Cards use `.product-flagship` style with `.corner-dot` decorations

---

## Phase 5: Product Demo Section

**File:** `src/components/sections/ProductDemo.tsx` (new)

Animated proof engine demonstration:

- Section label: `[INSTANT PROOF ENGINE]`
- Shows a mock UI: domain input -> loading pulse -> Proof Score dashboard mockup
- Closing Narrative output area with typing animation (CSS-only)
- Caption: "30 detik. Satu domain. Satu bukti yang tidak bisa diabaikan."
- Power shift quote below

---

## Phase 6: Social Proof Section

**File:** `src/components/sections/SocialProof.tsx` (new)

- Stats bar (horizontal strip, 4 metrics):
  - 23.847 Proof Generated
  - $4.2M Deals Closed by Users
  - less than 30s Average Proof Time
  - 0 Permissions Required
- Numbers use animated counter (CSS counter or simple state animation)
- 2 testimonial cards below (Alex persona + Sam persona)
- Cards use `.product-flagship` with corner dots

---

## Phase 7: Feature Matrix Section

**File:** `src/components/sections/FeatureMatrix.tsx` (new, replaces Features.tsx)

- Section label: `[PROOF ARSENAL]`
- 10 feature cards in a responsive grid (2-col on desktop, 1-col mobile)
- Each card: feature name, "APA YANG DILAKUKAN" description, expandable "MENGAPA PENTING" detail (using shadcn Collapsible)
- Features listed: Instant Proof Engine, AI Overview Impact Visualizer, Closing Narrative Generator, Proof Score Dashboard, Pitch Intelligence Archive, White-Label Brand Vault, Client-Facing Portal, Shareable Proof Link, Domain Reseller Integration (highlighted badge), Daily Battlefield Intelligence Brief

---

## Phase 8: Segment Selector Section

**File:** `src/components/sections/SegmentSelector.tsx` (new, replaces UseCases.tsx)

- Section label: `[PILIH JALURMU]`
- 3-column cards:
  - Freelancer SEO (Sam persona) - "Mulai $39/bln" CTA
  - Boutique Agency (Alex persona) - "Mulai $79/bln" CTA
  - Agency Elite - "Hubungi Sales" CTA
- Each card: persona name, pain point, key benefit, CTA button

---

## Phase 9: AI Overview + Infrastructure Sections

**File:** `src/components/sections/AIOverview.tsx` (new)
- Full-width dark section with accent-proof (#E8FF47) highlights
- Headline about AI Overview damage
- CTA: "Lihat contoh AI Overview Impact Report"

**File:** `src/components/sections/InfrastructureMoat.tsx` (new)
- "Infrastruktur, Bukan Tool" messaging
- Lock-in/switching cost visualization (simple comparison cards)
- LTV uplift metric: "+60% LTV"

---

## Phase 10: Pricing Rebuild

**File:** `src/components/Pricing.tsx` (update)

- Add ROI framing above tiers: "Rata-rata retainer SEO: $1.500/bln. Satu deal yang closed = 19 bulan subscription gratis."
- Keep 3-tier structure, update copy to Indonesian
- Add Pay-Per-Proof $12 option as a subtle 4th card
- Update CTA labels: "Mulai Sekarang" / "Hubungi Sales"

---

## Phase 11: Category Ownership + CTA + Footer

**File:** `src/components/sections/CategoryOwnership.tsx` (new)
- Proof-First Certified Program section
- Badge visual + cohort timeline
- Application CTA

**File:** `src/components/CTA.tsx` (update)
- Update copy to "Kirim Buktinya. Tutup Dealnya."
- Keep WaitlistForm integration

**File:** `src/components/Footer.tsx` (update)
- Add email capture: "Monthly AI Overview Impact Index" newsletter
- Update link groups to match new nav structure (Produk, Developers, Company, Legal)
- Add "Need Agency seats? Talk to us" with email field

---

## Phase 12: Index.tsx Page Assembly

**File:** `src/pages/Index.tsx`

New section order:
1. Navbar
2. Hero (with ProofScoreWidget)
3. PainAmplification
4. Understand (keep existing parallax)
5. ProductDemo
6. SocialProof
7. FeatureMatrix
8. SegmentSelector
9. AIOverview
10. InfrastructureMoat
11. Pricing
12. CategoryOwnership
13. FAQ (keep, update copy)
14. CTA
15. Footer

Remove old imports: Problem, HowItWorks, Features, UseCases, Comparison

---

## Files Summary

| File | Action |
|------|--------|
| `src/index.css` | Update: contrast tokens, new classes, reduced-motion |
| `src/components/layout/Navbar.tsx` | Rebuild: dropdown nav + dual CTAs |
| `src/components/sections/Hero.tsx` | Rebuild: info-dense hero with domain input |
| `src/components/sections/ProofScoreWidget.tsx` | Create: domain input + gauge animation |
| `src/components/sections/PainAmplification.tsx` | Create: 3-col dead loop section |
| `src/components/sections/ProductDemo.tsx` | Create: animated proof engine demo |
| `src/components/sections/SocialProof.tsx` | Create: stats bar + testimonials |
| `src/components/sections/FeatureMatrix.tsx` | Create: 10-feature expandable grid |
| `src/components/sections/SegmentSelector.tsx` | Create: 3 persona path cards |
| `src/components/sections/AIOverview.tsx` | Create: AI Overview damage section |
| `src/components/sections/InfrastructureMoat.tsx` | Create: infrastructure moat |
| `src/components/sections/CategoryOwnership.tsx` | Create: certified program |
| `src/components/Pricing.tsx` | Update: ROI framing + Indonesian copy |
| `src/components/CTA.tsx` | Update: Indonesian copy |
| `src/components/Footer.tsx` | Update: newsletter capture + restructured links |
| `src/pages/Index.tsx` | Update: new section assembly |

No new dependencies. All interactive UI uses shadcn components (Collapsible, Popover, Input, Button). CSS animations only (max 400ms for interactions, longer for decorative loops). All text meets WCAG AA contrast minimums.

