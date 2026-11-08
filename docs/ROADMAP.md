# Roadmap: from concept redesign to a site that works like a real university site

Written 2026-11-08. Rule for every phase: **keep the current theme** (Playfair headings, DM Sans text, Roboto Mono labels, blue / sand / paper / ink bands, gold square CTAs, `--ease` motion, dark theme) and reuse the shared shell (`SvcHero`, `.svc-wrap`, `.vis-block`). New pages use existing tokens; no new colours or fonts. Never invent facts about SRMIST: real data with a source link, or a visible "prototype" label.

Gaps found in the repo on 2026-11-08: no sitemap, no Open Graph / JSON-LD, no privacy page (now added), no analytics sink, no PWA manifest, enquiry form has no delivery channel, DAAS has no abuse check, no screen-reader audit.

## Phase 1: Trust and safety (started)
| Item | Status | Notes |
|---|---|---|
| Privacy and cookie notice (`/privacy`, footer link) | **Done** | Describes what the prototype does today; the university's legal team must review (DPDP Act 2023) |
| `upgrade-insecure-requests` in CSP | **Done** | Added only over TLS, like HSTS, so local http dev still works |
| Enquiry delivery | Needs you | Set `ENQUIRY_WEBHOOK_URL` (CRM, Slack, Zapier). Until then the API answers `delivered:false` and the UI says so |
| DAAS email check after 3 messages | Planned | Plan Task 4 in `docs/superpowers/plans/2026-11-07-ux-brief-plan.md`; needs `MAIL_API_KEY`, `MAIL_FROM`, `VERIFY_SECRET` |
| Shared rate limits | Planned | In-memory limits reset per instance; move to Redis/platform limits before real traffic |
| CSP violation reporting | Planned | `report-to`; run new third-party scripts in report-only first |
| Rotate the Gemini key | Needs you | Pasted into chat once |
| Screen-reader and keyboard-only audit | Planned | NVDA/VoiceOver on nav, search, DAAS, Apply |
| `npm audit` review | Planned | 2 moderate items reported earlier |

## Phase 2: Discoverability and tech
| Item | Notes |
|---|---|
| `sitemap.xml` and complete `robots.txt` | Generate from `SLUGS` and the route list at build time |
| Per-page `<title>`, description, canonical, Open Graph and Twitter cards | The SPA only sets `document.title` today; add a small head manager or build-time prerender |
| JSON-LD | `CollegeOrUniversity` on home, `Course` on programme pages, `Event` on events, `BreadcrumbList` |
| Prerender or SSR for key pages | Crawlers and link previews do not run the app reliably; `/404` currently returns 200 |
| Privacy-friendly analytics | Pluggable sink behind `window.__srmAnalytics`; consent-gated if anything sets cookies |
| PWA | `manifest.webmanifest`, icons, offline page for status and contacts |
| Images | AVIF/WebP `<picture>` for `public/srmist/*` as planned in `docs/REDESIGN.md` |
| Web Vitals budget | Lighthouse scripts exist in `reports/`; set pass thresholds in CI |

## Phase 3: New student-facing features (not on the official site)
| Feature | Why | Data rule |
|---|---|---|
| Programme compare (up to 3) | Families compare, the official site makes them open tabs | Only fields already in `data/programmes.js` |
| Scholarship eligibility checker | Turns the scholarships page into an answer | Rules from the official scholarship pages with links; show "check with the office" for anything unclear |
| Application tracker | Applicants return to see status | Prototype only until the university provides an API; label it |
| Events calendar with "add to calendar" (.ics) | Events are a list today | Real events only (`Event` JSON-LD shares the data) |
| Virtual campus tour page | Builds on `/day` and the explorer map | Use the official 360 tour link; permission-cleared photos only |
| Saved shortlist | Keep programmes, fees, dates in the browser | localStorage only, mentioned in the privacy notice |
| Notification centre for deadlines | SRMJEEE dates are already structured in `data/srmjeee.js` | Tentative dates stay labelled tentative |

## Phase 4: Content and quality
Native-speaker review of Tamil and Hindi, official fee schedule into `data/fees.js`, permission-cleared photography for student stories, a content owner per page, and a pre-launch checklist (legal wording for the Deemed-to-be status line, privacy review, accessibility sign-off).

## How we work each phase
Plan → build on a branch → `npm test` and `npm run build` → check light, dark, 375px and keyboard → update `docs/CONTEXT.md` → commit. Deploy only when asked.
