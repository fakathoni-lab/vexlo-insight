

# Sprint 1 — Critical Fixes (4 Tasks)

Following the one-feature-at-a-time build approach, here is the sequenced plan. Each task is independent and will be implemented in separate turns.

---

## Task 1: Enhance Social Proof Section (Logo Bar)
**Impact:** Trust transformation | **Effort:** ~1 day

The current `SocialProof.tsx` has animated stats and 2 testimonial cards but is **missing a logo bar** — the most common trust signal on SaaS landing pages.

### Changes
| File | Action |
|------|--------|
| `src/components/sections/SocialProof.tsx` | Add logo/partner bar above stats, add 1-2 more testimonials |
| `src/index.css` | Add `.logo-bar` styles (grayscale logos, auto-scroll on mobile) |

### What gets added
- A horizontal row of 6-8 placeholder agency/partner logos (grayscale, opacity 0.4, hover to 0.7)
- "Dipercaya oleh 200+ agency" label above the logos using `.section-label` pattern
- Optional: ticker-scroll animation on mobile using existing `ticker-scroll` keyframe
- 1-2 additional testimonial cards for more social weight

---

## Task 2: Create Dedicated /pricing Page
**Impact:** SEO capture + conversion clarity | **Effort:** ~1 day

Currently Pricing is an inline component on the homepage. A dedicated `/pricing` route improves SEO (captures "vexlo pricing" queries) and lets the nav link directly to it.

### Changes
| File | Action |
|------|--------|
| `src/pages/PricingPage.tsx` | New page wrapping existing `Pricing` component with Navbar, Footer, SEO, and FAQ |
| `src/App.tsx` | Add `/pricing` route |
| `src/components/layout/Navbar.tsx` | Update "Pricing" link from `#pricing` to `/pricing` |
| `src/components/Pricing.tsx` | Minor: add optional `showFAQ` prop for reuse |

### Page structure
```text
SEO (title: "Pricing — VEXLO")
Navbar
Pricing (existing component, reused)
FAQ (filtered to pricing-related questions)
CTA
Footer
```

---

## Task 3: Restructure Nav into 4 Groups
**Impact:** IA clarity | **Effort:** ~0.5 day

Current nav has 3 groups (Produk, Developers, Company). Adding a 4th "Resources" group improves information architecture.

### Changes
| File | Action |
|------|--------|
| `src/components/layout/Navbar.tsx` | Restructure `navGroups` into 4 groups, update items |
| `src/components/Footer.tsx` | Mirror the 4-group structure in footer links |

### New nav structure
```text
Produk          Resources        Developers       Company
- Proof Engine  - Blog           - API Docs       - About / Mission
- AI Overview   - Case Studies   - Integrations   - Team
- Features      - FAQ            - White-label     - Certified Program
- Pricing (/pricing)  - Help Center                - Contact
```

---

## Task 4: Create /company Page with Team Section
**Impact:** Trust signal | **Effort:** ~1 day

No `/company` page exists. This adds a public-facing page with mission statement and team/leadership cards.

### Changes
| File | Action |
|------|--------|
| `src/pages/Company.tsx` | New page with mission + team sections |
| `src/App.tsx` | Add `/company` route |
| `src/components/layout/Navbar.tsx` | Update "Mission" and "Team" links to `/company` and `/company#team` |

### Page structure
```text
SEO (title: "Company — VEXLO")
Navbar
Mission section (hero-style statement with .st-line typography)
Team grid (4-6 cards with name, role, photo placeholder, LinkedIn)
Company values (3 cards: Transparency, Speed, Proof-First)
CTA
Footer
```

### Team card design
- Uses `.bg-card` + `.border` tokens
- Avatar placeholder (initials in a circle, accent border)
- Name in `font-headline`, role in `font-mono` uppercase
- Follows existing card pattern from Pricing component

---

## Recommended Build Order

1. **Task 3** first (nav restructure) — smallest change, unblocks link targets for Tasks 2 and 4
2. **Task 1** (social proof logos) — standalone, no dependencies
3. **Task 2** (/pricing page) — depends on nav having correct link
4. **Task 4** (/company page) — depends on nav having correct link

Each task will be implemented in a separate turn per the build workflow rules.
