// Spending limits for the DAAS assistant, so spam or a script cannot run up the Gemini bill or exhaust the quota.
// Three layers, all in memory (see docs/HANDOVER.md: for real traffic move the counters to Redis/Vercel KV):
//   1. per visitor per day     (CHAT_DAILY_PER_IP,  default 60 questions)
//   2. whole site per day      (CHAT_DAILY_GLOBAL,  default 3000 questions)
//   3. whole site tokens a day (CHAT_DAILY_TOKENS,  default 1,500,000 tokens, counted from Gemini's own usage report)
// When a limit is reached the assistant answers with a polite message and the admissions phone number instead of calling Gemini.
// The per-minute burst limit lives in chat.js. Pure functions, tested in tests/budget.test.js.

const DAY = 86_400_000
const IST = 5.5 * 3_600_000
const dayKey = (now) => Math.floor((now + IST) / DAY) // changes at midnight India time

const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d)

export function createBudget(env = {}, clock = Date.now) {
  const limits = {
    perIp: num(env.CHAT_DAILY_PER_IP, 60),
    global: num(env.CHAT_DAILY_GLOBAL, 3000),
    tokens: num(env.CHAT_DAILY_TOKENS, 1_500_000),
  }
  let day = dayKey(clock())
  let total = 0
  let tokens = 0
  let perIp = new Map()

  const roll = () => {
    const d = dayKey(clock())
    if (d !== day) {
      day = d
      total = 0
      tokens = 0
      perIp = new Map()
    }
  }

  return {
    limits,
    /** Ask before calling Gemini. { ok: true } or { ok: false, status, reason: 'visitor' | 'site' } */
    check(ip) {
      roll()
      if (total >= limits.global || tokens >= limits.tokens) return { ok: false, status: 503, reason: 'site' }
      if ((perIp.get(ip) ?? 0) >= limits.perIp) return { ok: false, status: 429, reason: 'visitor' }
      return { ok: true }
    },
    /** Count a question that was answered (or attempted), and the tokens Gemini reported for it. */
    record(ip, usedTokens = 0) {
      roll()
      total += 1
      tokens += Number.isFinite(usedTokens) ? Math.max(0, usedTokens) : 0
      perIp.set(ip, (perIp.get(ip) ?? 0) + 1)
      if (perIp.size > 20_000) perIp = new Map([...perIp].slice(-10_000)) // keep memory bounded
    },
    usage() {
      roll()
      return { questions: total, tokens, visitors: perIp.size }
    },
  }
}

export const LIMIT_MESSAGE = {
  visitor: 'You have asked a lot of questions today, so I need to pause. Please call the admissions team on +91 70 2645 2645, or try again tomorrow.',
  site: 'SRM Guide has reached its limit for today. Please call the admissions team on +91 70 2645 2645 or use the pages in the menu.',
}
