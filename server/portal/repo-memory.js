// An in-memory copy of the portal's database layer, with the same methods as repo-sql.js. Used by the tests and by
// `DEMO_MEMORY=1` local runs. Nothing here persists.

import { cmsMemory } from '../cms/repo-memory.js'

export function memoryRepo(clock = () => new Date()) {
  const users = []
  const sessions = new Map()
  const items = []
  const logs = []
  const rate = new Map()
  let ids = { user: 0, item: 0, log: 0 }
  const iso = () => clock().toISOString()
  const withPeople = (it) => {
    const s = users.find((u) => u.id === it.submitter_id)
    const r = users.find((u) => u.id === it.reviewer_id)
    return { ...it, submitter_name: s?.name, submitter_email: s?.email, reviewer_name: r?.name ?? null, reviewer_email: r?.email ?? null }
  }

  return {
    _raw: { users, items, logs },
    ...cmsMemory({ users, clock }), // the headless CMS shares these users

    async upsertUser({ email, name, role }) {
      let u = users.find((x) => x.email === email)
      if (!u) {
        u = { id: ++ids.user, email, name, role, created_at: iso(), last_login: iso() }
        users.push(u)
      } else Object.assign(u, { name, role, last_login: iso() })
      return { ...u }
    },
    async createSession({ tokenHash, userId, csrf, expiresAt }) {
      sessions.set(tokenHash, { userId, csrf, expiresAt })
    },
    async getSession(tokenHash) {
      const s = sessions.get(tokenHash)
      if (!s || new Date(s.expiresAt) <= clock()) return null
      const user = users.find((u) => u.id === s.userId)
      return user ? { user: { ...user }, csrf: s.csrf } : null
    },
    async deleteSession(tokenHash) {
      sessions.delete(tokenHash)
    },

    async createItem(value, submitterId) {
      const it = { id: ++ids.item, ...value, status: 'pending', submitter_id: submitterId, reviewer_id: null, reject_reason: null, created_at: iso(), reviewed_at: null, live_at: null }
      items.push(it)
      return withPeople(it)
    },
    async getItem(id) {
      const it = items.find((x) => x.id === id)
      return it ? withPeople(it) : null
    },
    async myItems(userId) {
      return items.filter((x) => x.submitter_id === userId).sort((a, b) => b.id - a.id).map(withPeople)
    },
    async queue() {
      return items.filter((x) => x.status === 'pending').sort((a, b) => a.id - b.id).map(withPeople)
    },
    async updateItem(id, fields) {
      const it = items.find((x) => x.id === id)
      Object.assign(it, fields)
      return withPeople(it)
    },
    async setStatus(id, { status, reviewerId = null, reason = null, reviewedAt = null, liveAt = null }) {
      const it = items.find((x) => x.id === id)
      // the same rule the database enforces
      if (reviewerId !== null && reviewerId === it.submitter_id) throw new Error('reviewer_is_submitter')
      Object.assign(it, { status, reviewer_id: reviewerId, reject_reason: reason, reviewed_at: reviewedAt, live_at: liveAt })
      return withPeople(it)
    },
    async publicItems(type, today) {
      return items
        .filter((x) => x.status === 'approved' && x.type === type && (type === 'event' ? x.event_date >= today : !x.expires_at || x.expires_at >= today))
        .sort((a, b) => (type === 'event' ? `${a.event_date}${a.start_time}`.localeCompare(`${b.event_date}${b.start_time}`) : b.id - a.id))
        .map(withPeople)
    },

    async addLog(entry) {
      logs.push({ id: ++ids.log, at: iso(), approved_at: null, live_at: null, details: {}, ...entry })
    },
    async queryLogs({ from, to, type, submitter, approver, action, limit = 500 } = {}) {
      const has = (s, q) => String(s || '').toLowerCase().includes(String(q).toLowerCase())
      return logs
        .filter((l) => (!from || l.at >= from) && (!to || l.at <= to) && (!type || l.item_type === type) && (!action || l.action === action))
        .filter((l) => !submitter || has(l.submitter_email, submitter) || has(l.submitter_name, submitter))
        .filter((l) => !approver || (['approved', 'rejected'].includes(l.action) && (has(l.actor_email, approver) || has(l.actor_name, approver))))
        .sort((a, b) => b.id - a.id)
        .slice(0, limit)
        .map((l) => ({ ...l }))
    },
    /** Logs are append-only: the real database refuses these, and so does this copy. */
    async updateLog() {
      throw new Error('portal_logs is append-only')
    },
    async deleteLog() {
      throw new Error('portal_logs is append-only')
    },

    async rateHit(key, windowSec, limit) {
      const slot = Math.floor(clock().getTime() / 1000 / windowSec)
      const k = `${key}:${slot}`
      const n = (rate.get(k) ?? 0) + 1
      rate.set(k, n)
      return { ok: n <= limit, n }
    },
  }
}
