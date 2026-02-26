

# Fix Contrast Ratios + Add Stats to Hero

## Task 1: Fix WCAG Contrast Ratios

**Problem:** 12 component files use hardcoded `rgba(240,240,238,0.45)` and `rgba(240,240,238,0.25)` instead of the WCAG-fixed CSS variables (`--text-dim` at 0.55 opacity, `--text-muted` at 0.55 opacity). These hardcoded values fail WCAG AA contrast (4.5:1 minimum).

**Fix:** Replace all hardcoded rgba values with the CSS variable equivalents:
- `rgba(240,240,238,0.45)` --> `var(--text-dim)` 
- `rgba(240,240,238,0.25)` --> `var(--text-muted)`
- `rgba(240,240,238,0.42)` --> `var(--text-dim)` (closest match, bumped to 0.55)

**Files affected (12 files):**

| File | Hardcoded values to replace |
|------|---------------------------|
| `src/components/sections/Problem.tsx` | 0.45 x2, 0.25 x1 |
| `src/components/sections/HowItWorks.tsx` | 0.45 x1, 0.42 x1 |
| `src/components/sections/FeatureMatrix.tsx` | 0.42 x1 |
| `src/components/sections/AIOverview.tsx` | 0.42 x1 |
| `src/components/sections/ProductDemo.tsx` | 0.42 x1 |
| `src/components/sections/CategoryOwnership.tsx` | 0.42 x1 |
| `src/components/sections/SegmentSelector.tsx` | 0.42/0.45 instances |
| `src/components/sections/WaitlistForm.tsx` | 0.25 x1 |
| `src/components/sections/InfrastructureMoat.tsx` | 0.42 x1 |
| `src/components/Pricing.tsx` | 0.42 x1 |
| `src/components/Comparison.tsx` | 0.25 x1 |
| `src/components/layout/DashboardLayout.tsx` | 0.45 x4 |

---

## Task 2: Add Colossus-Style Stats Strip to Hero

**What:** Add a horizontal stats bar below the trust badges in the Hero section, inspired by xai's "200K GPUs" infrastructure stats but adapted for VEXLO's context.

**Stats to display (4 items):**
- `23,847` -- Proofs Generated
- `< 30s` -- Average Proof Time  
- `0` -- Permissions Required
- `$4.2M` -- Deals Closed by Users

**Design:** Reuses the existing `.stats-bar` CSS class pattern (mono font, uppercase labels, grid layout). This also **removes the duplicate** "23.847 proof generated" text line currently in the hero since the stats bar replaces it.

**File:** `src/components/sections/Hero.tsx`

### Changes to Hero.tsx:
1. Replace the static "23.847 proof generated..." text with a 4-column stats bar
2. Each stat uses `font-mono` text with `--text` color for the number and `--text-muted` for the label
3. Responsive: 2x2 grid on mobile, 4-column on desktop

---

## Technical Details

- All contrast fixes use `var(--text-dim)` and `var(--text-muted)` CSS variables (both set to `rgba(240,240,238,0.55)` in `:root`)
- No new dependencies or files needed
- Total: ~13 files edited (12 contrast fixes + 1 hero enhancement)
