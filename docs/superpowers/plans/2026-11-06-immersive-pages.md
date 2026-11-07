# Immersive Inner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 12 inner pages (About SRM, Research, International, Placements, Rankings, Scholarships, Events, Library, Departments A–Z, Examinations, Alumni, Campus life) as immersive as the home page: each opens with a cinematic hero and has one scroll-driven "signature moment" that fits its content, instead of the identical hero → 4 stats → 3 cards → split layout they all share today.

**Architecture:** Build a small kit of reusable motion components (cinematic hero, sticky story, horizontal rail, photo corridor, count band, marquee, route curtain) on one shared scroll-progress hook. A data file maps each page slug to an ordered list of "moments" built from the kit; `Interior.jsx` renders whatever its page's list says. Every moment has a plain, non-animated fallback (phones, short screens, reduced motion), exactly like the home page's corridor.

**Tech Stack:** React 18, Vite 5, plain CSS (tokens in `src/theme.css`), `node:test` for pure logic. No new dependencies.

**Spec:** None written. Decisions come from the conversation and from the home page built earlier (`src/ScrollTunnel.jsx`, `src/Home.jsx`, `src/ui/CountUp.jsx`). The decisions are under "Design decisions"; calls made without asking are marked **(my call)**.

## What is wrong today (measured)

Every slug in `src/data/pages.json` has the same shape: `hero`, 4 `stats`, `intro`, 3 `blocks`, one `split`. `src/pages/Interior.jsx` renders them identically. Five pages (admissions, international, placements, scholarships, alumni) share the same hero photo `admission-india.jpg`; three more reuse `students.jpg`. `Library` and `Admissions` already have custom pages and keep them, with the library upgraded in Task 12.

## Design decisions

- **Same signature as the home page.** The home page's moves are: letter-by-letter title rise, full-bleed photo with slow push-in, sticky pinned stages that change with scroll, count-up numbers, a corridor of photos, colour hand-off between sections, and a route-level intro. Inner pages reuse these moves; they do not invent a second visual language.
- **One signature moment per page, plus the shared hero and count band.** Not every page gets a corridor. The moment is chosen from the content:

| Page | Signature moment | Built from |
|---|---|---|
| About SRM | Pinned story: "Learn · Leap · Lead" origin and the Deemed-to-be-University badge, stages change as you scroll | StickyStory |
| Research | Pinned lab corridor with live counters for patents, publications and funding | PhotoCorridor + CountBand |
| International | Horizontal "passport" rail: twinning, dual degree, semester abroad, global immersion | HorizontalRail |
| Placements | Count band (companies, offers, highest and average package) over a recruiter-name marquee | CountBand + Marquee |
| Rankings | Pinned stack: each ranking (NAAC, NIRF University, Engineering, Medical, Pharmacy, Research, SDG) takes the stage in turn with a counting number | StickyStory + CountBand |
| Scholarships | Pinned "find your scheme" stepper: three questions narrow the official schemes | StickyStory |
| Events | Horizontal rail of upcoming events with date chips | HorizontalRail |
| Library | Sticky "open now" band, plus the existing timings, librarian and contact blocks | CountBand + existing page |
| Departments A–Z | Sticky alphabet rail: tap a letter, the list jumps and highlights | new `AlphaRail` |
| Examinations | Pinned exam-cycle stepper (before, during, after exams) with the official links from `src/data/students.js` | StickyStory |
| Alumni | Horizontal stories rail with placeholders for stories not yet provided | HorizontalRail |
| Campus life | Photo corridor (reuses the home page's) with club and sports chips | PhotoCorridor |

- **Content rule.** No invented facts. Numbers and names come from `pages.json`, `src/data/*.js` or the official site. Anything missing is a dashed `[placeholder]` saying what belongs there (same convention as the Hostels page, class `hs-missing`). **(my call, taken from the hostels brief)**
- **Imagery rule.** The project has 11 photos. Each page gets its own art direction from those: a distinct crop and focal point, plus a per-page accent colour applied as a tint. New photos are the owner's to save into `public/srmist/` (downloads from srmist.edu.in are blocked by its bot check and must not be worked around). **(my call)**
- **Motion gates.** Pinned and 3D moments run only when `(min-width: 640px) and (min-height: 480px) and (prefers-reduced-motion: no-preference)`; everything else gets the plain stacked layout. Same query as `ScrollTunnel.jsx`.
- **Route intro.** Navigating to an inner page plays a short blue curtain wipe that lands on the page title, using the existing View Transitions code in `src/App.jsx`. It is skipped for reduced motion and is never longer than 600 ms. **(my call)**
- **Dark theme, Tamil and Hindi** keep working: colours come from tokens; new visible strings go through `t()` and `src/data/translations.js`.
- **Not in scope:** Home (done), Admissions portal, Apply, Hostels, Students, Visitors, Status, Support, Access map (own pages already).

## Global Constraints

- No new npm dependencies.
- Scripts: `npm test` must stay green; `npm run build` must succeed after every task.
- Colours only from theme tokens (`var(--blue)`, `var(--ink)`, `var(--paper)`, `var(--gold)`, `var(--line)`). No hard-coded light surfaces (dark theme).
- Touch targets at least `var(--tap)` (44px). Visible focus stays the existing `:focus-visible` style.
- Pinned sections need a non-pinned fallback with identical content; no content may exist only inside an animation.
- Each page's total pinned scroll length is at most `260vh`.
- Every new interactive element is keyboard-operable.
- Existing hash links and URLs (`/research`, `/placements#…`) keep working.
- The project is not a git repo: each task ends with `npm test` and `npm run build` passing instead of a commit.

## Review Focus

- A page opened directly on a deep scroll position or by hash link (`/departments#M`) renders the right moment state without a jump.
- Reduced motion or a 375px phone shows every page's full content with nothing pinned and no horizontal page scroll.
- Two pinned moments close together (Rankings stack then marquee) do not fight over scroll and hand over colours cleanly.
- A page with a missing photo or empty data list still renders (placeholder, not a crash or an empty hole).
- Language switch to Tamil or Hindi on every page: no clipped text, no mid-word breaks, headings still fit.
- Keyboard-only: the rail, the stepper and the alphabet rail are fully usable; focus never lands on a hidden pinned stage.

---

## File Structure

- Create `src/lib/motion.js`: pure helpers (`clamp01`, `smooth`, `windowProgress`, `stageIndex`) used by every moment.
- Create `src/lib/useScrollProgress.js`: hook returning eased progress `0..1` of an element's pinned scroll length.
- Create `src/ui/immersive/` with one file per kit piece: `CinematicHero.jsx`, `StickyStory.jsx`, `HorizontalRail.jsx`, `PhotoCorridor.jsx`, `CountBand.jsx`, `Marquee.jsx`, `AlphaRail.jsx`, `Stepper.jsx`.
- Create `src/data/page-kits.js`: slug → ordered moments; plus `ACCENTS` (per-page tint and crop).
- Create `src/styles/immersive.css`: all kit styles (imported by `Interior.jsx` and `Library.jsx`).
- Modify `src/pages/Interior.jsx`: render the page's moments; keep the old template as the fallback for any slug without a kit.
- Modify `src/ScrollTunnel.jsx`: becomes a thin wrapper around `PhotoCorridor` (no visible change).
- Modify `src/App.jsx`: route curtain.
- Modify `src/pages/Library.jsx`, `src/data/pages.json` (only where a moment needs extra fields), `src/data/translations.js`, `README.md`.
- Tests in `tests/`: `motion.test.js`, `page-kits.test.js`.

---

### Task 1: Motion maths and the shared scroll hook

**Files:**
- Create: `src/lib/motion.js`, `src/lib/useScrollProgress.js`
- Test: `tests/motion.test.js`
- Modify: `src/ScrollTunnel.jsx` (use the shared helpers instead of its local `clamp01`/`smooth`)

**Interfaces:**
- Produces:
  - `clamp01(n: number): number`
  - `smooth(a: number, b: number, x: number): number` (smoothstep, 0 below `a`, 1 above `b`)
  - `windowProgress(p: number, start: number, end: number): number` (0..1 inside the window, clamped)
  - `stageIndex(p: number, count: number): number` (0..count-1; `p=1` gives `count-1`)
  - `useScrollProgress(ref: RefObject<HTMLElement>, opts?: { ease?: number }): number` (progress through the element's pinned length, eased with a time-based lerp, frame-rate independent)

- [ ] **Step 1: Write the failing tests** in `tests/motion.test.js`: `clamp01 limits to 0..1`; `smooth is 0 before a, 1 after b, 0.5 at the midpoint`; `windowProgress(0.5, 0.25, 0.75) === 0.5` and clamps outside; `stageIndex(0, 3) === 0`, `stageIndex(0.34, 3) === 1`, `stageIndex(1, 3) === 2`, `stageIndex(0.999, 1) === 0`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL (module not found).
- [ ] **Step 3: Implement** `src/lib/motion.js` with the four functions. Implement `useScrollProgress` by moving the measure-and-lerp loop out of `ScrollTunnel.jsx` (target from `getBoundingClientRect`, `current += (target - current) * (1 - Math.exp(-dt / 110))`, stop the loop when settled, re-measure on scroll and resize).
- [ ] **Step 4: Refactor** `ScrollTunnel.jsx` to import the helpers; the home corridor must look and behave exactly as before.
- [ ] **Step 5: Run** `npm test` and `npm run build` — Expected: all pass. Open `/` and scroll the corridor: unchanged.

### Task 2: Page kit data and its tests

**Files:**
- Create: `src/data/page-kits.js`
- Test: `tests/page-kits.test.js`

**Interfaces:**
- Produces:
  - `export const MOMENTS: readonly string[]` — `['story','rail','corridor','countband','marquee','alpha','stepper']`
  - `export const KITS: Record<string, { accent: string, crop: string, moments: { type: string, [k: string]: unknown }[] }>` for the 12 slugs
  - `export const kitFor: (slug: string) => { accent: string, crop: string, moments: object[] } | null`

- [ ] **Step 1: Write the failing tests:** `every one of the 12 slugs has a kit` (about, research, international, placements, rankings, scholarships, events, library, departments, examinations, alumni, campus-life); `every moment type is a known MOMENT`; `every kit has at least one moment and an accent that is a CSS hex colour`; `no two kits use the same accent` ; `kitFor('nope') === null`; `no kit lists more than 3 pinned moments` (types `story`, `corridor`, `stepper` count as pinned) so total pin length stays within the 260vh cap.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** `page-kits.js` using the table in "Design decisions". Each moment carries only the data it needs (stages, rail items, photo list, counter values), all copied from `pages.json` or the official pages already used elsewhere; use `null` plus a `placeholder` string where content is missing.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.

### Task 3: CinematicHero and the route curtain

**Files:**
- Create: `src/ui/immersive/CinematicHero.jsx`, `src/styles/immersive.css`
- Modify: `src/pages/Interior.jsx` (replace the compact hero), `src/App.jsx` (curtain)

**Interfaces:**
- Consumes: `kitFor` (Task 2), `useScrollProgress` (Task 1)
- Produces: `CinematicHero({ hero, accent, crop }: { hero: { eyebrow: string, h1: string, p: string, img: string, alt: string }, accent: string, crop: string })`

- [ ] **Step 1:** Build `CinematicHero`: full-bleed photo using `crop` as `object-position`, slow push-in (scale 1.0 to 1.08 over the first screen of scroll), `accent` tint as a gradient overlay, title that rises word by word (reuse the `letter-rise` keyframes idea from the home wordmark), eyebrow and paragraph fading in after. A small "scroll" cue like the home page.
- [ ] **Step 2:** Route curtain in `App.jsx`: on navigation to an inner page, a blue panel wipes up (≤ 600 ms) and the new title lands where the old one left. Skip for reduced motion and when the tab is hidden.
- [ ] **Step 3: Verify in the browser** at 1360 and 375 px: all 12 pages show the new hero with their own tint; no text clipped over the photo; the curtain never blocks input. Run `npm test` and `npm run build`.

### Task 4: CountBand and Marquee

**Files:**
- Create: `src/ui/immersive/CountBand.jsx`, `src/ui/immersive/Marquee.jsx`

**Interfaces:**
- Consumes: `CountUp` (`src/ui/CountUp.jsx`, existing)
- Produces: `CountBand({ items: [value: string, label: string][], tone?: 'blue' | 'ink' })`; `Marquee({ words: string[], speed?: number })`

- [ ] **Step 1:** `CountBand` lays out 3–4 big numbers with the existing `CountUp`, hover underline like the home Recognition band, background from `tone`. `Marquee` is a CSS-only looping row of large serif words that pauses on hover, on focus and under `body.motion-paused`, and is static under reduced motion.
- [ ] **Step 2: Verify:** numbers count once when scrolled into view; the marquee has an `aria-label` listing its words once (not duplicated for screen readers). `npm test`, `npm run build`.

### Task 5: StickyStory and Stepper

**Files:**
- Create: `src/ui/immersive/StickyStory.jsx`, `src/ui/immersive/Stepper.jsx`

**Interfaces:**
- Consumes: `useScrollProgress`, `stageIndex`, `smooth` (Task 1)
- Produces: `StickyStory({ stages: { title: string, text: string, visual: ReactNode, href?: string, cta?: string }[], startBg: string, endBg: string })`; `Stepper({ steps: { title: string, text: string, links?: [string, string][] }[] })`

- [ ] **Step 1:** `StickyStory` pins for `stages.length * 90vh` (max 260vh), shows one stage at a time with the home page's blur-and-rise text transition, a progress rail on the side, and blends `startBg` → ink → `endBg` the way `ScrollTunnel` does. Below the motion gate it renders all stages stacked.
- [ ] **Step 2:** `Stepper` is the interactive cousin: the same layout but advancing by button and arrow keys as well as scroll, so it is usable without scrolling (used by Scholarships and Examinations).
- [ ] **Step 3: Verify:** keyboard operation, focus never inside a hidden stage (hidden stages get `aria-hidden` and `tabIndex=-1` links), fallback stacked layout at 375px. `npm test`, `npm run build`.

### Task 6: HorizontalRail

**Files:**
- Create: `src/ui/immersive/HorizontalRail.jsx`

**Interfaces:**
- Produces: `HorizontalRail({ items: { title: string, meta?: string, text?: string, img?: string, href?: string, placeholder?: string }[], heading: string })`

- [ ] **Step 1:** A pinned section that converts vertical scroll into horizontal travel of a row of large cards (distance = row width minus viewport, pinned length capped at 200vh), with drag and arrow-key scrolling as alternatives, and a native `overflow-x: auto` row as the fallback.
- [ ] **Step 2:** Cards without an image or text render the dashed placeholder box with its `placeholder` string. **Verify:** keyboard (Tab through cards scrolls the rail), no page-level horizontal scroll. `npm test`, `npm run build`.

### Task 7: PhotoCorridor (generalise the home corridor)

**Files:**
- Create: `src/ui/immersive/PhotoCorridor.jsx`
- Modify: `src/ScrollTunnel.jsx`

**Interfaces:**
- Produces: `PhotoCorridor({ stages, photos: [src: string, aspect: number][], startBg: string, endBg: string, style?: CSSProperties })` with exactly the geometry now in `ScrollTunnel.jsx` (panels face you far away and swing to the walls near).
- `ScrollTunnel` passes the home stages and the 9 photos to it.

- [ ] **Step 1:** Move the corridor out of `ScrollTunnel.jsx` into the kit component unchanged, parameterised by `stages` and `photos`. `ScrollTunnel` keeps only the home page's data and the `ScrollTriplet` fallback.
- [ ] **Step 2: Verify** the home corridor is pixel-identical, then that `/campus-life` and `/research` use it with their own photo order and stages. `npm test`, `npm run build`.

### Task 8: AlphaRail (Departments A–Z)

**Files:**
- Create: `src/ui/immersive/AlphaRail.jsx`
- Test: `tests/alpha.test.js` (pure grouping function, exported from the same file's sibling `src/lib/alpha.js`)

**Interfaces:**
- Produces: `groupByLetter(names: string[]): { letter: string, names: string[] }[]` (sorted, locale-aware, non-letters under `#`); `AlphaRail({ departments: { name: string, href?: string }[] })`

- [ ] **Step 1: Write the failing test:** `groupByLetter(['Zoology','Architecture','Aerospace'])` returns letters `A` (names `Aerospace`, `Architecture`) then `Z`; digits go under `#`; empty input returns `[]`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL. **Step 3: Implement** `src/lib/alpha.js`, then `AlphaRail`: a sticky letter column, the grouped list, jump on click and on `/departments#M`, active letter follows scroll, letters with no departments are disabled.
- [ ] **Step 4: Run** `npm test` and verify in the browser. Department names come from the official departments list already linked in `src/data/nav.js`; where the list is unavailable show a placeholder, not a fabricated list.

### Task 9: Assemble About, Campus life and Library

**Files:**
- Modify: `src/pages/Interior.jsx` (moment renderer), `src/data/page-kits.js`, `src/pages/Library.jsx`, `src/data/pages.json`

- [ ] **Step 1:** `Interior.jsx` renders `kitFor(slug).moments` in order between the hero and the existing card grid (the old blocks and split stay below as the "details" section). Add the renderer map `{ story, rail, corridor, countband, marquee, alpha, stepper } → component`.
- [ ] **Step 2:** About gets the StickyStory (stages from its `blocks`), Campus life the PhotoCorridor with chips for clubs, sports, NCC and NSS (links from `src/data/students.js`), Library gets the CinematicHero plus a sticky "Central Library is open now" CountBand-style strip (reuse `openNow()` from `Library.jsx`).
- [ ] **Step 3: Verify** each page at 1360 and 375 px, light and dark. `npm test`, `npm run build`.

### Task 10: Assemble Research and Rankings

- [ ] **Step 1:** Research: PhotoCorridor (lab, research and tech-park photos) with CountBand for patents, publications and funding from `pages.json` stats. Rankings: StickyStory with one stage per ranking using the exact figures already on the home page (`nirfRanks`, `rankStats` in `Home.jsx`; move them to `src/data/rankings.js` and import from both places).
- [ ] **Step 2: Verify** the figures match the home page exactly (add `tests/rankings.test.js`: the home page and the Rankings page read the same module). `npm test`, `npm run build`.

### Task 11: Assemble Placements and Scholarships

- [ ] **Step 1:** Placements: CountBand (`980+` companies, `5,546+` offers, `52 LPA`, `7.19 LPA`, from `Home.jsx`'s `placementStats`) plus a Marquee of recruiter names taken from the official Career Centre page; if the names cannot be read, use the placeholder `[Recruiter names to be added]`, not a guessed list.
- [ ] **Step 2:** Scholarships: Stepper "find your scheme" with three questions (level, field, category) that links to the official schemes already listed in `src/data/students.js` (`FEES`). It never asserts eligibility: it says "Based on your answers, check:" and links out.
- [ ] **Step 3: Verify** both pages; the Stepper works by keyboard only. `npm test`, `npm run build`.

### Task 12: Assemble International, Events, Alumni, Examinations and Departments

- [ ] **Step 1:** International: HorizontalRail (twinning, dual degree, semester abroad, global immersion; links from `src/data/students.js` `ABROAD`). Events: HorizontalRail of upcoming events (`upcomingEvents` in `Home.jsx`; move to `src/data/events.js`). Alumni: HorizontalRail of stories with placeholders. Examinations: Stepper over `EXAMS` in `src/data/students.js`. Departments: AlphaRail.
- [ ] **Step 2: Verify** each page: content present with and without motion, nothing invented. `npm test`, `npm run build`.

### Task 13: Cross-page QA, performance and docs

- [ ] **Step 1: Motion-off pass:** with `prefers-reduced-motion: reduce` and at 375 px, every one of the 12 pages shows all its content, nothing pinned, no horizontal page scroll (check `document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 2: Language and theme pass:** switch to Tamil and Hindi and to dark theme on every page; fix clipping. Add every new visible string to `src/data/translations.js` (the existing test requires Tamil and Hindi script in each entry).
- [ ] **Step 3: Budget:** `npm run build` — the main bundle must not grow by more than 25 kB gzip; kit code lives in lazily loaded page chunks.
- [ ] **Step 4: Docs:** README gets a "Page moments" table and how to add a moment; remove any dead code from the old compact hero.
- [ ] **Step 5: Final check:** `npm test`, `npm run build`, then open all 12 pages in the browser one by one.

---

## Self-review

- **Coverage:** all 12 links in the screenshot have a moment (table) and an assembling task: About, Campus life, Library (Task 9); Research, Rankings (10); Placements, Scholarships (11); International, Events, Alumni, Examinations, Departments (12). The shared hero and route curtain are Task 3; fallbacks and QA are Task 13.
- **Consistency:** `useScrollProgress`, `stageIndex`, `smooth` are defined in Task 1 and used in Tasks 5–7; `kitFor`/`KITS` defined in Task 2 and used in Tasks 3 and 9; `CountBand`, `Marquee`, `StickyStory`, `Stepper`, `HorizontalRail`, `PhotoCorridor`, `AlphaRail` names match across their defining and assembling tasks.
- **Not auto-tested:** the visual components. The project has no component-test setup, so each kit task has a browser verification step, and only the pure logic (`motion`, `page-kits`, `alpha`, `rankings`) has tests.
- **Proportion:** this plan is longer than the request because it covers 12 pages; no task contains component bodies, only signatures, test names and the decisions an implementer cannot make alone.

---

## Mega prompt (paste this into any coding agent)

> You are working in `C:\Users\sidhu\Desktop\srmist-home`, a React + Vite site redesigning srmist.edu.in. Read `README.md` and `docs/superpowers/plans/2026-11-06-immersive-pages.md` first, then implement the plan task by task.
>
> **Mission:** make these 12 pages as immersive as the home page: About SRM, Research, International, Placements, Rankings, Scholarships, Events, Library, Departments A–Z, Examinations, Alumni, Campus life. Today they all share one template (hero, 4 stats, 3 cards, split) and five of them reuse the same photo.
>
> **The bar is the home page:** word-by-word title rise, full-bleed photo with a slow push-in, sticky pinned stages whose text changes with scroll, count-up numbers, the 3D photo corridor (`src/ScrollTunnel.jsx`), colour hand-off into the next section, and a short curtain between routes. Reuse those moves; do not invent a second visual language.
>
> **Rules that are not negotiable**
> 1. One signature moment per page, chosen from its content (see the table in the plan). Build the shared kit once in `src/ui/immersive/` on one scroll-progress hook, then assemble pages from it.
> 2. Never invent facts. Use `pages.json`, `src/data/*.js` or the official site. Missing content becomes a dashed `[placeholder]` that says what belongs there.
> 3. Every animated or pinned moment needs a plain fallback with identical content for phones, short screens and reduced motion (same query as `ScrollTunnel.jsx`). Pinned length per page ≤ 260vh.
> 4. Dark theme, Tamil/Hindi (`t()` and `src/data/translations.js`), keyboard use and 44px touch targets must keep working.
> 5. Colours from theme tokens only. No new dependencies. Do not download from srmist.edu.in by scripts (its bot check blocks it); ask the owner to save photos into `public/srmist/`.
> 6. TDD for pure logic with `node:test`; browser-verify every visual component at 1360 px and 375 px, light and dark. `npm test` and `npm run build` must pass after every task.
>
> **Done means:** all 12 pages open with the cinematic hero, each has its own signature moment, nothing is clipped in Tamil or Hindi, reduced-motion shows full content, and the README documents how to add a moment.
