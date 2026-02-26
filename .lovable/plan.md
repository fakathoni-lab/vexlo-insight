# VEXLO vs xAI Reference — 1:1 Design Audit Report

---

## **FIX #1  Fix --text-muted (0.55 → 0.25) — Hierarki teks hilang total**  *[KRITIS]*

REFINE ONLY: src/index.css (or globals.css)

 

PROBLEM: --text-muted is set to rgba(240,240,238,0.55)

  which is identical to --text-dim. This destroys visual hierarchy.

  Section labels, dates, tags, and muted text all look the same

  as secondary text — there is NO distinction.

 

FIX: Change ONLY this one line:

  FROM: --text-muted: rgba(240,240,238,0.55);

  TO:   --text-muted: rgba(240,240,238,0.25);

 

DO NOT touch any other CSS variable.

DO NOT touch --text-dim.

DO NOT touch any component file.

 

After fix, verify these elements are now VISIBLY DIMMER

than secondary text: section labels, news dates, product tags,

footer column titles, ann-tag, news-category badges.

 

**FIX #2  Fix --text-dim (0.55 → 0.45)**  *[KRITIS]*

REFINE ONLY: src/index.css (or globals.css)

 

FIX: Change ONLY this one line:

  FROM: --text-dim: rgba(240,240,238,0.55);

  TO:   --text-dim: rgba(240,240,238,0.45);

 

NOTE: This may slightly reduce contrast for body text.

  The xAI reference uses 0.45. We match it for visual parity.

  If WCAG compliance is required, document this as intentional deviation.

 

DO NOT touch any other line.

 

**FIX #3  Fix Hero headline font-size — 35% terlalu kecil dari referensi**  *[KRITIS]*

REFINE ONLY: src/components/sections/Hero.tsx

 

PROBLEM: Hero.tsx has an inline style that overrides the CSS class:

  style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}

  This makes the headline 35% smaller than the xAI reference.

 

FIX:

  1. Remove the inline fontSize style entirely from the H1 element.

  2. Ensure the H1 has className='hero-headline' (or equivalent)

     which applies: font-size: clamp(52px, 8.5vw, 120px)

     from globals.css.

 

EXPECTED RESULT: On desktop (1280px), H1 should be ~108px.

  On mobile (390px) should be ~52px minimum.

 

DO NOT change any other property on the headline.

DO NOT add any new inline styles.

 

**FIX #4  Fix products-h2 typography — 3 nilai salah sekaligus**  *[KRITIS]*

REFINE ONLY: src/index.css (or the section where .products-h2 is defined)

 

PROBLEM: .products-h2 has 3 wrong values:

  font-size:      clamp(32px, 5vw, 56px)  ← should be clamp(36px, 5vw, 64px)

  line-height:    1.05                     ← should be 1

  letter-spacing: -0.025em                 ← should be -0.02em

 

FIX: Change .products-h2 to:

  .products-h2 {

    font-family: var(--font-serif);

    font-size: clamp(36px, 5vw, 64px);

    font-weight: 400;

    line-height: 1;

    letter-spacing: -0.02em;

    color: var(--text);

    max-width: 500px;

  }

 

DO NOT touch any other selector.

DO NOT change font-family or color.

 

**FIX #5  Fix spacing — 4 nilai padding/gap salah**  *[MAYOR]*

REFINE ONLY: src/index.css

Fix these 4 spacing values. Change ONLY these lines:

 

1. .product-flagship-content padding:

   FROM: padding: 48px;

   TO:   padding: 52px 48px;

 

2. .product-card padding:

   FROM: padding: 32px;

   TO:   padding: 40px;

 

3. .products-header gap:

   FROM: gap: 16px;

   TO:   gap: 40px;

 

4. .sg-actions gap:

   FROM: gap: 12px;

   TO:   gap: 10px;

 

Also add to .products-header:

   flex-wrap: wrap;

 

Also add to .product-card:

   min-height: 200px;

 

DO NOT change any other CSS property.

 

**FIX #6  Fix body letter-spacing missing**  *[MAYOR]*

REFINE ONLY: src/index.css

 

PROBLEM: body element is missing letter-spacing: 0.25px

 

FIX: Add to body rule:

  body {

    background: var(--bg);

    color: var(--text);

    font-family: var(--font-sans);

    font-size: 16px;

    line-height: 1.5;

    letter-spacing: 0.25px;  ← ADD THIS

    overflow-x: hidden;

    min-height: 100vh;

  }

 

Only add the missing letter-spacing property. Do not change anything else.

 

**FIX #7  Fix Understand.tsx — gunakan CSS classes penuh bukan simplified markup**  *[MAYOR]*

REFINE ONLY: src/components/sections/Understand.tsx

 

PROBLEM: Component uses basic <section> with inline styles instead of

  the full CSS class structure defined in globals.css.

  Missing: .understand-section, .understand-atmo, .understand-line-sep,

           .understand-orb, .understand-text, .understand-line,

           .understand-line-1, .understand-line-2

  Also missing: pointer-events:none and user-select:none on text.

 

FIX: Rewrite the JSX structure to use the CSS classes:

 

  <section className='understand-section' ref={sectionRef}>

    <div className='understand-atmo'></div>

    <div className='understand-line-sep'></div>

    <div className='understand-orb'></div>

    <div className='understand-text'>

      <div

        className='understand-line understand-line-1'

        style={{ transform: `translateX(${offset}px)` }}

        id='uLine1'

      >

        Understand

      </div>

      <div

        className='understand-line understand-line-2'

        style={{ transform: `translateX(${-offset}px)` }}

        id='uLine2'

      >

        The Universe

      </div>

    </div>

  </section>

 

Keep the useParallax hook logic intact.

DO NOT touch other sections.

 

**FIX #8  Implement cursor tooltip di Understand section**  *[MAYOR]*

REFINE ONLY: src/components/sections/Understand.tsx

Add the interactive cursor tooltip feature AFTER Fix #7 is applied.

 

REQUIREMENTS (from xai-redesign.html reference):

  - Custom cursor: cursor:none on .understand-section (already in CSS)

  - Tooltip div: position fixed, pointer-events none, z-index 50

  - Tooltip follows mouse with lerp factor 0.13

  - 12 question strings cycle on hover entry and click

  - Auto-cycle every 3000ms while mouse inside section

  - Tooltip visible class toggles opacity 0 ↔ 1

 

QUESTIONS POOL (exact from reference):

  const QUESTIONS = [

    'What sparked the universe\'s birth?',

    'Are we alone in the cosmos?',

    'What lies beyond the observable universe?',

    'Can entropy be reversed?',

    'What is consciousness, really?',

    'Is time travel physically possible?',

    'What existed before the Big Bang?',

    'How many dimensions are there?',

    'What is dark matter made of?',

    'Could physics differ elsewhere in the multiverse?',

    'Where does mathematics come from?',

    'What happens at a black hole singularity?',

  ]

 

TOOLTIP STYLE (from CSS):

  position: fixed; pointer-events: none; z-index: 50;

  background: rgba(8,8,8,0.84); backdrop-filter: blur(16px);

  border: 1px solid var(--border-strong); border-radius: 12px;

  padding: 9px 16px; font-family: var(--font-mono); font-size: 10.5px;

  letter-spacing: 0.04em; color: rgba(240,240,238,0.78);

  max-width: 300px; text-align: center;

  opacity: 0 (default) → 1 when .visible class added

  transform: translate(-50%, calc(-100% - 14px))

  transition: opacity 0.3s var(--ease-circ-out)

 

USE React state and useEffect for the mouse/lerp/interval logic.

Render tooltip as a React Portal to document.body.

DO NOT use any external library for the tooltip.

 

**FIX #9  Fix ann-tag border missing**  *[MINOR]*

REFINE ONLY: src/index.css

 

PROBLEM: .ann-tag is missing its border.

 

FIX: Add border to .ann-tag:

  .ann-tag {

    font-family: var(--font-mono);

    font-size: 8.5px;

    letter-spacing: 0.16em;

    text-transform: uppercase;

    color: var(--accent);

    border: 1px solid rgba(255, 99, 8, 0.3);  ← ADD THIS

    padding: 3px 9px;

    border-radius: 100px;

  }

 

Change ONLY the .ann-tag rule. Do not touch any other selector.

 

**FIX #10  Fix supergrok-sep — width 80% centered + opacity 0.35**  *[MINOR]*

REFINE ONLY: src/index.css

 

PROBLEM: .supergrok-sep is full-width and missing opacity.

  FROM (wrong):

    left: 0; right: 0; (100% width)

    no opacity set

 

FIX: Change .supergrok-sep to:

  .supergrok-sep {

    position: absolute;

    top: 0;

    left: 50%;

    transform: translateX(-50%);

    width: 80%;       ← 80% not 100%

    height: 1px;

    background: linear-gradient(90deg,

      transparent, rgba(255,255,255,0.3), transparent);

    opacity: 0.35;    ← ADD THIS

  }

 

Also apply same fix to .understand-line-sep if it exists:

  Make it left:0; right:0; (this one IS full width per reference)

  Only supergrok-sep needs 80% width.

 

**FIX #11  Fix canvas aria-hidden pada Hero**  *[MINOR]*

REFINE ONLY: src/components/sections/Hero.tsx

 

PROBLEM: <canvas> element is missing aria-hidden='true'.

  Screen readers will try to interact with it unnecessarily.

 

FIX: Add aria-hidden to the canvas element:

  FROM: <canvas ref={canvasRef} className='hero-canvas' />

  TO:   <canvas

          ref={canvasRef}

          className='hero-canvas'

          aria-hidden='true'

        />

 

One attribute change. Do not touch anything else in Hero.tsx.

 

**FIX #12  Fix Footer legal text — 'VEXLO' all caps + format**  *[MINOR]*

REFINE ONLY: src/components/layout/Footer.tsx

 

PROBLEM: Footer shows 'Vexlo' (title case) with wrong format.

 

FIX: Change the legal text line:

  FROM: '(c) {year} Vexlo. All rights reserved.'

  TO:   '© 2026 VEXLO — All rights reserved'

 

Changes:

  1. 'Vexlo' → 'VEXLO' (all caps — brand standard)

  2. Period → em dash (—)

  3. Dynamic {year} → static 2026

 

Only change this text. Do not touch layout or other footer content.

 

**FIX #13  Add prefers-reduced-motion media query**  *[MINOR]*

REFINE ONLY: src/index.css

 

PROBLEM: No prefers-reduced-motion media query found.

  Users who prefer reduced motion still see all animations.

 

FIX: Add at the END of src/index.css:

 

  @media (prefers-reduced-motion: reduce) {

    *,

    *::before,

    *::after {

      animation-duration: 0.01ms !important;

      animation-iteration-count: 1 !important;

      transition-duration: 0.01ms !important;

      scroll-behavior: auto !important;

    }

  }

 

Add ONLY this block at the very end of the CSS file.

Do not change any existing rules.

 

**FIX #14  Add focus-visible styles**  *[MINOR]*

REFINE ONLY: src/index.css

 

PROBLEM: No explicit focus-visible styles defined.

  Keyboard users cannot see which element is focused.

 

FIX: Add after the scrollbar styles in src/index.css:

 

  /* Focus visible — keyboard accessibility */

  :focus-visible {

    outline: 2px solid var(--accent);

    outline-offset: 3px;

    border-radius: 2px;

  }

 

  /* Remove focus ring for mouse users */

  :focus:not(:focus-visible) {

    outline: none;

  }

 

Add ONLY these two rules. Do not change existing styles.

 

**FIX #15  Verify Twitter handle + domain in footer**  *[MINOR]*

REFINE ONLY: src/components/layout/Footer.tsx

 

Verify and fix these brand elements in the footer:

 

  1. Twitter/X handle: must be '@vexloai'

     NOT '@octopilot' or '@vexlo' or '@xai'

 

  2. Website domain: must be '[vexloai.com](http://vexloai.com)'

     NOT '[octopilot.co](http://octopilot.co)' or '[x.ai](http://x.ai)' or '[vexlo.com](http://vexlo.com)'

 

  3. Any 'Contact' or 'Status' links:

     Use 'vexloai.com/...' as base URL

 

Check all href attributes and text content in Footer.tsx.

Update any that use wrong domain or handle.

Do not change layout or other footer content.

 

**FIX #16  Fix shadcn --radius-button conflict (low risk cleanup)**  *[INFO]*

REFINE ONLY: src/index.css or tailwind.config.ts

 

PROBLEM (low risk): A shadcn variable --radius-button: 4px exists

  alongside the actual button border-radius: 100px.

  Rendered buttons are correct (100px wins via explicit .btn-primary),

  but the variable is misleading and could cause bugs in shadcn components.

 

FIX: Find --radius-button in CSS and update:

  FROM: --radius-button: 4px;  (or 0.25rem)

  TO:   --radius-button: 100px;

 

Also update in tailwind.config.ts if present:

  borderRadius: {

    ...

    button: '100px',  ← update from 4px

  }

 

This is cosmetic cleanup. Lowest priority.

 

 

  


**VERIFICATION CHECKLIST — SETELAH SEMUA FIX**

**⚡  Setelah semua 16 fix diterapkan, jalankan prompt verifikasi ini ke Lovable untuk konfirmasi 1:1.**

 

PLAN MODE — VERIFY: 1:1 Check after 16 fixes applied.

 

Do a quick visual scan and confirm these specific items are now correct:

 

VISUAL HIERARCHY TEST:

[ ] --text:      #f0f0ee   — primary text (brightest)

[ ] --text-dim:  0.45 opacity — clearly dimmer than primary

[ ] --text-muted: 0.25 opacity — MUCH dimmer, barely readable

    → Section labels, product tags, dates must look very subtle

 

HERO TEST:

[ ] H1 headline is ~108px on desktop (not 80px)

[ ] H1 headline min 52px on 390px mobile

[ ] Starfield canvas running (stars visible and pulsing)

[ ] canvas has aria-hidden='true'

 

TYPOGRAPHY TEST:

[ ] Products H2: clamp(36px,5vw,64px) — NOT clamp(32px,5vw,56px)

[ ] Body text has letter-spacing 0.25px

 

SPACING TEST:

[ ] Product flagship content: padding 52px 48px (not equal on all sides)

[ ] Product utility cards: padding 40px (not 32px)

[ ] Products header: gap 40px (header + desc well separated)

 

ANIMATION TEST:

[ ] Understand section: cursor disappears when mouse enters

[ ] Tooltip follows mouse with smooth lerp

[ ] Tooltip question changes on click and every 3s

[ ] Grok rings: ring 2 spins COUNTER-clockwise

 

MICRO DETAILS TEST:

[ ] ann-tag has visible orange border (rgba(255,99,8,0.3))

[ ] supergrok separator is 80% width centered (not full-width)

[ ] Footer shows: '© 2026 VEXLO — All rights reserved'

 

ACCESSIBILITY TEST:

[ ] Tab through page — focused element has orange outline

[ ] Enable 'prefers-reduced-motion' in OS — all animations stop

 

Report: PASS / STILL FAILING for each item.

Do NOT make changes during this verification.