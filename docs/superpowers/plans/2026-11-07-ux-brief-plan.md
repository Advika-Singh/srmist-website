# UX Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the gaps between the redesign and the owner's UX brief: answer cards in search, a visible deadline and mobile Apply path, a pause control for moving hero content, an email check in DAAS after 3 messages, trustworthy voice and feedback on search, a student-innovation section, an "ask a current student" page, and a measurable findability check.

**Architecture:** New logic goes in small pure modules under `src/lib/` (tested with node:test, like `srmjeee.js` and `courseFinder.js`); content goes in `src/data/`; UI is thin React that calls them. No new runtime dependencies and no new server beyond one log endpoint that follows `server/enquiry.js`.

**Tech Stack:** React 18, Vite 5, react-router 6, plain CSS (`src/redesign.css` is loaded last), node:test (`npm test` runs `tests/*.test.js`), Node handlers in `server/` with Vercel wrappers in `api/`.

**Spec:** `docs/superpowers/specs/2026-11-07-ux-brief-design.md` (requirements R1–R9). Project handoff: `docs/CONTEXT.md`.

## Global Constraints

- Never invent facts about SRMIST or real people. Fees stay labelled illustrative while `FEES_ARE_ILLUSTRATIVE` is true in `src/data/fees.js`.
- Every story, answer or statistic added must carry a source URL or be a clearly labelled prototype.
- Pages work at 375px wide, header still fits at 320px, tap targets are at least 36px.
- No new npm dependencies.
- Tests are pure logic only, in `tests/*.test.js`, run with `npm test` (use `npm.cmd test` in PowerShell).
- Secrets (`GEMINI_API_KEY`) are never written to files or logs.
- The folder is not a git repository, so there are no commit steps. "Done" for each task means its tests pass and, for UI, the check in the browser pane at 375px and desktop.
- Do not deploy unless the owner asks.
- UI strings that appear on every page use `t()` from `src/i18n.jsx`; long-tail text is covered by live translation.

## Review Focus

1. A fee question naming a campus we have no figures for ("CSE fees Delhi campus"): the card must not imply campus-specific numbers. Pinned in Task 1.
2. All SRMJEEE deadlines passed: the strip hides, the Apply bar stays, nothing shows "-1 days". Pinned in Task 2.
3. Browser without speech recognition, or microphone permission denied: no mic button or a quiet fallback, no thrown error. Pinned in Task 6.
4. DAAS email gate: visitor clears storage or opens a new tab to dodge the count; mail provider is down; code expires mid-chat; email typed with a typo. The server must still block, and the widget must show a clear message rather than spin. Pinned in Task 4.
5. Search log containing an email address or phone number typed by the visitor: it is redacted before sending and again on the server. Pinned in Task 5.

---

### Task 1: Answer cards for fee, duration and deadline questions (R2)

**Files:**
- Create: `src/lib/answers.js`, `tests/answers.test.js`
- Modify: `src/ui/SmartSearch.jsx` (show the card above the result list), `src/redesign.css` (append card styles)

**Interfaces:**
- Consumes: `FEE_PROGRAMMES`, `FEES_ARE_ILLUSTRATIVE` from `src/data/fees.js`; `PROGRAMMES` from `src/data/programmes.js`; `nextDeadline(now)` from `src/lib/srmjeee.js`.
- Produces: `answerFor(query: string, now?: Date): null | { kind: 'fees' | 'duration' | 'deadline', title: string, body: string, href: string, illustrative: boolean }`.

- [ ] **Step 1: Write failing tests in `tests/answers.test.js`**
  - `answerFor('B.Tech CSE fees')` → `kind 'fees'`, `body` contains `2,50,000`, `per year` and `4 years`, `illustrative === true`, `href` starts with `/admissions`.
  - `answerFor('mbbs fees')` → body contains `12,00,000`.
  - `answerFor('fees')` → `null` (no programme named, normal search handles it).
  - `answerFor('how long is b.tech')` → `kind 'duration'`, body contains `4 yrs`.
  - `answerFor('last date to apply', new Date('2027-03-01T10:00:00+05:30'))` → `kind 'deadline'`, body contains `nextDeadline(that date).deadlineLabel`, `href '/srmjeee'`.
  - `answerFor('last date to apply', new Date('2028-01-01'))` → `null`.
  - `answerFor('cse fees delhi campus')` → body matches `/campus/i` and says the figure is not campus-specific.
- [ ] **Step 2: Run `npm test` and confirm the new file fails** (module not found).
- [ ] **Step 3: Implement `answerFor` in `src/lib/answers.js`.** Normalise the query, match programme aliases (`btech|b tech|cse|ece|eee|mech|civil` → engineering; `mbbs|medicine` → medicine; `bba|mba` → management; `bsc` → science; `llb|law` → law; `barch|architecture` → architecture; `agri*` → agriculture; `hotel` → hotel), then intent words (`fee|cost|tuition`, `how long|duration|years`, `last date|deadline|apply by`). Format money with `toLocaleString('en-IN')`.
- [ ] **Step 4: Render the card in `SmartSearch.jsx`** above the results when `answerFor(q)` is non-null: title, body, an "Illustrative figure, confirm with admissions" tag when `illustrative`, and a link button to `href`.
- [ ] **Step 5: Run `npm test`.** Expected: all pass. Check in the browser pane at 375px: type "B.Tech CSE fees" in search, the card shows and nothing overflows.

### Task 2: Deadline strip and persistent mobile Apply bar (R3)

**Files:**
- Modify: `src/lib/srmjeee.js`, `tests/srmjeee.test.js`, `src/Home.jsx` (strip), `src/App.jsx` (mount the bar), `src/redesign.css`
- Create: `src/ui/DeadlineStrip.jsx`, `src/ui/ApplyBar.jsx`

**Interfaces:**
- Consumes: `nextDeadline(now)`.
- Produces: `deadlineLine(now?: Date): string | null` exported from `src/lib/srmjeee.js`.

- [ ] **Step 1: Add failing tests to `tests/srmjeee.test.js`.**
  - Two days before a deadline: `deadlineLine(d)` contains `2 days left` and `Phase`.
  - One day left: contains `1 day left` (singular).
  - On the deadline day: contains `Last day`.
  - After every phase: `null`.
- [ ] **Step 2: Run `npm test`; the new cases fail.**
- [ ] **Step 3: Implement `deadlineLine` in `src/lib/srmjeee.js`** using `nextDeadline`.
- [ ] **Step 4: `DeadlineStrip` renders the line as a link to `/srmjeee` under the header on the home page; renders nothing when the line is `null`.**
- [ ] **Step 5: `ApplyBar` is fixed to the bottom on screens up to 760px, links to `/apply`, is hidden on routes starting `/apply`, `/admissions` and `/srmjeee`, and does not cover the DAAS button (raise the DAAS button by the bar height with a CSS variable).**
- [ ] **Step 6: Run `npm test`; check at 375px that the bar shows on `/`, `/hostels` and not on `/apply`.**

### Task 3: Pause control for moving hero content (R4)

**Files:**
- Modify: `src/lib/motion.js`, `tests/motion.test.js`, `src/Home.jsx` (hero photo shuffle around line 362), `src/redesign.css`

**Interfaces:**
- Produces: `shouldAutoplay({ reducedMotion: boolean, paused: boolean, tabHidden: boolean }): boolean`.

- [ ] **Step 1: Add failing tests:** returns `true` only when all three flags are `false`; each flag alone makes it `false`.
- [ ] **Step 2: Run `npm test`; fails.**
- [ ] **Step 3: Implement `shouldAutoplay` in `src/lib/motion.js`.**
- [ ] **Step 4: In `Home.jsx` gate the hero interval with `shouldAutoplay`, and add a Pause/Play button (min 36px, `aria-pressed`, labelled "Pause hero animation") that stores its state in `sessionStorage` inside try/catch.**
- [ ] **Step 5: Run `npm test`; confirm in the browser pane that pausing stops the flips and reduced-motion starts paused.**

### Task 4: DAAS email check after 3 messages, to stop bots (R5)

**Files:**
- Create: `src/lib/chatGate.js`, `tests/chat-gate.test.js`, `server/verify.js`, `api/verify.js`
- Modify: `server/chat.js` (enforce the gate), the DAAS chat widget in `src/shared.jsx` (email step), `server/gemini-plugin.js` and `server/index.js` (route `/api/verify`), `src/redesign.css`

**Interfaces:**
- Produces (client, `src/lib/chatGate.js`): `needsVerification(userMessages: number, verified: boolean, free = 3): boolean` (true from the 4th message when not verified); `isPlausibleEmail(email: string): boolean` (format check, rejects a short list of disposable domains).
- Produces (server, `server/verify.js`): `signToken(email: string, now: number, secret: string): string`; `verifyToken(token: string, now: number, secret: string): { ok: boolean, email?: string }` (HMAC-signed, valid 24 hours); `checkAccess({ token, ip, now, secret, limiter }): { allow: boolean, reason?: 'verify' }` where an unverified IP gets `free` chat calls per hour from `makeLimiter` in `server/util.js`; a `sendCode(to, code)` adapter that uses a mail provider when `MAIL_API_KEY` and `MAIL_FROM` are set.
- Routes: `POST /api/verify` with `{ action: 'start', email }` (sends a 6-digit code) or `{ action: 'check', email, code }` (returns `{ token }`). Codes expire after 10 minutes and allow 5 attempts.

- [ ] **Step 1: Write failing tests in `tests/chat-gate.test.js`.**
  - `needsVerification(3, false) === false`; `needsVerification(4, false) === true`; `needsVerification(10, true) === false`.
  - `isPlausibleEmail('a@b.co')` true; `'ab'`, `'a@b'`, `'a b@c.com'` false; a known disposable domain false.
  - `verifyToken(signToken('a@b.co', t, 's'), t + 1000, 's')` is `{ ok: true, email: 'a@b.co' }`.
  - Expired (`t + 25 h`), tampered, and wrong-secret tokens return `{ ok: false }`.
  - `checkAccess` with no token allows 3 calls from one IP and the 4th returns `{ allow: false, reason: 'verify' }`; with a valid token it always allows.
- [ ] **Step 2: Run `npm test`; the new file fails.**
- [ ] **Step 3: Implement the client helpers and the server token and access functions** (Node `crypto` HMAC-SHA256, constant-time compare; no new dependency). Secret comes from `VERIFY_SECRET`; if it is missing in production, `/api/verify` returns 503 and the gate shows "Verification is unavailable right now" instead of hanging.
- [ ] **Step 4: Server enforcement.** In `server/chat.js`, call `checkAccess` first and return `401 { needVerify: true }` when blocked. The server counts by IP, not by what the browser claims, so clearing storage does not reset the limit.
- [ ] **Step 5: Mail adapter.** `sendCode` posts with `fetch` (no SDK) to the provider the owner sets up: Brevo's transactional email API by default (it works with one verified sender address and no domain), or Resend if the owner has a verified domain. Environment variables: `MAIL_API_KEY`, `MAIL_FROM`, `VERIFY_SECRET`; set them locally in `.env` and on Vercel with `vercel env add`, never in chat or in files. If no provider is configured, `/api/verify` runs in basic mode: it checks the email format only, returns a token with `level: 'basic'`, and the widget says "Not verified by email". This is a labelled fallback, not real verification.
- [ ] **Step 6: Widget.** After 3 messages the next send opens an inline step: "Enter your email to keep chatting. We use it only to check you are not a bot." Then a 6-digit code field, with Resend and a clear error for wrong or expired codes. The verified state is kept in `sessionStorage` (try/catch) and the token is sent with each chat call. The email is never stored or logged (apply `redact` from Task 5 to any log line).
- [ ] **Step 7: Run `npm test`. By hand: send 3 messages, confirm the 4th asks for email; clear storage and confirm the server still blocks; enter a valid code and confirm chat resumes.**

### Task 5: Search log and metrics, without personal data (R6, R9)

**Files:**
- Create: `src/lib/searchStats.js`, `tests/search-stats.test.js`, `server/searchlog.js`, `api/search-log.js`
- Modify: `server/gemini-plugin.js` (serve the route in `vite dev`), `server/index.js` (register the route)

**Interfaces:**
- Produces: `redact(q: string): string`; `summarise(events: { q: string, lang: string, results: number, clicked: boolean, helpful?: boolean }[]): { total: number, noResultRate: number, clickRate: number, helpfulRate: number | null }`; `logSearch(event): void` (uses `navigator.sendBeacon('/api/search-log', JSON)`, falls back to `fetch` with `keepalive`, never throws); server `handleSearchLog` following the handler shape in `server/enquiry.js` and the helpers in `server/util.js`.

- [ ] **Step 1: Write failing tests.**
  - `redact('mail me a@b.com')` → `mail me [email]`.
  - `redact('call 9876543210')` → `call [number]`.
  - `redact` output is at most 80 characters.
  - `summarise([])` → `{ total: 0, noResultRate: 0, clickRate: 0, helpfulRate: null }`.
  - Four events (one with `results: 0`, two `clicked: true`, one `helpful: true`, one `helpful: false`) → `noResultRate 0.25`, `clickRate 0.5`, `helpfulRate 0.5`.
  - Server handler rejects a non-object body (400) and redacts again before logging.
- [ ] **Step 2: Run `npm test`; fails.**
- [ ] **Step 3: Implement the lib and the handler.** The handler writes one `console.log` JSON line (`kind: 'search'`, redacted query, lang, results, clicked, helpful) and stores nothing; rate-limit with `makeLimiter`.
- [ ] **Step 4: Wire the route in the Vercel wrapper, the dev plugin and `server/index.js`.**
- [ ] **Step 5: Run `npm test`; post a sample event to the dev route and confirm a 200 and one log line.**

### Task 6: Voice input and "Was this helpful?" (R6)

**Files:**
- Create: `src/lib/voice.js`, `tests/voice.test.js`
- Modify: `src/ui/SmartSearch.jsx`, the DAAS chat widget in `src/shared.jsx` (find it with `grep srm:ask`), `src/redesign.css`

**Interfaces:**
- Consumes: `logSearch` from Task 5; `answerFor` from Task 1.
- Produces: `voiceSupported(win?: object): boolean`; `speechLang(code: 'en' | 'ta' | 'hi'): 'en-IN' | 'ta-IN' | 'hi-IN'`.

- [ ] **Step 1: Write failing tests:** `voiceSupported({})` is `false`; `voiceSupported({ webkitSpeechRecognition: function () {} })` is `true`; `speechLang('ta') === 'ta-IN'`; `speechLang('xx')` falls back to `'en-IN'`.
- [ ] **Step 2: Run `npm test`; fails.**
- [ ] **Step 3: Implement both functions in `src/lib/voice.js`.**
- [ ] **Step 4: In `SmartSearch.jsx` add a mic button only when `voiceSupported(window)`; on result, fill the query; on any recognition error, stop quietly and show a one-line hint (Review Focus 3).**
- [ ] **Step 5: Add "Was this helpful?" Yes/No buttons under the answer card and under each DAAS reply; each calls `logSearch` with `helpful`. Log each search once it is submitted or a result is opened (`clicked`).**
- [ ] **Step 6: Run `npm test`; check at 375px that the mic and helpful buttons are at least 36px and nothing overflows.**

### Task 7: Student innovation section (R7)

**Files:**
- Create: `src/data/innovation.js`, `tests/innovation.test.js`, `src/pages/Innovation.jsx`, `src/ui/InnovationRail.jsx`, `src/styles/innovation.css`
- Modify: `src/App.jsx` (route `/innovation`), `src/data/nav.js` (add "Student innovation" to the Research "Collaborate" column), `src/Home.jsx` (rail), `src/pages/` or `src/ui/immersive/AlphaRail.jsx` (department directory chip)

**Interfaces:**
- Produces: `STORIES: { id: string, title: string, kind: 'project' | 'lab' | 'startup' | 'alumnus', departments: string[], hook: string, photo: string | null, source: string, asOf: string }[]` (`departments` are the last path segment of `DEPARTMENTS[i].href`); `storiesForDepartment(slug: string): Story[]`.

- [ ] **Step 1: Research first.** Find real, sourced cross-department stories (for example SRMSAT) on srmist.edu.in or other primary sources. Record each source URL and retrieval date. Use only what a source states; if fewer than three can be verified, ship the ones that can and say so in the page.
- [ ] **Step 2: Write failing tests:** at least 1 story exists; every story has an `https://` source, a `hook` of at most 120 characters, at least one department, and a valid `asOf` date; every department slug exists in `DEPARTMENTS`; `storiesForDepartment` returns only stories listing that slug and `[]` for an unknown slug.
- [ ] **Step 3: Run `npm test`; fails.**
- [ ] **Step 4: Implement the data module and helper.**
- [ ] **Step 5: Build `/innovation` with the shared page shell (`SvcHero`, banded sections, reveal) listing stories filterable by kind and by `?dept=`; each card shows photo (or none), hook, departments and a "Source" link.**
- [ ] **Step 6: `InnovationRail` on the home page is a manual horizontal scroll-snap strip with previous/next buttons and no autoplay (R4). Add a "n stories" chip in the department directory rows that links to `/innovation?dept=<slug>`.**
- [ ] **Step 7: Run `npm test`; check `/innovation` and the home rail at 375px and in dark mode.**

### Task 8: Ask a current student (R8)

**Files:**
- Create: `src/data/student-voices.js`, `tests/student-voices.test.js`, `src/pages/StudentVoices.jsx`, `src/styles/voices.css`
- Modify: `src/App.jsx` (route `/ask-a-student`), `src/data/nav.js` (add under Campus life "Community"), `server/enquiry.js` (accept a `student-question` type if it validates a fixed list)

**Interfaces:**
- Produces: `VOICES: { id: string, topic: 'hostel' | 'workload' | 'clubs' | 'placements', department: string, q: string, a: string, who: string, consent: boolean, source?: string }[]`; `filterVoices(voices, { topic?: string, department?: string }): Voice[]`.

- [ ] **Step 1: Write failing tests:** every entry has `consent === true` or an `https://` `source`; `filterVoices(VOICES, { topic: 'placements' })` returns only that topic; an empty filter returns all; an unknown topic returns `[]`.
- [ ] **Step 2: Run `npm test`; fails.**
- [ ] **Step 3: Seed `VOICES` only from content we can already source: reshape the five Career Centre stories in `src/data/placements.js` as answers to "What helped you get placed?" with `source` set to the Career Centre page. Leave other topics empty.**
- [ ] **Step 4: Build `/ask-a-student` with topic and department filters, honest empty states ("No answers published yet for this topic"), and a question form that reuses the existing enquiry endpoint. Label the page "Prototype: answers are added only with the student's consent".**
- [ ] **Step 5: Run `npm test`; check 375px and dark mode.**

### Task 9: Click-depth check and usability-test kit (R1, R9)

**Files:**
- Create: `src/lib/clickDepth.js`, `tests/click-depth.test.js`, `docs/usability-test.md`
- Modify: `src/data/nav.js` (export `SRMJEEE_LINK = ['SRMJEEE', '/srmjeee']`), `src/shared.jsx` (use it for the two `snav-srmjee` anchors)

**Interfaces:**
- Consumes: `STRIP`, `AUX`, `ADMIT`, `MENUS`, `SRMJEEE_LINK` from `src/data/nav.js`.
- Produces: `depthFromHome(href: string): number | null` (links in the header, strip and quick links count as 1 click; the menu itself counts as 1 and each of its dropdown links as 2, so the check holds on touch devices; `null` when unreachable).

- [ ] **Step 1: Write failing tests:** `depthFromHome('/admissions') === 1`; `'/srmjeee' === 1`; `'/placements' === 1`; `'/course-finder' <= 2`; `'/hostels' <= 2`; `'/staff-finder' <= 2`; `'/innovation' <= 2`; `'/ask-a-student' <= 2`; `'/does-not-exist' === null`.
- [ ] **Step 2: Run `npm test`; fails.**
- [ ] **Step 3: Implement `depthFromHome`; export `SRMJEEE_LINK` and use it in `shared.jsx`.**
- [ ] **Step 4: Write `docs/usability-test.md`:** 8–10 participants (half non-SRM), six tasks ("find the fees for a CSE degree", "find the last date to apply", "find placement figures", "find hostel types", "find which course suits me", "find a faculty member's availability"), what to record (time, wrong clicks, success), pass marks (at least 80% success, median time under 60 seconds, at most 1 wrong click per task), and where to read search metrics (`summarise` over the Task 5 log lines).
- [ ] **Step 5: Run `npm test`. Expected: all pass, including the new depth checks.**

---

## Self-review

- **Spec coverage:** R1 → Task 9 (and Task 2 apply path). R2 → Task 1. R3 → Task 2. R4 → Tasks 3 and 7 (no autoplay rail). R5 → Task 4 (email check). R6 → Tasks 5 and 6. R7 → Task 7. R8 → Task 8. R9 → Tasks 5 and 9. Non-goals are not planned.
- **Type consistency:** `nextDeadline` (existing) feeds `deadlineLine` (Task 2) and `answerFor` (Task 1). `logSearch` (Task 5) is consumed by Task 6. `redact` (Task 5) is used by Task 4's logging; Task 4 therefore runs after Task 5's `redact` exists, so do Task 5 first. `SRMJEEE_LINK` is defined and used within Task 9. `depthFromHome` targets `/innovation` and `/ask-a-student` created in Tasks 7 and 8, so Task 9 runs last.
- **Dependencies:** run in order 1, 2, 3, 5, 4, 6, 7, 8, 9. Tasks 1 to 3 are independent of each other; Task 4 needs `redact` from Task 5, so run 5 before 4. Task 6 needs 1 and 5. Task 9 needs 7 and 8.
