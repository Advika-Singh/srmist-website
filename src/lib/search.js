// Intent-based, typo-tolerant search over a small in-memory index. No network, so it answers as you type.
// Ranking = exact/prefix/fuzzy token matches + a bonus for "doing" intents + a boost for what this
// visitor has opened before (kept in localStorage on their own device, never sent anywhere).

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/b\.?\s?tech/g, 'btech')
    .replace(/m\.?\s?tech/g, 'mtech')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Edit distance with swapped neighbours counted as one edit ("hostle" -> "hostel"); stops early past `max`. */
export function distance(a, b, max = 2) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

// What the visitor most likely meant, expressed as the words our index uses.
const INTENTS = [
  [/\b(apply|admission|admissions|join|enrol|enroll|register)\b/, ['apply', 'admission']],
  [/\b(how much|cost|price|afford|cheap|expensive|fees?|tuition)\b/, ['fee', 'tuition']],
  [/\b(place to stay|stay|live|room|dorm|accommodation)\b/, ['hostel']],
  [/\b(job|jobs|salary|package|hire|hiring)\b/, ['placement']],
  [/\b(money|funding|free|discount|aid)\b/, ['scholarship']],
  [/\b(talk|speak|call|phone)\b/, ['callback']],
]

export function expandIntent(q) {
  const extra = []
  for (const [re, words] of INTENTS) if (re.test(q)) extra.push(...words)
  return extra
}

const tokensOf = (e) => (e._tokens ??= [...new Set(norm(`${e.title} ${e.words}`).split(' ').filter(Boolean))])
const titleTokens = (e) => (e._title ??= norm(e.title).split(' '))

const HITS_KEY = 'srm-search-hits'
export const readHits = () => {
  try {
    return JSON.parse(localStorage.getItem(HITS_KEY)) || {}
  } catch {
    return {}
  }
}
export const recordHit = (href) => {
  try {
    const h = readHits()
    h[href] = (h[href] || 0) + 1
    localStorage.setItem(HITS_KEY, JSON.stringify(h))
  } catch {
    /* private mode or blocked storage: ranking just doesn't learn */
  }
}

/** Score one token against an entry: 3 exact, 2.4 prefix, 1.6 one typo, 1.1 two typos, 0 none. */
function tokenScore(t, e) {
  let best = 0
  for (const w of tokensOf(e)) {
    if (w === t) return 3
    if (w.startsWith(t) && t.length >= 3) best = Math.max(best, 2.4)
    else if (t.length >= 4) {
      const d = distance(t, w, t.length >= 7 ? 2 : 1)
      if (d === 1) best = Math.max(best, 1.6)
      else if (d === 2 && t.length >= 7) best = Math.max(best, 1.1)
    }
  }
  return best
}

/**
 * Returns { results, corrected, suggestions }. `corrected` is a "did you mean" string when a typo was
 * fixed. With an empty query it returns what this visitor opened most, then the main actions.
 */
export function search(index, query, hits = readHits(), limit = 8) {
  const q = norm(query)
  if (!q) {
    const mine = index.filter((e) => hits[e.href]).sort((a, b) => hits[b.href] - hits[a.href])
    const rest = index.filter((e) => e.type === 'action' && !hits[e.href])
    return { results: [...mine, ...rest].slice(0, limit), corrected: null, suggestions: true }
  }
  const raw = q.split(' ')
  const tokens = [...new Set([...raw, ...expandIntent(q)])]
  const fixed = new Map()
  const solid = new Set() // typed words that match something outright, so they are not typos
  const scored = []
  for (const e of index) {
    let sum = 0
    let matched = 0
    for (const t of tokens) {
      const s = tokenScore(t, e)
      if (!s) continue
      matched++
      sum += s
      if (s >= 2.4) solid.add(t)
      else if (raw.includes(t)) {
        const w = tokensOf(e).find((w) => distance(t, w, 2) <= 2)
        if (w) fixed.set(t, w)
      }
    }
    if (!matched) continue
    const typed = raw.filter((t) => tokenScore(t, e) > 0).length
    let score = sum + typed * 0.8
    if (titleTokens(e).some((w) => raw.some((t) => w.startsWith(t)))) score += 1.5
    if (e.type === 'action') score += 0.6
    score += Math.min(hits[e.href] || 0, 5) * 0.35
    scored.push([score, e])
  }
  scored.sort((a, b) => b[0] - a[0])
  for (const t of solid) fixed.delete(t)
  const corrected = fixed.size ? raw.map((t) => fixed.get(t) || t).join(' ') : null
  return { results: scored.slice(0, limit).map((s) => s[1]), corrected, suggestions: false }
}
