# Staff content portal

Teachers post announcements and events at `/portal`; an approver reviews them; only approved items reach `/announcements` and `/events/calendar`.

## How it works
- **Sign-in:** Google Identity Services. The server verifies the ID token with Google (audience, issuer, expiry, `email_verified`, `hd`) and then checks the address against a strict pattern, so `user@srmist.edu.in.evil.com` and `user@evil.com?@srmist.edu.in` are refused. The role comes only from `APPROVER_EMAILS` on the server.
- **Sessions:** random token in an httpOnly, Secure, SameSite=Lax cookie (`__Host-` prefix); only a hash is stored. Every change needs the CSRF header and a same-origin check.
- **Roles:** every route checks the session; teachers get 403 on approver routes. Nobody can approve or reject their own item.
- **Logs:** `portal_logs` is append-only, enforced by database triggers (update, delete, truncate all fail). Times are stored in UTC and shown in IST. CSV export neutralises spreadsheet formulas.
- **Rate limits:** stored in the database (`portal_rate`), so they hold across serverless instances.
- **Neon cold start:** the browser shows "Waking the database…" and retries once; the server retries a dropped connection once.

## Run locally (no database)
Put `DEMO_MEMORY=1` and `DEMO_MODE=1` in `.env.local`, run `npm run dev`, open http://localhost:5174/portal and use the demo buttons. Data resets when the server restarts.

## Deploy
1. Vercel project, Storage / Marketplace: add **Neon** (free plan). `DATABASE_URL` is injected.
2. `vercel env pull .env.local`, then `node scripts/migrate-portal.mjs` and `node scripts/seed-portal.mjs`.
3. Google Cloud Console: create an OAuth **Web** client; authorised JavaScript origins = your site URL and `http://localhost:5174`. Put the client id in `GOOGLE_CLIENT_ID`.
4. Set `APPROVER_EMAILS` (comma-separated). Leave `DEMO_MODE` and `DEMO_MEMORY` unset in production.
5. Without `DATABASE_URL` the portal answers 503 and nothing else on the site is affected.

## Prototype shortcuts (be honest about these)
- Token verified via Google's `tokeninfo` endpoint instead of local JWKS verification (one extra network call per login).
- Demo mode and the in-memory store exist for presentations only.
- Approved items are frozen: an approver can edit pending items, not live ones.
- Seed data uses fictional people; replace via the seed script or delete the rows.
- `npm audit` shows 2 findings in vite/esbuild (dev server only, pre-existing); fixing needs a major Vite upgrade.
