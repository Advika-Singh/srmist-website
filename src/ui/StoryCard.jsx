import { DEPARTMENTS } from '../data/departments.js'
import { KIND_LABEL } from '../data/innovation.js'
import { ArrowUR, Reveal } from '../shared.jsx'

const slugOf = (href) => href.replace(/\/$/, '').split('/').pop()
const deptName = (slug) => DEPARTMENTS.find((d) => slugOf(d.href) === slug)?.name ?? slug

/** One sourced student story: kind, title, one-line hook, where it comes from and a link to the source. */
// One simple line drawing per kind of story, shown large and faint on the card's blue panel.
const GLYPH = {
  project: <path d="M12 2c3 2.5 4.5 6 4.5 10l-2 3h-5l-2-3c0-4 1.5-7.5 4.5-10Zm-2.5 13-3 4 3-.5L12 22l2.5-3.5 3 .5-3-4M12 9.5a1.6 1.6 0 1 0 0 .1" />,
  lab: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 15h9" />,
  startup: <path d="M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3Zm-2 15h4m-3.2 3h2.4" />,
  alumnus: <path d="m2 9 10-5 10 5-10 5L2 9Zm4 2.6V16c0 1.3 2.7 3 6 3s6-1.7 6-3v-4.4M22 9v6" />,
}

export default function StoryCard({ s, delay = 0 }) {
  return (
    <Reveal as="article" className={`in-card in-card--${s.kind}`} delay={delay}>
      <div className="in-vis" aria-hidden="true">
        <svg viewBox="0 0 24 24">{GLYPH[s.kind] ?? GLYPH.project}</svg>
        <i />
        <i />
      </div>
      <div className="in-body">
      <span className="in-kind">{KIND_LABEL[s.kind]}</span>
      <h3>{s.title}</h3>
      <p>{s.hook}</p>
      {(s.faculty || s.departments.length > 0) && (
        <ul className="in-tags" aria-label="Where it comes from">
          {s.faculty && <li>{s.faculty}</li>}
          {s.departments.map((d) => (
            <li key={d}>{deptName(d)}</li>
          ))}
        </ul>
      )}
      <a className="in-src" href={s.source} target="_blank" rel="noopener noreferrer">
        Source: {s.sourceName}
        <ArrowUR />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      </div>
    </Reveal>
  )
}

