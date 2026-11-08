import { ALUMNI } from '../data/community.js'
import { Arrow, Footer, SiteHeader } from '../shared.jsx'
import LinkCards from '../ui/LinkCards.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

export default function AlumniChapters() {
  const a = ALUMNI
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Alumni" title="Stay part of SRM, wherever you are." lede="Chapters in cities across India, an official alumni portal, and a directorate whose job is to keep graduates and the university connected." img="/srmist/students.jpg" pos="50% 40%">
          <nav className="vis-quick" aria-label="On this page">
            <a href="#about">What the directorate does</a>
            <a href="#chapters">Chapter meetups</a>
            <a href="#connect">Connect</a>
          </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="about">
            <h2>What the directorate does</h2>
            <p>{a.intro}</p>
            <dl className="priv-list">
              {a.aims.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="cw-blurb">
              <b>Vision:</b> {a.vision}
            </p>
            <a className="button button-gold" href={a.portal} target="_blank" rel="noreferrer">
              Join the alumni portal <Arrow />
            </a>
          </div>

          <div className="vis-block" id="chapters">
            <h2>Recent chapter meetups</h2>
            <p>Chapter meets listed on the official Alumni Affairs page, newest first. Stories open on srmist.edu.in.</p>
            <ul className="cm-list">
              {a.chapters.map(([t, h]) => (
                <li key={t}>
                  {h ? (
                    <a href={h} target="_blank" rel="noreferrer">
                      {t}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span>{t}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="vis-block" id="connect">
            <h2>Connect</h2>
            <LinkCards items={a.links} />
            <p className="source-note">
              Source: <a href={a.source} target="_blank" rel="noreferrer">srmist.edu.in/alumni-affairs</a>, read on 8 November 2026. The official page shows live chapter and member counters, so we link to it instead of copying numbers. We don’t list notable alumni here because the university doesn’t publish an official list we can cite. This is an independent concept redesign.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
