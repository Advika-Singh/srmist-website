# Audience Switch ("I'm a…") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-line "I'm a: Applicant / Parent / Current student / Visitor" control at the top of the home page that reorders the home sections and shows four quick links for that person.

**Architecture:** One pure data module (`src/data/audiences.js`) defines the four audiences, each one's section order and quick links, and is unit-tested with `node --test`. A small React component plus hook (`src/ui/AudienceSwitch.jsx`) holds the choice, saves it on the device and renders the control and links. `Home.jsx` becomes a flex column and gives each section a CSS `order` from the data module.

**Tech Stack:** React 18, Vite 5, plain CSS in `src/redesign.css`, `node:test` for the data module. No new dependencies.

**Spec:** None written. The design was agreed in conversation (plan 1 of 3: the others are the "SRM right now" strip and "A day at SRM" on the campus map). The decisions are under "Design decisions" below, with the calls made without asking the owner marked **(my call)**.

## Design decisions

- Four audiences, ids: `applicant`, `parent`, `student`, `visitor`. Labels: "Applicant", "Parent", "Current student", "Visitor".
- First visit shows today's page unchanged (`applicant` order). Nothing is auto-detected. **(my call)**
- Home sections get stable keys: `about` (intro panel), `triplet` (Learn · Leap · Lead), `rankings`, `fields` (study finder), `pathways`, `research`, `news`. The hero and footer never move.
- Section order per audience (left = first):
  - applicant: about, triplet, rankings, fields, pathways, research, news
  - parent: about, rankings, pathways, triplet, fields, research, news
  - student: research, about, triplet, fields, rankings, pathways, news
  - visitor: about, triplet, rankings, fields, research, pathways, news
- Quick links (label → href), real destinations only:
  - applicant: Start your application → `/apply`; Fee & ROI calculator → `/admissions#fees`; Programme finder → `/programmes`; Scholarships → `/scholarships`
  - parent: Fees & scholarships → `/scholarships`; Hostels → `https://www.srmist.edu.in/srm-hostels/`; Visit the campus → `/visitors`; Counselling & anti-ragging → `https://www.srmist.edu.in/life-at-srm/anti-ragging/`
  - student: Service status → `/status`; Report an issue → `/support`; Library → `/library`; Academia portal → `https://academia.srmist.edu.in/`
  - visitor: Visit the campus → `/visitors`; Campus map → `/visitors#layout`; Accessible routes → `/access-map`; Contact us → `https://www.srmist.edu.in/contact-us/`
- The choice is saved in `localStorage` key `srm-audience`. `?for=<id>` in the URL overrides it once on load. **(my call)**
- Control is a native radio group (`fieldset` + `legend` "I’m a") styled as pills. Changing it announces "Showing the <label> view" in a polite live region. No animated reorder; the change is instant.

## Global Constraints

- No new npm dependencies.
- Colours come from the theme tokens so dark theme works (`var(--paper)`, `var(--ink)`, `var(--blue)`, `var(--gold)`, `var(--line)`). No hard-coded light surfaces.
- Touch targets at least `var(--tap)` (44px). Visible focus is the existing `:focus-visible` style.
- Storage access is always inside try/catch; the page must work with storage blocked.
- Existing hash links (`#about`, `#programmes`, `#apply`, `#research`) must still land on their sections.
- The project is not a git repo, so each task ends with `npm test` and `npm run build` passing instead of a commit.

## Review Focus

- Saved value is garbage (`srm-audience=zzz`) → falls back to `applicant`, no crash.
- Storage blocked or throwing → control still works for the session.
- `?for=parent` on a first visit → parent view; `?for=nonsense` → ignored.
- Keyboard only: arrow keys move between audiences, nothing needs a mouse.
- Reordering keeps the pinned Learn · Leap · Lead scroll sequence working and does not break scroll reveals.
- Screen reader hears the change; dark theme and 375px width both look right.

---

### Task 1: Audience data module and tests

**Files:**
- Create: `src/data/audiences.js`
- Create: `tests/audiences.test.js`
- Modify: `package.json` (add script `"test": "node --test tests/"`)

**Interfaces:**
- Produces:
  - `export const SECTION_KEYS: readonly string[]` — the seven keys in the applicant order.
  - `export const AUDIENCES: readonly { id: string, label: string, links: readonly [string, string][] }[]`
  - `export const DEFAULT_AUDIENCE: 'applicant'`
  - `export const isAudience: (v: unknown) => boolean`
  - `export const parseAudience: (search: string, stored: string | null) => string` — returns a valid id: `?for=` wins if valid, else `stored` if valid, else the default.
  - `export const orderFor: (audience: string, key: string) => number` — 0-based position of `key` for that audience; unknown audience uses the default.

- [ ] **Step 1: Write the failing tests** in `tests/audiences.test.js`, using `node:test` and `node:assert/strict`:
  - `every audience orders all seven sections exactly once` — for each audience, the positions `orderFor(id, key)` over `SECTION_KEYS` are a permutation of 0–6.
  - `applicant order is today's page` — `SECTION_KEYS.map(k => orderFor('applicant', k))` equals `[0,1,2,3,4,5,6]`.
  - `parent view puts rankings before the programme list` — `orderFor('parent','rankings') < orderFor('parent','fields')`; `student` puts `news` first (`orderFor('student','news') === 0`).
  - `each audience has exactly four links and every href is /path or https://` .
  - `parseAudience` cases: `('?for=parent', null) → 'parent'`; `('?for=bogus', 'visitor') → 'visitor'`; `('', 'zzz') → 'applicant'`; `('', null) → 'applicant'`; `('?for=student', 'parent') → 'student'`.
  - `orderFor('nope','about')` equals `orderFor('applicant','about')`.

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `src/data/audiences.js` with the exports above, using the orders and links from "Design decisions" verbatim. Keep it free of React and browser APIs so Node can import it.

- [ ] **Step 4: Run** `npm test` — Expected: all tests PASS.

### Task 2: AudienceSwitch component

**Files:**
- Create: `src/ui/AudienceSwitch.jsx`
- Modify: `src/redesign.css` (append the styles)

**Interfaces:**
- Consumes: `AUDIENCES`, `DEFAULT_AUDIENCE`, `parseAudience` from Task 1; `track(name: string, data?: object)` from `src/lib/experiments.js`.
- Produces:
  - `export function useAudience(): [string, (id: string) => void]` — initial value is `parseAudience(location.search, localStorage 'srm-audience')`; the setter validates with `isAudience`, saves to `localStorage` (try/catch) and calls `track('audience_selected', { audience })`.
  - `export default function AudienceSwitch({ audience, onChange }: { audience: string, onChange: (id: string) => void })` — renders the `fieldset`/`legend` radio group, the four quick links for the current audience as `<a>` elements (links starting with `/` stay in-app, others open normally with `target="_blank" rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)"), and a `role="status"` live region reading "Showing the <label> view" (empty on first render so nothing is announced on load).

- [ ] **Step 1: Implement** `useAudience` and `AudienceSwitch` as above. Radios are native `<input type="radio" name="audience">` so arrow keys work for free; the visible pill is the `<label>`.

- [ ] **Step 2: Style** in `src/redesign.css`: a pill row (`.aud`, `.aud-pill`, `.aud-links`) using only theme tokens; selected pill filled `var(--blue)` with white text; link row wraps; at ≤600px pills scroll horizontally without a page-level scrollbar; the live region uses the existing `.sr-only`.

- [ ] **Step 3: Verify** by running `npm run build` — Expected: build succeeds with no import errors.

### Task 3: Wire into the home page

**Files:**
- Modify: `src/Home.jsx` (the `<main className="home-curtain">` block)
- Modify: `src/ScrollTriplet.jsx` (accept and apply a `style` prop on its root `<section>`)
- Modify: `src/index.css` (`.home-curtain` becomes `display:flex;flex-direction:column`)
- Modify: `README.md` (one line under "Home page")

**Interfaces:**
- Consumes: `useAudience`, `AudienceSwitch` from Task 2; `orderFor` from Task 1.

- [ ] **Step 1:** In `Home`, call `const [audience, setAudience] = useAudience()`. Render `<AudienceSwitch>` as the first child of `<main className="home-curtain">` with `style={{ order: -1 }}`.

- [ ] **Step 2:** Give each section a `style={{ order: orderFor(audience, key) }}`: `intro-panel` → `about`, `<ScrollTriplet style=… />` → `triplet`, `rankings`, `study-finder` → `fields`, `pathways`, `feature-story` → `research`, `happenings` → `news`. Keep every existing `id` and class.

- [ ] **Step 3: Verify in the browser** (dev server, desktop and 375px): first visit looks exactly as today; clicking each audience reorders sections and swaps the four links; reload keeps the choice; `/?for=parent` opens the parent view; `localStorage.setItem('srm-audience','zzz')` then reload shows the applicant view; Tab and arrow keys operate the control; `#programmes` link still scrolls to the fields section; the Learn · Leap · Lead block still pins while scrolling in every audience; dark theme looks right.

- [ ] **Step 4: Run** `npm test` and `npm run build` — Expected: both pass.

- [ ] **Step 5:** Add one README line: the switch, where its data lives (`src/data/audiences.js`), and the `?for=` parameter.

---

## Self-review

- **Coverage:** order, links, persistence, URL override, accessibility, dark theme and every Review Focus line map to a task (data/parse cases in Task 1; storage and keyboard in Task 2; reorder/pin/hash/dark/375px in Task 3 Step 3).
- **Consistency:** `useAudience`, `AudienceSwitch`, `orderFor`, `parseAudience`, `DEFAULT_AUDIENCE` are defined in Tasks 1–2 and used with the same names in Task 3.
- **Not tested automatically:** the React pieces and layout. There is no component test setup in this project, so Task 3 Step 3 is a manual browser check.
