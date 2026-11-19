# Handover: running, editing, migrating and securing this site

Written 2026-11-20 for the judges' questions (migration for a non-technical owner, backend, CMS, bot security). It says what exists today and what is only planned.

## 1. What this is, in one paragraph
A React single-page site built into plain files (HTML, JS, CSS, images) plus six small serverless functions (`/api/chat`, `/api/translate`, `/api/status`, `/api/enquiry`, `/api/complaints`, `/api/search-log`). **There is no database and no admin login.** All content lives in files under `src/data/` (`pages.json`, `sections.js`, `events.js`, `nav.js`, `programmes.js`, `srmjeee.js`, `community.js` and others). Hosting is Vercel today; any static host plus Node works (`npm start` serves the build and the API).

## 2. "If we hand this to someone who is not technical, how do they migrate it?"
| Step | Who | What |
|---|---|---|
| Hand-over package | us | This repo, `docs/CONTEXT.md` (map), this file, `.env.example` (settings list), and a recorded 20-minute walkthrough |
| Host it | university IT (or us once) | Import the GitHub repo into Vercel (or run `npm run build` and serve `dist/` with the `server/` folder). Add the settings in section 4. About 30 minutes |
| Run beside the old site | IT | Put it on a test address (for example `new.srmist.edu.in`) and compare pages with `public/sitemap.xml` |
| Switch over | IT | Point the main domain at the new host. Old addresses that changed need 301 redirects (a list can be generated from the sitemap). Keep the old site reachable for two weeks to roll back |
| Day-to-day edits | content team | See section 3. Today a developer edits the data files; the CMS below removes that |

## 3. CMS: what exists and what we recommend
**Today: no CMS.** Content is in data files and edited in code. Honest answer: a non-technical editor cannot change it yet.
**Recommended and low-risk: Decap CMS (free, Git-based).** It adds an `/admin` page where staff log in (GitHub or university single sign-on), edit forms, and press Publish; the change is saved as a commit and the site rebuilds in about a minute. Nothing in the site's design changes. Effort: 1 to 2 days, because the content is already structured (one form per file: events, news, colleges, menus, stats). Alternatives if the university wants a hosted editor: Sanity or Strapi (more setup, more cost). Rules to keep in the forms: every figure has a "source link" and "date checked" field, as the site already does.

## 4. Backend and settings (all server-side, none in the browser)
`GEMINI_API_KEY` (assistant and translation), `ENQUIRY_WEBHOOK_URL` (where enquiries go; until set the form says it was not delivered), optional `GEMINI_MODEL`, `TRUST_PROXY=1` behind Vercel, `CHAT_DAILY_PER_IP`, `CHAT_DAILY_GLOBAL`, `CHAT_DAILY_TOKENS`, `TRANSLATE_DAILY_PER_IP`, `TRANSLATE_DAILY_GLOBAL`, and for shared counters `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The support tracker and its reference numbers are a prototype with no link to SRMIST systems. No personal data is stored by the site; enquiry data goes only to the webhook.

## 5. Assistant (DAAS) abuse and cost controls
| Layer | Where | Limit |
|---|---|---|
| Only our own pages may call it, JSON only | `server/security.js`, `chat.js` | other origins get 403 |
| Size caps | `chat.js` | 16 KB request, last 10 turns, 800 characters each |
| Burst limit | `chat.js` | 20 questions a minute per visitor |
| **Daily per visitor** | `server/budget.js` | **60 questions** (setting `CHAT_DAILY_PER_IP`) |
| **Daily whole site** | `server/budget.js` | **3,000 questions** (`CHAT_DAILY_GLOBAL`) |
| **Daily tokens** | `server/budget.js` | **1,500,000 tokens**, counted from Gemini's own usage report (`CHAT_DAILY_TOKENS`) |
| Cost per answer | `chat.js` | answers capped at 600 tokens, 25-second ceiling, fast models first |
| What it may say | `chat.js` | only the fact list and page list in the prompt; links outside the page list are dropped; unknown details get "ask admissions" |
| Translator | `translate.js` | 300 requests a day per visitor and 15,000 for the site (only requests that need Gemini count) |
| Shared counters | `server/budget.js` | with the two Upstash settings every server instance counts together and restarts lose nothing; without them counters are per process |
| CAPTCHA | `server/turnstile.js`, `src/lib/captcha.js` | Cloudflare Turnstile, built and switched off until keys are set: with `TURNSTILE_SECRET` (server) and `VITE_TURNSTILE_SITEKEY` (build) every question needs a fresh one-time token, or the server answers 403 before spending anything on Gemini |
| When a limit is hit | `budget.js` | a polite message with the admissions phone number; Gemini is not called |
| Key safety | server only | never sent to the browser; CSP, HSTS and frame blocking on every page |
Failed attempts count as questions, so a broken or blocked upstream cannot be hammered for free. Tests: `tests/budget.test.js`, `tests/chat.test.js`.

**Known limits (say these plainly):** the shared counters are built and tested against a fake Upstash, but are switched on only once an Upstash database exists and its two settings are added (until then counters are per server instance); visitors are told apart by IP, so many students behind one college network share a limit; the CAPTCHA is built but off until its two keys are added, and there is no email check yet. **Still needs an account or key from the owner, in order:** (1) create a free Upstash Redis database and add its two settings in Vercel (10 minutes); (2) free Cloudflare Turnstile keys: add `TURNSTILE_SECRET` in Vercel and `VITE_TURNSTILE_SITEKEY` as a build setting, then redeploy (the chat box is covered; the forms are not yet); (3) a mail provider key for the email one-time code (plan in `docs/superpowers/plans/`); (4) rotate the Gemini key and set a spend alert in Google AI Studio; (5) a GitHub login set-up for the CMS (section 3).

## 6. Short answers for questions
- **"After how many tokens does it stop?"** Per answer: 600 output tokens. Per day for the whole site: 1.5 million tokens, then it pauses until midnight India time. Per visitor: 60 questions a day, 20 a minute.
- **"What if it is spammed?"** Layered limits above; over-limit visitors get a message and a phone number, not an error and not a bill.
- **"Can it make things up?"** It is told to use only a supplied fact list; it says "ask admissions" otherwise. Facts are rebuilt from the same data files as the pages (exam dates, events) so they cannot drift.
- **"Who owns the data?"** The university: the repo, the content files and the settings are all theirs; no vendor lock-in beyond Gemini (replaceable in one file, `server/chat.js`).
- **"What would you do first with more time?"** Redis counters, Turnstile, the CMS, native-speaker review of Tamil and Hindi, and the official fee schedule.
