// Makes the language switcher change every part of the site, not just the words we translated by hand.
//
// While Tamil or Hindi is chosen, this watches the page, collects the visible English text (and placeholders, labels and
// titles), asks /api/translate for it in batches, and writes the translation into the same text nodes. Nothing in the
// React tree changes: if React rewrites a text node later, the new English is spotted and translated again.
// Choosing English puts every original back. Translations are remembered on this device so the next visit is instant.
//
// Skipped on purpose: text that is already Tamil/Hindi (the hand-made translations), code, SVG, form values, the language
// buttons, and the chat transcript (DAAS answers in the chosen language itself).

const TARGET_SCRIPT = { ta: /[஀-௿]/, hi: /[ऀ-ॿ]/ }
const SKIP = 'script,style,noscript,code,pre,textarea,svg,canvas,[data-notranslate],[contenteditable="true"],.prefs-lang,.ai-thread,.sketch,.cf-count,.map-list,.vis-places b'
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt']
const BATCH_ITEMS = 50
const BATCH_CHARS = 5000
const STORE = 'srm-tr-'

let lang = 'en'
let cache = new Map() // english -> translation, for the current language
let observer = null
let titleWatcher = null
let flushTimer = 0
let scanQueue = new Set()
let scanRaf = 0
let inFlight = 0
const failedAt = new Map() // english -> time of last failure (do not hammer a failing string)
const waiting = new Map() // english -> Set of { node | el+attr }
const tracked = new Set() // text nodes we changed (strong refs, pruned when disconnected)
const trackedAttrs = new Set() // { el, attr }
const nodeState = new WeakMap() // text node -> { orig, shown }
const attrState = new WeakMap() // element -> Map(attr -> { orig, shown })

const needs = (text) => /[A-Za-z]{2,}/.test(text) && !TARGET_SCRIPT[lang].test(text)
const split = (value) => {
  const m = value.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return { lead: m[1], core: m[2], trail: m[3] }
}

/* ---------- cache ---------- */
function loadCache(l) {
  try {
    cache = new Map(Object.entries(JSON.parse(localStorage.getItem(STORE + l) || '{}')))
  } catch {
    cache = new Map()
  }
}
let saveTimer = 0
function saveCache() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      let entries = [...cache]
      if (entries.length > 4000) entries = entries.slice(-4000)
      localStorage.setItem(STORE + lang, JSON.stringify(Object.fromEntries(entries)))
    } catch {
      /* storage full or blocked: translations just are not remembered */
    }
  }, 800)
}

/* ---------- applying ---------- */
function showText(node, core) {
  const st = nodeState.get(node)
  const { lead, trail } = split(st.orig)
  const next = lead + core + trail
  st.shown = next
  if (node.nodeValue !== next) node.nodeValue = next
  tracked.add(node)
}
function showAttr(el, attr, core) {
  const st = attrState.get(el).get(attr)
  const { lead, trail } = split(st.orig)
  const next = lead + core + trail
  st.shown = next
  if (el.getAttribute(attr) !== next) el.setAttribute(attr, next)
  trackedAttrs.add({ el, attr })
}

// Only text near the screen is sent for translation; the rest waits until you scroll toward it.
const lazy = new Map() // element -> [() => void]
let io = null
function whenNear(el, commit) {
  if (typeof IntersectionObserver === 'undefined' || !el || el.closest('head')) return commit() // the document title has no box to scroll to
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          io.unobserve(e.target)
          const jobs = lazy.get(e.target)
          lazy.delete(e.target)
          jobs?.forEach((j) => j())
        }
      },
      { rootMargin: '120% 0px 120% 0px' },
    )
  }
  if (!lazy.has(el)) lazy.set(el, [])
  lazy.get(el).push(commit)
  io.observe(el)
}

function want(english, target) {
  const hit = cache.get(english)
  if (hit !== undefined) return target(hit)
  if (failedAt.has(english) && Date.now() - failedAt.get(english) < 60_000) return
  if (!waiting.has(english)) waiting.set(english, new Set())
  waiting.get(english).add(target)
  scheduleFlush()
}

function handleText(node) {
  const value = node.nodeValue
  if (!value || !value.trim()) return
  const seen = nodeState.get(node)
  if (seen && value === seen.shown) return // already handled: still English and queued, or already translated
  if (!needs(value)) return
  nodeState.set(node, { orig: value, shown: value }) // new, or React wrote new text: treat it as a fresh original
  const english = split(value).core
  whenNear(node.parentElement, () => nodeState.get(node)?.orig === value && want(english, (tr) => nodeState.get(node)?.orig === value && showText(node, tr)))
}

function handleAttrs(el) {
  for (const attr of ATTRS) {
    const value = el.getAttribute?.(attr)
    if (!value || !value.trim()) continue
    let map = attrState.get(el)
    const prev = map?.get(attr)
    if (prev && value === prev.shown) continue
    if (!needs(value)) continue
    if (!map) attrState.set(el, (map = new Map()))
    map.set(attr, { orig: value, shown: value })
    const english = split(value).core
    whenNear(el, () => attrState.get(el)?.get(attr)?.orig === value && want(english, (tr) => attrState.get(el)?.get(attr)?.orig === value && showAttr(el, attr, tr)))
  }
}

function scan(root) {
  if (!root) return
  if (root.nodeType === 3) {
    if (!root.parentElement?.closest(SKIP)) handleText(root)
    return
  }
  if (root.nodeType !== 1 || root.closest?.(SKIP)) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n.nodeType === 1 && n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  handleAttrs(root)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === 3) handleText(n)
    else handleAttrs(n)
  }
}

/* ---------- network ---------- */
function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(flush, 120)
}

async function flush() {
  flushTimer = 0
  if (lang === 'en' || inFlight >= 2) {
    if (waiting.size && lang !== 'en') flushTimer = setTimeout(flush, 300)
    return
  }
  const batch = []
  let chars = 0
  for (const english of waiting.keys()) {
    if (batch.length >= BATCH_ITEMS || chars + english.length > BATCH_CHARS) break
    batch.push(english)
    chars += english.length
  }
  if (!batch.length) return
  const myLang = lang
  const targets = batch.map((e) => [e, waiting.get(e)])
  batch.forEach((e) => waiting.delete(e))
  inFlight++
  document.documentElement.classList.add('tr-busy')
  try {
    const r = await fetch('/api/translate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lang: myLang, texts: batch.map((s) => s.slice(0, 500)) }) })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || !Array.isArray(data.translations) || data.translations.length !== batch.length) throw new Error('translate failed')
    if (myLang === lang) {
      targets.forEach(([english, set], i) => {
        const tr = data.translations[i]
        if (!tr) return
        cache.set(english, tr)
        set.forEach((apply) => apply(tr))
      })
      saveCache()
    }
  } catch {
    targets.forEach(([english]) => failedAt.set(english, Date.now()))
  } finally {
    inFlight--
    if (!inFlight) document.documentElement.classList.remove('tr-busy')
    if (waiting.size && lang !== 'en') scheduleFlush()
  }
}

/* ---------- watching the page ---------- */
function queueScan(node) {
  scanQueue.add(node)
  if (scanRaf) return
  scanRaf = requestAnimationFrame(() => {
    scanRaf = 0
    const nodes = [...scanQueue]
    scanQueue = new Set()
    for (const n of nodes) if (n.isConnected) scan(n)
  })
}

function observe() {
  if (observer) return
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach((n) => queueScan(n))
      else if (r.type === 'characterData') queueScan(r.target)
      else if (r.type === 'attributes') {
        const st = attrState.get(r.target)?.get(r.attributeName)
        if (!st || r.target.getAttribute(r.attributeName) !== st.shown) queueScan(r.target)
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS })
}

function restoreAll() {
  tracked.forEach((node) => {
    const st = nodeState.get(node)
    if (st && node.isConnected && node.nodeValue === st.shown) node.nodeValue = st.orig
    if (st) nodeState.delete(node)
  })
  tracked.clear()
  trackedAttrs.forEach(({ el, attr }) => {
    const st = attrState.get(el)?.get(attr)
    if (st && el.isConnected && el.getAttribute(attr) === st.shown) el.setAttribute(attr, st.orig)
    attrState.get(el)?.delete(attr)
  })
  trackedAttrs.clear()
  waiting.clear()
  lazy.clear()
  io?.disconnect()
  io = null
}

function translateTitle() {
  const t = document.querySelector('title')?.firstChild
  if (t) queueScan(t)
}

/** Call whenever the chosen language changes (and once at start-up). 'en' puts the original English back. */
export function setPageLanguage(next) {
  if (next === lang) return
  restoreAll()
  lang = next
  if (next === 'en' || !TARGET_SCRIPT[next]) {
    lang = 'en'
    observer?.disconnect()
    observer = null
    document.documentElement.classList.remove('tr-busy')
    return
  }
  loadCache(next)
  failedAt.clear()
  observe()
  queueScan(document.body)
  translateTitle()
  if (!titleWatcher) {
    // the document title changes on every page; keep it in step
    titleWatcher = new MutationObserver(() => lang !== 'en' && translateTitle())
    titleWatcher.observe(document.querySelector('title') ?? document.head, { childList: true, characterData: true, subtree: true })
  }
}
