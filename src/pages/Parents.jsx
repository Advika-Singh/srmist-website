import { PARENTS } from '../data/community.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import LinkCards from '../ui/LinkCards.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

export default function Parents() {
  const p = PARENTS
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Parents" title="Everything a parent looks for, in one place." lede="The parent portal, fees and loans, safety, hostels and ways to stay in touch, with each link going to the official page." img="/srmist/admission-india.jpg" pos="50% 40%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#portal">Parent portal</a>
            {p.groups.map((g) => (
              <a key={g.title} href={`#${g.title.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                {g.title}
              </a>
            ))}
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="portal">
            <h2>{p.portal.title}</h2>
            <p>{p.portal.lede}</p>
            <p className="source-note">{p.portal.note}</p>
            <LinkCards items={p.portal.links.map(([t, h]) => [t, h, null])} />
            <p style={{ marginTop: 18 }}>
              {p.other[1]}{' '}
              <a href={p.other[2]} target="_blank" rel="noreferrer">
                Open the parent login
              </a>
              .
            </p>
          </div>

          {p.groups.map((g) => (
            <div className="vis-block" key={g.title} id={g.title.toLowerCase().replace(/[^a-z]+/g, '-')}>
              <h2>{g.title}</h2>
              <LinkCards items={g.items} />
            </div>
          ))}

          <div className="vis-block">
            <h2>{p.feedback[0]}</h2>
            <p>{p.feedback[2]}</p>
            <a className="button button-gold" href={p.feedback[1]} target="_blank" rel="noreferrer">
              Give feedback <Arrow />
            </a>
            <p className="source-note">
              Everything here comes from the university’s parents page (<a href={p.source} target="_blank" rel="noreferrer">srmist.edu.in/parents</a>), read on 8 November 2026. Links marked as new-tab pages open on the official site. This is an independent concept redesign.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
