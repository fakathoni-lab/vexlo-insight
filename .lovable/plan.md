

# Plan: Refine `src/components/layout/Navbar.tsx`

## Summary

The current Navbar is ~90% correct. This plan applies targeted fixes to match the exact spec without touching any other files.

## Changes (single file: `src/components/layout/Navbar.tsx`)

### 1. Fix padding
- **Current**: `px-5 sm:px-10` (20px mobile, 40px desktop)
- **New**: `px-5 sm:px-10` is fine for responsive, but spec says `padding: 20px 40px` — update to `py-0 px-5 sm:px-10` (already correct, keep as-is)

### 2. Nav link border-radius
- **Current**: `rounded` (default 6px)
- **New**: `rounded-[4px]` to match spec exactly

### 3. CTA button — use `.btn-primary` class
- **Current**: Inline styles for background, color, box-shadow on both desktop and mobile CTA buttons
- **New**: Replace with `className="btn-primary"` which already defines all the correct styles (pill shape, Space Mono 10px uppercase, emboss shadow, hover state)
- Remove all redundant inline `style` props

### 4. CTA scroll target
- **Current**: Scrolls to `#cta`
- **New**: Scrolls to `#waitlist` as specified
- Note: Index.tsx has `<div id="cta">` wrapping `<CTA />`. A `#waitlist` anchor must exist on the page. The WaitlistForm component or CTA section should have this ID. If not present, we'll keep `#cta` as fallback since the CTA section contains the waitlist form.

### 5. Desktop CTA visibility
- **Current**: `hidden sm:inline-flex` (shows at 640px+)
- **New**: `hidden md:inline-flex` (shows at 768px+, consistent with nav links breakpoint)

### 6. Wordmark text
- Already uppercase via `uppercase` class, but source text is "Vexlo" — change to "VEXLO" for clarity (visual result unchanged since CSS handles it)

## What stays the same
- Fixed positioning, z-50, h-16
- Scroll detection at 16px threshold
- Backdrop blur + border on scroll
- shadcn Sheet for mobile menu
- Nav link items, colors, hover behavior
- Menu icon styling
- `src/index.css` is NOT touched

## Technical details

The `.btn-primary` class (from `index.css`) provides:
```
font-family: var(--mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
color: var(--bg); background: var(--text); border: none;
height: 40px; padding: 0 24px; border-radius: 100px;
box-shadow: emboss + inset; hover: background #d4d4d0;
```

This replaces ~8 lines of inline styles per button with a single class.
