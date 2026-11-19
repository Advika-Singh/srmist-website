// Sessions, cookies, CSRF and proof of the visitor's email for the content portal.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { srmistEmail } from './validate.js'

export const COOKIE = '__Host-srm_portal'
export const SESSION_DAYS = 7
const TOKENINFO = 'https://oauth2.googleapis.com/tokeninfo'

export const hash = (s) => createHash('sha256').update(s).digest('hex')
export const newToken = () => randomBytes(32).toString('base64url')

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

/** Cookie header for the session: httpOnly, Secure, SameSite=Lax, path /, expiring with the session. `__Host-` forbids a Domain attribute. */
export function sessionCookie(token, { secure = true } = {}) {
  const name = secure ? COOKIE : 'srm_portal'
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure ? '; Secure' : ''}`
}
export const clearCookie = ({ secure = true } = {}) => `${secure ? COOKIE : 'srm_portal'}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`

export function readCookie(req) {
  const raw = String(req.headers?.cookie || '')
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf('=')
    if (i < 0) continue
    const k = part.slice(0, i)
    if (k === COOKIE || k === 'srm_portal') return part.slice(i + 1)
  }
  return ''
}

/**
 * CSRF: every request that changes anything must carry the per-session token in the x-csrf-token header (a cross-site page
 * cannot read it) and come from our own origin. Returns true when the request passes.
 */
export function csrfOk(req, session, host) {
  if (!session) return false
  if (!safeEqual(req.headers['x-csrf-token'] || '', session.csrf)) return false
  const origin = req.headers.origin
  if (origin) {
    try {
      if (new URL(origin).host !== host) return false
    } catch {
      return false
    }
  }
  return true
}

/**
 * Prove the visitor owns an srmist.edu.in address using a Google ID token. The server checks the token with Google and then
 * requires: our own client id as audience, a Google issuer, an unexpired token, a verified email, hosted domain srmist.edu.in,
 * and an address that passes the strict domain check. Returns { email, name } or { error }.
 */
export async function verifyGoogleIdToken(idToken, env, fetchImpl = fetch) {
  if (typeof idToken !== 'string' || idToken.length < 20 || idToken.length > 4096) return { error: 'bad_token' }
  if (!env.GOOGLE_CLIENT_ID) return { error: 'not_configured' }
  let info
  try {
    const r = await fetchImpl(`${TOKENINFO}?id_token=${encodeURIComponent(idToken)}`, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return { error: 'bad_token' }
    info = await r.json()
  } catch {
    return { error: 'unavailable' }
  }
  if (info.aud !== env.GOOGLE_CLIENT_ID) return { error: 'bad_token' }
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(info.iss)) return { error: 'bad_token' }
  if (!(Number(info.exp) * 1000 > Date.now())) return { error: 'bad_token' }
  if (String(info.email_verified) !== 'true') return { error: 'unverified' }
  if (info.hd !== 'srmist.edu.in') return { error: 'wrong_domain' }
  const email = srmistEmail(info.email)
  if (!email) return { error: 'wrong_domain' }
  const name = String(info.name || email.split('@')[0]).replace(/[\u0000-\u001F\u007F<>]/g, '').slice(0, 80) || email
  return { email, name }
}
