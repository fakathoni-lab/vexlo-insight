
# Improve Early Access Conversion Copy + Align to Purple Brand

## Overview
Text-only copy updates across 8 component files + color system migration from orange (#ff6308) to purple (#7C3AED) across CSS and all component files with hardcoded orange references. No layout, structure, or Supabase logic changes.

---

## Files Changed (8 total)

### 1. `src/index.css` — Color System Update
**What changes:**
- `:root` variable `--accent` from `#ff6308` to `#7C3AED`
- Add new tokens: `--accent-light: #9333EA`, `--accent-glow: #A855F7`, `--accent-dim: rgba(124,58,237,0.12)`, `--accent-border: rgba(124,58,237,0.25)`
- `--accent-hsl` from `22 100% 52%` to `263 84% 58%`
- `--ring` from `22 100% 52%` to `263 84% 58%`
- `.ann-tag`: `background` from `rgba(255,99,8,0.12)` to `rgba(124,58,237,0.12)`, `border` from `rgba(255,99,8,0.3)` to `rgba(124,58,237,0.30)`
- `.product-flagship-visual`: radial-gradient `rgba(255,99,8,0.06)` to `rgba(124,58,237,0.06)`
- `.grok-ring:nth-child(2)`: `border-color` from `rgba(255,99,8,0.18)` to `rgba(124,58,237,0.22)`
- `.understand-atmo`: replace orange gradient stops with purple
- `.understand-orb`: replace orange gradient stop with purple
- `.supergrok-atmo`: replace orange gradient stops with purple
- `.sg-badge`: 3 values — color, background, border — all from orange to purple
- `::selection`: from `hsla(22, 100%, 52%, 0.3)` to `hsla(263, 84%, 58%, 0.3)`

### 2. `src/components/sections/Hero.tsx` — Copy Update
**Current → New:**
- Eyebrow: `'Sales Proof Intelligence'` → `'Pre-Sale Revenue Infrastructure'`
- Tagline: current text → `'Generate branded, prospect-specific SEO proof in under 60 seconds. No access. No waiting. No skill gap in the room.'`
- ann-label: `'VEXLO Early Access — Founding Members Open:'` → `'VEXLO Early Access — Founding Members Open:'` (keep)
- ann-sub: current → `'17 of 50 founding member slots claimed. Lifetime deal at $149 — locked in forever.'` (already correct — keep)
- ann-btn: `'Claim Your Slot'` → `'Claim Founding Member Access'`

### 3. `src/components/sections/Problem.tsx` — Copy Update
**Current → New:**
- Section label color: `hsl(22,100%,52%)` → `var(--accent)` (2 instances)
- Section label text: `'The Problem'` → `'The Revenue Gap'`
- H2: current 3 lines → `'Skill doesn't close deals. Proof does.'` + italic line `'And you don't have it fast enough.'`
- Body paragraph: new text as specified
- Card 1: tag `'Time Sink'` kept, title + body updated
- Card 2: tag `'Trust Killer'` kept, title + body updated  
- Card 3: tag `'Lost Deal'` kept, title + body updated

### 4. `src/components/sections/HowItWorks.tsx` — Copy Update
**Current → New:**
- Section label color: `hsl(22,100%,52%)` → `var(--accent)` (2 instances)
- H2: `'Three steps to undeniable proof.'` → `'Proof in under 60 seconds.'` + italic `'Before the call ends.'`
- Step 1: number `'01'`, title → `'Enter any prospect domain + keyword'`, body updated, label prefix `'01 — INPUT'`
- Step 2: number `'02'`, title → `'VEXLO builds the proof report'`, body updated, label prefix `'02 — GENERATE'`
- Step 3: number `'03'`, title → `'Share. Present. Win.'`, body updated, label prefix `'03 — CLOSE'`
- Step label color: `hsl(22,100%,52%)` → `var(--accent)`

### 5. `src/components/Pricing.tsx` — Copy Update
**Current → New:**
- Section label: `'Pricing'` → `'Founding Member Pricing'`
- ROI framing box: replace Indonesian text with `'50 founding members only. Price increases once seats are gone.'`
- H2: replace Indonesian → `'Early access pricing.'` + italic `'Locked in forever.'`
- Tier 1: desc → `'Solo Freelancer'`, CTA → `'Start Closing'`
- Tier 2: desc → `'Growing Operator'`, CTA → `'Claim Founding Slot'`
- Tier 3: name `'Agency Elite'` → `'Elite'`, desc → `'Scale Operator'`, CTA → `'Lock Elite Access'`
- Featured badge color: `hsl(22,100%,52%)` → `var(--accent)`
- Featured border: `rgba(255,99,8,0.4)` → `rgba(124,58,237,0.4)`
- Check icon color: `var(--accent)` (already uses variable — auto-updates)
- Pay-per-proof box: update Indonesian text to English

### 6. `src/components/CTA.tsx` — Copy Update
**Current → New:**
- H2: `'Kirim Buktinya. Tutup Dealnya.'` → `'Stop losing deals to the proof gap.'`
- Sub: Indonesian text → `'Join 17 SEO freelancers who will close their next client in the first 60 seconds of the call.'`
- Badge labels: Indonesian → English (`'Free to Join'`, `'60-Second Setup'`, `'No Card Required'`, `'Cancel Anytime'`)
- Add scarcity text below badges: `'Founding member pricing locked in for life. 50 slots only. 33 remaining.'`

### 7. `src/components/FAQ.tsx` — Complete Q&A Replacement
Replace all 8 existing FAQs with the 8 new Q&A pairs specified in the task. No structural changes to the Accordion component.

### 8. `src/components/Footer.tsx` — Copy Update
**Current → New:**
- Newsletter label: keep `'Monthly AI Overview Impact Index'` (already English)
- Newsletter body: Indonesian → `'Data from thousands of proof reports you can't get from any other tool.'`
- Newsletter button: Indonesian → `'Get Free Report'`
- Footer link group 1 title: `'Produk'` → `'Product'`
- Agency seats text: already English — keep
- Legal line: already correct (`'© 2026 VEXLO — All rights reserved'`) — keep

### 9. `src/components/sections/WaitlistForm.tsx` — Color + Copy Update
- Focus ring: `hsl(22,100%,52%)` → `hsl(263,84%,58%)`
- Success state color: `hsl(22,100%,52%)` → `hsl(263,84%,58%)`
- Placeholder: `'you@agency.com'` → `'Your work email — we'll send access details'`
- Button text: `'Join Waitlist'` → `'Secure My Founding Slot'`

### 10. `src/pages/Login.tsx` — Color Update Only
- Focus ring (2 inputs): `hsl(22,100%,52%)` → `hsl(263,84%,58%)`
- Sign up link color: `hsl(22,100%,52%)` → `hsl(263,84%,58%)`

### 11. `src/pages/Signup.tsx` — Color Update Only
- Focus ring (3 inputs): `hsl(22,100%,52%)` → `hsl(263,84%,58%)`
- Sign in link color: `hsl(22,100%,52%)` → `hsl(263,84%,58%)`

### 12. `src/components/sections/SegmentSelector.tsx` — Color Update Only
- Featured border: `rgba(255,99,8,0.4)` → `rgba(124,58,237,0.4)`
- Badge background: `hsl(22,100%,52%)` → `var(--accent)`

---

## Execution Order
1. `src/index.css` — color tokens + all orange references in CSS
2. `src/components/sections/Hero.tsx` — copy
3. `src/components/sections/Problem.tsx` — copy + color
4. `src/components/sections/HowItWorks.tsx` — copy + color
5. `src/components/Pricing.tsx` — copy + color
6. `src/components/CTA.tsx` — copy
7. `src/components/FAQ.tsx` — copy
8. `src/components/Footer.tsx` — copy
9. `src/components/sections/WaitlistForm.tsx` — color + copy
10. `src/pages/Login.tsx` — color
11. `src/pages/Signup.tsx` — color
12. `src/components/sections/SegmentSelector.tsx` — color

## What Is NOT Touched
- All layout/structure unchanged
- All Supabase hooks/config untouched
- All shadcn/ui components preserved
- Section order preserved
- No new sections added
- No file/folder structure changes
- `--bg`, `--text`, `--border`, `--font-*` variables unchanged
