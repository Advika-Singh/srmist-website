# Session handoff: SRMIST concept redesign (2026-11-08 to 2026-11-15)

Paste or point a new conversation at this file, then at `docs/CONTEXT.md` (project map), `docs/ROADMAP.md` (plan) and `docs/DESIGN-HANDOFF.md` (design spec). This file records what happened in the last long session, what the user likes and dislikes, and what is left.

## State right now
- Repo: https://github.com/Advika-Singh/srmist-website, branch `main`, local folder `D:\srmist-home`. Local `main` equals `origin/main` at `f6da0d4`. Working tree clean (except this file, if not yet committed).
- Live site: https://srmist-home-pink.vercel.app was last deployed 2026-11-07. Nothing from this session is live. Deploy only when the user asks (`npx vercel@latest deploy --prod --yes`).
- Run locally: `npm run dev` (port 5174; preview launch config `srmist-dev`). `npm test` = 89 tests, all pass. `npm run build` also writes `public/sitemap.xml` first.
- Git author is set for this repo only: `phoenixada2118 <phoenixada2118@gmail.com>`. Commit trailer used: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## The user's goals and taste
- Main task: redesign the original srmist.edu.in into something better, with what a real university site has (safety, design, tech, product), **without straying from the current theme** (Playfair headings, DM Sans text, Roboto Mono labels, blue / sand / paper / ink bands, gold square CTAs, `--ease` motion, dark theme).
- Wants to **beat** https://srmist-redesign.vercel.app/ (another student redesign: video hero, 360° tour, Ask SRM bar, legal pages, parents and alumni sub-pages). We lead on tools, accessibility and safety; they lead on visual impact.
- **Likes the homepage as is.** Keep it. Preferences learned:
  - Asked to remove the search bar I added under "I'm a Applicant" (did not fit the design). Removed.
  - Tried a video / drift behind the hero, then asked to go back to the original: **keep the original blur-in photo swap, plus the newer photos**. Done: the hero is original; `campus-lakeview.jpg` was added to `HERO_CYCLE` in `src/Home.jsx`.
  - Wants to see a **mockup first**, then decide, before big changes.
  - Do **not** copy another site's video or assets. If a video is wanted later, it needs a clip the user has permission to use, saved at `public/srmist/hero-loop.mp4` (the code for it was removed, so it would need re-adding).
- Never invent facts about SRMIST or people. Real data with a source link, or a visible "prototype" label. (Notable alumni were deliberately not listed because no official list exists.)

## What was done this session (all committed and pushed)
| Commit | What |
|---|---|
| `b31953c` | Accessibility fixes from the review, plus `docs/DESIGN-HANDOFF.md` |
| `c4618a9` | `/privacy` page, `docs/ROADMAP.md`, `upgrade-insecure-requests` in the CSP (HTTPS only) |
| `f6da0d4` | `/campus-walk`, `/parents`, `/alumni/chapters`, `/recruiters`, `/terms`, `/accessibility`; per-page SEO; sitemap; nav, search and Visitors links |

Details:
- **Accessibility audit of the homepage** (WCAG 2.1 AA): found 4 minor or major items and fixed 3: Esc in a nav dropdown now returns focus to its button (`src/shared.jsx`, `returningFocus` ref); short text links get 44px targets (end of `redesign.css`); all font sizes under 12px raised to 12px. A "clipped theme button" finding did not reproduce. Still not done: screen-reader testing, dark theme and phone checks beyond the main pages, keyboard test of every page.
- **Privacy / Terms / Accessibility pages**: share `src/ui/LegalPage.jsx` (Privacy has its own file). Plain language, describe the prototype, flagged for legal review. A "Privacy request" category was added to the support form (`server/complaints.js`, `src/pages/Support.jsx`).
- **SEO**: `src/lib/seo.js` sets description, canonical, Open Graph and Twitter tags per route on the client; `index.html` has site-wide defaults; `scripts/build-sitemap.mjs` writes `public/sitemap.xml` (33 URLs); `robots.txt` points to it. Limitation: link previews from crawlers that do not run JS still get only the `index.html` defaults, so true per-page previews need prerendering (roadmap phase 2). `SITE` in `seo.js` is `https://srmist-home-pink.vercel.app`.
- **Campus walk**: five stops from `src/data/campus-day.json` (OpenStreetMap derived), walking time assumes 80 m a minute, links to the official 360° tour.
- **Parents, Alumni chapters, Recruiters**: content in `src/data/community.js`, read from srmist.edu.in pages on 2026-11-08 via the browser pane (the site returns 403 to scripts). Cards use `src/ui/LinkCards.jsx`. Recruiters reuses `src/data/placements.js`. Nav: top-strip "Parents" now opens `/parents`; Campus life menu has "Alumni chapters"; About menu has "Hire from SRMIST".
- `SmartSearch.openSearch(text)` can now open with a starting query (no caller uses it now, since the ask bar was removed).

## Open items (nothing here was started unless stated)
- **Roadmap phases** (`docs/ROADMAP.md`): phase 1 trust and safety is only partly done. Still needed: set `ENQUIRY_WEBHOOK_URL` so leads go somewhere; DAAS email check after 3 messages (needs `MAIL_API_KEY`, `MAIL_FROM`, `VERIFY_SECRET`); shared rate limits (Redis); CSP report-to; rotate the Gemini key (it was pasted into chat once); screen-reader audit. Phase 2: prerendering, JSON-LD, privacy-friendly analytics, PWA manifest, AVIF/WebP images. Phase 3: programme compare, scholarship checker, application tracker, events calendar (.ics), saved shortlist. Phase 4: native-speaker review of Tamil/Hindi, official fee schedule into `data/fees.js`, permission-cleared photos.
- **Not yet linked or shown**: the new Parents / Recruiters pages are not on the homepage (user wants the homepage left alone). `/campus-walk` is in the Campus life menu, the Visitors quick links and search.
- **Terms/Privacy/Accessibility text** needs the university's legal review before any real launch.
- **Deploy** has not been done since 2026-11-07.
- `docs/CONTEXT.md` has not been updated for this session. Add the new routes (`/campus-walk`, `/parents`, `/alumni/chapters`, `/recruiters`, `/terms`, `/accessibility`, `/privacy`) and the SEO files when convenient.

## Gotchas learned (save time)
- **Mixed line endings (CRLF and LF)** in several files (`Home.jsx`, `SmartSearch.jsx`, `nav.js`, CSS files). Multi-line `node` string replaces silently fail on them; **use the Edit tool** or single-line replaces, then verify with `grep`.
- **Do not run shell heredocs that pipe into `python -`**: it hung once and needed killing. Write scripts to files instead.
- **Browser pane width**: below 900px the site shows the mobile layout (desktop nav buttons are not visible). Use `resize_window` to 1280 for desktop tests, then reset with preset `desktop`. Screenshots often lag one frame; also check with `javascript_tool`.
- **Vite module cache** can get stuck after file reverts (blank page, "does not provide an export" in the console). Fix: stop and restart the dev server with `preview_stop` / `preview_start`.
- Home page header can be hidden during the intro splash; menu and focus tests are easier on a page like `/clubs`.
- A portable `ffmpeg` was fetched into the old session's scratchpad only; it is not in the repo or installed globally.
- Windows: `npx` is blocked in PowerShell (use Bash or `npx.cmd`). Git warns "LF will be replaced by CRLF"; that is harmless.

## Key files added or changed this session
`src/pages/{Privacy,Terms,Accessibility,CampusWalk,Parents,AlumniChapters,Recruiters}.jsx`, `src/ui/{LegalPage,LinkCards}.jsx`, `src/data/community.js`, `src/lib/seo.js`, `scripts/build-sitemap.mjs`, `tests/seo.test.js`, `src/App.jsx` (routes, titles, prefetch, `applyMeta`), `src/shared.jsx` (footer links, nav Esc focus fix), `src/data/{nav,search-index}.js`, `src/pages/Visitors.jsx`, `src/redesign.css` and `src/services.css` (new styles at the end), `docs/{DESIGN-HANDOFF,ROADMAP,SESSION-HANDOFF}.md`.

## Suggested next steps for a new session
1. Read `docs/CONTEXT.md`, this file and `docs/ROADMAP.md`; run `git pull`, `npm install`, `npm run dev`, `npm test`.
2. Ask the user which to do next: finish phase 1 (needs their keys and decisions), prerender or JSON-LD for sharing and SEO, one of the phase 3 features (show a mockup first), or a deploy.
3. Keep every change inside the current theme and leave the homepage layout alone unless asked.
