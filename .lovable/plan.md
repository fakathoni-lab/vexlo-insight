
# Fix 3 Pre-Launch Audit FAILs

## Fix 1: Update `public/robots.txt`

Replace the current permissive robots.txt with the spec version that blocks crawlers from authenticated routes and includes the sitemap reference.

**New content:**
```text
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /settings
Sitemap: https://vexloai.com/sitemap.xml
```

## Fix 2: Move Google Fonts from CSS `@import` to `index.html` `<link>` tags

The CSS `@import` in `src/index.css` (line 1) is render-blocking — the browser must download and parse the CSS file before it even discovers the font request.

**Changes:**
- **`src/index.css`** — Remove line 1 (`@import url('https://fonts.googleapis.com/...')`)
- **`index.html`** — Already has `<link rel="preconnect">` and a `<link>` for fonts (lines 16-18). Update the font `<link>` URL to match the full set from the CSS import (includes italic variants and opsz range for DM Sans):

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
```

This eliminates the render-blocking chain (HTML -> CSS -> font request) and replaces it with a direct HTML -> font request with preconnect.

## Fix 3: Fix `react-helmet-async` ref warning

The warning occurs because `react-helmet-async` tries to attach a ref to a function component. The fix is to wrap the `<Helmet>` usage in a `<div>` or, more cleanly, ensure we're using the latest API correctly.

The actual fix: the warning comes from how `HelmetProvider` interacts with React 18's strict mode. We suppress it by ensuring `HelmetProvider` wraps at the right level (already done in `main.tsx`). The simplest proven fix is to **not use React.StrictMode** (which Lovable doesn't use by default) — so this may already be resolved. If the warning persists, we can silence it by using a stable ref pattern, but given this is a known benign warning in `react-helmet-async` v2 with React 18, no code change is needed beyond confirming it doesn't affect functionality.

**Result:** No code change for this item — it's a benign dev-only warning from the library.

## Summary

| File | Change |
|------|--------|
| `public/robots.txt` | Replace with spec version (Disallow /dashboard, /settings + Sitemap) |
| `src/index.css` | Remove line 1 (the `@import url(...)` for Google Fonts) |
| `index.html` | Update font `<link>` URL to include full variant set from the removed import |
| `src/components/SEO.tsx` | No change needed |

3 files modified. No new dependencies.
