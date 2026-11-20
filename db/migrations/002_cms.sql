-- Headless CMS: editable content (news, FAQ, site text) kept apart from the site's code. Same database and people as the staff portal.
-- Run with:  node scripts/migrate-portal.mjs   (applies every file in db/migrations in order; safe to run twice).

CREATE TABLE IF NOT EXISTS content_items (
  id            BIGSERIAL PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type ~ '^[a-z][a-z0-9-]{1,30}$'),
  slug          TEXT NOT NULL CHECK (slug ~ '^[a-z0-9]+([.-][a-z0-9]+)*$' AND char_length(slug) <= 60),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'rejected', 'published', 'archived')),
  data          JSONB NOT NULL CHECK (octet_length(data::text) <= 20000),       -- the working copy
  live_data     JSONB CHECK (live_data IS NULL OR octet_length(live_data::text) <= 20000), -- what the public site shows; NULL = not live
  version       INT NOT NULL DEFAULT 1,
  author_id     BIGINT NOT NULL REFERENCES portal_users(id),
  reviewer_id   BIGINT REFERENCES portal_users(id),
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ,
  UNIQUE (type, slug),
  CHECK (reviewer_id IS NULL OR reviewer_id <> author_id)  -- nobody approves or rejects their own work
);
CREATE INDEX IF NOT EXISTS content_public ON content_items (type, published_at DESC) WHERE live_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS content_author ON content_items (author_id, updated_at DESC);

-- One row per action, with a snapshot of the content at that moment: the audit trail and the revision history in one table.
CREATE TABLE IF NOT EXISTS content_events (
  id          BIGSERIAL PRIMARY KEY,
  at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  item_id     BIGINT NOT NULL,
  item_type   TEXT NOT NULL,
  slug        TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('created', 'edited', 'submitted', 'published', 'rejected', 'unpublished', 'archived')),
  version     INT NOT NULL,
  actor_id    BIGINT NOT NULL,
  actor_name  TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  note        TEXT,
  snapshot    JSONB
);
CREATE INDEX IF NOT EXISTS content_events_item ON content_events (item_id, id DESC);

-- Like portal_logs, the database itself refuses to change or remove an event, whoever asks.
CREATE OR REPLACE FUNCTION content_events_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'content_events is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS content_events_no_update ON content_events;
CREATE TRIGGER content_events_no_update BEFORE UPDATE OR DELETE ON content_events FOR EACH ROW EXECUTE FUNCTION content_events_append_only();
DROP TRIGGER IF EXISTS content_events_no_truncate ON content_events;
CREATE TRIGGER content_events_no_truncate BEFORE TRUNCATE ON content_events FOR EACH STATEMENT EXECUTE FUNCTION content_events_append_only();
