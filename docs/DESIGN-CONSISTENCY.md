# One site, many pages: a consistency audit and how to fix it

Written 2026-11-20 after measuring all 53 public pages in the browser (computed styles, not screenshots alone). Nothing here is implemented yet.

## 1. The honest verdict

You are right, and it is not a matter of taste. The pages feel like different websites because **the things that make a site recognisable are the things that vary**: the shape of the first screen, the heading size, the button style, the corner radius and the accent colour. The things that usually make a site feel consistent (typefaces, base colours) are in fact consistent here, which is why the problem is easy to feel and hard to name.

The cause is clear in the code: the last big addition, `src/styles/identity.css`, gave **every page its own "identity"**: 45 `idv-*` classes, a different hero silhouette, pattern, photo cut and heading mark per page. That is variation by default. A design system does the opposite: **constant by default, with a short menu of allowed variation.**

The uniqueness is not the mistake. It is carried by the wrong layer. Unique pages should differ in **content, photography and one signature interactive moment**, not in the frame around them.

## 2. What was measured (53 routes)

| Dimension | What exists today | Healthy range |
|---|---|---|
| Hero families | 5: cinematic `.ch` (14 pages), service `.sh` (29), Admissions `portal-hero`, Clubs `cl-hero`, Day `day` | 1 component, 3 layouts |
| Hero silhouettes | About 32 distinct shape or pattern combinations across 33 pages (nearly one per page): wave, slash, arch, hex, pill, diamond, chamfer, ticket, notch, venn, blob, arrow, film, ghost and more | 1 shared edge |
| Hero background | 6: ink, dark blue, blue, sand, a gradient family, a near-black navy | 2 (blue, ink) |
| Page accent colours | **14 hues** in `page-kits.js` (blue, sky, indigo, teal, orange, yellow, violet, green, rose, cyan, lime, red, fuchsia, amber) | 1: gold on the brand blue |
| Main heading (h1) size | 7 sizes: 29, 40, 45, 47, 48, 54 and 84 px | 1 fluid scale |
| Hero height | 440 to 878 px, and one 4,869 px page (Day) | 2 heights |
| Primary button | 3 styles: gold square, blue pill, ink square | 1 (gold square) plus an outline |
| Card corner radius | About 20 different values from 2 px to 40 px and pills | 3 |
| Typefaces | 3 (Playfair, DM Sans, Roboto Mono) | **Already good** |
| Base colours | Brand tokens used almost everywhere | **Already good** |

Page families and what each looks like on arrival:
- **Immersive (dark, photo full-bleed, 54 px heading, 723 px tall):** Academics, Research, Campus life, Programmes, International, Rankings, Scholarships, Events, Departments, Examinations, Alumni, Placements, About, Library.
- **Service (dark blue, 47 or 40 px heading, each with its own cut):** Status, Support, Visitors, Hostels, Students, Staff finder, Srmjeee, Innovation, Parents, Compare, Dates, Campus walk, Colleges and all the section pages.
- **One-offs:** Home, Admissions, Clubs and Day each start from scratch.

## 3. Why it matters (beyond taste)

1. **Recognition is trust.** A parent clicking through five pages should feel one institution. Five different silhouettes read as five projects.
2. **Variation costs bugs.** This week alone: the scalloped edges, the stair-step hero that hid text, and the broken phone menu spacing were all products of per-page shapes. Every variant is a thing that can clip text or fail on a phone.
3. **Judges look for a system.** "One design system, with a defined way to vary a page" is a stronger answer than "each page is different".
4. **Maintenance.** A university web team cannot maintain 45 hero variants; they can maintain three layouts.

## 4. The principle: constant frame, variable content

Three layers. Each page may vary only in the layers below the line it is allowed to touch.

**Layer 1: locked, never varies per page**
- Colour tokens, one accent (gold on brand blue), type families and scale, spacing scale, radius scale, shadow scale.
- Header, footer, breadcrumbs, the "on this page" bar.
- The hero skeleton: eyebrow, heading, lede, quick links, in the same positions at the same sizes.
- Primary and secondary button, card, chip, table, form field.
- Motion language: one easing curve, one reveal, one hover lift, and the reduced-motion and pause behaviour.

**Layer 2: chosen from a short menu, one option per page**
| Choice | Allowed options |
|---|---|
| Hero layout | Full-bleed photo; photo on the right in a frame; text and index (no photo); data-led (figures under the heading) |
| Hero tone | Blue gradient (default) or ink (immersive pages) |
| Pattern in the hero wash | One of six: dots, lines, grid, rays, rings, none |
| Section rhythm | Which order the paper, sand, ink and blue bands appear in (3 approved sequences) |
| Signature moment | One of six: pinned story, sideways rail, sticky chapters, expanding panels, filter grid, count band |

**Layer 3: free per page**
Content, copy, photography and crops, the one interactive tool that belongs to the page (fee calculator, hostel finder, staff search, programme compare), and its icons.

**One shared signature shape.** If the team wants a brand shape, pick one for every hero: the stair-step edge is the best candidate, since you asked to keep it. Every page gets the identical step, in the same place, with the same safe space under the text; the page's character comes from its photo and its pattern, not a new silhouette.

## 5. How to get there (in order, each step shippable)

| Phase | Work | Output | Effort |
|---|---|---|---|
| 0. Rules | Write the locked and chosen layers above into this file's successor `docs/DESIGN-RULES.md`; add `tests/design-consistency.test.js` that fails the build if a page uses an accent outside the palette, a hero class outside the whitelist, or a radius outside the scale | A guard that stops the sprawl returning | Half a day |
| 1. One Hero | Merge `SvcHero`, `CinematicHero`, the Admissions, Clubs and Day heroes into one `Hero` with props `layout`, `tone`, `pattern`. Existing pages map to the three layouts | One component, one set of sizes (one h1 scale, two heights) | 1 day |
| 2. Tokens | Add radius, shadow and button tokens; replace the 20 radii and 3 primary buttons | One button, three radii | Half a day |
| 3. Prune identity | Cut `identity.css` from 45 classes to about 8 (one edge, six patterns, a few photo cuts) | A file a team can read | Half a day |
| 4. One accent | Remove the 14 per-page hues from `page-kits.js`; the hero tint uses brand blue and the page's photo | The rainbow is gone | 2 hours |
| 5. Signature per page | Assign each page one moment from the menu of six (most already have one) | Variety by content, not by frame | 1 day |
| 6. Prove it | Screenshot every page at desktop, phone and dark mode into `reports/`, review them as a grid, and publish a style-guide page for judges | A visible system | Half a day |

Total about 4 to 5 working days, on a branch, with the test from Phase 0 protecting the result. Risk: visual changes on all 53 pages at once, which is why Phase 6 (the screenshot grid) is part of the plan, not an extra.

## 6. What to keep

- The type pairing and the blue, sand, paper, ink and gold palette: it is distinctive and consistent.
- The best signature moments (Library, Day, the pinned scroll scenes, filter grids). They survive as Layer 2 choices.
- Dark theme support, the tests, the sources-on-every-fact rule.

## 7. Open decisions for the team

1. Which single edge shape is the brand shape (recommend the stair-step)?
2. Is the primary button the gold square everywhere (recommend yes, per the handoff rule)?
3. Do the immersive pages stay ink-toned and the service pages blue, or does everything share the blue hero (recommend two tones, assigned by page type)?
4. Is it acceptable that a few pages (Admissions, Home) keep a bespoke first screen, with the same locked layer below it?
