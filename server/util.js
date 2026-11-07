// Small helpers shared by the status and complaint endpoints (same defences as server/enquiry.js).

export const send = (res, status, body, extra = {}) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

export const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').trim().slice(0, max)

export function clientIp(req, env) {
  return (env.TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket?.remoteAddress || 'local'
}

/** Sliding-window limiter kept in memory. Returns true when `key` has gone over `max` hits in `windowMs`. */
export function makeLimiter(max, windowMs) {
  const hits = new Map()
  return (key) => {
    const now = Date.now()
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
    recent.push(now)
    hits.set(key, recent)
    if (hits.size > 5000) hits.clear()
    return recent.length > max
  }
}

/** Reads a small JSON body (works with Vercel's pre-parsed body too). Throws {status,message} on trouble. */
export async function readJson(req, maxBytes = 6000) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) throw { status: 415, message: 'Send JSON.' }
  let raw = ''
  if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body)
  else {
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > maxBytes) throw { status: 413, message: 'Request too large.' }
    }
  }
  if (raw.length > maxBytes) throw { status: 413, message: 'Request too large.' }
  try {
    return JSON.parse(raw || '{}')
  } catch {
    throw { status: 400, message: 'Invalid JSON.' }
  }
}
