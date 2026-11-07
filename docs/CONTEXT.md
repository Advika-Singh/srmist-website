# SRMIST concept redesign: project context (compact handoff)

Written 2026-11-07 so a new session or teammate can pick up without the chat history. The feature-by-feature table is in `README.md`; this file is the map, the decisions and the caveats.

## What this is
An independent **concept redesign** of srmist.edu.in (not official, and the footer says so). React 18 + Vite 5 + react-router 6, plain CSS with theme tokens, no UI framework. The landing page is the visual reference: cinematic hero, big serif headings, blue / sand / paper / ink bands, gold accents, square gold CTAs.

- **Live:** https://srmist-home-pink.vercel.app (Vercel team `daas7`, project `srmist-home`, linked in `.vercel/project.json`)
- **Local:** `npm run dev` (port 5174; the preview tool uses launch config `srmist-dev`)
- **Tests:** `npm test` (node:test, 64 tests, pure logic only). **Build:** `npm run build`.
- **Deploy:** `npx vercel@latest deploy --prod --yes` (needs `vercel login` once; the account must belong to team `daas7`). Only deploy when asked.

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
`/` home · interior pages from `data/page-kits.js` (about, research, international, rankings, scholarships, events, alumni, campus-life, departments, examinations) · `/placements` · `/library` · `/admissions`, `/apply/*` · `/status` · `/support` · `/access-map` · `/visitors` · `/hostels` · `/students` · `/clubs` · `/day` · `/course-finder` · `/staff-finder` · `/srmjeee` · `/404` and `*` (custom 404). `indexpage.html` redirects to `/staff-finder`; `teach.html` is the static Faculty Gateway.

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
- Rotate the Gemini key; translations need native-speaker review; no screen-reader audit; dark mode and phone only spot-checked on newer pages.
- Real staff availability needs a data source (timetable export or staff-entered hours).
- `/404` returns HTTP 200 (single-page app rewrite); campus filter hidden in staff finder (official data only ties people to Kattankulathur).
- Staff data is a 2026-11-06 snapshot; refresh with the two scripts. SRMJEEE dates are tentative per SRMIST; update `data/srmjeee.js`.
