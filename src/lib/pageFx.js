// Scroll-in reveal for every information page, so they move like the landing page.
// Elements matching REVEAL fade, rise and un-blur once as they enter the viewport; nothing is hidden unless JavaScript
// is running, motion is allowed, and the browser has IntersectionObserver. Pinned or already-animated sections are skipped.

const REVEAL = [
  '.svc .vis-block > :is(h2, p, .svc-row, .vis-quick, .map-layout, .vis-hotel, .svc-fine, .lib-hours, .st-cols, .st-tabs, .hs-toolbar, .hs-filter)',
  '.svc .svc-banner',
  '.svc .svc-group',
  '.svc .svc-help',
  '.svc .svc-support > *',
  '.svc .svc-list > li',
  '.svc .hs-grid > *',
  '.svc .vis-places > li',
  '.svc .lib-two > *',
  '.svc .st-cards > li',
  '.svc .st-links > li',
].join(',')

const SKIP = '.tn, .fcl, .iris, .day, .ch, .sh, .snav, .ai-assistant, .motion-reveal, [data-no-rv]'

/** Starts the reveal watcher once; returns a function that stops it. */
export function startPageFx() {
  const root = document.documentElement
  if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const seen = new WeakSet()
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const el = e.target
        io.unobserve(el)
        el.setAttribute('data-rv', 'in')
        // once it has settled, drop the helper attributes so hover effects and layout work normally
        setTimeout(() => {
          el.removeAttribute('data-rv')
          el.style.removeProperty('--rv-d')
        }, 1400)
      }
    },
    { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
  )

  let queued = false
  const scan = () => {
    queued = false
    if (document.body.classList.contains('motion-paused')) return
    document.querySelectorAll(REVEAL).forEach((el) => {
      if (seen.has(el) || el.closest(SKIP)) return
      seen.add(el)
      const siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0
      el.style.setProperty('--rv-d', `${Math.min(siblings, 6) * 70}ms`)
      el.setAttribute('data-rv', '')
      io.observe(el)
    })
  }
  const schedule = () => {
    if (queued) return
    queued = true
    queueMicrotask(scan)
  }

  root.classList.add('fx')
  const mo = new MutationObserver(schedule)
  mo.observe(document.body, { childList: true, subtree: true })
  schedule()
  return () => {
    mo.disconnect()
    io.disconnect()
    root.classList.remove('fx')
    document.querySelectorAll('[data-rv]').forEach((el) => el.removeAttribute('data-rv'))
  }
}
