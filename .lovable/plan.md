

# Replace index.css with Complete xai-redesign Stylesheet

## The Problem

The user provided a complete CSS file to replace `src/index.css`. However, a direct copy-paste would **break the app** because the provided CSS is missing several critical pieces that the current file has.

## What the Provided CSS is Missing

1. **Tailwind directives** -- The current file starts with `@tailwind base; @tailwind components; @tailwind utilities;`. Without these, all Tailwind utility classes and shadcn/ui components stop working entirely.

2. **HSL variables for shadcn compatibility** -- The current file has `--background`, `--foreground`, `--accent-hsl`, `--border-hsl`, `--muted-hsl`, `--input`, `--ring`, `--radius-card`, `--radius-button`, `--radius-input`, `--font-headline`, `--font-body`, `--font-mono` (shadcn variant). These are required by shadcn components.

3. **VEXLO-specific accent tokens** -- `--accent-proof: #E8FF47`, `--accent-danger: #FF4747`, `--accent-success: #47FF8F`, `--surface`, `--surface-elevated` are used by existing components (ProductDemo gauge, SocialProof stats, etc.).

4. **WCAG-compliant opacity values** -- The provided CSS uses `--text-dim: rgba(240,240,238,0.45)` and `--text-muted: rgba(240,240,238,0.25)` which fail WCAG AA. The current file already fixed these to `0.55`.

5. **Component-specific styles** -- `.landing-section`, `.stats-bar`, `.testimonial-card`, `.proof-score-gauge`, `.typing-animation`, `.fade-up`, `.bounce-scroll` are used by existing components.

6. **Existing keyframes** -- `blink-caret`, `gauge-fill`, `counter-up`, `ticker-scroll` are used by components.

7. **`::selection` styles and `* { border-color }` reset** for shadcn.

8. **The `@layer components` wrapper** -- Current styles are inside `@layer components {}` which gives them proper Tailwind layer ordering. The provided CSS has no layer wrapping.

## Implementation Plan

Replace the entire `src/index.css` with a merged version that:

1. **Keeps** the 3 Tailwind directives at the top
2. **Adds** the Google Fonts `@import` from the provided CSS
3. **Adds** the universal reset (`*, *::before, *::after { box-sizing... }`)
4. **Merges `:root` tokens:** Takes the provided structure but keeps:
   - WCAG-fixed opacities (`0.55` not `0.45`/`0.25`)
   - All HSL shadcn variables (`--background`, `--foreground`, etc.)
   - VEXLO accent tokens (`--accent-proof`, `--accent-danger`, `--accent-success`, `--surface`, `--surface-elevated`)
   - Font aliases (`--mono`, `--serif`, `--sans`) alongside the new `--font-mono/serif/sans`
   - Mini radii tokens
5. **Keeps** the `* { border-color }` rule and `::selection`
6. **Replaces** base `html`/`body` with the provided version
7. **Wraps all component styles** inside `@layer components {}` for proper Tailwind ordering
8. **Takes all component styles from the provided CSS** (nav, buttons, hero, products, understand, supergrok, statement, news, footer, utility classes) -- these are the canonical xai-redesign versions
9. **Adds back** the VEXLO-specific component styles that the provided CSS doesn't have: `.landing-section`, `.stats-bar`, `.testimonial-card`, `.proof-score-gauge`, `.typing-animation`, `.fade-up`, `.bounce-scroll`, `.nav-cta`
10. **Merges keyframes:** Takes the provided set + adds back `blink-caret`, `gauge-fill`, `counter-up`, `ticker-scroll`
11. **Keeps** `prefers-reduced-motion` media query and scrollbar styles

## Single File Change

| File | Action |
|------|--------|
| `src/index.css` | Full replacement with merged content (~550 lines) |

## Key Decisions

- **Font variable naming:** Keep both `--mono`/`--serif`/`--sans` (used by existing components) AND `--font-mono`/`--font-serif`/`--font-sans` (from provided CSS) as aliases pointing to the same values
- **`.st-line` font:** Use `var(--font-sans)` with `font-weight: 300` as specified in the provided CSS (matching xai-redesign reference). The `Understand.tsx` component already has an inline `fontFamily` override.
- **WCAG compliance:** Override the provided `0.45`/`0.25` opacity with `0.55` to maintain AA contrast

