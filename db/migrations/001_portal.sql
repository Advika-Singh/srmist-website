-- Content portal: teachers submit announcements and events, approvers review them, only approved items go public.
-- Run with:  node scripts/migrate-portal.mjs   (reads DATABASE_URL). Safe to run twice.

CREATE TABLE IF NOT EXISTS portal_users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE CHECK (email = lower(email) AND email ~ '^[a-z0-9._%+-]+@srmist\.edu\.in$'),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'approver')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login  TIMESTAMPTZ
);

-- Sessions: only a hash of the cookie value is stored, so a database leak cannot be replayed as a login.
CREATE TABLE IF NOT EXISTS portal_sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  csrf        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS portal_sessions_expiry ON portal_sessions (expires_at);

CREATE TABLE IF NOT EXISTS portal_items (
  id            BIGSERIAL PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('announcement', 'event')),
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 4000),
  link          TEXT CHECK (link IS NULL OR link ~ '^https?://'),
  expires_at    DATE,                 -- announcements: last day shown
  event_date    DATE,                 -- events
  start_time    TIME,
  end_time      TIME,
  venue         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  submitter_id  BIGINT NOT NULL REFERENCES portal_users(id),
  reviewer_id   BIGINT REFERENCES portal_users(id),
  reject_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  live_at       TIMESTAMPTZ,          -- when it started showing on the public site
  CHECK (type <> 'event' OR (event_date IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL AND venue IS NOT NULL)),
  CHECK (reviewer_id IS NULL OR reviewer_id <> submitter_id)  -- nobody approves or rejects their own item
);
CREATE INDEX IF NOT EXISTS portal_items_public ON portal_items (status, type, event_date, expires_at);
CREATE INDEX IF NOT EXISTS portal_items_submitter ON portal_items (submitter_id, created_at DESC);

-- Append-only audit log: one row per action. Times are stored in UTC and shown in IST by the app.
CREATE TABLE IF NOT EXISTS portal_logs (
  id          BIGSERIAL PRIMARY KEY,
  at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  action      TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'edited', 'withdrawn')),
  item_id     BIGINT NOT NULL,
  item_type   TEXT NOT NULL,
  item_title  TEXT NOT NULL,
  submitter_id BIGINT NOT NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  actor_id    BIGINT NOT NULL,
  actor_name  TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  approved_at TIMESTAMPTZ,            -- filled on 'approved' rows
  live_at     TIMESTAMPTZ,            -- filled on 'approved' rows
  details     JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS portal_logs_at ON portal_logs (at DESC);

-- The database refuses to change or remove a log row, whoever asks (the app, a script or someone with the connection string).
CREATE OR REPLACE FUNCTION portal_logs_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'portal_logs is append-only';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS portal_logs_no_update ON portal_logs;
CREATE TRIGGER portal_logs_no_update BEFORE UPDATE OR DELETE ON portal_logs FOR EACH ROW EXECUTE FUNCTION portal_logs_append_only();
DROP TRIGGER IF EXISTS portal_logs_no_truncate ON portal_logs;
CREATE TRIGGER portal_logs_no_truncate BEFORE TRUNCATE ON portal_logs FOR EACH STATEMENT EXECUTE FUNCTION portal_logs_append_only();

-- Rate limits kept in the database, so serverless restarts do not reset them.
CREATE TABLE IF NOT EXISTS portal_rate (
  key          TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  n            INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
