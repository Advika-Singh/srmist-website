// Builds src/data/campus-day.json for "A day at SRM": the stops, the sports grounds, and real walking routes between
// the stops along the campus paths already in src/data/campus-map.json (OpenStreetMap, © OpenStreetMap contributors, ODbL).
//   node scripts/build-day-data.mjs
// Needs src/data/campus-map.json (run scripts/build-campus-map.mjs first) and internet for the sports grounds.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const map = JSON.parse(readFileSync(here('../src/data/campus-map.json'), 'utf8'))

// same projection as build-campus-map.mjs: metres from the north-west corner of the bbox
const [S, W, N, E] = [12.815, 80.032, 12.836, 80.052]
const lat0 = (S + N) / 2
const M_LAT = 111_320
const M_LON = 111_320 * Math.cos((lat0 * Math.PI) / 180)
const px = (lon) => (lon - W) * M_LON
const py = (lat) => (N - lat) * M_LAT
const r1 = (n) => Math.round(n * 10) / 10
const toPath = (geom) => 'M' + geom.map((g) => `${r1(px(g.lon))} ${r1(py(g.lat))}`).join('L') + 'Z'

// ---- sports grounds (pitches, playgrounds, pools) with geometry ----
const MIRRORS = ['https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass-api.de/api/interpreter']
const QUERY = `[out:json][timeout:60];(way["leisure"~"pitch|playground|swimming_pool|track"](12.815,80.032,12.836,80.052););out geom tags;`
let grounds = []
for (const url of MIRRORS) {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'srmist-home-concept/0.1' }, body: 'data=' + encodeURIComponent(QUERY), signal: AbortSignal.timeout(90_000) })
    if (!r.ok) continue
    const j = await r.json()
    grounds = j.elements.filter((e) => e.geometry?.length > 2).map((e) => ({ id: e.id, k: e.tags.leisure, n: e.tags.name || null, d: toPath(e.geometry), c: centroid(e.geometry) }))
    break
  } catch {
    /* next mirror */
  }
}
function centroid(g) {
  const x = g.reduce((s, p) => s + px(p.lon), 0) / g.length
  const y = g.reduce((s, p) => s + py(p.lat), 0) / g.length
  return [r1(x), r1(y)]
}
if (!grounds.length) throw new Error('Could not fetch the sports grounds from Overpass; try again in a minute.')

// ---- stops ----
const building = (name) => {
  const b = map.buildings.find((x) => x.n === name)
  if (!b) throw new Error('building not on the map: ' + name)
  return b.c
}
// the playing-field cluster just north of the University Building (pitches and playgrounds within 150 m of it)
const lib = [r1(px(80.04259)), r1(py(12.82328))] // OSM node "SRM Library"
const fieldCluster = grounds.filter((g) => g.k !== 'swimming_pool' && Math.hypot(g.c[0] - lib[0], g.c[1] - lib[1]) < 150)
const fields = fieldCluster.length ? fieldCluster : grounds.filter((g) => g.k !== 'swimming_pool')
const sports = [r1(fields.reduce((s, g) => s + g.c[0], 0) / fields.length), r1(fields.reduce((s, g) => s + g.c[1], 0) / fields.length)]

const STOPS = [
  { id: 'hostel', name: 'Paari Hostel', at: building('Paari Hostel') },
  { id: 'lab', name: 'SRM Tech Park', at: building('SRM Tech Park') },
  { id: 'lunch', name: 'Java Green food court', at: building('Java Food Court') },
  { id: 'library', name: 'SRM Library', at: lib },
  { id: 'sports', name: 'Sports ground', at: sports },
  { id: 'night', name: 'Paari Hostel', at: building('Paari Hostel') },
]

// ---- walking graph from the roads and paths ----
const nums = (d) => d.match(/-?\d+(\.\d+)?/g).map(Number)
const key = (x, y) => `${x},${y}`
const nodes = new Map() // key -> { x, y, edges: [[key, weight]] }
const node = (x, y) => {
  const k = key(x, y)
  if (!nodes.has(k)) nodes.set(k, { x, y, edges: [] })
  return nodes.get(k)
}
for (const road of map.roads) {
  const v = nums(road.d)
  const weight = road.k === 'steps' ? 3 : road.k === 'road' ? 1.15 : 1 // prefer paths and service lanes over main roads
  for (let i = 0; i + 3 < v.length; i += 2) {
    const a = node(v[i], v[i + 1])
    const b = node(v[i + 2], v[i + 3])
    const w = Math.hypot(a.x - b.x, a.y - b.y)
    a.edges.push([key(b.x, b.y), w * weight])
    b.edges.push([key(a.x, a.y), w * weight])
  }
}
const nearest = (p) => {
  let best = null
  let bd = Infinity
  for (const [k, n] of nodes) {
    const d = Math.hypot(n.x - p[0], n.y - p[1])
    if (d < bd) {
      bd = d
      best = k
    }
  }
  return { k: best, d: bd }
}
function route(from, to) {
  const a = nearest(from)
  const b = nearest(to)
  const dist = new Map([[a.k, 0]])
  const prev = new Map()
  const todo = new Set([a.k])
  while (todo.size) {
    let u = null
    let ud = Infinity
    for (const k of todo) if (dist.get(k) < ud) ((u = k), (ud = dist.get(k)))
    todo.delete(u)
    if (u === b.k) break
    for (const [v, w] of nodes.get(u).edges) {
      const nd = ud + w
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd)
        prev.set(v, u)
        todo.add(v)
      }
    }
  }
  if (!dist.has(b.k)) return { pts: [from, to], connected: false }
  const path = []
  for (let k = b.k; k; k = prev.get(k)) path.push(k)
  path.reverse()
  const pts = [from, ...path.map((k) => [nodes.get(k).x, nodes.get(k).y]), to]
  return { pts, connected: true }
}

const length = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)
const legs = []
for (let i = 0; i + 1 < STOPS.length; i++) {
  const { pts, connected } = route(STOPS[i].at, STOPS[i + 1].at)
  const clean = pts.filter((p, j) => j === 0 || p[0] !== pts[j - 1][0] || p[1] !== pts[j - 1][1])
  legs.push({ from: STOPS[i].id, to: STOPS[i + 1].id, connected, metres: Math.round(length(clean)), pts: clean.map((p) => [r1(p[0]), r1(p[1])]) })
}

const out = {
  generated: new Date().toISOString().slice(0, 10),
  attribution: map.attribution,
  size: map.size,
  stops: STOPS,
  grounds: grounds.map(({ id, k, n, d }) => ({ id, k, n, d })),
  legs,
}
writeFileSync(here('../src/data/campus-day.json'), JSON.stringify(out))
console.log(
  'stops',
  STOPS.map((s) => `${s.id}@${s.at}`).join(' '),
  '\nlegs',
  legs.map((l) => `${l.from}→${l.to} ${l.metres} m ${l.connected ? '' : '(STRAIGHT: not connected)'} ${l.pts.length} pts`).join('\n     '),
  '\ngrounds',
  grounds.length,
)
