

# Add Subtle Hover Effect to Hero Stats Strip Items

## File: `src/components/sections/Hero.tsx`

## What stays unchanged
- Starfield canvas, headline, subtitle, eyebrow
- ProofScoreWidget, trust badges
- Stats values, labels, dividers, layout/spacing

## Change
Add a subtle hover effect to each stat item in the stats strip:
- On hover: slight background highlight using `rgba(255,255,255,0.04)` with rounded corners (`rounded-lg`)
- CSS transition: `transition-colors duration-300` (within the 400ms constraint)
- Applied to the inner `div` wrapping each stat's value + label (the `px-4 py-1` container)

This is a single-line class addition — no structural changes needed.

