

# Plan: Phase 1B — Setup Design Tokens in `src/index.css`

## Problem

The user's spec replaces the entire `index.css` with new design token variables (`--bg`, `--bg-card`, `--text`, etc.) and updated utility classes. However, the current codebase has **462 usages across 37 files** of Tailwind classes like `bg-background`, `text-foreground`, `text-muted-foreground` that depend on the existing HSL-based CSS variables (`--background`, `--foreground`, `--border`, etc.) consumed through `tailwind.config.ts`.

Doing a raw replacement would break every shadcn/ui component and all pages.

## Solution

Replace `src/index.css` with the user's spec **plus** retain the HSL-based variables needed by Tailwind/shadcn in a `:root` block. This gives us:

- All new design tokens (`--bg`, `--bg-card`, `--text-dim`, `--accent`, `--mono`, `--serif`, `--sans`, easing curves, etc.)
- Updated `.btn-primary` with proper hover (`#d4d4d0` instead of `filter: brightness`)
- Updated `.btn-ghost` with `--emboss-shadow-less` and refined hover
- Updated `.section-label` with `9px` font, `0.2em` tracking, `56px` margin-bottom, `--text-muted` color
- Preserved HSL variables so `bg-background`, `text-foreground`, `text-accent`, `text-muted-foreground` etc. continue working in all 37 files

## Single File Change

**`src/index.css`** — Full replacement with:

1. Font import via `@import url(...)` at top
2. Tailwind directives
3. `:root` block containing:
   - All new design tokens from the user's spec (verbatim)
   - Existing HSL variables for Tailwind compatibility (`--background`, `--foreground`, `--border` as HSL channels, `--muted`, `--ring`, `--input`, `--accent` as HSL, radius tokens)
4. `html` and `body` base styles using new variables
5. Global `*` border-color rule for shadcn compatibility
6. `.btn-primary`, `.btn-ghost`, `.section-label` exactly as specified
7. Keep `::selection` and scrollbar styles (updated to use new variables)
8. Remove the old `.landing-section` class (sections now handle their own padding)

## What Changes vs Current

| Item | Current | New |
|------|---------|-----|
| `.btn-primary` hover | `filter: brightness(1.1)` | `background: #d4d4d0` + shadow change |
| `.btn-ghost` | no shadow | `--emboss-shadow-less` |
| `.section-label` color | `hsl(var(--accent))` (orange) | `--text-muted` (subtle gray) |
| `.section-label` margin | `12px` | `56px` |
| `.section-label` size | `10px` | `9px`, `0.2em` tracking |
| New variables | -- | `--bg-raised`, `--bg-card`, `--text-dim`, `--text-muted`, `--ease-back-out`, `--ease-circ-out`, `--ease-quart-in-out`, `--emboss-shadow-hover`, `--emboss-shadow-less`, `--taxbutton-height` |
| Font import | In `index.html` `<link>` | Duplicated via CSS `@import` (belt-and-suspenders) |

## No Other Files Modified

Only `src/index.css` is touched. The `tailwind.config.ts` and all component files remain unchanged because the HSL variables they depend on are preserved.

