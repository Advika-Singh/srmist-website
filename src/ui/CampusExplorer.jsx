import { useState } from 'react'
import { LINK } from '../shared.jsx'

// A schematic of a campus, not a survey: positions are illustrative and the map is not to scale.
// Descriptions stay general so nothing here can drift out of date.
const ZONES = [
  { id: 'academic', name: 'Academic blocks', tag: 'Learn', x: 80, y: 70, w: 190, h: 100, text: 'Lecture halls, smart classrooms and department blocks, grouped by college so students rarely cross campus between classes.', href: LINK.academics, cta: 'Explore academics' },
  { id: 'labs', name: 'Labs & research', tag: 'Discover', x: 300, y: 60, w: 150, h: 90, text: 'Central laboratories and research centres where undergraduates can work alongside faculty and doctoral scholars.', href: LINK.research, cta: 'See research' },
  { id: 'library', name: 'Library', tag: 'Study', x: 310, y: 180, w: 130, h: 80, text: 'Reading rooms, journals and quiet study spaces, open through exam season.', href: LINK.library, cta: 'Visit the library' },
  { id: 'hostels', name: 'Hostels & mess', tag: 'Live', x: 60, y: 210, w: 200, h: 90, text: 'Residential blocks and dining halls on campus, so a hostel place also means a short walk to class.', href: LINK.campusLife, cta: 'Campus life' },
  { id: 'health', name: 'Medical & health', tag: 'Care', x: 480, y: 80, w: 130, h: 100, text: 'Teaching hospital and health-sciences facilities, with clinical training close to the classroom.', href: LINK.academics, cta: 'Medicine & health' },
  { id: 'sports', name: 'Sports & clubs', tag: 'Play', x: 470, y: 210, w: 150, h: 90, text: 'Grounds, courts and club spaces for sport, music, drama and technical societies.', href: LINK.campusLife, cta: 'Clubs and sport' },
]

const CAMPUSES = [
  ['Kattankulathur', 'Chennai'],
  ['Ramapuram', 'Chennai'],
  ['Vadapalani', 'Chennai'],
  ['Tiruchirappalli', 'Tamil Nadu'],
  ['Delhi-NCR', 'Delhi region'],
  ['Baburayanpettai', 'Chengalpattu'],
]

/**
 * Interactive campus explorer. Hover, focus or tap a zone to light it up and read about it.
 * Problem it solves: applicants decide on a place they have never seen; this gives a sense of
 * where lectures, hostels, library and sport sit relative to each other, without a trip.
 */
export default function CampusExplorer() {
  const [pick, setPick] = useState(ZONES[0].id)
  const zone = ZONES.find((z) => z.id === pick)

  return (
    <div className="ce">
      <div className="ce-map">
        <svg viewBox="0 0 680 340" role="group" aria-label="Schematic map of the Kattankulathur campus. Choose a zone to read about it.">
          <rect x="0" y="0" width="680" height="340" rx="18" className="ce-ground" />
          <path d="M20 190H660M270 20V320" className="ce-road" />
          <circle cx="270" cy="190" r="14" className="ce-hub" />
          <text x="270" y="194" textAnchor="middle" className="ce-hub-t">Gate</text>
          {ZONES.map((z) => (
            <g
              key={z.id}
              className={`ce-zone ${pick === z.id ? 'on' : ''}`}
              tabIndex={0}
              role="button"
              aria-pressed={pick === z.id}
              aria-label={`${z.name}. ${z.tag}.`}
              onMouseEnter={() => setPick(z.id)}
              onFocus={() => setPick(z.id)}
              onClick={() => setPick(z.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setPick(z.id)
                }
              }}
            >
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="12" />
              <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 2} textAnchor="middle" className="ce-name">{z.name}</text>
              <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 18} textAnchor="middle" className="ce-tag">{z.tag}</text>
            </g>
          ))}
        </svg>
        <p className="ce-scale">Schematic, not to scale</p>
      </div>

      <div className="ce-info" aria-live="polite">
        <span className="ce-kicker">{zone.tag}</span>
        <h3>{zone.name}</h3>
        <p>{zone.text}</p>
        <a className="text-link" href={zone.href}>
          {zone.cta} <span aria-hidden="true">→</span>
        </a>
        <ul className="ce-campuses" aria-label="SRM campuses">
          {CAMPUSES.map(([n, p]) => (
            <li key={n}>
              <b>{n}</b>
              <small>{p}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
