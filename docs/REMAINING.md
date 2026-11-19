# What is left (only the owner can do these: they need your accounts or secrets)

Done and live: site, 14 section pages, events, key dates, translations, DAAS bot, staff portal code, Neon database (migrated and seeded), noindex portal. The portal is not linked from any public page.

## 1. Turn the staff portal on (about 10 minutes)
1. Google Cloud Console, APIs and Services, Credentials, Create credentials, OAuth client ID, **Web application**.
   Authorised JavaScript origins: `https://srmist-home.vercel.app` and `http://localhost:5174`.
2. Vercel project srmist-home, Settings, Environment Variables (Production): add
   - `GOOGLE_CLIENT_ID` = the client id (public)
   - `APPROVER_EMAILS` = comma-separated @srmist.edu.in addresses of the real approvers
3. Redeploy. Open `/portal`. Keep `DEMO_MODE` and `DEMO_MEMORY` unset in production.
4. The seed data uses fictional people. To remove them, run the delete in the Neon console (SQL editor) for the `@srmist.edu.in` demo and fictional users and their items. The log table cannot be edited by design, so leave log rows or recreate the database.

## 2. Shared chat limits (Upstash, free)
Create a Redis database at upstash.com, then add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel. Without them the limits are per server instance only.

## 3. Rotate the Gemini key
Google AI Studio: create a new key, delete the old one, set a spend alert. Put the new one in Vercel as `GEMINI_API_KEY` and redeploy. The "SRM Guide is getting a lot of questions" message means the current key's quota ran out (Google answered 429).

## 4. Not built yet
- Email check after 3 chat messages: needs a mail provider key (for example Resend). Plan: `docs/superpowers/plans`.
- A page for editing site text: the portal handles announcements and events only. For other text use the Decap option in `docs/HANDOVER.md`.
- Native-speaker review of the Tamil and Hindi text; the official fee schedule; permission-cleared event photos.

## Notes
- `npm audit` shows 2 findings in vite/esbuild (dev server only). Fixing needs a major Vite upgrade.
- A separate session is redesigning the other pages (branch, not pushed to main).
