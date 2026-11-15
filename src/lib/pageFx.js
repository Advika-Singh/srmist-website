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
  // everything else inside a band: blocks as a whole, lists item by item
  '.svc .vis-block > :not(ul, ol, dl, .sr-only, .lib-two, .hs-grid, .st-cards, .st-links, .vis-places, .svc-list)',
  '.svc .vis-block > :is(ul, ol, dl) > *',
  '.svc :is(.cf-wrap, .sf-wrap) > *',
  '.svc .in-wrap > :not(.in-grid)',
  '.svc .sv-wrap > :not(.sv-list)',
  '.svc :is(.map-layers, .map-legend, .map-side, .lib-bar)',
  // pages outside the shared shell
  '.portal-hero > :not(ol)',
  '.portal-steps > li',
  '.portal-section > :not(.sr-only)',
  '.programme-table > *',
  '.page-stats > div',
  '.split-feature > img',
  '.about-d > *',
  '.cl-grid > li',
  '.pl-numbers',
  '.pl-note',
  '.pl-acc > div',
  '.al-head',
  '.al-list > section',
  '.interior section[aria-label="Life at SRMIST"] > div > *',
  '.svc .map',
  '.svc figure',
  '.application-aside > :not(.apply-orbit)',
].join(',')

const SKIP = '.tn, .fcl, .iris, .day, .ch, .sh, .snav, .ai-assistant, .motion-reveal, [data-no-rv]'

/** Starts the reveal watcher once; returns a function that stops it. */
export function startPageFx() {
  const root = document.documentElement
  if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const seen = new WeakSet()
  const marked = new WeakSet()
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // very tall blocks (long tables, grids) never reach the ratio, so a visible strip of 60px also counts
        if (!e.isIntersecting || (e.intersectionRatio < 0.06 && e.intersectionRect.height < 60)) continue
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
    { threshold: [0, 0.03, 0.06], rootMargin: '0px 0px -4% 0px' },
  )

  let queued = false
  const scan = () => {
    queued = false
    if (document.body.classList.contains('motion-paused')) return
    document.querySelectorAll(REVEAL).forEach((el) => {
      if (seen.has(el) || el.closest(SKIP)) return
      seen.add(el)
      // a block inside one that already reveals moves with it, not a second time
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (marked.has(a)) return
      marked.add(el)
      const siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0
      const item = el.tagName === 'LI' || el.parentElement?.tagName === 'DL'
      el.style.setProperty('--rv-d', `${(item ? siblings % 4 : Math.min(siblings, 6)) * 70}ms`)
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
