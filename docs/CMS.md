# Headless CMS

Editable site content (news, FAQ answers, short pieces of site text) kept in the database, apart from the site's code. Staff write it in the portal, an approver publishes it, and the public site reads it from a small read-only API. It reuses the staff portal's sign-in, roles, database and audit approach; there is no separate system to run.

## How it works

1. **Write.** Anyone signed in with an `@srmist.edu.in` account opens **Staff portal → Site content** and saves a draft.
2. **Send for review.** The author sends it for review. It is now `pending`.
3. **Publish or send back.** An approver (listed in `APPROVER_EMAILS`) publishes it or sends it back with a reason. **Nobody can review their own work**: the API refuses it, and the database refuses it too (`CHECK (reviewer_id <> author_id)`).
4. **Public site.** Published content is read from `GET /api/public/content?type=news` and `GET /api/public/content/<type>/<slug>`. Only the live copy is returned, with no names or emails, cached for 60 seconds.

Editing something that is live sends it back for review. The old live copy stays on the public site until the edit is approved (`data` is the working copy, `live_data` is what the public sees). Approvers can **take down** (off the public site at once, back to draft) or **archive**.

## Content types

Defined as data in `server/cms/schemas.js`. The editor screen draws its form from that list, so a new type needs a schema entry and no new screen.

| Type | Fields |
|---|---|
| `news` | headline, summary, story, image, image description, read-more link, date |
| `faq` | question, answer, topic |
| `snippet` | key (for example `announcements.intro`), text, note |

Rules the server enforces on every save: unknown fields are refused, text is plain (HTML is stripped), links must be `http(s)` without credentials, images must be a photo already on the site (`/srmist/…`) or an `https` address on `www.srmist.edu.in` or `images.unsplash.com` (the same hosts the Content Security Policy allows), and an image needs a description for screen readers.

## What uses it today

- **Announcements page**: a *News* section from `news` items, and the hero line from the `announcements.intro` snippet. If the CMS is empty or unreachable, the page shows its built-in wording.
- `src/lib/cms.js` has `useContentList(type)` and `useSnippet(key, fallback)` for any other page.

## Audit and history

Every action (created, edited, submitted, published, rejected, unpublished, archived) writes a row to `content_events` with who did it, when, and a snapshot of the content. The table is append-only: database triggers refuse updates, deletes and truncation. The **History** button in the editor shows an item's events.

## Setup

```powershell
node scripts/migrate-portal.mjs
```

This applies every file in `db/migrations` in order (`001_portal.sql`, `002_cms.sql`) and is safe to run twice. No new environment variables are needed. For a local demo run with `DEMO_MODE=1 DEMO_MEMORY=1` the seed adds one live site-text item, one story waiting for review and one draft.

## Files

- `server/cms/schemas.js` content types, cleaning and validation
- `server/cms/routes.js` public and portal endpoints, roles, workflow
- `server/cms/repo-sql.js`, `server/cms/repo-memory.js` Postgres and in-memory storage (same methods)
- `db/migrations/002_cms.sql` tables, constraints, append-only triggers
- `src/pages/portal/ContentPanel.jsx` the editor screen
- `src/lib/cms.js` what the public pages read
- `tests/cms.test.js`, `tests/cms-api.test.js` 24 tests

## Limits

- No image upload: images are addresses of files that already exist.
- No scheduled publishing and no rich text; text is plain with blank-line paragraphs.
- Public pages fetch content in the browser, so it is not in the prerendered HTML that search engines see first.
- The Postgres layer (`repo-sql.js`) has not been run against a live Neon database yet; the memory layer is what the tests cover. Run the migration and try one story end to end before relying on it.
