// Pure logic for "A day at SRM": where in the day a scroll position is, where the student stands on a route,
// what time it is, and what colour the campus is at that hour. No React, no browser APIs, so Node can test it.

/** Clock time (hours, 24h) at each stop: hostel, lab, lunch, library, sports, night. An illustrative day, not a timetable. */
export const HOURS = [6.75, 9, 12.5, 14.5, 17, 20.25]

const DWELL = 1 // each stop holds for one unit of scroll
const TRAVEL = 1.2 // each walk takes a little longer, so the walking is the main motion

const ease = (t) => t * t * (3 - 2 * t)

/**
 * Where scroll progress `p` (0..1) is in a day of `n` stops:
 *   { phase: 'dwell', stop, dwellT }              standing at stop `stop`
 *   { phase: 'travel', stop, leg, t }             walking leg `leg` (from stop `leg` to `leg + 1`), t = 0..1; `stop` is the one just left
 */
export function timeline(p, n) {
  const total = n * DWELL + (n - 1) * TRAVEL
  let x = Math.min(1, Math.max(0, p)) * total
  for (let i = 0; i < n; i++) {
    if (x <= DWELL || i === n - 1) return { phase: 'dwell', stop: i, dwellT: Math.min(1, x / DWELL) }
    x -= DWELL
    if (x <= TRAVEL) return { phase: 'travel', stop: i, leg: i, t: x / TRAVEL }
    x -= TRAVEL
  }
  return { phase: 'dwell', stop: n - 1, dwellT: 1 }
}

/** The scroll progress at which the student stands still at stop `i` (the middle of its dwell). */
export function progressAtStop(i, n) {
  const total = n * DWELL + (n - 1) * TRAVEL
  return Math.min(1, (i * (DWELL + TRAVEL) + (i === n - 1 ? DWELL : DWELL * 0.5)) / total)
}

export function polylineLength(pts) {
  let s = 0
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return s
}

/** The point a fraction `t` (0..1) of the way along a polyline, by distance. */
export function pointAt(pts, t) {
  const target = polylineLength(pts) * Math.min(1, Math.max(0, t))
  let run = 0
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (run + seg >= target && seg > 0) {
      const f = (target - run) / seg
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]
    }
    run += seg
  }
  return pts[pts.length - 1]
}

/** Clock hour for a timeline position: the stop's time while standing, easing toward the next stop's time while walking. */
export function hourAt(tl) {
  if (tl.phase === 'dwell') return HOURS[tl.stop]
  return HOURS[tl.leg] + (HOURS[tl.leg + 1] - HOURS[tl.leg]) * ease(tl.t)
}

// ---- colour of the campus by hour ----
const KEYS = [
  // hour, sky, ground, building, road, glow, light (0 dark .. 1 bright)
  [5.5, '#2b2d4f', '#2a3040', '#3c4062', '#555a78', '#ffb27a', 0.25],
  [7.5, '#f4b99a', '#c8d3b0', '#e9d6c3', '#fff3e6', '#ff9a52', 0.7],
  [12, '#bfe0f5', '#cfe3b8', '#f1ece2', '#ffffff', '#ffd75e', 1],
  [16.5, '#cfe4f2', '#cde0b4', '#efe6d8', '#fffaf0', '#ffcf6a', 0.9],
  [18.5, '#f0a36a', '#c4b98f', '#e6c9a8', '#ffe2b8', '#ff8a3d', 0.6],
  [20.25, '#3a3a66', '#2c3447', '#4a4d72', '#6a6f92', '#ffc76b', 0.3],
  [22, '#10132b', '#161c2b', '#252a4a', '#333a5c', '#ffd27a', 0.12],
]
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
export const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')

export function skyFor(hour) {
  const h = Math.min(KEYS.at(-1)[0], Math.max(KEYS[0][0], hour))
  let i = 0
  while (i < KEYS.length - 2 && h > KEYS[i + 1][0]) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = (h - a[0]) / (b[0] - a[0])
  const k = ['sky', 'ground', 'building', 'road', 'glow']
  const out = { light: a[6] + (b[6] - a[6]) * t }
  k.forEach((name, j) => (out[name] = mix(a[j + 1], b[j + 1], t)))
  return out
}

/** "07:30" style clock text. */
export function clock(hour) {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const hh = m === 60 ? h + 1 : h
  return `${String(hh).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`
}

/** A colour multiplied toward black (f below 1 is darker). */
export const shade = (color, f) => '#' + hex(color).map((v) => Math.min(255, Math.max(0, Math.round(v * f))).toString(16).padStart(2, '0')).join('')
