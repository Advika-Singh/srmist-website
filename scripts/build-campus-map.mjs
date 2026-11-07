// Builds src/data/campus-map.json: the SRMIST Kattankulathur campus as plain vector shapes taken from
// OpenStreetMap (© OpenStreetMap contributors, ODbL). Run it again whenever you want fresh data:
//   node scripts/build-campus-map.mjs
// No map tiles are used at runtime, so the site's strict Content-Security-Policy stays unchanged.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BBOX = [12.815, 80.032, 12.836, 80.052] // south, west, north, east
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
const bb = BBOX.join(',')
const QUERY = `[out:json][timeout:60];(
 way["highway"](${bb});
 way["building"](${bb});
 node["entrance"](${bb});
 node["amenity"~"toilets|parking"]["wheelchair"](${bb});
 node["highway"="elevator"](${bb});
 node["highway"="footway"]["wheelchair"](${bb});
);out geom tags;`

async function fetchOverpass() {
  for (const url of MIRRORS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'srmist-home-concept/0.1' },
        body: 'data=' + encodeURIComponent(QUERY),
        signal: AbortSignal.timeout(90_000),
      })
      if (r.ok) return await r.json()
      console.warn(url, r.status)
    } catch (e) {
      console.warn(url, e.message)
    }
  }
  throw new Error('No Overpass mirror answered. Try again in a minute.')
}

const [S, W, N, E] = BBOX
const lat0 = (S + N) / 2
const M_LAT = 111_320
const M_LON = 111_320 * Math.cos((lat0 * Math.PI) / 180)
// metres from the north-west corner; x grows east, y grows south
const px = (lon) => (lon - W) * M_LON
const py = (lat) => (N - lat) * M_LAT
const r1 = (n) => Math.round(n * 10) / 10

const toPath = (geom, close) => 'M' + geom.map((g) => `${r1(px(g.lon))} ${r1(py(g.lat))}`).join('L') + (close ? 'Z' : '')

const ROAD = new Set(['residential', 'tertiary', 'secondary', 'primary', 'unclassified', 'trunk', 'trunk_link', 'living_street', 'road', 'tertiary_link', 'primary_link', 'secondary_link'])
const PATH = new Set(['footway', 'path', 'pedestrian', 'cycleway', 'track', 'corridor'])

const data = await fetchOverpass()
const roads = []
const buildings = []
const pois = []

for (const e of data.elements) {
  const t = e.tags || {}
  if (e.type === 'way' && e.geometry?.length > 1) {
    if (t.building) {
      const xs = e.geometry.map((g) => px(g.lon))
      const ys = e.geometry.map((g) => py(g.lat))
      buildings.push({
        id: e.id,
        n: t.name || null,
        d: toPath(e.geometry, true),
        c: [r1((Math.min(...xs) + Math.max(...xs)) / 2), r1((Math.min(...ys) + Math.max(...ys)) / 2)],
        ...(t.wheelchair ? { w: t.wheelchair } : {}),
      })
    } else if (t.highway === 'steps') {
      roads.push({ id: e.id, k: 'steps', n: t.name || null, w: t.wheelchair || null, ramp: t.ramp || null, d: toPath(e.geometry) })
    } else if (PATH.has(t.highway)) {
      roads.push({ id: e.id, k: 'path', n: t.name || null, w: t.wheelchair || null, d: toPath(e.geometry) })
    } else if (t.highway === 'service') {
      roads.push({ id: e.id, k: 'service', d: toPath(e.geometry) })
    } else if (ROAD.has(t.highway)) {
      roads.push({ id: e.id, k: 'road', n: t.name || null, d: toPath(e.geometry) })
    }
  } else if (e.type === 'node') {
    const kind = t.highway === 'elevator' ? 'lift' : t.amenity === 'toilets' ? 'toilet' : t.amenity === 'parking' ? 'parking' : t.entrance ? 'entrance' : t.highway === 'footway' ? 'crossing' : null
    if (kind) pois.push({ id: e.id, k: kind, x: r1(px(e.lon)), y: r1(py(e.lat)), w: t.wheelchair || null, n: t.name || null })
  }
}

const out = {
  generated: new Date().toISOString().slice(0, 10),
  attribution: '© OpenStreetMap contributors (ODbL)',
  size: [r1(px(E)), r1(py(S))],
  counts: { buildings: buildings.length, named: buildings.filter((b) => b.n).length, paths: roads.filter((r) => r.k === 'path').length, steps: roads.filter((r) => r.k === 'steps').length, pois: pois.length },
  roads,
  buildings,
  pois,
}
const file = fileURLToPath(new URL('../src/data/campus-map.json', import.meta.url))
writeFileSync(file, JSON.stringify(out))
console.log('wrote', file, out.counts, `${(JSON.stringify(out).length / 1024).toFixed(0)} KB`)

// ---- Places around the campus (hotels and food) for the visitors page --------------------------------
// Distances are straight-line from the Main Block area, not driving distance.
const HERE = [12.8231, 80.0444]
const metres = (la, lo) => {
  const dy = (la - HERE[0]) * M_LAT
  const dx = (lo - HERE[1]) * M_LON
  return Math.round(Math.hypot(dx, dy))
}
const NEAR = `[out:json][timeout:60];(
 nwr["tourism"~"^(hotel|guest_house|motel|hostel|apartment)$"](around:4000,${HERE.join(',')});
 nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"](around:2500,${HERE.join(',')});
);out center tags;`
const nearBody = await (async () => {
  for (const url of MIRRORS) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'srmist-home-concept/0.1' }, body: 'data=' + encodeURIComponent(NEAR), signal: AbortSignal.timeout(90_000) })
      if (r.ok) return await r.json()
    } catch {
      /* next mirror */
    }
  }
  return null
})()
if (nearBody) {
  const places = nearBody.elements
    .map((e) => {
      const t = e.tags || {}
      const lat = e.lat ?? e.center?.lat
      const lon = e.lon ?? e.center?.lon
      if (!t.name || lat == null) return null
      const hotel = !!t.tourism
      const onMap = lat > S && lat < N && lon > W && lon < E
      return {
        id: `${e.type[0]}${e.id}`,
        name: t.name,
        group: hotel ? 'stay' : 'eat',
        kind: hotel ? t.tourism : t.amenity,
        dist: metres(lat, lon),
        lat: Math.round(lat * 1e5) / 1e5,
        lon: Math.round(lon * 1e5) / 1e5,
        ...(onMap ? { x: r1(px(lon)), y: r1(py(lat)) } : {}),
        ...(t.cuisine ? { cuisine: t.cuisine.replace(/;/g, ', ').replace(/_/g, ' ') } : {}),
        ...(t.phone || t['contact:phone'] ? { phone: t.phone || t['contact:phone'] } : {}),
        ...(t.website || t['contact:website'] ? { web: t.website || t['contact:website'] } : {}),
        ...(t.opening_hours ? { hours: t.opening_hours } : {}),
        ...(t.wheelchair ? { wheelchair: t.wheelchair } : {}),
        ...(t.stars ? { stars: t.stars } : {}),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist)
  const nearFile = fileURLToPath(new URL('../src/data/nearby.json', import.meta.url))
  writeFileSync(nearFile, JSON.stringify({ generated: out.generated, attribution: out.attribution, places }))
  console.log('wrote', nearFile, { stay: places.filter((p) => p.group === 'stay').length, eat: places.filter((p) => p.group === 'eat').length })
} else console.warn('Could not fetch nearby places; nearby.json left as it was.')
