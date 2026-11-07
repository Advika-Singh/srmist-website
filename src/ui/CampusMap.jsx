import { useMemo, useRef, useState } from 'react'
import map from '../data/campus-map.json'

/**
 * The Kattankulathur campus drawn as plain SVG from OpenStreetMap shapes (see scripts/build-campus-map.mjs).
 * No tiles and no third-party scripts, so the site's strict Content-Security-Policy is untouched.
 *
 * mode="access"  : step-free routes, barriers and accessible entrances are highlighted
 * mode="visitor" : named buildings, food and stay markers
 */
const [W, H] = map.size
const MIN = 1
const MAX = 8

const KIND_LABEL = { lift: 'Lift', toilet: 'Accessible toilet', parking: 'Accessible parking', entrance: 'Entrance', crossing: 'Crossing' }

export function accessSummary() {
  const steps = map.roads.filter((r) => r.k === 'steps')
  const noStep = steps.filter((r) => r.w === 'no' || r.ramp === 'no')
  const blockedPaths = map.roads.filter((r) => r.k === 'path' && r.w === 'no')
  const stepFree = map.roads.filter((r) => r.k === 'path' && (r.w === 'yes' || r.w === 'designated'))
  const entrancesYes = map.pois.filter((p) => p.k === 'entrance' && p.w === 'yes')
  const buildingsTagged = map.buildings.filter((b) => b.w).length
  return { steps: steps.length, noStep: noStep.length, blockedPaths: blockedPaths.length, stepFree: stepFree.length, entrancesYes: entrancesYes.length, buildingsTagged, buildings: map.buildings.length, named: map.buildings.filter((b) => b.n).length }
}

export default function CampusMap({ mode = 'access', layers = {}, markers = [], selected = null, onSelect, label = 'Campus map' }) {
  const [view, setView] = useState({ k: 1, x: 0, y: 0 }) // zoom and pan, in map metres
  const drag = useRef(null)
  const svg = useRef(null)

  const clamp = (v) => {
    const k = Math.min(MAX, Math.max(MIN, v.k))
    const vw = W / k
    const vh = H / k
    return { k, x: Math.min(W - vw, Math.max(0, v.x)), y: Math.min(H - vh, Math.max(0, v.y)) }
  }
  const zoomAt = (factor, cx = 0.5, cy = 0.5) =>
    setView((v) => {
      const k = Math.min(MAX, Math.max(MIN, v.k * factor))
      const px = v.x + (W / v.k) * cx
      const py = v.y + (H / v.k) * cy
      return clamp({ k, x: px - (W / k) * cx, y: py - (H / k) * cy })
    })

  const onPointerDown = (e) => {
    if (e.target.closest('[data-hit]')) return
    drag.current = { x: e.clientX, y: e.clientY, v: view }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    const rect = svg.current.getBoundingClientRect()
    const dx = ((e.clientX - drag.current.x) / rect.width) * (W / drag.current.v.k)
    const dy = ((e.clientY - drag.current.y) / rect.height) * (H / drag.current.v.k)
    setView(clamp({ ...drag.current.v, x: drag.current.v.x - dx, y: drag.current.v.y - dy }))
  }
  const onPointerUp = () => (drag.current = null)
  const onKeyDown = (e) => {
    const step = (W / view.k) * 0.12
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[e.key]) {
      e.preventDefault()
      setView((v) => clamp({ ...v, x: v.x + moves[e.key][0], y: v.y + moves[e.key][1] }))
    } else if (e.key === '+' || e.key === '=') zoomAt(1.4)
    else if (e.key === '-') zoomAt(1 / 1.4)
  }

  const vb = `${view.x} ${view.y} ${W / view.k} ${H / view.k}`
  const sw = (n) => n / view.k // keep strokes the same on-screen width whatever the zoom

  const blocked = useMemo(() => map.roads.filter((r) => r.k === 'steps' || (r.k === 'path' && r.w === 'no')), [])
  const good = useMemo(() => map.roads.filter((r) => r.k === 'path' && (r.w === 'yes' || r.w === 'designated')), [])
  const pois = map.pois.filter((p) => p.k !== 'crossing' || p.w)

  return (
    <div className="map">
      <div className="map-tools" role="group" aria-label="Map controls">
        <button onClick={() => zoomAt(1.5)} aria-label="Zoom in">+</button>
        <button onClick={() => zoomAt(1 / 1.5)} aria-label="Zoom out">−</button>
        <button onClick={() => setView({ k: 1, x: 0, y: 0 })} aria-label="Reset map view">Reset</button>
      </div>
      <svg
        ref={svg}
        className="map-svg"
        viewBox={vb}
        role="application"
        aria-label={`${label}. Drag to move, plus and minus to zoom, arrow keys to pan. A list of places is next to the map.`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onWheel={(e) => {
          if (!e.ctrlKey && !e.metaKey) return // plain scrolling still scrolls the page
          e.preventDefault()
          const r = svg.current.getBoundingClientRect()
          zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
        }}
      >
        <rect x="0" y="0" width={W} height={H} className="map-bg" />
        <g className="map-roads" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {map.roads.filter((r) => r.k === 'service').map((r) => <path key={r.id} d={r.d} className="m-service" strokeWidth={sw(1.4)} />)}
          {map.roads.filter((r) => r.k === 'road').map((r) => <path key={`c${r.id}`} d={r.d} className="m-casing" strokeWidth={sw(4.2)} />)}
          {map.roads.filter((r) => r.k === 'road').map((r) => <path key={r.id} d={r.d} className="m-road" strokeWidth={sw(2.8)} />)}
          {map.roads.filter((r) => r.k === 'path').map((r) => <path key={r.id} d={r.d} className="m-path" strokeWidth={sw(1.6)} strokeDasharray={`${sw(4)} ${sw(3)}`} />)}
        </g>

        <g className="map-buildings">
          {map.buildings.map((b) => {
            const on = selected === `b${b.id}`
            return (
              <path
                key={b.id}
                d={b.d}
                data-hit={b.n ? '' : undefined}
                className={`m-building ${b.n ? 'is-named' : ''} ${on ? 'is-on' : ''} ${mode === 'access' && b.w ? `acc-${b.w}` : ''}`}
                onClick={b.n && onSelect ? () => onSelect({ type: 'building', id: `b${b.id}`, name: b.n, x: b.c[0], y: b.c[1], w: b.w || null }) : undefined}
              >
                {b.n && <title>{b.n}</title>}
              </path>
            )
          })}
        </g>

        {mode === 'access' && layers.routes !== false && (
          <g fill="none" strokeLinecap="round">
            {good.map((r) => <path key={r.id} d={r.d} className="m-good" strokeWidth={sw(4)} />)}
          </g>
        )}
        {mode === 'access' && layers.barriers !== false && (
          <g fill="none" strokeLinecap="butt">
            {blocked.map((r) => (
              <g key={r.id}>
                <path d={r.d} className="m-bad-halo" strokeWidth={sw(8)} />
                <path d={r.d} className="m-bad" strokeWidth={sw(3.2)} strokeDasharray={r.k === 'steps' ? `${sw(2)} ${sw(1.6)}` : undefined} />
              </g>
            ))}
          </g>
        )}

        {view.k >= 2.2 &&
          map.buildings
            .filter((b) => b.n)
            .map((b) => (
              <text key={b.id} x={b.c[0]} y={b.c[1]} className="m-label" fontSize={sw(11)} textAnchor="middle" dominantBaseline="middle">
                {b.n.length > 22 ? b.n.slice(0, 21) + '…' : b.n}
              </text>
            ))}

        {mode === 'access' &&
          pois.map((p) => (
            <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
              <circle r={sw(7)} className={`m-poi ${p.w === 'yes' ? 'is-yes' : p.w === 'no' ? 'is-no' : 'is-unknown'}`} />
              <text className="m-poi-glyph" fontSize={sw(9)} textAnchor="middle" dominantBaseline="central">{p.w === 'yes' ? '✓' : p.w === 'no' ? '✕' : '?'}</text>
              <title>{`${p.n || KIND_LABEL[p.k]}${p.w ? ` (wheelchair: ${p.w})` : ' (not surveyed)'}`}</title>
            </g>
          ))}

        {markers.map((m) => (
          <g
            key={m.id}
            transform={`translate(${m.x} ${m.y})`}
            data-hit=""
            className={`m-marker m-marker--${m.group} ${selected === m.id ? 'is-on' : ''}`}
            onClick={onSelect ? () => onSelect({ type: 'marker', id: m.id, name: m.name, x: m.x, y: m.y }) : undefined}
          >
            <circle r={sw(8)} />
            <text fontSize={sw(9)} textAnchor="middle" dominantBaseline="central">{m.group === 'stay' ? 'H' : 'F'}</text>
            <title>{m.name}</title>
          </g>
        ))}

        {selected && (() => {
          const hit = map.buildings.find((b) => `b${b.id}` === selected)
          return hit ? <circle cx={hit.c[0]} cy={hit.c[1]} r={sw(14)} className="m-ring" strokeWidth={sw(2.5)} /> : null
        })()}
      </svg>
      <p className="map-credit">Map data {map.attribution}, drawn {map.generated}.</p>
    </div>
  )
}

export const NAMED_BUILDINGS = map.buildings.filter((b) => b.n).map((b) => ({ id: `b${b.id}`, name: b.n, x: b.c[0], y: b.c[1], w: b.w || null })).sort((a, b) => a.name.localeCompare(b.name))
