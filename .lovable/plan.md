

# Plan: Restyle All Remaining Landing Page Sections to VEXLO Design Spec

## Current State Assessment

All 7 sections exist but deviate from the locked design tokens in the prompt pack. The main issues:

- **index.css** is missing the global `.btn-primary`, `.btn-ghost`, `.section-label` classes and CSS custom properties (`--bg`, `--bg-card`, `--accent`, etc.) specified in the prompt pack
- Sections use Tailwind theme tokens (`bg-surface`, `rounded-card`) instead of exact hex values from the design spec
- Section padding should be `100px 40px` with `border-bottom: 1px solid rgba(255,255,255,0.07)` between sections
- FAQ uses a custom accordion instead of shadcn Accordion
- CTA section doesn't use the `WaitlistForm` component and is missing `id="waitlist"`
- Pricing tier names don't match spec ("Pro" should be "Agency Pro")
- Demo section exists in Index.tsx but is not in the prompt pack's section list

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add missing CSS custom properties and utility classes (`.btn-primary`, `.btn-ghost`, `.section-label`) from prompt pack |
| `src/components/Features.tsx` | Restyle: exact padding `100px 40px`, card bg `#0d0d0d`, border `rgba(255,255,255,0.07)`, hover `rgba(255,255,255,0.13)`, section-label class, Instrument Serif h2 |
| `src/components/UseCases.tsx` | Same restyling as Features |
| `src/components/Comparison.tsx` | Same restyling, ensure table uses exact design tokens |
| `src/components/Pricing.tsx` | Rename "Pro" to "Agency Pro", featured border `rgba(255,99,8,0.4)`, badge "MOST POPULAR", use `.btn-primary` for featured / `.btn-ghost` for others |
| `src/components/FAQ.tsx` | Replace custom accordion with shadcn `Accordion` component, keep 8 questions |
| `src/components/CTA.tsx` | Add `id="waitlist"`, bg `#0d0d0d`, replace inline form with `WaitlistForm` component (source="footer_cta"), add pill-shaped guarantee badges (Space Mono 8px, border `rgba(255,255,255,0.13)`, border-radius 100px) |
| `src/components/Footer.tsx` | Restyle with exact design tokens, 4-column grid |
| `src/pages/Index.tsx` | Remove Demo section import and `<div id="demo">`, add border-bottom between sections |

## No Supabase Changes Needed

- No new tables
- No edge functions
- No new React state (existing component state is sufficient)

## shadcn Components Needed

- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` (for FAQ)
- `Input`, `Button` (already used via WaitlistForm in CTA)

## Top 3 Edge Cases

1. **section-label class conflict** -- The `.section-label` class from prompt pack uses `::before` / `::after` pseudo-elements for bracket decoration. Must ensure this doesn't conflict with existing Tailwind styles.
2. **CTA WaitlistForm integration** -- The CTA section needs to center the WaitlistForm and pass `source="footer_cta"`. The form is already built and tested, so this is low risk.
3. **Tailwind theme token vs hardcoded hex** -- Some sections use Tailwind tokens like `bg-surface`. Switching to inline `style={{ backgroundColor: '#0d0d0d' }}` is more faithful to the spec but less maintainable. Approach: use Tailwind where the token maps correctly, hardcode hex only where the spec demands exact values not in the theme.

## Risk Assessment

**Low risk.** All changes are cosmetic restyling of existing components. No logic changes, no Supabase queries, no auth modifications. The WaitlistForm integration in CTA is the only functional change (replacing a dummy `console.log` form with the real Supabase-connected component).

## Implementation Order

Build each section one at a time in this order:

1. **index.css** -- Add global utility classes first (`.btn-primary`, `.btn-ghost`, `.section-label`)
2. **Features** -- 3x2 grid, 6 feature cards
3. **UseCases** -- 3 columns
4. **Comparison** -- Table restyling
5. **Pricing** -- 3 tiers with correct names and styling
6. **FAQ** -- Swap to shadcn Accordion
7. **CTA** -- Integrate WaitlistForm, add guarantee badges
8. **Footer** -- Final restyling
9. **Index.tsx** -- Remove Demo, add section border-bottoms

## Technical Notes

- The `section-label` class adds `[` and `]` brackets via CSS pseudo-elements per the spec
- Pricing CTA buttons will use the global `.btn-primary` and `.btn-ghost` classes rather than Tailwind approximations
- FAQ accordion will use shadcn's `Accordion` with `type="single"` and `collapsible` prop
- All sections get consistent `py-[100px] px-10` padding and bottom border separator

