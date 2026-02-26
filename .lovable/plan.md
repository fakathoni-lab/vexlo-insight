

# Refine Hero Stats Bar — `src/components/sections/Hero.tsx` only

## DO NOT CHANGE
- Starfield canvas animation
- ProofScoreWidget (CTA/search bar)
- Trust badges content and styling
- Headline, eyebrow, subtitle

## Fixes (3 items)

### 1. Tighten stats spacing
- Reduce `max-w-[600px]` to `max-w-[480px]` on the stats grid
- Reduce `gap-6` to `gap-4`
- This pulls the 4 stats closer together

### 2. Adjust stats text sizes
- Stat values: reduce from `text-2xl` to `text-lg` (less overpowering)
- Stat labels: bump from `text-[8px]` to `text-[9px]` for readability

### 3. Reorder: stats strip above trust badges (swap positions)
- Move the stats grid block (lines 49-69) **below** the trust badges block (lines 71-89)
- Result: ProofScoreWidget -> Trust badges -> Stats strip

## Technical detail
Only lines 49-89 of `Hero.tsx` are affected. All changes are class/order swaps within the existing JSX.
