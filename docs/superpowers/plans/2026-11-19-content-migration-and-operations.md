# Content Migration and Editing: Master Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Tasks 0, 9, 10, 11 and 12 need the university; everything else is ours.

**Goal:** Move the content of srmist.edu.in (7,656 URLs) onto the redesigned site without losing a link, a file or a search ranking, let non-technical staff keep the content current from day one, and keep the new platform at least as safe as the one it replaces.

**Architecture:** Treat the migration as a repeatable pipeline, not a one-off copy: official export, then inventory, then a typed content model in Postgres, then cleaned and validated records, then template-driven pages that keep the official URL patterns. The staff portal we already built (Google sign-in, roles, approvals, append-only audit) grows from two content types to all of them and becomes the one place staff edit. WordPress stays the source of truth until cutover, so editors never stop working, and is then frozen and retired.

**Tech Stack:** Existing: React 18 + Vite 5, Node serverless functions (Vercel today, `npm start` elsewhere), Neon Postgres, Google Identity Services, Upstash Redis, Cloudflare Turnstile, `sharp`, `node:test`. Added: JSON Schema validation, `parse5`/`sanitize-html` for cleaning, object storage for media (Vercel Blob, S3 or R2: decided in Task 0), Playwright for parity crawls.

**Spec:** There is no single spec. It argues from the judge's question (below), `docs/HANDOVER.md`, `docs/PORTAL.md`, `docs/ROADMAP.md` and `docs/CONTEXT.md`. Where it disagrees with `docs/HANDOVER.md` section 3 (Decap CMS) it supersedes it, for the reason in "Decision 2". After sign-off, update HANDOVER sections 1 and 3: both still say "no database and no admin login", which stopped being true with the portal.

---

## 1. The judge's question, answered in 60 seconds

> **"How will you migrate thousands of resources, how will the people who update the site do it with new technology, and what about security?"**

1. **Scale, measured.** The official sitemap lists **7,656 URLs** (read 2026-11-19): 1,518 news posts, 600 pages, 425 programmes, 386 labs, 2,517 faculty profiles, 957 departments, 22 colleges, 1,215 events. They are not 7,656 different designs. They are **eight content types**, so we build seven templates and migrate *records*, not pages. We already did this once for people: our staff directory holds **2,516 records** from the official staff finder, against 2,517 faculty URLs in the sitemap.
2. **No link left behind.** Record pages keep the official URL patterns (`/faculty/<slug>/`, `/program/<slug>/`, `/events/<slug>/`...). Every one of the 7,656 URLs gets a recorded decision: same address, 301 redirect, or archived. Printed brochures, QR codes, Google rankings and other sites' links keep working.
3. **Editors keep editing.** WordPress stays live and authoritative while we import repeatedly into a staging copy. Staff move to one editor, the portal they can already try today: sign in with their `@srmist.edu.in` Google account, edit simple forms, an approver publishes, every change is in an append-only log. Faculty edit only their own profile. Department coordinators edit only their own department. Nobody approves their own work.
4. **Security gets better, not just different.** WordPress with Elementor and plugins is the usual attack surface (we measured the pages at about 500 to 670 KB of builder markup each). We replace it with a small API, single sign-on, strict content sanitising, a CSP that forbids inline scripts, backups the university owns, and a penetration test before go-live. Section 7 lists each threat, its control and whether it exists today.
5. **No WordPress in the end state.** WordPress is only the *source* we move content out of. After cutover nobody edits in it; after 90 stable days it is archived as static files and switched off (Task 12). The final system is our own front end, a small API, Postgres and the staff portal, with no WordPress, no page builder and no plugins to patch.
6. **Honest status.** Built and tested: the portal, the security headers, the assistant's abuse limits, the staff import, 404 handling and the sitemap. Planned: the rest of this document. Section 10 draws that line exactly.

---

## 2. What we measured (evidence, not assumptions)

### 2.1 The official site, read through the browser pane on 2026-11-19

| Content type | URLs | How it is built | New template |
|---|---|---|---|
| Faculty profile | 2,517 | WordPress custom post type `faculty` | `PersonPage` |
| News and blog posts | 1,518 | `post` | `ArticlePage` |
| Events | 1,215 (1,000 + 215) | `events` | `EventPage` |
| Departments | 957 | `department` (nested, e.g. centres inside departments) | `UnitPage` |
| Programmes | 425 | `program` | `ProgrammePage` |
| Labs | 386 | `lab` | `LabPage` |
| Pages | 600 | `page` | `InfoPage` (long tail) plus our 57 designed pages |
| Colleges | 22 | `college` | `UnitPage` |
| Archives and categories | 16 | listing pages | generated listings |
| **Total** | **7,656** | 8 content types | **7 templates** |

**What runs on what (checked 2026-11-19 by opening each site in the browser pane and reading its page source).** The main site is WordPress, but SRM is not one system:

| Site | What it runs | In scope? |
|---|---|---|
| www.srmist.edu.in (the 7,656 URLs above) | WordPress + Elementor + ACF + All in One SEO | **Yes, the core of this plan** |
| law, dental and medical (`law.`, `dental.`, `medical.srmist.edu.in`) and Ramapuram (`srmrmp.edu.in`) | Each its own WordPress + Elementor install | Separate exports, phase 2 (decide in Task 0) |
| Trichy (`srmtrichy.edu.in`) | A bundled JavaScript app (a single `index-*.js`, no WordPress markers); backend unknown | Ask the owner (Task 0) |
| Vadapalani (`srmistvdp.edu.in`) and Delhi NCR (`srmup.in`) | Not WordPress; Vadapalani pages reference `.php` and `.jsp` | Ask the owner (Task 0) |
| Student portal (`sp.srmist.edu.in`), careers (`careers.srmist.edu.in`) | Java (`.jsp` addresses) | **No.** Applications, not websites: we link to them, and plan single sign-on later |
| Academia (`academia.srmist.edu.in`) | Zoho | No: link only |
| Alumni network (`alumni.srmist.edu.in`) | A third-party platform (its page names the vendor Vaave) | No: link only |
| Online application form (`applications.srmist.edu.in`) | Custom (no CMS markers) | No: link only, until the university offers an API |
| `webstor.srmist.edu.in` | A file store, not a website: **documents and PDFs live here** (`/web_assets/downloads/<year>/...`, `/web_assets/srm_mainsite/files/<year>/...`), not in WordPress | **Yes: Task 4 must migrate or mirror these links** |

So the corrected statement is: the site that holds nearly all the content (7,656 URLs) is WordPress, and four other sites are too; the many other systems (portals, careers, alumni, Zoho, the campus sites) are different technologies and are **not migrated by this plan**.

How the main site is built, which decides the strategy:
- **WordPress + Elementor + ACF + All in One SEO** (on the main site). Every sampled page contained Elementor markup and ACF field data; a typical page is 480 to 670 KB of HTML. The structured fields (programme fees, duration, eligibility, faculty designation) exist in the database; the HTML hides them.
- **The REST API is closed to outsiders** (every `/wp-json/wp/v2/...` request answers 405) and **scripts get 403** (already recorded in `docs/CONTEXT.md`). So we cannot, and should not, extract thousands of pages by scraping. The right route is an **export from the university's IT team** (Task 0). A polite authorised crawl is the fallback: at one request a second, 7,656 pages take about 2 hours 7 minutes.
- Sitemaps are split at 1,000 URLs (posts, faculty and events run to 2 or 3 files), so any importer must follow the sitemap index, not a single file.
- Not measurable from outside: the count and size of images in `wp-content/uploads` and of documents on `webstor.srmist.edu.in`. Task 0 asks for both; Task 4 handles both.

### 2.2 Our site today

| Area | Today |
|---|---|
| Pages | 57 pre-rendered routes (designed pages plus 14 template-driven section pages); content in `src/data/*.js` and `pages.json` (a few hundred KB, excluding translations) and `public/data/staff.json` (2,516 people) |
| Editing | **Developers edit data files.** A non-technical editor cannot change anything yet |
| Portal | `/portal`: Google sign-in (strict `@srmist.edu.in` check, `hd` claim), roles `teacher` and `approver` from `APPROVER_EMAILS`, approvals, `portal_logs` append-only by database trigger, rate limits in Postgres, CSRF header, `__Host-` httpOnly session cookie. Handles **two** types: announcements and events (`db/migrations/001_portal.sql`) |
| Security | CSP with no inline scripts, HSTS, frame blocking, assistant limits (60 questions a day per visitor, 3,000 a day for the site, 1.5 million tokens a day), Turnstile built and switched off, Upstash counters built and waiting for keys |
| Quality gates | 160 tests (`npm test`), build writes sitemap, per-route heads and a real 404 |

### 2.3 The gap this plan closes

| Need | Gap |
|---|---|
| Hold 7,000 records | We have no content database, only files |
| Render 7,000 pages | Pages render in the browser; only head tags are pre-rendered (`scripts/prerender-head.mjs`). 7,000 record pages need real HTML for search engines |
| Let thousands of staff edit | The portal covers two content types and two roles |
| Keep old links alive | No redirect system; our routes differ from official ones |
| Move files | No media pipeline beyond `scripts/optimize-images.mjs` |

---

## 3. Decisions (with the options we rejected)

### Decision 1: Migration style
| Option | Verdict |
|---|---|
| A. Big bang: export, import, switch over one weekend | Rejected. One mistake affects 7,656 URLs at once, and editors lose a week |
| B. Headless: keep WordPress forever as the editor, put our front end on top | Rejected as the end state. Keeps the plugin and page-builder attack surface and the Elementor lock-in; the REST API is closed, so we would depend on IT opening it. Kept as a **temporary** state: it is what the "WordPress stays authoritative until cutover" phase looks like |
| **C. Strangler: repeatable import into the new platform, WordPress authoritative until cutover, then frozen, then retired** | **Chosen.** Imports can be re-run any number of times, so we rehearse the whole migration weekly, measure parity, and only freeze content for the last 48 hours |

### Decision 2: Where editors work
| Option | Verdict |
|---|---|
| Decap CMS (Git-based; the recommendation in `docs/HANDOVER.md`) | Rejected for scale. Every editor needs a GitHub account; no per-department scoping, no approval chain, no audit trail we control; 2,517 faculty cannot be Git users |
| Sanity, Strapi or similar hosted headless CMS | Rejected. A second identity system, a second audit trail and a vendor to own the university's data, when the portal already solves sign-in, roles, approvals and audit |
| **Extend our portal** | **Chosen.** Already built and tested for the hard parts (sign-in, CSRF, roles, self-approval ban, append-only log). We add content types, scopes and revisions |

### Decision 3: How 7,000 pages become HTML
Decided by a measured spike (Task 6), not by preference. Candidates: (a) static generation at publish time with a rebuild hook, (b) on-demand server rendering with CDN caching (`stale-while-revalidate`). Rule: record pages must contain their `h1` and body text in the first HTML response, without JavaScript.

### Decision 4: Hosting
Two supported paths, chosen with the university in Task 0: **managed** (Vercel + Neon, choosing an India region where the provider offers one, for data residency) or **university-hosted** (Node container from `npm start` plus their Postgres). The code supports both today because `server/index.js` serves the build and the API.

---

## 4. Global Constraints

- Theme: keep Playfair headings, DM Sans text, Roboto Mono labels and the existing blue/sand/paper/ink tokens. New templates reuse `SvcHero`, `.svc-wrap`, `.vis-block`. No new colours or fonts.
- **Never invent facts.** Every migrated field comes from the official export; fields the official site does not hold stay empty and render nothing, not a guess.
- Sign-in accepts only `^[a-z0-9._%+-]+@srmist\.edu\.in$` after Google verifies the token (already enforced in `server/portal/auth.js` and in the `portal_users` check constraint). Never relax it.
- Role comes only from the server (`APPROVER_EMAILS` today, the `content_scopes` table after Task 7). Never from the client.
- Times: stored UTC, shown IST. A published item can never be edited in place by its author; edits create a new revision that must be approved.
- `DEMO_MODE` and `DEMO_MEMORY` must be unset in production.
- No secret in the repo or the client bundle. `.env*` stays git-ignored. The Gemini key pasted into chat earlier must be rotated before launch.
- **URL parity:** record pages keep the official path patterns; all other changes go through the redirect table.
- Every task ends with `npm test` green and `npm run build` succeeding. Deploy only when asked.
- Content that comes from the old site is **untrusted input**: sanitised on import, again on save, and again on render.

---

## 5. Review Focus (failure modes the tests below must pin)

1. **Hostile or sloppy HTML in 7,000 old pages** (`<script>`, `onerror=`, `javascript:` links, iframes, inline styles). Expected: none reach the public page. Pinned in Task 3.
2. **URLs that do not round-trip:** trailing slash vs none, upper case, percent-encoded or Unicode slugs, duplicate slugs ending in `-2`, query strings from tracking links. Expected: one canonical address, at most one redirect hop, never a loop. Pinned in Task 5.
3. **Personal data that should not be public or is out of date** (a faculty member who has left, a phone number nobody agreed to publish). Expected: departed users lose access the same day, profiles can be unpublished in one action, only fields the official profile already shows are imported. Pinned in Tasks 3 and 7.
4. **Wrong scope:** an editor who moves department, belongs to two units, or whose role is revoked mid-edit. Expected: permissions are evaluated at save time, not at sign-in. Pinned in Task 7.
5. **Files:** a 200 MB PDF, a filename with spaces or Tamil characters, an SVG with a script, the same file uploaded twice. Expected: refused, renamed safely, sanitised or de-duplicated. Pinned in Task 4.
6. **The domain itself:** our headers send `Strict-Transport-Security: ...; includeSubDomains; preload`. On a `srmist.edu.in` address that can lock out any university subdomain that is not HTTPS. Expected: `preload` removed until IT confirms every subdomain serves HTTPS; the domain is never submitted to the preload list by us. Pinned in Task 8.

---

## 6. Tasks

Files below are proposals; names in **Interfaces** blocks are what later tasks rely on.

### Task 0: Agreement, access and hosting (university-dependent)

**Owner:** project lead with university IT. **Output:** `migration/RECEIVED.md` listing every file received with its SHA-256.

**Ask for, in this order:**
1. WordPress export per post type (WXR) or a read-only database dump.
2. The `wp-content/uploads` archive and its size, **and a listing or copy of the `webstor.srmist.edu.in/web_assets` document store** (PDFs and downloads live there, not in WordPress).
3. ACF field-group definitions (JSON) for `faculty`, `program`, `lab`, `department`, `college`, `events`.
4. `.htaccess` / server redirect rules and any redirect plugin export.
5. Twelve months of top pages and top landing pages (Search Console, analytics).
6. Which sibling sites are in scope (the four other WordPress installs; Trichy, Vadapalani and Delhi NCR) and who owns each. A named content owner per college and department, and the list of current editors with their roles.
7. A decision on hosting (managed vs university-hosted), media storage, and who owns DNS.
8. A named security contact and the university's incident-reporting procedure.

- [ ] **Step 1:** Send the request list above as one document; record the answer date for each item.
- [ ] **Step 2:** If item 1 or 2 is refused, request written permission for a polite crawl (one request a second, off-peak, identifying user agent). Do not spoof a browser agent.
- [ ] **Step 3:** Hold a 60-minute hosting and ownership workshop; record decisions in `docs/DECISIONS.md` (hosting, storage, domain, who holds the database credentials).
- [ ] **Step 4: Verify:** `migration/RECEIVED.md` has a row and a checksum for every item received; items not received are marked with an owner and a date.

### Task 1: Inventory and decision table

**Files:** Create `scripts/migrate/inventory.mjs`, `migration/inventory.csv`, `tests/migration-inventory.test.js`.

**Interfaces:**
- Produces: `parseSitemapIndex(xml: string): string[]` (child sitemap URLs); `parseSitemap(xml: string): {url: string, lastmod: string|null}[]`; `classify(url: string): 'faculty'|'program'|'lab'|'department'|'college'|'event'|'post'|'page'|'listing'` (by path prefix; root-level non-page slugs are `post` when found in the posts sitemap).
- CSV columns: `url,type,lastmod,decision,new_path,owner,traffic_12m`, where `decision` is `keep|redirect|merge|archive|drop`.

- [ ] **Step 1: Write the failing test** using a saved fixture of the official `sitemap_index.xml` and three child sitemaps: `parseSitemapIndex` returns every child; `classify('https://www.srmist.edu.in/faculty/dr-l-kavisankar/') === 'faculty'`; `classify('https://www.srmist.edu.in/program/best-b-com-finance-and-taxation-colleges-chennai/') === 'program'`.
- [ ] **Step 2:** Run `node --test tests/migration-inventory.test.js`. Expected: FAIL (functions not defined).
- [ ] **Step 3:** Implement the three functions and a CLI that follows the sitemap index, handles the 1,000-URL splits, and writes the CSV.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5: Acceptance on real data** (from an authorised source): totals per type match the table in section 2.1 (7,656 on 2026-11-19; record the new totals and date, since the site changes daily). Every row has a `decision`; a row with an empty decision fails `node scripts/migrate/inventory.mjs --check`.
- [ ] **Step 6:** Join traffic data; mark the top 500 URLs `priority=1`. Commit.

**Decision rules** (so nobody argues row by row): `keep` = still current and linked from live navigation; `redirect` = replaced by a different new page; `merge` = duplicate content folded into one record; `archive` = historical (for example events and news older than the university's retention rule) kept readable at the same address with an "archived" banner and no redesign; `drop` = test pages, empty pages and spam, answering 410.

### Task 2: Content model and database

**Files:** Create `content-model/{page,programme,faculty,unit,lab,event,post,media}.schema.json`, `db/migrations/002_content.sql`, `server/content/validate.js`, `tests/content-model.test.js`.

**Interfaces:**
- `validate(type: string, data: unknown): {ok: true, data: object} | {ok: false, errors: string[]}`. Unknown fields are rejected, not stored.
- Tables: `content_items(id, type, slug, status, data jsonb, owner_unit text, version int, created_at, updated_at, published_at)` with `UNIQUE (type, slug)`; `content_revisions(id, item_id, version, data jsonb, actor_id, at)` **append-only by trigger, the same pattern as `portal_logs`**; `media_assets(id, sha256 unique, path, mime, bytes, alt, source_url, status)`; `redirects(old_path primary key, status 301|410, new_path)`; `content_scopes(user_id, unit, types text[], can_approve boolean)`.
- Fields are taken from the ACF definitions received in Task 0, not guessed from HTML.

- [ ] **Step 1: Write failing tests:** a programme without `duration` fails; a faculty record with an `http:` photo URL or an email outside `@srmist.edu.in` where the model says internal-only fails; `UPDATE content_revisions` throws "append-only".
- [ ] **Step 2:** Run `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3:** Write the schemas and `002_content.sql` (idempotent, like `001_portal.sql`); implement `validate` with a JSON Schema library.
- [ ] **Step 4:** Run `node scripts/migrate-portal.mjs` against a scratch database, then `npm test`. Expected: PASS, and running the migration twice changes nothing.
- [ ] **Step 5:** Commit.

### Task 3: Cleaner and importers (the heart of the migration)

**Files:** Create `scripts/migrate/clean-html.mjs`, `scripts/migrate/extract-{faculty,programme,unit,lab,event,post,page}.mjs`, `scripts/migrate/import.mjs`, `tests/migration-clean.test.js`, `tests/migration-import.test.js`.

**Interfaces:**
- `cleanHtml(html: string, ctx: {rewriteLink: (url: string) => string | null}): {html: string, images: string[], links: string[], warnings: string[]}`. Allow-list only: `p h2 h3 h4 ul ol li a strong em table thead tbody tr th td img figure figcaption blockquote br`; `a` keeps `href` (http, https, mailto, tel only), `img` keeps `src` and `alt`. Everything else is dropped, including all `style` and `on*` attributes, `<script>`, `<iframe>`, Elementor wrapper `div`s and shortcodes.
- `extract(type, source): object` returns a record that passes `validate(type, ...)`; low-confidence conversions add a warning and go to a review queue (`migration/review-queue.csv`).
- `import.mjs --type faculty --source <folder> --dry-run` upserts by `(type, slug)`; running it twice leaves the same row count and the same data.

- [ ] **Step 1: Write failing tests:**
  - an extracted faculty record that carries a field the content model does not list (for example a personal mobile number) is dropped with a warning, never stored;
  - input containing `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `<a href="javascript:alert(1)">`, an `<iframe>`, and an Elementor `<div data-elementor-type="wp-page">` produces output with none of those and the visible text unchanged;
  - an internal link to an old URL is rewritten through `ctx.rewriteLink`, which is built from Task 5's `redirectFor` (returns its `to` for a 301, otherwise `null`);
  - **text parity:** for 5 saved fixture pages, normalised visible text of `cleanHtml(page)` equals the normalised visible text of the original main content (whitespace and case folded);
  - importing the same fixture twice leaves the row count unchanged.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** (Task 5 does not exist yet when this runs: use a stub `rewriteLink`; the import is idempotent, so re-run it once the redirect table is generated.) Implement the cleaner by parsing with `parse5` and walking the tree against the allow-list (never regular expressions on HTML). Implement `extract-*` from ACF fields first, falling back to headings only when a field is missing. Start from the proven staff pipeline (`scripts/fetch-staff.mjs`, `scripts/build-staff.mjs`) for people.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Acceptance on real data** (staging database): per type, import completes with `errors = 0`; `warnings` are listed in `migration/review-queue.csv`; a human reviews **25 random records per type plus the top 500 priority URLs** against the old page and signs `migration/QA-<type>.md`. Target: at least 99.5% of sampled records pass without edits.
- [ ] **Step 6:** Commit.

### Task 4: Media, documents and alt text

**Files:** Create `scripts/migrate/media.mjs`, `server/content/upload.js`, `tests/migration-media.test.js`.

**Interfaces:**
- `mediaUrlFor(oldUrl: string): string | null` maps `/wp-content/uploads/YYYY/MM/<file>` **and `webstor.srmist.edu.in/web_assets/<folder>/<year>/<file>`** to `/files/<sha256[0..2]>/<sha256>.<ext>`; `null` for unknown files.
- `checkUpload({name, mime, bytes, head}): {ok: true, safeName: string} | {ok: false, reason: string}`: extension and sniffed type must agree; images up to 10 MB, documents up to 25 MB (configurable); SVG refused unless sanitised; names normalised to ASCII slugs with the original kept in metadata.

- [ ] **Step 1: Write failing tests:** the same bytes under two names yield one asset; a `.pdf` whose first bytes are an executable is refused; a `webstor` document URL maps to the same new path as its de-duplicated copy; an SVG with `<script>` is refused; a 30 MB document is refused with a clear reason; a Tamil filename becomes a safe slug and keeps its original name in metadata; `mediaUrlFor` of an uploaded path returns the new path.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement: hash every file, de-duplicate, convert photos to WebP with the existing `sharp` code (keep the original), keep PDFs byte-identical, write `migration/media-manifest.csv` (`old_url,new_path,sha256,bytes,used_by_count`).
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Acceptance:** every media URL referenced by an imported record resolves on the new storage (`HEAD` 200, count of failures is 0). Files used by no page are marked `orphan` and archived, not served. `migration/alt-queue.csv` lists images with no alt text; new and edited content cannot be published without alt text, and the legacy backlog is burned down by the owners (a number on the editors' dashboard, not hidden).
- [ ] **Step 6:** Commit.

### Task 5: URL parity and redirects

**Files:** Create `scripts/migrate/redirects.mjs`, `server/content/redirect.js`, `tests/redirects.test.js`.

**Interfaces:**
- `redirectFor(path: string): {status: 200|301|410, to?: string}`; normalises case, trailing slash, `%`-encoding and strips tracking parameters (`utm_*`, `fbclid`, `gclid`) before lookup; never returns a chain longer than one hop.
- Lookup is served from the `redirects` table through a small function or edge middleware. **Do not** put thousands of rules in `vercel.json`: static redirect lists have size limits (confirm the current limit when implementing).

- [ ] **Step 1: Write the failing test** as a table: `/faculty/dr-l-kavisankar` and `/faculty/dr-l-kavisankar/` give the same answer; `/Faculty/DR-L-KAVISANKAR/` redirects once to the lower-case path; a Unicode slug round-trips; a path with `?utm_source=x` loses the parameter; an unknown path returns 404, a `drop` path returns 410; **no entry points to another redirect** (checked over the whole table).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement; generate rows from `inventory.csv` decisions.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Acceptance:** crawl every one of the 7,656 old paths against staging: **0 unexpected 404s, 0 chains longer than 1, 0 loops**; every `keep` row returns 200 at the same path.
- [ ] **Step 6:** Commit.

### Task 6: Rendering spike, then templates (SEO and speed)

**Files:** Create `scripts/migrate/spike-render.mjs` (throwaway), then `src/pages/records/{PersonPage,ProgrammePage,EventPage,ArticlePage,UnitPage,LabPage,InfoPage}.jsx`, `scripts/build-records.mjs`, `tests/records-seo.test.js`.

- [ ] **Step 1: Spike:** render one real faculty record both ways (static file written at publish time; on-demand server render with `stale-while-revalidate`). Measure time to first byte, Lighthouse mobile performance, build time for 7,000 pages, and cost of a rebuild after one edit. Write the result and the choice into `docs/DECISIONS.md`.
- [ ] **Step 2: Write failing tests:** for a record route, the first HTML response contains the `h1`, the main text, a canonical link, and valid JSON-LD (`Person`, `Course`, `Event`, `NewsArticle` by type) **without executing JavaScript**; the sitemap lists exactly the published records.
- [ ] **Step 3:** Implement the templates with the existing shell and the chosen renderer; publish triggers a rebuild or cache purge for that one URL.
- [ ] **Step 4: Acceptance:** `curl -s <record url> | grep '<h1'` finds the title; Lighthouse mobile performance at least 90 and accessibility at least 95 on one page of each type; axe reports 0 critical issues.
- [ ] **Step 5:** Commit.

### Task 7: One editor for everyone (roles, scopes, revisions)

**Files:** Modify `server/portal/{auth,handlers,validate,repo-sql,repo-memory}.js`; Create `server/content/{routes,scopes}.js`, `src/pages/portal/{Editor,Queue,History,Dashboard}.jsx`, `tests/content-scopes.test.js`.

**Roles** (extends today's `teacher` and `approver`):

| Role | Can do | Cannot do |
|---|---|---|
| Faculty | edit **their own** profile; submit announcements and events | edit anyone else; publish |
| Unit editor | create and edit records owned by their unit (department, labs, programmes, news, events) | publish; touch other units |
| Approver | approve or reject items in their unit's scope | approve their own work (database check already exists) |
| Central editor | edit designed pages, menus, banners (with a second approver) | change code or templates |
| Admin (IT) | manage users, scopes, backups, settings | publish without a second person |

**Interfaces:**
- `canWrite(user: {id, email, scopes: {unit: string, types: string[], canApprove: boolean}[]}, item: {type: string, owner_unit: string, author_id: number}, action: 'create'|'edit'|'submit'|'approve'|'unpublish'): boolean`. Evaluated on every request against the current database state.
- A published record is never edited in place: an edit creates a `content_revisions` row and a pending version; the public page changes only on approval. `unpublish` takes one click and effect within a minute, for any approver in scope.

- [ ] **Step 1: Write failing tests** as a matrix: faculty edits own profile (allow), someone else's (deny); unit editor edits own unit (allow), another unit (deny); nobody approves own item; approver outside the unit (deny); a user removed from `content_scopes` mid-session is refused on the next request; a user who moved unit loses the old scope immediately; two scopes combine correctly; a user deactivated by the leaver sync (Task 8) is refused on the next request and their sessions are deleted.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement scopes and the generic content CRUD with revisions. Forms are generated from the JSON Schemas, so a new field appears in the editor without new code. Rich text uses a small toolbar limited to the allow-list in Task 3, and the server sanitises on save.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Editor must-haves** (acceptance by a person who is not a developer, recorded in `migration/UX-<date>.md`): autosave; "preview exactly as public"; plain-language validation messages; restore any earlier revision in two clicks; bulk import from CSV for faculty lists and event series; a dashboard showing content older than 12 months per owner, broken links, and the alt-text backlog; the **content owner** of every page is visible on it.
- [ ] **Step 6:** Commit.

### Task 8: Security hardening and proof

**Files:** Create `docs/SECURITY.md`, `tests/security-*.test.js`, `.github/workflows/security.yml`; modify `vercel.json`, `server/security.js`.

| Threat | Control | Today | Test or evidence |
|---|---|---|---|
| Stolen or shared staff account | Google sign-in only; require 2-step verification at the university's Google tenant; short sessions; sessions listed and revocable | Sign-in, hashed session tokens, `__Host-` cookie built; 2-step is the university's setting | Test: expired and revoked sessions refused; written confirmation from IT that 2-step is enforced |
| Leavers keep access | Nightly sync of active staff from the university's directory; missing person is deactivated and sessions deleted | Planned | Test: deactivated user gets 401 on next request |
| Stored XSS from editors or imports | Allow-list sanitising on import, on save and on render; CSP forbids inline scripts | CSP built; sanitiser planned (Task 3) | Tests in Task 3 plus a CSP test that fails if `'unsafe-inline'` appears in `script-src` |
| Malicious uploads | Type sniffing, size caps, SVG sanitising, safe filenames, malware scan at upload | Planned (Task 4) | Tests in Task 4 |
| Tampering and defacement | Approval by a second person; immutable revisions and logs; one-click unpublish; alerts on edits to the home page and menus | Approval and append-only log built; revisions and alerts planned | Test: update or delete on logs and revisions fails; alert fires in staging |
| CSRF and cross-site abuse | CSRF header plus same-origin check on every change | Built | Existing portal tests |
| Abuse and cost attacks | Rate limits in the database and Upstash; Turnstile; daily assistant budgets | Built; Turnstile and Upstash waiting for keys | `tests/budget.test.js`, `tests/chat.test.js`; keys added before launch |
| Supply chain | Lockfile, `npm audit` and Dependabot in CI, fail on high severity, pinned versions, SBOM exported at each release | `npm audit` reviewed manually | CI job fails on a high finding |
| Secrets | Server-only environment; rotate the Gemini key; separate staging and production keys; no secrets in logs | Server-only in place; rotation pending | Pre-launch checklist item with date |
| Data protection (DPDP Act 2023) | Publish only fields the official profile already shows; notice and correction path for staff; retention rule per content type; database in India; **legal review by the university** | Privacy page exists; legal review pending | Legal sign-off recorded in `docs/DECISIONS.md` |
| Backups and recovery | Nightly export (SQL and JSON) to storage the **university** owns; point-in-time restore; a restore drill with a stopwatch before launch | Planned | Drill report: time to restore (target under 4 hours) and maximum data loss (target under 24 hours) |
| Incidents | Named contact; log retention; reporting procedure. CERT-In's 2022 directions set a 6-hour reporting window and 180-day log retention; **confirm applicability and wording with university counsel** | Planned | Runbook in `docs/SECURITY.md`; a tabletop exercise |
| Domain safety | Remove `preload` from the `Strict-Transport-Security` header until IT confirms every `srmist.edu.in` subdomain is HTTPS-only; never submit the domain to the preload list ourselves | Header currently includes `preload` | Test reads `vercel.json` and `server/security.js` and fails if `preload` is present while the production host is under `srmist.edu.in` |
| Independent verification | Penetration test by someone who did not write the code, against an OWASP ASVS Level 2 checklist, fixed before go-live; a public `security.txt` and a disclosure address | Planned | Report with every high and medium finding closed |

- [ ] **Step 1:** Write `docs/SECURITY.md` containing this table with owners and dates.
- [ ] **Step 2: Write failing tests** for the rows marked "Test": CSP has no `'unsafe-inline'` in `script-src`; no response header leaks the server version; `preload` rule above; deactivated user refused.
- [ ] **Step 3:** Implement the missing controls; add the CI workflow.
- [ ] **Step 4: Acceptance:** `npm test` green; `npm audit --audit-level=high` clean; penetration test report attached; restore drill report attached.
- [ ] **Step 5:** Commit.

### Task 9: Pilot with real editors (university-dependent)

**Pilot:** two units (one academic department with many faculty, one central unit such as Communications) for four weeks, on staging with real imported content.

- [ ] **Step 1:** Train the pilot editors: a 45-minute session, a one-page cheat sheet, five 3-minute videos (sign in, edit a profile, post an event, add a document, ask for approval), and a sandbox with demo data (`DEMO_MODE`).
- [ ] **Step 2:** Appoint one **web champion** per college (22 colleges): the person colleagues ask first.
- [ ] **Step 3: Measure weekly** and record in `migration/PILOT.md`: share of edits made without a developer (target 100%), median time from submission to publish (target under 2 working days), editor satisfaction (target at least 4 of 5), support requests per editor, and defects found.
- [ ] **Step 4: Acceptance:** two consecutive weeks with no blocking defect, the targets above met, and the pilot approvers' written agreement to roll out.

### Task 10: Dual-run and parity report

- [ ] **Step 1:** Re-run the importers nightly from a fresh export so staging tracks the live WordPress site (the import is idempotent; see Task 3).
- [ ] **Step 2:** `scripts/migrate/verify.mjs` writes `migration/parity.md` each night: every old URL status; text parity on a sample; broken internal links; images and files resolving; redirect chains; accessibility and Lighthouse budgets; counts per type versus the inventory.
- [ ] **Step 3: Load test** the record routes and the API at three times the highest traffic in the analytics export; the assistant stays within its daily limits.
- [ ] **Step 4: Acceptance (go/no-go gate):** unexpected 404s 0; redirect chains over one hop 0; top 500 pages human-verified 100%; sampled text parity at least 99.5%; Lighthouse and axe budgets met on every template; pen-test findings closed; restore drill passed; pilot accepted; university approvals signed. **If any line fails, the date moves.**

### Task 11: Cutover and rollback (university-dependent)

**Timeline of the day:** T-7 days announce the freeze and lower DNS TTL to 300 seconds; T-48 hours content freeze (editors keep drafting in the portal, nothing publishes on WordPress); T-24 hours final delta import and parity run; T-0 switch DNS; T+1 hour watch the 404 and error dashboards; T+24 hours first fix pass on any missed redirects.

- [ ] **Step 1:** Write `docs/RUNBOOK-CUTOVER.md` with named people, the exact commands, and who has authority to call a rollback.
- [ ] **Step 2:** Rehearse the full runbook on staging twice, with a stopwatch.
- [ ] **Step 3: Rollback rule:** within 24 hours, switch DNS back (about 5 minutes with the low TTL); edits made on the new platform meanwhile are replayed from the append-only logs, so nothing is lost. After 24 hours we fix forward. The old WordPress stays read-only and reachable for **90 days**.
- [ ] **Step 4:** After cutover: monitor 404s from logs daily for 4 weeks and add redirects within 24 hours of each finding; watch Search Console coverage weekly; no ranking decline of more than 10% on the top 500 pages is the success line (record the baseline before cutover).

### Task 12: Retire WordPress and hand over

- [ ] **Step 1:** After 90 stable days, export a static archive of the old site (HTML and files) to university storage; decommission WordPress and its admin login, which removes that attack surface.
- [ ] **Step 2:** Hand over to university IT: repository ownership in the university's GitHub organisation, all accounts and keys in their name, `docs/RUNBOOK-*.md`, a recorded walkthrough, and a named maintenance owner. Update `docs/HANDOVER.md` and `docs/CONTEXT.md`.
- [ ] **Step 3: Acceptance:** university IT performs a restore and a deploy from the handover documents alone, unaided, within one working day.

---

## 7. Who edits what, after launch

| Type of change | Who | How | Time to live |
|---|---|---|---|
| A faculty member's own profile, publications, photo | The faculty member | Portal form; approver in their unit | Under 2 working days, no developer |
| Department, lab, programme details, department news and events | Unit editor | Portal form; unit approver | Same |
| University-wide announcements and the events calendar | Any staff member submits | Existing portal workflow | Same day when approved |
| Home page, menus, admissions pages, policies | Central editors | Portal; second approver required | Same day |
| A **new kind of page**, a layout change, a new field on a type | A developer, through a request | Pull request, tests, review | Weeks, by design: this is structure, not content |
| Emergency removal of anything | Any approver in scope | One-click unpublish | Within a minute |

Staying healthy: every page has a visible owner; the dashboard flags content older than 12 months to its owner; a weekly broken-link report; a monthly "stale content" review by the central team; a changelog of releases.

---

## 8. Timeline (assumes a small student team plus university IT, about 18 weeks to cutover)

| Weeks | Work | Gate |
|---|---|---|
| 0 to 2 | Task 0: agreement, export, hosting | Files received and checksummed |
| 1 to 4 | Tasks 1 and 2: inventory, content model, database | Every URL has a decision |
| 3 to 8 | Task 3, then Task 4: importers, media | Sampled QA at least 99.5% |
| 5 to 9 | Tasks 5 and 6: redirects, rendering spike, templates | 0 unexpected 404s on staging |
| 7 to 12 | Task 7: editor, roles, scopes, revisions | Non-developer test passed |
| 9 to 14 | Task 8: security work and penetration test | Findings closed |
| 12 to 15 | Task 9: pilot | Pilot accepted |
| 14 to 17 | Task 10: dual-run and go/no-go | All gate lines green |
| 18 | Task 11: cutover | Success line held |
| 19 to 30 | Task 12: stabilise, retire WordPress, hand over | Handover test passed |

Exams and holidays will stretch this. Task 0 can slip the whole plan, which is why it comes first and why the fallback crawl exists.

## 9. What we need from the university

A named sponsor; IT access to the export (Task 0); a named content owner per college and unit; a Google Workspace admin to confirm 2-step verification and to provide the staff directory feed; a decision on hosting and domain; a legal reviewer for data protection and incident reporting; 22 web champions; time for a pilot.

## 9a. Not in scope

- Rebuilding the student portal, careers site, Academia, the alumni network or the online application form. They are separate applications on other technologies; the new site links to them and the university can add single sign-on later.
- The four sibling WordPress sites (law, dental, medical, Ramapuram) and the Trichy, Vadapalani and Delhi NCR campus sites until Task 0 settles who owns them. The pipeline is built per content type, so each WordPress site is another export through the same importers.

## 10. Honest status: built today versus planned

| Built and tested today | Planned in this document |
|---|---|
| Portal: Google sign-in, roles, approvals, append-only logs, rate limits, CSRF (announcements and events only) | Everything else in Tasks 1 to 12 |
| Staff directory import (2,516 records) and the scripts behind it | Importers for the other seven content types |
| CSP, HSTS, assistant limits, Turnstile (off), Upstash (waiting for keys) | Sanitiser, uploads, scopes, revisions, penetration test, backups |
| Sitemap, per-route head tags, real 404 handling | Redirect table, record rendering, JSON-LD per type |
| 160 passing tests | The tests named in each task |

In a demo, show the portal flow (sign in, submit, approve, public page updates, log entry) and the staff directory, and say clearly that the rest is this plan.

## 11. Risks

| Risk | Likelihood | Effect | Response |
|---|---|---|---|
| University declines an export | Medium | Slower, more fragile | Authorised polite crawl; the same pipeline starts from HTML; budget a longer Task 3 |
| Content is messier than the sample (builder markup, inline PDFs, tables as images) | High | More manual review | Review queue; priority on the top 500; archive the long tail rather than polish it |
| Editors do not adopt it | Medium | Content goes stale | Champions, pilot, dashboard nudges, central team backstop, visible owners |
| Rendering approach misses the speed target | Low | Rework in Task 6 | The spike runs first; both options are measured |
| Timeline pressure leads to a rushed cutover | Medium | Broken links, lost rankings | The go/no-go gate is mandatory; the date moves, the gate does not |
| One person holds all the knowledge | High (small team) | Stall | Runbooks, handover test, two named owners for every system |

## 12. Open questions for the university

1. Is the WordPress database or an export available, and who is the technical contact?
2. Do the official pages hold personal details (phone, email, address) of staff that must not be republished?
3. Retention rule for old news and events: how far back is "current"?
4. Is the staff directory available as a feed for deactivating leavers?
5. Where must the data live (country, provider, university-owned account)?
6. Which Tamil and Hindi pages must exist, and who reviews the translations?
