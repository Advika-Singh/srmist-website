// Spending limits for the assistant and the translator, so spam or a script cannot run up the Gemini bill or exhaust the quota.
// Three layers, counted per day (India time):
//   1. per visitor       (CHAT_DAILY_PER_IP,  default 60 questions)
//   2. whole site        (CHAT_DAILY_GLOBAL,  default 3000 questions)
//   3. whole site tokens (CHAT_DAILY_TOKENS,  default 1,500,000, counted from Gemini's own usage report)
// The translator uses the same code with its own names and limits (TRANSLATE_DAILY_PER_IP 300, TRANSLATE_DAILY_GLOBAL 15000).
// Counters live in a shared store when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set (every server instance then
// counts together and a restart loses nothing); without them they live in this process's memory, which is fine on one machine
// but not on serverless hosting. If the shared store cannot be reached the check lets the request through (a counter outage
// must not take the assistant down) and the per-minute limit in chat.js still applies.
// Tested in tests/budget.test.js.

const DAY = 86_400_000
const IST = 5.5 * 3_600_000
const dayKey = (now) => new Date(now + IST).toISOString().slice(0, 10)
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d)

/** Counters in this process's memory. Entries expire after a day. */
export function memoryStore(clock = Date.now) {
  const map = new Map()
  const live = (k) => {
    const e = map.get(k)
    if (!e) return 0
    if (e.until <= clock()) {
      map.delete(k)
      return 0
    }
    return e.n
  }
  return {
    async get(keys) {
      return keys.map(live)
    },
    async incr(entries) {
      for (const [k, by] of entries) {
        const n = live(k) + by
        map.set(k, { n, until: clock() + 2 * DAY })
      }
      if (map.size > 50_000) for (const k of [...map.keys()].slice(0, 20_000)) map.delete(k) // keep memory bounded
    },
  }
}

/** Counters in Upstash Redis over its REST API (works from serverless functions, no connection to keep open). */
export function upstashStore(url, token, fetchImpl = fetch) {
  const call = async (commands) => {
    const r = await fetchImpl(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(2500),
    })
    if (!r.ok) throw new Error(`store ${r.status}`)
    return r.json()
  }
  return {
    async get(keys) {
      const out = await call(keys.map((k) => ['GET', k]))
      return out.map((x) => Number(x?.result) || 0)
    },
    async incr(entries) {
      await call(entries.flatMap(([k, by]) => [['INCRBY', k, String(by)], ['EXPIRE', k, String(2 * 86_400)]]))
    },
  }
}

export function storeFromEnv(env = {}) {
  return env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? upstashStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN) : memoryStore()
}

/**
 * name: counter prefix ('chat' or 'translate'). env names are `${NAME}_DAILY_PER_IP|GLOBAL|TOKENS`.
 * defaults: { perIp, global, tokens } used when the settings are missing or not positive numbers.
 */
export function createBudget({ env = {}, name = 'chat', defaults = {}, store = storeFromEnv(env), clock = Date.now } = {}) {
  const NAME = name.toUpperCase()
  const limits = {
    perIp: num(env[`${NAME}_DAILY_PER_IP`], defaults.perIp ?? 60),
    global: num(env[`${NAME}_DAILY_GLOBAL`], defaults.global ?? 3000),
    tokens: num(env[`${NAME}_DAILY_TOKENS`], defaults.tokens ?? 1_500_000),
  }
  const keys = (ip) => {
    const d = dayKey(clock())
    return { ip: `srm:${name}:${d}:ip:${ip}`, total: `srm:${name}:${d}:total`, tokens: `srm:${name}:${d}:tokens` }
  }
  return {
    limits,
    /** Ask before calling Gemini: { ok: true } or { ok: false, status, reason: 'visitor' | 'site' }. */
    async check(ip) {
      const k = keys(ip)
      let ipN
      let total
      let tokens
      try {
        ;[ipN, total, tokens] = await store.get([k.ip, k.total, k.tokens])
      } catch {
        return { ok: true } // the counter store is down: keep serving (see the note at the top)
      }
      if (total >= limits.global || tokens >= limits.tokens) return { ok: false, status: 503, reason: 'site' }
      if (ipN >= limits.perIp) return { ok: false, status: 429, reason: 'visitor' }
      return { ok: true }
    },
    /** Count a question that was answered or attempted, and the tokens Gemini reported for it. */
    async record(ip, usedTokens = 0) {
      const k = keys(ip)
      const t = Number.isFinite(usedTokens) ? Math.max(0, Math.round(usedTokens)) : 0
      try {
        await store.incr([[k.ip, 1], [k.total, 1], ...(t ? [[k.tokens, t]] : [])])
      } catch {
        /* a counter outage must not break the answer that was already produced */
      }
    },
    async usage() {
      const k = keys('-')
      const [, total, tokens] = await store.get([k.ip, k.total, k.tokens])
      return { questions: total, tokens }
    },
  }
}

export const LIMIT_MESSAGE = {
  visitor: 'You have asked a lot of questions today, so I need to pause. Please call the admissions team on +91 70 2645 2645, or try again tomorrow.',
  site: 'SRM Guide has reached its limit for today. Please call the admissions team on +91 70 2645 2645 or use the pages in the menu.',
}
