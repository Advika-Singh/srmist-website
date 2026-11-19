// Browser side of the content portal API. Sends the CSRF token on every change, times out after 20 s, and retries once when the
// database is waking up (Neon's free plan sleeps after 5 minutes idle, so the first request can be slow or return 502/503).

let csrf = ''
export const setCsrf = (t) => {
  csrf = t || ''
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function once(path, method, body) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 20_000)
  try {
    const r = await fetch(`/api/portal${path}`, {
      method,
      credentials: 'same-origin',
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(method !== 'GET' ? { 'x-csrf-token': csrf } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctl.signal,
    })
    const data = await r.json().catch(() => ({}))
    return { r, data }
  } finally {
    clearTimeout(timer)
  }
}

/** { ...json } on success; throws an Error with .status and .fields (per-field messages) otherwise. `onWaking` is told when a retry starts. */
export async function api(path, { method = 'GET', body, onWaking } = {}) {
  let out
  try {
    out = await once(path, method, body)
  } catch {
    out = null
  }
  if (!out || out.r.status === 502 || out.r.status === 503) {
    onWaking?.()
    await wait(2500)
    out = await once(path, method, body).catch(() => null)
  }
  if (!out) throw Object.assign(new Error('The server did not answer. Check your connection and try again.'), { status: 0 })
  if (!out.r.ok) throw Object.assign(new Error(out.data.error || 'Something went wrong.'), { status: out.r.status, fields: out.data.fields })
  return out.data
}

/** Dates and times are stored in UTC and shown in India time. */
export const istDateTime = (iso) => (iso ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '')
export const niceDate = (ymd) => (ymd ? new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', dateStyle: 'medium' }).format(new Date(`${ymd}T00:00:00Z`)) : '')
