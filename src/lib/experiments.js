// Minimal, privacy-friendly A/B assignment. A visitor keeps the same variant (localStorage), `?v=B`
// forces one for QA, and every exposure and conversion goes through track() so any analytics tool
// can listen: window.__srmAnalytics = (event) => …  (nothing is sent anywhere by default).
const KEY = 'srm-experiments'

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function track(name, props = {}) {
  const event = { name, props, at: Date.now(), path: location.pathname }
  window.__srmAnalytics?.(event)
  window.dispatchEvent(new CustomEvent('srm:track', { detail: event }))
}

/** Sticky assignment: returns 'A' or 'B' (or any key in `variants`) for the named experiment. */
export function getVariant(experiment, variants = ['A', 'B']) {
  const forced = new URLSearchParams(location.search).get('v')
  if (forced && variants.includes(forced)) return forced
  const saved = read()
  if (variants.includes(saved[experiment])) return saved[experiment]
  const v = variants[Math.floor(Math.random() * variants.length)]
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...saved, [experiment]: v }))
  } catch {
    /* storage blocked: the visitor is re-randomised next visit, which is acceptable */
  }
  return v
}
