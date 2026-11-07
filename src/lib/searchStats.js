// Measuring search and the assistant without keeping anything personal.
// redact() runs in the browser before an event is sent and again on the server; summarise() turns logged events into the
// numbers the launch plan watches (searches with no result, searches that end in a click, "was this helpful?" answers).
// Pure functions, tested in tests/search-stats.test.js.

/** Replaces emails and phone-like numbers, trims, and caps the text at 80 characters. */
export function redact(q) {
  return String(q ?? '')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/\+?\d[\d\s()-]{5,}\d/g, '[number]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

/** events: { q, lang, results: number, clicked: boolean, helpful?: boolean }[] */
export function summarise(events) {
  const total = events.length
  if (!total) return { total: 0, noResultRate: 0, clickRate: 0, helpfulRate: null }
  const rated = events.filter((e) => typeof e.helpful === 'boolean')
  return {
    total,
    noResultRate: events.filter((e) => e.results === 0).length / total,
    clickRate: events.filter((e) => e.clicked).length / total,
    helpfulRate: rated.length ? rated.filter((e) => e.helpful).length / rated.length : null,
  }
}

/** Sends one event to /api/search-log. Never throws and never blocks the page. */
export function logSearch(event) {
  try {
    const body = JSON.stringify({ ...event, q: redact(event.q) })
    fetch('/api/search-log', {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json', 'x-requested-with': 'srm-web' },
      body,
    }).catch(() => {})
  } catch {
    /* logging is best effort */
  }
}
