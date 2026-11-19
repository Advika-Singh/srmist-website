// The portal's database layer on Neon Postgres. Every query uses numbered parameters ($1, $2 ...): no value is ever pasted into SQL text.
// Neon's free plan sleeps after 5 minutes idle, so the first query can take a couple of seconds; `run` retries once on a connection error.
import { neon } from '@neondatabase/serverless'

const ITEM_SELECT = `
  SELECT i.*, to_char(i.event_date,'YYYY-MM-DD') AS event_date, to_char(i.expires_at,'YYYY-MM-DD') AS expires_at,
         to_char(i.start_time,'HH24:MI') AS start_time, to_char(i.end_time,'HH24:MI') AS end_time,
         s.name AS submitter_name, s.email AS submitter_email, r.name AS reviewer_name, r.email AS reviewer_email
  FROM portal_items i JOIN portal_users s ON s.id = i.submitter_id LEFT JOIN portal_users r ON r.id = i.reviewer_id`

export function sqlRepo(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is not set')
  const sql = neon(url)
  const run = async (text, params = []) => {
    try {
      return await sql.query(text, params)
    } catch (e) {
      if (/fetch failed|ECONNRESET|ETIMEDOUT|terminating connection|timeout/i.test(String(e?.message))) {
        await new Promise((r) => setTimeout(r, 1500)) // the database was waking up
        return sql.query(text, params)
      }
      throw e
    }
  }
  const one = async (text, params) => (await run(text, params))[0] ?? null

  return {
    async upsertUser({ email, name, role }) {
      return one(
        `INSERT INTO portal_users (email, name, role, last_login) VALUES ($1,$2,$3, now())
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, last_login = now() RETURNING *`,
        [email, name, role],
      )
    },
    async createSession({ tokenHash, userId, csrf, expiresAt }) {
      await run('DELETE FROM portal_sessions WHERE expires_at < now()')
      await run('INSERT INTO portal_sessions (token_hash, user_id, csrf, expires_at) VALUES ($1,$2,$3,$4)', [tokenHash, userId, csrf, expiresAt])
    },
    async getSession(tokenHash) {
      const row = await one(
        `SELECT s.csrf, u.* FROM portal_sessions s JOIN portal_users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [tokenHash],
      )
      if (!row) return null
      const { csrf, ...user } = row
      return { user, csrf }
    },
    async deleteSession(tokenHash) {
      await run('DELETE FROM portal_sessions WHERE token_hash = $1', [tokenHash])
    },

    async createItem(v, submitterId) {
      const row = await one(
        `INSERT INTO portal_items (type,title,body,link,expires_at,event_date,start_time,end_time,venue,submitter_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [v.type, v.title, v.body, v.link, v.expires_at, v.event_date, v.start_time, v.end_time, v.venue, submitterId],
      )
      return this.getItem(row.id)
    },
    async getItem(id) {
      return one(`${ITEM_SELECT} WHERE i.id = $1`, [id])
    },
    async myItems(userId) {
      return run(`${ITEM_SELECT} WHERE i.submitter_id = $1 ORDER BY i.id DESC LIMIT 200`, [userId])
    },
    async queue() {
      return run(`${ITEM_SELECT} WHERE i.status = 'pending' ORDER BY i.id ASC LIMIT 200`)
    },
    async updateItem(id, f) {
      await run(
        `UPDATE portal_items SET title=$2, body=$3, link=$4, expires_at=$5, event_date=$6, start_time=$7, end_time=$8, venue=$9 WHERE id=$1`,
        [id, f.title, f.body, f.link, f.expires_at, f.event_date, f.start_time, f.end_time, f.venue],
      )
      return this.getItem(id)
    },
    async setStatus(id, { status, reviewerId = null, reason = null, reviewedAt = null, liveAt = null }) {
      await run('UPDATE portal_items SET status=$2, reviewer_id=$3, reject_reason=$4, reviewed_at=$5, live_at=$6 WHERE id=$1', [id, status, reviewerId, reason, reviewedAt, liveAt])
      return this.getItem(id)
    },
    async publicItems(type, today) {
      return run(
        `${ITEM_SELECT} WHERE i.status = 'approved' AND i.type = $1
           AND (($1 = 'event' AND i.event_date >= $2::date) OR ($1 = 'announcement' AND (i.expires_at IS NULL OR i.expires_at >= $2::date)))
         ORDER BY CASE WHEN $1 = 'event' THEN i.event_date END ASC, i.start_time ASC, i.id DESC LIMIT 200`,
        [type, today],
      )
    },

    async addLog(e) {
      await run(
        `INSERT INTO portal_logs (action,item_id,item_type,item_title,submitter_id,submitter_name,submitter_email,actor_id,actor_name,actor_email,approved_at,live_at,details)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [e.action, e.item_id, e.item_type, e.item_title, e.submitter_id, e.submitter_name, e.submitter_email, e.actor_id, e.actor_name, e.actor_email, e.approved_at ?? null, e.live_at ?? null, JSON.stringify(e.details ?? {})],
      )
    },
    async queryLogs({ from, to, type, submitter, approver, action, limit = 500 } = {}) {
      const where = []
      const p = []
      const add = (cond, v) => {
        p.push(v)
        where.push(cond.replace('?', `$${p.length}`))
      }
      if (from) add('at >= ?', from)
      if (to) add('at <= ?', to)
      if (type) add('item_type = ?', type)
      if (action) add('action = ?', action)
      if (submitter) add("(submitter_email ILIKE '%' || ? || '%' OR submitter_name ILIKE '%' || ? || '%')".replaceAll('?', `$${p.length + 1}`), submitter)
      if (approver) add("(action IN ('approved','rejected') AND (actor_email ILIKE '%' || ? || '%' OR actor_name ILIKE '%' || ? || '%'))".replaceAll('?', `$${p.length + 1}`), approver)
      p.push(Math.min(Number(limit) || 500, 2000))
      return run(`SELECT * FROM portal_logs ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT $${p.length}`, p)
    },

    async rateHit(key, windowSec, limit) {
      const row = await one(
        `INSERT INTO portal_rate (key, window_start, n) VALUES ($1, to_timestamp(floor(extract(epoch from now()) / $2) * $2), 1)
         ON CONFLICT (key, window_start) DO UPDATE SET n = portal_rate.n + 1 RETURNING n`,
        [key, windowSec],
      )
      await run("DELETE FROM portal_rate WHERE window_start < now() - interval '1 day'")
      return { ok: row.n <= limit, n: row.n }
    },
  }
}
