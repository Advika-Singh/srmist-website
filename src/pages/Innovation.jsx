import { useSearchParams } from 'react-router-dom'
import { DEPARTMENTS } from '../data/departments.js'
import { KIND_LABEL, KINDS, STORIES } from '../data/innovation.js'
import { Footer, SiteHeader } from '../shared.jsx'
import StoryCard from '../ui/StoryCard.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../styles/innovation.css'

const slugOf = (href) => href.replace(/\/$/, '').split('/').pop()
const deptName = (slug) => DEPARTMENTS.find((d) => slugOf(d.href) === slug)?.name ?? slug

export default function Innovation() {
  const [params, setParams] = useSearchParams()
  const kind = KINDS.includes(params.get('kind')) ? params.get('kind') : ''
  const dept = params.get('dept') || ''
  const shown = STORIES.filter((s) => (!kind || s.kind === kind) && (!dept || s.departments.includes(dept)))
  const set = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero
          eyebrow="Student innovation"
          title="Things SRM students have built."
          lede="Satellites, apps and ideas from across the university, each linked to the page where it was reported. A small start, and it grows as more stories are sourced."
          img="/srmist/research.jpg"
          pos="50% 40%"
        />
        <section className="svc-wrap in-wrap">
          <div className="in-filter" role="group" aria-label="Filter stories">
            <button type="button" className={!kind ? 'is-on' : ''} aria-pressed={!kind} onClick={() => set('kind', '')}>
              All
            </button>
            {KINDS.filter((k) => STORIES.some((s) => s.kind === k)).map((k) => (
              <button key={k} type="button" className={kind === k ? 'is-on' : ''} aria-pressed={kind === k} onClick={() => set('kind', k)}>
                {KIND_LABEL[k]}
              </button>
            ))}
            {dept && (
              <button type="button" className="in-clear" onClick={() => set('dept', '')}>
                {deptName(dept)} ✕
              </button>
            )}
          </div>
          {shown.length ? (
            <div className="in-grid">
              {shown.map((s, i) => (
                <StoryCard key={s.id} s={s} delay={i * 0.06} />
              ))}
            </div>
          ) : (
            <p className="in-empty">No stories match yet. Clear the filter to see all of them.</p>
          )}
          <p className="svc-fine">
            Every story links to its source. Student names appear only where the source names them. Know a project that belongs here? Tell us through the{' '}
            <a href="/support">feedback form</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
