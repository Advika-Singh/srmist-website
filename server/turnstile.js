// Cloudflare Turnstile (a free CAPTCHA) for the assistant. Off until TURNSTILE_SECRET is set, so nothing changes without keys.
// The browser gets a one-time token from the widget (src/lib/captcha.js) and sends it with the question; this checks it with
// Cloudflare. Tokens work once and expire after about five minutes, so a script cannot reuse one.
// Tested in tests/turnstile.test.js with a fake fetch.

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const turnstileEnabled = (env = {}) => Boolean(env.TURNSTILE_SECRET)

/** { ok: true } when the token is good (or Turnstile is off); { ok: false, reason } otherwise. */
export async function verifyTurnstile(token, ip, env = {}, fetchImpl = fetch) {
  if (!turnstileEnabled(env)) return { ok: true, skipped: true }
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return { ok: false, reason: 'missing' }
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token })
    if (ip && ip !== 'local') body.set('remoteip', ip)
    const r = await fetchImpl(VERIFY, { method: 'POST', body, signal: AbortSignal.timeout(4000) })
    const data = await r.json()
    return data?.success === true ? { ok: true } : { ok: false, reason: 'rejected' }
  } catch {
    // Cloudflare unreachable: fail closed, because this check exists to stop abuse (the daily limits still protect the bill)
    return { ok: false, reason: 'unavailable' }
  }
}
