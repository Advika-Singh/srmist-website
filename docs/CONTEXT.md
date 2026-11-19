# SRMIST concept redesign: project context (compact handoff)

Written 2026-11-07, updated 2026-11-08, so a new session or teammate can pick up without the chat history. The feature-by-feature table is in `README.md`; this file is the map, the decisions and the caveats.

## What this is
An independent **concept redesign** of srmist.edu.in (not official, and the footer says so). React 18 + Vite 5 + react-router 6, plain CSS with theme tokens, no UI framework. The landing page is the visual reference: cinematic hero, big serif headings, blue / sand / paper / ink bands, gold accents, square gold CTAs.

- **Repo:** https://github.com/Advika-Singh/srmist-website (branch `main`). Push by committing in this folder and `git push origin main`; `.env*`, `.vercel`, `node_modules`, `dist` are git-ignored.
- **Live:** https://srmist-home-pink.vercel.app (Vercel team `daas7`, project `srmist-home`, linked in `.vercel/project.json`). **Last deployed 2026-11-07 (Placements). Everything listed under "Since the last deploy" below is in the repo and runs locally but is NOT deployed yet.**
- **Local:** `npm run dev` (port 5174; the preview tool uses launch config `srmist-dev`)
- **Tests:** `npm test` (node:test, 112 tests, pure logic only). **Build:** `npm run build` (sitemap, then Vite, then `scripts/prerender-head.mjs`).
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

## Added 2026-11-08 to 2026-11-15 (in the repo, not live)
- **Pages:** `/privacy`, `/terms`, `/accessibility` (`ui/LegalPage.jsx`), `/campus-walk`, `/parents`, `/alumni/chapters`, `/recruiters` (content in `data/community.js`, cards in `ui/LinkCards.jsx`).
- **Compare programmes** (`/compare`, `pages/Compare.jsx`, `lib/compare.js`, `styles/compare.css`): up to three fields side by side, chosen in the address (`?fields=law,science`) so a comparison can be shared. Shows only what `data/programmes.js` and `data/srmjeee.js` hold, plus official links; fields with no published entrance exam say "See the official admissions page". No fees in the table (they are illustrative); it links to the fee calculator. **Shortlist** is kept in `localStorage['srm-shortlist']` and is listed in the privacy notice.
- **Key dates** (`/dates`, `pages/KeyDates.jsx`, `lib/ics.js`): SRMJEEE deadlines and exam days from `data/srmjeee.js`, each with "Add to calendar" and one `.ics` download for all upcoming dates. The file is built in the browser; every entry is labelled tentative and links the official dates PDF. Other exams are not listed because we hold no sourced dates for them.
- **SEO:** `lib/seo.js` now owns tab titles (`titleFor`, moved out of `App.jsx`), descriptions, canonical, share tags and JSON-LD (`WebSite` about SRMIST on home, `BreadcrumbList` elsewhere). `scripts/build-sitemap.mjs` writes the sitemap; `scripts/prerender-head.mjs` runs after the build and writes `dist/<route>/index.html` with each page's own head tags, so link previews work without JavaScript. `server/index.js` serves those copies; on Vercel they are expected to be served ahead of the rewrite, **not yet checked on a deploy** (if they are not, pages fall back to the shared `index.html` as before). A test fails if a page has a title but no description.
- **PWA:** `public/manifest.webmanifest` (name, colours, shortcuts, SVG icon). No service worker, so nothing is cached offline. PNG icons (192 and 512) are still needed for a full install prompt on Android.
- **Fix:** the countdown number on `/srmjeee` no longer wraps on phones.

## Added 2026-11-19 (branch `section-pages`, not pushed, not deployed)
- **Fourteen section pages** cover the official pages that had no redesign: `/colleges`, `/research/centres`, `/research/initiatives`, `/research/partners`, `/campus-life/student-life`, `/campus-life/living`, `/campus-life/wellbeing`, `/international/global`, `/international/pathways`, `/about/history`, `/about/leadership`, `/about/recognition`, `/about/offices`, `/contact`. One template (`pages/Section.jsx`), content in `data/sections.js`, one effect per section family in `ui/fx.jsx` (fan panels, pointer spotlight, hover index, tilt cards, sliced photos, sticky chapters, help filter, passport stamps, route line, sideways timeline, name roll, foil cards, folders, contact). Styles in `styles/sections.css`; no new colours or fonts.
- **Content rule:** every sentence was written from the official page named in its `href`, read through the browser pane on 2026-11-19 (the site returns 403 to scripts). Where the official page holds a list or number we did not read in full, the card links to it. Our own pages inside these lists are marked `ours: true`. `tests/sections.test.js` checks links, ids, images, SEO tables and that menu anchors land on a real card.
- **Menus:** 88 menu links that opened srmist.edu.in now open these pages (with an anchor to the card). Links to separate official sites (law, medical, dental, alumni, FAB LAB, srmdei) and to News, Blog and the campus sites still go out. The REACH link was removed: its official page returns 404.
- **Real 404 status:** `vercel.json` no longer rewrites unknown addresses to the app. `scripts/prerender-head.mjs` writes a file for every route (including the apply steps) and `dist/404.html` (the app's own 404 page, `noindex`). `tests/routes.test.js` fails if a route in `App.jsx` has no pre-rendered file. **Check on the first Vercel deploy:** deep links such as `/compare` must still open, and an unknown address must show the 404 design with status 404. The local server (`npm start`) already behaves this way.
- **Images:** `scripts/optimize-images.mjs` (sharp, a dev dependency) writes WebP next to each JPEG in `public/srmist` (1,112 KB to 610 KB). The app uses the WebP files; the JPEGs stay for link previews.
- **Stat bands** on the inner pages (`data/pages.json`) now hold only figures read from the official site on 2026-11-19, or from our own sourced data. Replaced: 300+ programmes in the old form, 8 faculties, 200+ partners, 80+ countries, 35+ destinations, 100+ award categories, 60+ centres, 40+ clubs, 15+ sports facilities, 24/7 support, 365 days and the old ₹48 Cr scholarships figure (the official home page says ₹30 Cr+ every year).
- **Fixes:** the gold words in the home-page marquee now use a darker gold in the light theme (contrast 3.5:1, was 1.41:1); links with a backslash are no longer handled as in-app links.
- **Still open from the audit:** the homepage and `data/placements.js` show 2023–24 placement figures while the official Career Centre page now shows the 2025 batch (as on 12 June 2026: 10190+ offers, 61 LPA highest, 6.5 LPA average); the official research page shows 1100+ patents, 58000+ publications and ₹294 Cr+ while our homepage still shows the older 920+, 47K+ and ₹250 Cr+; `clubs.js` says "100+ events each year" and `placements.js` "100+ active MoUs" (official: 150+ MoUs) without a source; `npm audit` still lists react-router 6 (the fix is the v7 upgrade, a breaking change; the open-redirect path is closed in `App.jsx`, there is no server rendering); mobile performance is about 82–84 with a 4.3 s largest paint.

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
`/` home · interior pages from `data/page-kits.js` (about, research, international, rankings, scholarships, events, alumni, campus-life, departments, examinations) · `/placements` · `/library` · `/admissions`, `/apply/*` · `/status` · `/support` · `/access-map` · `/visitors` · `/hostels` · `/students` · `/clubs` · `/day` · `/course-finder` · `/staff-finder` · `/srmjeee` · `/compare` · `/dates` · `/privacy` · `/terms` · `/accessibility` · `/campus-walk` · `/parents` · `/alumni/chapters` · `/recruiters` · `/innovation` (sourced student stories; `data/innovation.js`) · `/ask-a-student` (`data/student-voices.js`, only consented or sourced answers) · `/404` and `*` (custom 404). Search answer cards: `lib/answers.js`. Search/assistant metrics: `lib/searchStats.js` + `POST /api/search-log` (log lines only, redacted). Click-depth check: `lib/clickDepth.js`; usability script: `docs/usability-test.md`. Plan and spec: `docs/superpowers/`. Not built yet: Telugu (dropped) and the DAAS email check (deferred, see the plan's Task 4). `indexpage.html` redirects to `/staff-finder`; `teach.html` is the static Faculty Gateway.

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
