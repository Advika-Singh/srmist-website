# Design rules: one site, many pages

Why this exists: an audit on 2026-11-20 found that pages differed in their frame (hero shape, heading size, button, corner radius, accent), so the site felt like several sites. Full measurements and the reasoning are in `docs/DESIGN-CONSISTENCY.md`. These rules are the part that is enforced by `tests/design-consistency.test.js`.

**Constant frame, variable content.** A page is allowed to differ in what it says, which photos it shows and one signature interactive moment. It is not allowed to invent a new frame.

## Layer 1: locked (never varies per page)
- Colour tokens in `src/theme.css`. One accent: gold (`--gold`) on the brand blue (`--blue`, `--blue-dark`) and ink. No per-page hues.
- Type: Playfair Display (headings), DM Sans (text), Roboto Mono (small labels). Nothing else.
- **Page hero:** always the `Hero` component (`src/ui/Hero.jsx`). The main heading uses `--hero-h1`. Two minimum heights: `--hero-min-m` (service pages) and `--hero-min-l` (immersive pages).
- Header, footer, the "on this page" bar, buttons, cards, chips, tables and form fields come from the shared styles, not from a page.
- Motion: one easing curve (`--ease`), one reveal, one hover lift; honour reduced motion and the pause toggle.

## Layer 2: one choice from a short menu per page
| Choice | Allowed |
|---|---|
| Hero component layout | `photo` (immersive pages) or `band` (service pages), both through `ui/Hero.jsx` |
| Hero look (class on `<main>`) | one from the curated menu in `src/styles/identity.css`: framed photos (arch, hex, pill, circle, blob, diamond, venn, octagon, slats, tiles), cut edges (slash, reverse, chevron, notch, chamfer, arrow, stairs, zigzag), pattern washes (grid, ledger, rays, omr, bubbles, sun, duo), ghost, and the immersive looks (spine, quarter, diag). Neighbouring pages should differ. Recognition and Research initiatives keep their own, by request |
| Signature moment | pinned story, sideways rail, sticky chapters, expanding panels, filter grid, count band |

**What makes it one site is Layer 1, not the hero shape.** The look is the part of the page that is allowed to be different.

## Layer 3: free
Content, copy, photographs and crops, and the page's own tool (calculator, finder, compare).

## How the guard works (a ratchet)
`tests/design-consistency.test.js` stores the current counts as ceilings. They can only go down. When you remove variants, lower the number in the test in the same commit.

| Check | Was (2026-11-20) | Ceiling now |
|---|---|---|
| `idv-*` identity classes in `identity.css` | 45 | 45 (the menu may shrink, not grow) |
| Page accent colours in `data/page-kits.js` | 14 | 1 |
| Distinct `border-radius` pixel values in the CSS | 23 | 11 |
| Pages that import a hero implementation directly | allowed | 0 |
| Hero heading size and the two heights | seven sizes | one token each |
| Primary button | three styles | the gold square |
| Hero heading size, accent, button, radii | all varied | one each (locked) |

## When you add or change a page
1. Use `Hero`. Pick the layout by page type, never by taste, and add one of the approved look classes to `<main>`.
2. Do not add an accent colour, a hero shape or a new corner radius. If a page needs one, change the rule here first and say why.
3. Run `npm test`. If the guard fails, you added variation; if it is a genuine system change, change the ceiling in the same commit and explain it in the message.
