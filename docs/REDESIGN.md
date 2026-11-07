# SRMIST redesign: what was built and why

Everything below is implemented in this repo (React + Vite) unless marked **Plan**. Run it with `npm run build && npm start`.

## 1. Critical fixes

| Brief | Where | What changed |
|---|---|---|
| Logo unreadable on glass | `shared.jsx` (`MainNav`), `redesign.css` §1 | Logo always sits in a solid white container with a blue outline and a gold base edge (echoing the gold Apply pill). Always the dark logo, so it no longer depends on what is behind the glass. The bar itself is also firmer (97% opaque). |
| Admissions out of header | `nav.js`, `shared.jsx`, `App.jsx` | Gold "Admissions" button removed from the strip and the mobile menu. A floating **Admissions** button (`AdmissionsFab`) opens `/admissions`, a separate screen with its own slim header (`pages/Admissions.jsx`). |
| Long home page | `Home.jsx`, `ui/blocks.jsx` | Eleven stacked sections replaced by: hero, About, one tabbed Explore module (Programmes, Recognition, Careers, Global, Research, Campus), one swipeable carousel, one closing call to action. Mobile height is about 4,900px (the old page had a pinned scroll scene, marquee, and about 10 more sections). |
| About: Deemed status | `ui/blocks.jsx` (`AboutDeemed`) | Gold badge "Deemed to be University" is the largest element after the name, then name, lead, four facts. Also shown on `/about` and in the hero. |
| All inner pages | `pages/Interior.jsx`, `redesign.css` §11 | One template for all 14 inner pages: sticky "On this page" bar, card grid of topics, programme table on Programmes and Academics. |

> **Verify before launch:** "Under Section 3 of the UGC Act, 1956" is the standard form of the status line. It is not on the official-site copy this project was built from. Check the exact wording against the university's own records.

## 2. Responsive layout

- Fluid grids use `repeat(auto-fit, minmax(min(100%, 300px), 1fr))`, so columns collapse without media queries. Breakpoints are only used for behaviour changes: 720px and 900px.
- **Tables never scroll sideways.** `ResponsiveTable` (and the fee table) render semantic `<table>`s with explicit ARIA roles. Below 720px CSS turns each row into a card and each cell into a `label: value` line using `data-label`. Measured at 390px and 820px on `/`, `/admissions`, `/programmes`, `/about`: `scrollWidth === clientWidth` on every page.
- Touch targets are at least 44px on coarse pointers (`theme.css`).

## 3. AI

### Assistant (SRM Guide)
`ui/chatCards.jsx`, `Assistant` in `shared.jsx`, `server/enquiry.js`.

| A text-only ChatGPT bot | SRM Guide |
|---|---|
| Describes a programme in prose | Shows a **programme card**: levels, length, "Apply for this" that pre-selects the field in the form |
| "Fees vary, please check the website" | A **live fee card** (programme × hostel) inside the bubble, with a link to the full breakdown |
| "You can apply on the portal" | An **Apply card** with the direct link, pre-filled when the programme is known |
| "Please contact admissions" | An inline **call-back form** that validates and posts to `/api/enquiry`, no page change |
| Down when the AI service is down | Cards are chosen on the device in milliseconds, so they show even when the model is slow or unreachable |
| Can link anywhere, including invented URLs | Server only allows links from a fixed list of real pages |
| Unaware of the site | Hand-off from ⌘K search ("DAAS: …") and from the Admissions page |

### Smart search (⌘K / Ctrl K, or `/`)
`ui/SmartSearch.jsx`, `lib/search.js`, `data/search-index.js`. Typo tolerance with swapped letters (`hostle` finds hostel), intent phrases ("how much does it cost" finds the fee calculator), a "Showing results for…" correction, ranking that learns from what this visitor opened (stored only in their browser), keyboard navigation, combobox/listbox ARIA, and an "DAAS" row for anything it cannot answer.

## 4. New features

| Feature | Code | Problem it solves |
|---|---|---|
| **Fee & ROI calculator** (e-commerce cart / fintech loan estimator) | `ui/FeeCalculator.jsx`, `data/fees.js` | Fees, hostel and mess are on different pages, so a family cannot see one real number. It gives year by year totals, a breakdown bar, and "years of average starting salary to repay the degree" using the published 2023–24 average CTC. **Fee figures in `data/fees.js` are placeholders** and the UI says so; replace them with the official schedule. |
| **Campus explorer** (map-first travel and real-estate sites) | `ui/CampusExplorer.jsx` | Applicants choose a place they have never seen. Hover, focus or tap a zone to light it up and read what it is. Schematic and labelled not-to-scale; keyboard operable. |
| **Pathway tabs + inline enquiry** (ticketing and onboarding flows) | `Admissions.jsx`, `ui/EnquiryForm.jsx` | Applicants from India, medical and international routes see only their own steps and phone line. |

## 5. Accessibility, performance, security

### Accessibility
`src/theme.css` holds the tokens. `npm run audit:contrast` checks 18 pairs and currently passes all (body 15.8:1, muted text 7.4:1, white on blue 8.4:1, ink on gold 11.2:1, focus ring 5.3:1 or better). Also: 16–18px fluid body text, visible 3px focus rings on light and dark surfaces, reduced-motion and high-contrast handling, skip link, tabs and combobox follow WAI-ARIA patterns. The two low-contrast greys the older audit flagged were replaced.

### Performance
Already present and kept: self-hosted fonts with `preload`, route-level code splitting (`React.lazy`), prefetch on hover/focus, `<Photo>` with `srcset`, `sizes`, width/height (no layout shift), `loading="lazy"` and `decoding="async"` for everything except the hero, Brotli/gzip with immutable caching for hashed assets. The new Admissions page and calculator load only on `/admissions`.

**Plan for self-hosted images** (today they come from Unsplash with `auto=format`, which serves WebP/AVIF):
```html
<picture>
  <source type="image/avif" srcset="/img/hero-480.avif 480w, /img/hero-960.avif 960w" sizes="100vw">
  <source type="image/webp" srcset="/img/hero-480.webp 480w, /img/hero-960.webp 960w" sizes="100vw">
  <img src="/img/hero-960.jpg" width="1600" height="900" alt="…" loading="lazy" decoding="async">
</picture>
```
Hero image: `loading="eager" fetchpriority="high"`. Scripts: Vite emits `type="module"`, which is deferred by default; third-party tags (analytics, chat widgets) should be added with `defer`, or injected on first interaction or `requestIdleCallback`, and allow-listed in the CSP.

### Security checklist
Status as of this build. ✅ done · ◻ to do.

- ✅ CSP with `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` (`server/security.js`, `vercel.json`, `public/_headers`)
- ✅ HSTS with preload, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP
- ✅ **CSRF** on the enquiry API: same-origin check, JSON-only content type, required `x-requested-with` header that a cross-site form cannot send (verified: missing header gives 403)
- ✅ Server-side validation, length caps, control characters stripped, honeypot field, per-IP rate limit (5 per 10 min) on `/api/enquiry`; per-IP limit on `/api/chat`
- ✅ API keys only on the server; dotfiles never served; path traversal blocked
- ✅ Chat links restricted to an allow-list
- ◻ `upgrade-insecure-requests` is in `vercel.json` and `_headers` but not in `server/security.js`; add it
- ◻ **Configure `ENQUIRY_WEBHOOK_URL`** (CRM, Slack, Zapier). Without it the server only logs the enquiry and the API answers `delivered:false`
- ◻ Rate limits are in memory, so they reset on restart and do not span serverless instances; move to Redis or the platform's rate limiting before heavy traffic
- ◻ `npm audit --omit=dev` reports 2 moderate issues; review and update
- ◻ If login or sessions are ever added: `HttpOnly; Secure; SameSite=Lax` cookies and a per-session CSRF token
- ◻ Add `Reporting-Endpoints` / `report-to` for CSP violations; run the CSP in report-only mode first when adding any third-party script
- ◻ Subresource Integrity for any third-party script or stylesheet added later
- ◻ Privacy: the consent checkbox is wired, but a privacy notice page and a data-retention rule for enquiries are needed (India's DPDP Act)

## 6. A/B test plan: Admissions screen

Assignment is in `lib/experiments.js` (sticky per browser, `?v=A|B` to force for QA). Events go through `track()`; hook your analytics with `window.__srmAnalytics = (event) => …`. Nothing is sent anywhere by default.

**Experiment 1 · hero framing** (built: `admissions-hero`)
- A: "Your place at SRM starts here", primary button *Start your application*.
- B: "What will your degree really cost?", primary button *Estimate my fees*.
- Hypothesis: leading with cost reduces drop-off from price anxiety, raising enquiries without lowering applications.
- **Primary metric:** application starts per unique visitor (`admissions_cta` with label *Start…* or `/apply` page load). **Secondary:** `enquiry_submitted`, `fee_calculator_used`, scroll depth to Pathways. **Guardrails:** bounce rate, time to first interaction, Core Web Vitals, enquiry quality (share that reach a counsellor conversation).
- Segments: mobile vs desktop, India vs international, new vs returning, traffic source.
- Sample size: for a baseline start rate of 8% and a minimum detectable lift of 1.5 points (relative 19%) at 95% confidence and 80% power, roughly 5,500 visitors per variant. Run at least two full weeks so that weekday and weekend behaviour both appear, and avoid launching during results or counselling announcements.
- Decision: ship B only if primary improves with the guardrails flat; if B lifts enquiries but lowers starts, consider showing both actions equally.

**Follow-ups, one at a time:** (2) floating Admissions button label, "Admissions" vs "Apply 2027"; (3) pathway tabs vs a single long list; (4) call-back form with phone only vs phone and email; (5) calculator placed above vs below the pathways.

Rules: one change per test, no peeking before the planned end, document the decision, remove the losing code.
