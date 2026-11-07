# SRMIST concept redesign: project context (compact handoff)

Written 2026-11-07, updated 2026-11-08, so a new session or teammate can pick up without the chat history. The feature-by-feature table is in `README.md`; this file is the map, the decisions and the caveats.

## What this is
An independent **concept redesign** of srmist.edu.in (not official, and the footer says so). React 18 + Vite 5 + react-router 6, plain CSS with theme tokens, no UI framework. The landing page is the visual reference: cinematic hero, big serif headings, blue / sand / paper / ink bands, gold accents, square gold CTAs.

- **Repo:** https://github.com/Advika-Singh/srmist-website (branch `main`). Push by committing in this folder and `git push origin main`; `.env*`, `.vercel`, `node_modules`, `dist` are git-ignored.
- **Live:** https://srmist-home-pink.vercel.app (Vercel team `daas7`, project `srmist-home`, linked in `.vercel/project.json`). **Last deployed 2026-11-07 (Placements). Everything listed under "Since the last deploy" below is in the repo and runs locally but is NOT deployed yet.**
- **Local:** `npm run dev` (port 5174; the preview tool uses launch config `srmist-dev`)
- **Tests:** `npm test` (node:test, 85 tests, pure logic only). **Build:** `npm run build`.
- **Deploy:** `npx vercel@latest deploy --prod --yes` (needs `vercel login` once; the account must belong to team `daas7`). Only deploy when asked.

## Since the last deploy (2026-11-08, in the repo, not live)
- **Search answer cards** (`lib/answers.js`, shown in `ui/SmartSearch.jsx`): "B.Tech CSE fees", "mbbs fees", "how long is b.tech", "last date to apply". Fee numbers come from `data/fees.js`, which is **illustrative** and labelled so; a campus named in the query adds "not campus-specific".
- **Home deadline strip** (`ui/DeadlineStrip.jsx`, `deadlineLine()` in `lib/srmjeee.js`); "Was this helpful?" (`ui/Helpful.jsx`) under answer cards and DAAS replies.
- **Search/assistant metrics**: `lib/searchStats.js` (`redact`, `summarise`, `logSearch`) and `POST /api/search-log` (`server/searchlog.js`, `api/search-log.js`). Writes one redacted `[search]` log line per event, stores nothing. Numbers to watch are in `docs/usability-test.md`.
- **Student innovation** (`/innovation`, `ui/InnovationRail.jsx` on home, `ui/StoryCard.jsx`, chip on the department directory): four stories, each with a source I read (SRMSat via ISRO, Swift Student Challenge, Forge Inspira drone idea, SRM–Aman Aviation award). Add stories only with a primary source.
- **Ask a current student** (`/ask-a-student`): seeded only from the sourced Career Centre stories; other topics show an empty state. "Ask a question" uses the existing `/support` form under a new category "Question for a current student" (added in `server/complaints.js` and `pages/Support.jsx`).
- **Navigation**: ~40 official menu links merged into `data/nav.js`, wrong URLs corrected (Management, Law, Agri, Public Health, Sports). The scraped menu tree is `public/data/official-nav.json` (read through the browser pane, because srmist.edu.in returns 403 to scripts). `lib/clickDepth.js` + `tests/click-depth.test.js` fail the build if key pages get buried.
- **Type system**: Playfair Display headings, DM Sans text, **Roboto Mono for small labels** (`.eyebrow`, `th`, `legend`), lining numerals everywhere (`body{font-variant-numeric:lining-nums}`; any rule that sets `tabular-nums` must also say `lining-nums`), and DM Sans's `&` replaced by Playfair Italic's swash `&` through an `Amp` font face (U+0026 only) at the front of `--sans` and `--mono`. Montserrat/Raleway were tried and dropped.
- **Fixes from the design review**: dark-mode Admissions bar, `/day` now has an `h1`, ≥36px tap targets for contact links and form labels, `.cb-grid li>span` (stat numbers had been styled as 12px captions), footer caption contrast.

## Decisions to remember
- Telugu was dropped. The **DAAS email check after 3 messages** is deferred (plan Task 4 in `docs/superpowers/plans/2026-11-07-ux-brief-plan.md`): server-side per-IP limit + email one-time code via a mail provider (Brevo suggested; needs `MAIL_API_KEY`, `MAIL_FROM`, `VERIFY_SECRET`).
- Mic/voice input and a hero pause button were built and then removed on request. The footer "Pause animations" toggle remains (WCAG 2.2.2).
- No separate mobile Apply bar: the existing `AdmissionsFab` already covers it.
- Plans and spec live in `docs/superpowers/`.

## Secrets and env
- `GEMINI_API_KEY` is set on the Vercel project (production, hidden) and in local `.env` (not uploaded; see `.vercelignore`). It is only read server-side. **The key was pasted into chat once: rotate it** (Google AI Studio), then `vercel env rm/add GEMINI_API_KEY production` and redeploy.

## Layout
- `src/Home.jsx` landing page (intro splash, hero, audience switch, corridor, recognition, fields, research, news run).
- `src/pages/` one file per page; `src/ui/` shared pieces; `src/ui/immersive/` scroll-driven pieces for inner pages (CinematicHero, PhotoCorridor, FacilityCollage, IrisStory, Bands, Stepper…).
- `src/data/` content (pages.json, nav.js, search-index.js, programmes.js, clubs.js, srmjeee.js, placements.js, translations.js…). `src/lib/` pure logic (search, courseFinder, availability, srmjeee, staffRoles, pageTranslate, pageFx, useScrollScenes…).
- `src/styles/` per-feature CSS (shell, immersive, clubs, finder, staff, srmjeee, placements, notfound…). Global: `index.css`, `theme.css` (tokens, dark theme), `redesign.css` (**last-loaded; most overrides go at its end**).
- `server/` Node handlers (chat, translate, status, complaints, enquiry, security); `api/` Vercel function wrappers; `server/gemini-plugin.js` serves the same handlers in `vite dev`.
- `public/data/staff.json` (2,516 staff), `public/srmist/` local photos, `scripts/` data tools.

## Routes
`/` home · interior pages from `data/page-kits.js` (about, research, international, rankings, scholarships, events, alumni, campus-life, departments, examinations) · `/placements` · `/library` · `/admissions`, `/apply/*` · `/status` · `/support` · `/access-map` · `/visitors` · `/hostels` · `/students` · `/clubs` · `/day` · `/course-finder` · `/staff-finder` · `/srmjeee` · `/innovation` (sourced student stories; `data/innovation.js`) · `/ask-a-student` (`data/student-voices.js`, only consented or sourced answers) · `/404` and `*` (custom 404). Search answer cards: `lib/answers.js`. Search/assistant metrics: `lib/searchStats.js` + `POST /api/search-log` (log lines only, redacted). Click-depth check: `lib/clickDepth.js`; usability script: `docs/usability-test.md`. Plan and spec: `docs/superpowers/`. Not built yet: Telugu (dropped) and the DAAS email check (deferred, see the plan's Task 4). `indexpage.html` redirects to `/staff-finder`; `teach.html` is the static Faculty Gateway.

## Key mechanisms
- **Page shell** (`styles/shell.css`, `ui/SvcHero.jsx`, `lib/pageFx.js`): photo hero + curtain overlap + banded sections + scroll reveal on every information page. Page transitions use View Transitions in `App.jsx`.
- **Language switcher**: hand-made dictionary (`data/translations.js`) for chrome; everything else is translated live by `lib/pageTranslate.js` via `POST /api/translate` (Gemini). Only text near the screen is sent; results cached in browser + server. DAAS replies in the chosen language. `data-notranslate` opts an element out.
- **Theme**: tokens in `theme.css`, dark via `html[data-theme='dark']`; the toggle (`ui/Preferences.jsx`) plays a wave via View Transitions. Home has a "white nav" state that needed explicit dark overrides.
- **Staff finder**: data from the official staff finder, collected with `node scripts/fetch-staff.mjs` then `node scripts/build-staff.mjs` (writes `public/data/staff.json`). Timetables/availability filter are **randomly generated per person** (`lib/availability.js`), labelled prototype everywhere.
- **Scroll scenes** on home use CSS vars from `lib/useScrollScenes.js` (desktop + motion allowed only).
- **DAAS** (renamed from "Ask SRM") is the Gemini assistant: `server/chat.js`, facts and allowed links are whitelisted there.

## Data provenance (be honest about these)
- Real, from official pages: SRMJEEE facts (applications.srmist.edu.in, admission-india), clubs and DSA, placements Career Centre facts, hostels, library hours/contacts, staff list/photos, rankings.
- Derived: accessible map (OpenStreetMap, almost nothing tagged), day-at-SRM routes (OSM paths), course-finder weights (our judgement).
- **Invented / prototype:** staff timetables and availability, the issue tracker's back end (no SRMIST integration), Tamil/Hindi translations (machine). All are labelled in the UI.

## Conventions
- Never invent facts about real people or SRMIST; label prototypes. Use real data + source links.
- Pages must work at 375px (header fits down to 320px; taps ≥ 36px). `localStorage.audit` trick used a phone audit script in the browser pane.
- Windows quirks: avoid several heredocs in one Bash call (write scripts with the Write tool); several files use CRLF; `npx` is blocked in PowerShell (use `npx.cmd` or Bash).
- Browser pane screenshots often lag one frame; take a second one.

## Known limits / next steps
- Rotate the Gemini key; translations need native-speaker review; no screen-reader audit or keyboard-only test of the dropdown menus; dark mode and phone spot-checked on the main pages only.
- Story cards could show the key fact (year, rank) in the panel instead of a generic icon; real photos need permission-cleared images.
- Fee figures are illustrative until the official fee schedule is loaded into `data/fees.js`.
- Design-review tooling note: contrast scripts misjudge text over photos and outline text; reload each page in each theme (`localStorage['srm-theme']`) before trusting numbers.
- Real staff availability needs a data source (timetable export or staff-entered hours).
- `/404` returns HTTP 200 (single-page app rewrite); campus filter hidden in staff finder (official data only ties people to Kattankulathur).
- Staff data is a 2026-11-06 snapshot; refresh with the two scripts. SRMJEEE dates are tentative per SRMIST; update `data/srmjeee.js`.
