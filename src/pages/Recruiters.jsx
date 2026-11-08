import { CONTACT, NUMBERS, OFFICIAL, RECRUITERS as NAMES, STORIES } from '../data/placements.js'
import { RECRUITERS } from '../data/community.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import LinkCards from '../ui/LinkCards.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

export default function Recruiters() {
  const r = RECRUITERS
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Recruiters" title="Hire from SRMIST." lede="How campus recruitment works, who has recruited, and who to write to at the Career Centre." img="/srmist/tech-park.jpg" pos="50% 45%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#how">How it works</a>
            <a href="#numbers">The numbers</a>
            <a href="#who">Who recruits</a>
            <a href="#contact">Contact</a>
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="how">
            <h2>How campus recruitment works</h2>
            <ol className="cm-steps">
              {r.steps.map(([t, d], i) => (
                <li key={t}>
                  <span>{i + 1}</span>
                  <div>
                    <b>{t}</b>
                    <p>{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="vis-block" id="numbers">
            <h2>The numbers</h2>
            <dl className="cm-stats">
              {NUMBERS.map(([k, v]) => (
                <div key={v}>
                  <dt>{v}</dt>
                  <dd>{k}</dd>
                </div>
              ))}
            </dl>
            <LinkCards items={r.links} />
          </div>

          <div className="vis-block" id="who">
            <h2>Who has recruited</h2>
            <p>Organisations named by the Career Centre in its student stories:</p>
            <ul className="cm-chips">
              {NAMES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="source-note">This is a sample of named recruiters, not a full list. The official placement statistics page has the live figures for the latest batch.</p>
            <dl className="priv-list">
              {STORIES.map((s) => (
                <div key={s.name}>
                  <dt>
                    {s.name} · {s.org}
                  </dt>
                  <dd>
                    {s.course}. {s.line}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="vis-block" id="contact">
            <h2>Contact the Career Centre</h2>
            <p>
              {CONTACT.role}: {CONTACT.name}
            </p>
            <p>
              <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a> · {CONTACT.alt}
              <br />
              <a href={`mailto:${OFFICIAL.email}`}>{OFFICIAL.email}</a>
            </p>
            <a className="button button-gold" href={OFFICIAL.centre} target="_blank" rel="noreferrer">
              Career Centre on srmist.edu.in <Arrow />
            </a>
            <p className="source-note">
              Sources: {r.sources.map((s, i) => (
                <span key={s}>
                  {i ? ', ' : ''}
                  <a href={s} target="_blank" rel="noreferrer">{s.replace('https://www.', '')}</a>
                </span>
              ))}
              . Figures are the ones already published in this site’s data, read on 6 November 2026. This is an independent concept redesign.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
