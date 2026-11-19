// Cloudflare Turnstile in the browser. Only used when VITE_TURNSTILE_SITEKEY is set at build time (the site key is public).
// The widget is invisible unless Cloudflare needs the visitor to do something, in which case a small box appears at the bottom left.

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading = null

export const captchaSiteKey = () => import.meta.env?.VITE_TURNSTILE_SITEKEY || ''

function load() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ||= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => resolve(window.turnstile)
    s.onerror = () => {
      loading = null
      reject(new Error('The security check could not load.'))
    }
    document.head.appendChild(s)
  })
  return loading
}

/** A fresh one-time token, or an error if the check fails or takes longer than 30 seconds. */
export async function getCaptchaToken(sitekey = captchaSiteKey()) {
  if (!sitekey) return ''
  const ts = await load()
  return new Promise((resolve, reject) => {
    const box = document.createElement('div')
    box.setAttribute('data-notranslate', '')
    box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000'
    document.body.appendChild(box)
    let id
    const done = (fn, value) => {
      clearTimeout(timer)
      try {
        ts.remove(id)
      } catch {
        /* already gone */
      }
      box.remove()
      fn(value)
    }
    const timer = setTimeout(() => done(reject, new Error('The security check timed out.')), 30_000)
    id = ts.render(box, {
      sitekey,
      appearance: 'interaction-only',
      callback: (token) => done(resolve, token),
      'error-callback': () => done(reject, new Error('The security check failed.')),
    })
  })
}
