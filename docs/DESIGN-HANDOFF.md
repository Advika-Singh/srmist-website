# Handoff Spec: SRMIST concept redesign (whole site)

Written 2026-11-08 from the repo source (`src/theme.css`, `index.css`, `redesign.css`, `styles/shell.css`, `App.jsx`, `data/routes.js`, `docs/CONTEXT.md`, `docs/REDESIGN.md`). Values are what the CSS says, not measurements from a rendered page. Items marked **(verify)** were not confirmed in a browser or are not in the CSS I read. This is an independent concept redesign of srmist.edu.in, not official.

Stack: React 18, Vite 5, react-router 6, plain CSS with tokens. Tailwind is used only by `ui/TiltGrid.jsx` (preflight off).

---

## 1. Overview

Audience: applicants, parents, current students, visitors, faculty/staff. The landing page is the visual reference for every other page: cinematic hero, large serif headings, alternating blue / sand / paper / ink bands, gold accents, square gold CTAs.

Principles that explain many details:
- **Never invent facts.** Real data carries a source link; prototypes (staff timetables, fee figures, issue tracker, Tamil/Hindi translations) are labelled in the UI.
- **Information pages share one shell** (photo hero, curtain overlap, banded sections, scroll reveal) so a new page needs no new design.
- **Tables never scroll sideways**; they become cards under 720px.
- **Motion is optional**: every animation has a reduced-motion path and a footer "Pause animations" toggle (WCAG 2.2.2).

## 2. Site map and templates

| Route | Template | Notes |
|---|---|---|
| `/` | Landing (`Home.jsx`) | Intro splash, cinematic hero, audience switch ("I'm a…"), deadline strip, corridor, rankings, study finder, research feature, news run, innovation rail |
| `/about` `/academics` `/research` `/campus-life` `/programmes` `/international` `/rankings` `/scholarships` `/events` `/departments` `/examinations` `/alumni` | Interior (`pages/Interior.jsx`, content in `data/page-kits.js`) | Shared shell, sticky "On this page" bar, card grid, programme table on Programmes/Academics |
| `/admissions`, `/apply`, `/apply/programme`, `/apply/details`, `/apply/review` | Admissions + 4-step Apply | Admissions has its own slim header; reached from the floating button |
| `/srmjeee` | Service page | Dates are tentative per SRMIST |
| `/placements`, `/library`, `/hostels`, `/students`, `/clubs`, `/visitors`, `/day`, `/innovation`, `/ask-a-student` | Service pages (`.svc` shell) | |
| `/course-finder`, `/staff-finder`, `/access-map`, `/status`, `/support` | Tool pages | Own CSS in `styles/` |
| `/404`, `*` | `NotFound` | Returns HTTP 200 (SPA rewrite) |
| `/teach.html`, `/indexpage.html` | Static | Faculty Gateway; redirect to `/staff-finder` |

Global chrome on every page: skip link, 3-tier header (utility strip, logo + aux links, main menu with mega dropdowns), floating **Admissions** button, ⌘K/`/` smart search, **DAAS** assistant, cursor light, footer.

## 3. Design tokens (`src/theme.css`)

### Colour
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--ink` / `--text` | #171814 | #ebeae3 | Body text; also dark button/band fill |
| `--paper` | #f3f1e9 | #0e1217 | Page background |
| `--sand` | #e7e2d2 | #151b23 | Alternate bands |
| `--white` | #ffffff | #171d25 | Card surface |
| `--blue` | #084b9b | #2f6fd0 | Fills with white text, brand |
| `--blue-ink` | = `--blue` | #8dbaff | Blue **text** (use this for text, not `--blue`) |
| `--blue-dark` | #06366f | #2459aa | Hero base, gradients |
| `--gold` | #f2c84b | same | Primary CTA, accents, focus on dark |
| `--lime` | #d8f14c | same | Hover on dark buttons, cursor light |
| `--lavender` | #dcd5ff | same | Light brand bands (become `--sand` in dark) |
| `--text-muted` | #4d4e49 | #b4b7b0 | Captions, meta |
| `--text-placeholder` | #6a6b65 | #8f938c | Placeholders |
| `--on-blue` / `--on-blue-muted` | #fff / #d6e4f7 | | Text on blue sections |
| `--line` / `--line-strong` | #17181429 / #6a6b65 | #ffffff26 / #7d827b | Hairlines / input borders (3:1+) |
| `--success` / `--danger` | #0f6b3a / #a31f1f | #4ad08b / #ff8a8a | Status |
| `--focus` / `--focus-on-dark` | #084b9b / #f2c84b | #7ab2ff | Focus ring |

Contrast is enforced by `npm run audit:contrast` (18 pairs; body 15.8:1, muted 7.4:1, white on blue 8.4:1, ink on gold 11.2:1). Re-run it when changing any colour token. It misjudges text over photos, so check those by eye in both themes.

### Type
| Token | Value | Usage |
|---|---|---|
| `--display` | Playfair Display, Georgia, serif | All headings, card titles, big numerals |
| `--sans` | Amp, DM Sans, system-ui | Body and UI |
| `--mono` | Amp, Roboto Mono | Small labels only: `.eyebrow`, `th`, `legend` |
| `--fs-body` | clamp(1rem, .96rem + .2vw, 1.125rem) | 16 to 18px, never below 16 for reading text |
| `--fs-small` | .875rem | 14px minimum for meta text |
| `--lh-body` / `--measure` | 1.6 / 68ch | |

- "Amp" is a custom font face covering only U+0026, so `&` renders as Playfair Italic's swash ampersand.
- Lining numerals everywhere (`font-variant-numeric: lining-nums`). Any rule setting `tabular-nums` must also say `lining-nums`.
- Fonts are self-hosted from `public/fonts` (Latin and Latin-ext subsets), preloaded.

Heading scale (all Playfair, weight 500, tight negative tracking):
| Role | Size | Line height | Tracking |
|---|---|---|---|
| Opening wordmark `h1` | clamp(7rem, 18.5vw, 19rem) | .72 | -.075em |
| Section heading `h2` | clamp(3.2rem, 6.8vw, 7.5rem) | .92 | -.05em |
| Cinematic copy `h2` | clamp(3.5rem, 6vw, 7rem) | .85 | -.055em |
| Interior page hero `h1` (`.sh h1`) | clamp(2.7rem, 7.2vw, 6.4rem), max 15ch | .95 | -.045em |
| Interior block `h2` (`.svc .vis-block h2`) | clamp(1.9rem, 4vw, 3.2rem) | 1.02 | -.035em |
| Card title | 22 to 31px | 1.1 to 1.15 | |
| Eyebrow | 12px mono, uppercase | | .12em |

Tamil and Hindi: tracking forced to 0, line height 1.22, `word-break: keep-all` on cinematic copy, narrower letterspacing on labels (see end of `theme.css`).

### Spacing, shape, motion
| Token | Value |
|---|---|
| `--s-1` to `--s-7` | 4, 8, 12, 16, 24, 40, 64px |
| `--radius` | 12px (cards in practice use 14, 16, 18, 20px; hero curtain 34px; CTA card 26px; **a radius token for these is missing**) |
| `--radius-pill` | 999px |
| `--tap` | 44px (min target on coarse pointers) |
| `--nav-h` | 78px on shell pages, 120px on `.interior` **(verify which header state applies where)** |
| `--ease` | cubic-bezier(.2, .72, .2, 1), used for nearly all transitions |

Page gutter on shell pages: `max(6vw, (100vw - 1200px) / 2)`. Content max width 1200px.

Z-index stack (no tokens; values found in CSS): nav 50, home pill 52, cursor light 60, search overlay 100, FAB 140, command palette 200, staff 300, 400/500 for overlays and the route loader. Add tokens before adding layers.

## 4. Layout and responsive behaviour

Fluid grids use `repeat(auto-fit, minmax(min(100%, 300px), 1fr))`, so columns collapse without media queries. Breakpoints are for behaviour changes.

| Breakpoint | Where used | Changes |
|---|---|---|
| >900px (`min-width:901px`) | Desktop | Home scroll scenes (CSS vars from `lib/useScrollScenes.js`), mega menus, full header |
| ≤1280 / ≤1100px | Header | In Tamil/Hindi the top strip drops its least-used links (they stay in menus) |
| ≤900px | 18 rules | Header collapses to mobile menu; cinematic copy goes to `calc(100% - 40px)`; two-column layouts stack |
| ≤720px | Tables | `.rt` rows become cards; each cell is a `label: value` line from `data-label` |
| ≤700 / 640 / 600px | Page-specific | Smaller card grids and type |
| ≤420 / 360px | Small phones | Header must still fit down to 320px; taps ≥ 36px |
| `pointer: coarse` | Global | `button`, inputs, tabs get `min-height: var(--tap)` |
| `hover: none` | Cards | Hover-only reveals need a tap/focus equivalent **(verify per card)** |

Rule: every page must work at 375px with no horizontal scroll (`scrollWidth === clientWidth`).

## 5. Components

| Component | Variants / states | Key specs | Notes |
|---|---|---|---|
| **Header** (`shared.jsx` `MainNav`) | Overlay (transparent on hero), solid, mobile drawer; light/dark | Strip (dark, utility links, Campuses dropdown, gold "Admissions 2027", outlined SRMJEEE) → bar (logo, aux links, search `⌘K`, prefs) → menu with mega dropdowns. Bar bg #f3f1e9f7 + blur 14px | Logo always sits in a solid white container with blue outline and gold base edge, always the dark logo. Dark: strip/footer #080a0d, bar #0e1217f2 |
| **Hero** `.sh` (`ui/SvcHero.jsx`) | Per-page photo | min-height min(66svh, 640px); photo parallax `translate3d(0, p*70px)` + scale 1.06 to 1.14; blue gradient tint; copy fades as scroll progress `--sh-p` goes 0 to 1 | Title words rise 1.1s staggered; eyebrow gold |
| **Curtain** `.svc-wrap` | | Content overlaps hero by -44px, `border-radius: 34px 34px 0 0`, paper bg | |
| **Banded block** `.vis-block` | Odd = paper, even = sand | Padding-block clamp(44px, 6vw, 84px); full-bleed via `box-shadow 0 0 0 100vmax` + `clip-path` | |
| **Buttons** | `.button` (ink), `.button-gold` (gold, ink text), `.button-light`/`.button-ghost` (outline), `.pill-apply`, `.apply-link` (blue), `.svc-btn` | `.button`: 12px/600, padding 15 18, inline-flex, gap 30, square corners. Hover on shell pages: `translateY(-2px)`, 300ms | Dark theme: `.button` becomes #ebeae3 on #111, hover lime. Gold stays gold, hover white. Gold text is always #171814 |
| **Admissions FAB** `.adm-fab` | | Fixed left 22 / bottom 22, z 140, gold pill, 2px ink border, shadow 0 12px 36px #042a5a47 | Replaces gold header button; also the mobile apply bar (no separate one) |
| **Cards** `.svc-card .hs-card .lib-card .st-card .slide` | Rest / hover / focus | Radius 18; hover `translateY(-5px)`, border `--blue`, shadow 0 20px 46px #084b9b22, 500ms. `.slide`: 22px pad, min-height 210, label 12px/700 uppercase blue, title Playfair 22px | |
| **Answer card** `.cc` (`ui/chatCards.jsx`, `lib/answers.js`) | Programme, fee, apply, call-back | Pad 14, radius 14, white, `dl` grid 92px / 1fr, title Playfair 20px | Fee numbers are illustrative and labelled; a campus named in the query adds "not campus-specific" |
| **Closing CTA** `.svc-help` | | Blue bg, white text, radius 26, gold button | |
| **Responsive table** `.rt` | Desktop table / mobile cards | Header cells 12px uppercase on #eceae1; row hover #1c242d (dark) | Semantic `<table>` with explicit ARIA roles |
| **Tabs** | Default / selected / focus | WAI-ARIA tabs; selected gets 2px ButtonText border in forced-colors | Admissions pathways, home Explore |
| **Smart search** (`ui/SmartSearch.jsx`) | Closed / open / empty / results / correction | Palette: fixed, z 200, box `min(680px,100%)`, max-height 84vh, radius 16, shadow 0 40px 90px #00000066. Opens with ⌘K, Ctrl K or `/` | Combobox/listbox ARIA; typo tolerance; "Showing results for…"; falls through to a DAAS row |
| **DAAS assistant** (`Assistant`, `server/chat.js`) | Closed / open / thinking / reply with cards / error / offline | Cards chosen on device so they show if the model is down; links limited to a server allow-list | Replies in the chosen language. "Was this helpful?" under replies. Email check after 3 messages is **deferred** |
| **Fee & ROI calculator** (`ui/FeeCalculator.jsx`) | | Programme × hostel; year-by-year, breakdown bar, years of average salary to repay | `data/fees.js` is placeholder |
| **Campus explorer / map** | Hover, focus, tap lights a zone | Schematic, labelled not-to-scale; keyboard operable | |
| **Prefs** (`ui/Preferences.jsx`) | Theme, language, pause animations, text size | Buttons min 28px (44px in mobile menu); `data-text` 90%, 112.5%, 125% scales root font | Theme toggle plays a View Transition wave |
| **Immersive pieces** (`ui/immersive/*`) | CinematicHero, PhotoCorridor, FacilityCollage, IrisStory, Bands, Stepper, StickyStory, HorizontalRail | Scroll-driven; desktop + motion allowed only | Static fallback needed for each **(verify)** |

## 6. States and interactions

| Element | State | Behaviour |
|---|---|---|
| Any link/button | Focus-visible | 3px solid `--focus`, offset 3px, radius 4. On dark surfaces (hero, strip, portal hero, footer) `--focus-on-dark` gold |
| Nav items | Hover / active | 2px blue underline scales in from left, 300ms |
| Home pill nav | Show | Fades in and slides to `top:16px` after the hero; hover fills blue |
| Cards | Hover | Lift 4 to 5px, border blue, soft blue shadow |
| Internal link click | Navigate | View Transition cross-fade; skipped when reduced motion, motion paused, tab hidden, or same path. 1s safety net then plain navigate. No-VT browsers get a CSS fade (`html.no-vt`) |
| Hover/focus on internal link | Prefetch | Lazy page chunk is fetched on `pointerover`, `focusin`, `touchstart`; Interior chunk warmed at idle |
| Route change | Scroll | Resets to top (`behavior:auto`); document title set per route (`titleFor`) |
| Route loading | Suspense | `.route-loading`: 3px gold-to-blue bar sweeping across the top, 1.1s loop; text hidden but announced (`role=status`) |
| Forms | Error | Server validation + client messages; `--danger` colour; honeypot hidden field; enquiry rate-limited 5 per 10 min per IP (shows an error state) **(verify copy)** |
| Enquiry | Not delivered | If `ENQUIRY_WEBHOOK_URL` is unset the API returns `delivered:false`; UI must not claim success **(verify)** |
| Language switch | Translating | Chrome strings from `data/translations.js`; body text translated live for text near the screen via `/api/translate`; cached; `data-notranslate` opts out |

## 7. Content specifications

| Case | Rule |
|---|---|
| Headlines | Playfair, sentence case; hero `h1` max 15ch; no more than 3 lines at desktop |
| Eyebrows | Short noun phrase, mono uppercase |
| Long text / international strings | Tamil and Hindi run wider: nav labels `nowrap` at 13.5px, strip links 12px; allow cards to grow vertically, never truncate headings **(verify)** |
| Empty state | Ask-a-student shows an empty state for topics without consented/sourced answers; staff finder and search need "no results" with a suggestion and the DAAS handoff |
| Loading | Route bar (above); DAAS shows a thinking state; fee/answer cards are computed locally so they do not load |
| Error | Network/API failure: inline message, never a blank panel; DAAS cards still render offline |
| Data labelling | Staff timetables/availability, issue tracker back end, machine translations: visible "prototype" label wherever shown |
| Dates | SRMJEEE dates are tentative; show the deadline strip with days left and link to dates |
| Photos | Local photos in `public/srmist/`; real people need permission-cleared images before launch |

## 8. Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Hero title words | Load | Rise from translateY(55%), opacity 0 to 1, staggered | 1.1s | `--ease` |
| Hero lede / eyebrow / quick links | Load | Fade + 14px rise | 0.9 to 1s, delays .1 / .55 / .7s | `--ease` |
| Hero photo | Load / scroll | Blur 8px to 0 and scale 1.08 to 1; then parallax | 1.8s | `--ease` |
| Cinematic copy | Load | `cinema-copy-in` | .8s after 1.4s | `--ease` |
| Opening wordmark letters | Load | Rise from 100% | 1.05s | `--ease` |
| Scroll reveal `[data-rv]` | In view | Opacity, 28px rise, blur 6px to 0; per-element delay `--rv-d` | .85 / .95 / .75s | `--ease` |
| Cards | Hover | translateY + shadow | .45 to .5s | `--ease` |
| Buttons | Hover | bg/colour .25 to .3s; lift .35s | | `--ease` |
| Theme toggle | Click | Wave via View Transitions | **(verify)** | |
| Route loader | Loading | Gradient bar sweep | 1.1s infinite | `--ease` |
| Cursor light | Pointer move | 380px radial glow, `mix-blend-mode: multiply` | | |

Reduced motion (23 `prefers-reduced-motion` rules, plus `body.motion-paused`): `[data-rv]` forced visible with no transition, view transitions skipped, scroll scenes off. The footer toggle sets `motion-paused`.

## 9. Accessibility

- **Skip link** first in DOM → `#main` (main has `tabIndex=-1`).
- **Focus order** follows DOM: skip link, strip, bar, menu, page content, footer; floating FAB, search, DAAS render after the routes in the DOM **(verify that Tab reaches them in a sensible place)**.
- **Roles**: tabs and combobox follow WAI-ARIA patterns; tables keep explicit ARIA roles when restyled as cards; route loader is `role="status" aria-live="polite"`.
- **Keyboard**: ⌘K / Ctrl K / `/` opens search; arrow keys move in results; Esc closes; the campus map is keyboard operable. Dropdown menus have **not** had a keyboard-only or screen-reader audit.
- **Targets**: ≥44px on coarse pointers; ≥36px minimum for contact links and form labels.
- **Contrast**: enforced by `audit:contrast`; focus ring ≥ 3:1 on both surfaces.
- **Preferences honoured**: `prefers-reduced-motion`, `prefers-contrast: more` (line and muted text go to ink), `forced-colors` (CTAs and selected tabs get a 2px `ButtonText` border), text size A−/A/A+/A++, dark theme.
- **Headings**: each page needs exactly one `h1` (`/day` was fixed for this). Note global CSS resets `h1–h3` to inherit size and weight, so heading level is not visible in styles; do not rely on it.
- **Language**: `html[lang]` changes with the switcher; type rules branch on `lang`.
- **Not yet done**: screen-reader pass, keyboard-only pass on dropdowns, dark mode and phone checked only on main pages.

## 10. Implementation notes and gaps

1. **Where to add overrides**: `redesign.css` loads last; most overrides go at its end. Per-feature CSS lives in `src/styles/`.
2. **Dark theme** works by flipping tokens plus an explicit list of hard-coded white surfaces in `theme.css` (lines ~188 to 200). A new white card must be added to that list or use `var(--white)`. Prefer tokens for new work.
3. **Token gaps worth closing**: radius scale, z-index scale, `--nav-h` (two values), shadow tokens, a type-size scale (sizes are inline clamps), gold/blue hover colours.
4. **Home "white nav" state** needed explicit dark overrides; test it in both themes after nav changes.
5. **Performance**: route-level `React.lazy`, prefetch on intent, self-hosted fonts with preload, `<Photo>` with srcset, width/height and lazy decoding except the hero. Local photos in `public/srmist/` are JPG/WebP; AVIF/WebP `<picture>` is planned, not done.
6. **Security headers** are set in `server/security.js`, `vercel.json` and `public/_headers`. `upgrade-insecure-requests` is missing from `server/security.js`. See `docs/REDESIGN.md` §5 for the full checklist.
7. **A/B test**: Admissions hero (`lib/experiments.js`, `?v=A|B` to force). Plan in `docs/REDESIGN.md` §6.
8. **Tests**: `npm test` (pure logic, 85+ tests incl. `click-depth`, which fails if key pages get buried in nav).
9. **Open items before launch**: rotate the Gemini key; load the official fee schedule; native-speaker review of Tamil/Hindi; verify the "Under Section 3 of the UGC Act, 1956" wording; privacy notice and retention rule for enquiries (DPDP Act); configure `ENQUIRY_WEBHOOK_URL`; `/404` returns 200.
10. **Deploy**: only when asked. `npx vercel@latest deploy --prod --yes`. The live site (srmist-home-pink.vercel.app) was last deployed 2026-11-07, so the 2026-11-08 work is not live.

## 11. Open questions for design

- Which radius is canonical: 12 (token) or 14 to 20 (what cards use)?
- Hover-only affordances on touch devices: which cards need a tap equivalent?
- Static fallbacks for each immersive scroll piece when motion is off or on mobile.
- Real photography and permissions for student stories.
- "Admissions" vs "Apply 2027" on the floating button (test 2 in the A/B plan).
