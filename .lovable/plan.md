

# Backfill Missing CSS Component Styles from xai-redesign.html

## Problem
The current `src/index.css` has ~290 lines covering tokens, buttons, nav basics, hero basics, and VEXLO-specific additions. But the xai-redesign.html reference contains ~430 lines of CSS with dozens of component-level styles that were never transplanted. These missing classes mean any component referencing them gets no styling.

## What's Missing (grouped by component)

### 1. Missing Tokens (add to `:root`)
- `--ease-material` (advanced linear easing curve)
- `--emboss-shadow-less-hover`
- `--radii-right-mini`, `--radii-left-mini`
- `color-scheme: light dark` on `:root`

### 2. Missing Global Styles
- `body { overflow-x: hidden; min-height: 100vh; }`
- `.text-wrap-content` utility class

### 3. Missing Nav Styles
- `.nav-links` (flex container for nav items)
- `.nav-links a` (mono font, 10.5px, uppercase, hover states)
- `.nav-cta` (the nav-level CTA button variant)

### 4. Missing Hero Component Styles
- `.hero-top` (flex layout for headline area)
- `.hero-search-wrap`, `.hero-search-form`, `.hero-search-inner` (search box container with gradient border)
- `.hero-search-form textarea` (transparent input styling)
- `.hero-search-submit` (circular submit button)
- `.hero-bottom` (bottom bar with scroll icon + announcement)
- `.hero-scroll-icon` + bounce animation
- `.hero-ann`, `.ann-tag`, `.ann-text`, `.ann-link` (announcement strip)

### 5. Missing Products Section Styles
- `.products-section` (padding + border)
- `.products-header`, `.products-h2`, `.products-desc` (header layout)
- `.product-flagship` needs the 2-col grid variant from the reference (current version is a simple card)
- `.product-flagship-content` (content half with border-right)
- `.product-tag`, `.product-name`, `.product-desc` (product text hierarchy)
- `.product-flagship-visual` (visual half with radial gradient)
- `.grok-visual`, `.grok-ring` (x3), `.grok-center` (spinning ring animation)
- `.product-utilities`, `.product-card` (utility cards grid)

### 6. Missing Understand Section Styles
- `.understand-section` (min-height, flex centering, cursor:none)
- `.understand-atmo` (atmospheric gradient with mask)
- `.understand-line-sep` (top gradient separator)
- `.understand-text` (text container)
- `.understand-line`, `.understand-line-1`, `.understand-line-2` (gradient text fills -- different from current `.st-line` approach)

### 7. Missing SuperGrok Section Styles
- `.supergrok-section`, `.supergrok-atmo`, `.supergrok-sep`
- `.supergrok-inner`, `.sg-wordmark`, `.sg-title`, `.sg-subtitle`
- `.sg-badge`, `.sg-actions`

### 8. Missing Statement Section
- `.statement-section`, `.statement-lines`
- The `.st-line` class in the reference uses `font-family: var(--sans)` and `font-weight: 300` -- different from current implementation which uses `var(--serif)`

### 9. Missing News Section Styles
- `.news-section`, `.news-header`, `.news-h2`
- `.news-item` (grid layout: date | title | arrow)
- `.news-date`, `.news-title`, `.news-excerpt`
- `.news-meta`, `.news-category`, `.news-arrow`

### 10. Missing Footer Styles
- `.footer-grid` (5-column grid)
- `.footer-brand`, `.footer-tagline`
- `.footer-col-title`, `.footer-links`
- `.footer-bottom`, `.footer-legal`

### 11. Missing Interactive Styles
- `.question-tooltip` (floating tooltip with backdrop-filter)

## Implementation

**Single file edit:** `src/index.css`

All missing styles will be added inside the existing `@layer components { }` blocks or as new blocks after the existing content. The approach:

1. Add missing tokens to `:root` (4 new variables)
2. Add `overflow-x: hidden` and `min-height: 100vh` to body
3. Add `.text-wrap-content` utility
4. Add all missing nav styles (`.nav-links`, `.nav-links a`, `.nav-cta`)
5. Add all missing hero sub-component styles (search box, bottom bar, announcement)
6. Add all missing products section styles (header, flagship grid, product cards, grok visual)
7. Add full understand section styles (atmosphere, gradient text lines, separator)
8. Add supergrok section styles
9. Add statement section + update `.st-line` to match reference (sans-serif, weight 300)
10. Add news section styles
11. Add footer component styles
12. Add question tooltip styles

**Note on `.st-line` conflict:** The current `index.css` defines `.st-line` with `font-family: var(--serif)` while the xai-redesign.html uses `var(--sans)` with `font-weight: 300`. The reference version will be added as the canonical definition. The existing `.st-line` in `Understand.tsx` may need its usage reviewed after this change, but since it's the same class name the reference styling will take precedence.

**No new files created. No dependencies added. Single file update only.**
