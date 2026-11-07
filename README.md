# srmist-home: SRMIST website redesign (concept)

> **New here?** Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first: a compact map of the project, how to run and deploy it, where the data comes from, and what is a prototype.

A React + Vite redesign of srmist.edu.in, built from a Figma design. Live: https://srmist-home-pink.vercel.app (Vercel team `daas7`; deployed 2026-11-07 with everything below).

Last updated 2026-11-06 (services, visitors, library, dark theme, shorter home page). Longer write-up of the redesign, security checklist and A/B plan: [`docs/REDESIGN.md`](docs/REDESIGN.md). Talk script: `PRESENTATION_SCRIPT.md`.

## Run it locally

```bash
npm install
npm run build && npm start      # production server (also serves /api/chat and /api/enquiry), PORT=4291 npm start to pick a port
npm run dev                     # Vite dev server with live reload
npm run audit:contrast          # WCAG check of the colour tokens in src/theme.css
npm run audit:deps              # npm audit (production dependencies)
```

- Port 4180 was already taken by an older server on this PC; the working test server ran on **4291**.
- The server serves the last build, so run `npm run build` after changes.
- AI chat answers need `GEMINI_API_KEY` in `.env`. Without it the chat cards still work and the written answer falls back to a short local reply.
- Enquiry forms need `ENQUIRY_WEBHOOK_URL` (CRM, Slack, Zapier). Without it the server only logs the enquiry and replies `delivered:false`.

## Current state

| Area | State |
|---|---|
| **Home page** | Cinematic hero (small "NAAC A++ · NIRF 2025" line, no rank row, no est. date or coordinates), white header bar, then intro, scroll "Learn · Leap · Lead" as a 3D photo corridor (`src/ScrollTunnel.jsx`, scroll-driven, after the Melius site; phones, short screens and reduced motion get the stacked rows in `ScrollTriplet.jsx`), programmes, pathways, rankings, research, news. **Trimmed from 14 sections to 7 on request** (removed: campus photo, marquee, stats band, destinations, global, service gateway, campuses). The tabbed version was rejected earlier, don't re-apply it. Full previous version: `src/Home.full.backup.jsx` (not imported by anything). The floating mini nav was removed: the normal header now stays on screen like srmist.edu.in. |
| **Audience switch** | "I’m a: Applicant / Parent / Current student / Visitor" bar under the hero. Reorders the home sections and swaps four quick links. Data and order in `src/data/audiences.js` (tests: `npm test`), component `src/ui/AudienceSwitch.jsx`. Saved on the device; `/?for=parent` opens a view directly. |
| **Services** | `/status` live portal checks (`server/status.js`, probes the real Academia, Student Portal, LMS, Student Connect, ITKM Service Desk, CoE page, main site). `/support` issue tracker with reference numbers (`server/complaints.js`, stored in `server/data/complaints.json`; staff move status with `PATCH /api/complaints` and `COMPLAINTS_ADMIN_TOKEN`). **Prototype only, not connected to SRMIST systems.** `/access-map` step-free map. All under the "Services" nav menu. |
| **Accessible map** | `src/ui/CampusMap.jsx` draws OpenStreetMap shapes as SVG (no tiles, CSP unchanged). Data via `node scripts/build-campus-map.mjs` into `src/data/campus-map.json` and `nearby.json`. OSM has almost no accessibility tags for the campus, so the page says so. |
| **Visitors** | `/visitors`: campus map, SRM Hotel (real phone and booking link from srmhotels.com), nearby stays and food (OSM, sparse), getting here. |
| **A day at SRM** | Its own page at `/day` (Services menu → Visiting SRM; `src/pages/Day.jsx`). Pinned 3D scene (`src/ui/DayAtSRM.jsx`, `src/styles/day.css`): the real campus map is tilted and the buildings lifted; as you scroll a student walks real campus paths hostel → Tech Park → Java Green → library → sports ground → hostel while the clock runs and the light goes dawn to night. Routes are computed along the OpenStreetMap paths by `node scripts/build-day-data.mjs` into `src/data/campus-day.json` (needs `campus-map.json` first). Pure logic in `src/lib/day.js`, tested. Phones, short screens and reduced motion get a flat map plus the stops as cards. It is an "illustrative day": times are for the story, hours and distances are real. |
| **Shared page shell** | Every information page (status, support, access map, visitors, hostels, students) shares the landing page's look and motion: `src/ui/SvcHero.jsx` (photo hero under a blue tint, title rising word by word, parallax) with the content sliding up over it like the home curtain, alternating sand/paper bands, lifting cards and a blue closing card (`src/styles/shell.css`). `src/lib/pageFx.js` fades each block in as it scrolls into view (only when JavaScript runs and motion is allowed; honours reduced motion and the pause toggle). Page-to-page navigation uses the same view-transition cross-fade everywhere, and the route loader is a thin progress bar. The Clubs page (`/clubs`, `src/data/clubs.js`) lists the 15 DSA clubs with the official photos. |
| **Course finder** | `/course-finder` (`src/pages/CourseFinder.jsx`), linked from a blue banner under the search box in the home page's "What do you want to study?" and from Academics in the menu. Five questions (what sounds like you, how you learn, what you want after graduating, favourite school subjects, level) are scored by `src/lib/courseFinder.js` against the eight fields in `programmes.js`; the weights are in `src/data/finder-questions.js` and are our own judgement. It returns up to three fields with the reasons, the programme examples and typical lengths from `programmes.js`, and links to start an application. It says plainly that eligibility is decided by SRMIST. Tested in `tests/course-finder.test.js`. English only for now. |
| **Language switcher (whole site)** | English, Tamil and Hindi. The hand-made dictionary (`src/data/translations.js`) covers the header, hero and landing sections; everything else is translated in the page by `src/lib/pageTranslate.js`: while Tamil or Hindi is on, it finds the visible English text (and placeholders, labels, titles and the document title) near the screen, sends it in batches to `POST /api/translate` (`server/translate.js`, `api/translate.js`; Gemini, key stays on the server, results cached in memory and in the browser), and writes the translation into the same text nodes. Switching back to English restores the originals. Proper names, numbers and acronyms are kept; wrong-script output is caught and retried. DAAS also answers in the chosen language. It is machine translation, so wording will not always be perfect, and a first visit to a page takes a moment while the batches arrive. |
| **Staff finder** | `/staff-finder` (`src/pages/StaffFinder.jsx`; the old `indexpage.html` now redirects to it). Every faculty and staff profile from the official SRMIST staff finder, with photo, designation and research areas, each linking to the person's official profile. Search a name, department or research area, or filter by campus, college, department, faculty type and role (role is grouped from the designation text in `src/lib/staffRoles.js`, tested), with a photo-only switch, sorting, removable filter chips and clickable research tags. Data is a snapshot: `node scripts/fetch-staff.mjs` reads the official list (the same public endpoint the site's own form uses, one request at a time) and `node scripts/build-staff.mjs` writes `public/data/staff.json`; re-run both to refresh. Names, photos and designations are as the university publishes them, so mistakes need fixing at the source. The earlier sample directory on `teach.html` (invented offices, emails and availability) was removed. |
| **SRMJEEE 2027 page** | `/srmjeee`, with an `SRMJEEE` button beside Admissions 2027 in the top bar (and in the phone menu). Facts are copied from SRMIST's own pages (`applications.srmist.edu.in/btech`, `srmist.edu.in/admission-india/`, checked 2026-11-06) into `src/data/srmjeee.js`: two phases (17-18 Apr and 19-20 Jun 2027, apply by 2 Apr / 4 Jun, tentative), fee Rs 1,400 per phase, the five registration steps, the eligibility rule and links to the official portal and dates PDF. A countdown shows days to the next deadline, and an eligibility self-check restates the published rule (`src/lib/srmjeee.js`, tested). Registration itself happens on SRMIST's portal: nothing is collected here. Update the data file when SRMIST changes the dates. |
| **News run and SRM sketch** | "What's happening" is two rows of story and event cards drifting in opposite directions (`src/ui/NewsRun.jsx`); hover, focus or the footer's pause toggle stops them, and reduced motion turns them into hand-scrollable rows. Every page's footer ends with a sketch that draws itself once (`src/ui/SrmSketch.jsx`): "SRM" in the middle, in the logo's own lettering (outline path in `src/ui/srmWordmark.js`, taken from `public/brand/srm-logo.svg`), with dashed rings, rays and twelve small subject icons (study, labs, medicine, law, design, farming, hospitality, ideas) emerging from it. |
| **Landing page scroll scenes** | After Recognition the home page moves with your scroll (`src/lib/useScrollScenes.js`, active only with motion on and screens 640px and wider): the field cards rise and un-blur in a staggered wave, a band of huge words (Learn, Question, Build, Discover, Lead) slides in opposite directions, the research photo opens from a small rounded window and drifts while the copy slides across, the blue news panel slides over it like a curtain, and a thin gold progress line runs along the top of the page. Everything is written as CSS variables (`--sp`, `--sc`, `--page-p`), so there are no React re-renders; without motion the page is plain. |
| **Immersive inner pages** | The 12 inner pages (About, Research, International, Placements, Rankings, Scholarships, Events, Library, Departments, Examinations, Alumni, Campus life) open with a cinematic hero and each has its own scroll moment. Kit in `src/ui/immersive/` (PhotoCorridor, StickyStory, HorizontalRail, CountBand/Marquee, Stepper, AlphaRail), per-page choices in `src/data/page-kits.js`, content pulled from `pages.json` and `src/data/*.js`. To add a moment: build or reuse a component, add its type to `MOMENTS` and a case in `Moments.jsx`, then list it in the page kit. Phones, short screens and reduced motion get plain stacked layouts. |
| **Students** | `/students` (the strip "Students" link): portals, fees and loans, exams and certificates, academic calendars by faculty, careers, study abroad and campus-life links, all from the official Students page. Data in `src/data/students.js`. |
| **Hostels** | `/hostels` (Campus life menu): 22 blocks (10 boys, 10 girls, 2 international) from the official Directorate of Hostels pages, with features, room types, floor-plan PDFs, warden contacts, mess timings and distances to UB / Tech Park / Main Block / Java Green (straight-line, from the OpenStreetMap campus map). Data in `src/data/hostels.js`. Missing items show a dashed `[placeholder]` saying what belongs there (mess weekly menu, some photos, distances for blocks not on the map). Photos are loaded from srmist.edu.in (CSP `img-src` allows that host) and fall back to a placeholder box if they fail. |
| **Library** | `/library`: real timings, librarian, contact and links read from library.srmist.edu.in. No floor plan is published, so none is shown; set `FLOOR_PLAN` in `src/pages/Library.jsx` when you have one. |
| **Language & theme** | English / தமிழ் / हिन्दी switcher and a dark theme in the header (`src/ui/Preferences.jsx`, `src/i18n.jsx`, strings in `src/data/translations.js`, tested by `npm test`). Tamil/Hindi cover the header, hero, "I’m a" bar, Learn · Leap · Lead, recognition band and field list; everything else is still English. To translate more, add a pair in translations.js and wrap the text with `t()`. The old A−/A/A+ text-size buttons were removed. |
| **Header** | Logo sits in a solid white box (blue outline, gold base edge), always the dark logo. No Admissions button in the desktop header. On phone/tablet (≤900px) a gold **Admissions** pill sits in the header next to search and the menu. A floating **Admissions** button (bottom-left) shows on desktop, and on small screens only after the header scrolls away. |
| **Admissions** | Separate portal screen at `/admissions` (`src/pages/Admissions.jsx`): slim header, pathway tabs, fee & ROI calculator, enquiry form. Hero copy is an A/B test (`?v=A` / `?v=B`). Footer and links still say "Admissions 2027". |
| **Inner pages** | One template (`src/pages/Interior.jsx`): sticky "On this page" bar, card grid, programme table on `/programmes` and `/academics` (becomes stacked cards below 720px, no horizontal scroll). `/about` and `/campus-life` also show the Tilt image grid. `/about` shows the large "Deemed to be University" badge. |
| **Search** | Ctrl/⌘ K or `/` opens a typo-tolerant, intent-aware palette (`src/ui/SmartSearch.jsx`, `src/lib/search.js`). Unanswered queries go to the chat. |
| **Chat (SRM Guide)** | Replies include action cards: programme, live fee estimate, apply, call-back form (`src/ui/chatCards.jsx`). Cards show instantly; the model's answer fills in after. |
| **Images** | Unsplash replaced with SRMIST's own photos in `public/srmist/` (hero aerial, campus, tech park, labs, library, sports, students). Alt text rewritten to match. |
| **Tilt grid** | `src/ui/TiltGrid.jsx`: `react-parallax-tilt` + Tailwind, 1/2/3 columns, 6 cards. Tailwind v3 is scoped to this one file (`tailwind.config.js`, preflight off). |
| **Accessibility** | `src/theme.css` tokens; 18 colour pairs all pass AA (`reports/check-theme-contrast.mjs`). Measured at 390px and 820px: no sideways scrolling on any page. |
| **Security** | CSP (`script-src 'self'`), HSTS, nosniff, frame-ancestors none, etc. in `server/security.js`, `vercel.json`, `public/_headers`. `/api/enquiry` has CSRF header check, same-origin check, validation, honeypot, per-IP rate limit. |

## Project map

```
src/
  Home.jsx            original landing page (restored)
  shared.jsx          header (MainNav), assistant, footer, Photo, IMG map, AdmissionsFab
  App.jsx             routes, view transitions, mounts SmartSearch + AdmissionsFab + Assistant
  pages/              Admissions.jsx (portal), Interior.jsx (all inner pages), Apply.jsx (4-step form, reads ?field=)
  ui/                 SmartSearch, chatCards, EnquiryForm, FeeCalculator, CampusExplorer, TiltGrid, blocks (Tabs, Carousel, ResponsiveTable, AboutDeemed)
  lib/                search.js (fuzzy search), experiments.js (A/B + track())
  data/               nav.js, pages.json, programmes.js, fees.js, search-index.js, routes.js
  theme.css           WCAG tokens   ·   redesign.css  new component styles   ·   tailwind.css  Tilt grid only
server/               index.js (prod server), chat.js (Gemini proxy), enquiry.js, status.js, complaints.js, util.js, security.js, gemini-plugin.js (Vite dev/preview)
scripts/              build-campus-map.mjs (refreshes the OSM map and nearby-places data)
api/                  chat.js, enquiry.js, status.js, complaints.js (Vercel functions; Vercel disk is temporary, so issues do not last there)
public/srmist/        original SRMIST photos   ·   public/brand/ logos   ·   public/fonts/
docs/REDESIGN.md      full write-up   ·   reports/  Lighthouse + contrast audits
```

`Tabs`, `Carousel` and `CampusExplorer` are built and tested but **not used on the home page now**. `CampusExplorer` is not used anywhere. `docs/REDESIGN.md` still describes the shorter tabbed home page; that part is outdated.

## Things to do before launch

1. **Fee figures are placeholders** (`src/data/fees.js`, flagged in the UI). Replace with the official fee schedule.
2. **Verify the Deemed status wording** ("Under Section 3 of the UGC Act, 1956"). It wasn't on the official-site copy used.
3. Set `ENQUIRY_WEBHOOK_URL`; add a privacy notice and retention rule for enquiries.
4. Add `upgrade-insecure-requests` to `server/security.js` (already in `vercel.json` and `_headers`).
5. `npm audit` reports issues (the install of Tilt/Tailwind showed 4: 3 moderate, 1 high). Not reviewed yet.
6. Rate limits are in memory and reset on restart; move to a shared store for production.
7. Programme lengths in `src/data/programmes.js` are typical national durations; confirm against SRM programme pages.
8. Photos belong to SRMIST; confirm permission to use them beyond a concept.
9. Some photos are small (the lakeview is 600px); fine for cards, not full-screen.
10. Set `COMPLAINTS_WEBHOOK_URL` / `COMPLAINTS_ADMIN_TOKEN` and move the issue store to a real database (or SRMIST's own ticketing) before using the tracker for real.
11. The NeWake demo font was tried and removed (personal-use licence, no punctuation). `newake.zip` is still in the project root.
12. Deploy to Vercel once local testing is done (`vercel.json` already has headers, rewrites and the `/api/chat` function; add the `api/enquiry.js` function and env vars `GEMINI_API_KEY`, `ENQUIRY_WEBHOOK_URL`).

## Image sources

Saved from https://www.srmist.edu.in/wp-content/uploads/ using headless Chrome (the site blocks plain downloads). Full list with source URLs is in `srmist-images.zip` (`SOURCES.txt`), saved next to this folder at `OneDrive/Desktop/FIGMA/srmist-images.zip`.

## Conventions

- The home page was shortened at the user's request on 2026-11-06 (backup kept). Keep the original look of the sections that remain.
- Facts on the site come from srmist.edu.in, checked 2026-11-05 (NAAC A++, NIRF 2025, placements 2023–24, phone numbers).
