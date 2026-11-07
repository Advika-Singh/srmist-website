// Security response headers shared by the production server and the Vite dev/preview servers.
// The same policy is mirrored in public/_headers for static hosts (Netlify, Cloudflare Pages).

// Everything the site loads is same-origin, except photos from Unsplash.
// No inline scripts exist (the standalone pages use /src/static/directory.js), so script-src is 'self' only.
// 'unsafe-inline' is kept for *styles* only, because React sets small inline style attributes
// (animation delays). That cannot execute code.
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com https://www.srmist.edu.in",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// HSTS only means something over HTTPS, so it is added only when the request arrived over TLS.
export const HSTS = 'max-age=63072000; includeSubDomains; preload'

export function applySecurityHeaders(req, res, { csp = true } = {}) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (k === 'Content-Security-Policy' && !csp) continue
    res.setHeader(k, v)
  }
  if (req.headers['x-forwarded-proto'] === 'https' || req.socket?.encrypted) res.setHeader('Strict-Transport-Security', HSTS)
  res.removeHeader?.('X-Powered-By')
}

/** Browsers send Origin on cross-site POSTs. Reject any that don't come from this site. */
export function sameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}
