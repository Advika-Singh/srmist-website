import { useState } from 'react'
import pages from '../data/pages.json'
import { kitFor } from '../data/page-kits.js'
import { CONTACT, FAQ, JOURNEY, NUMBERS, OFFICIAL, RECRUITERS, STORIES, WHY } from '../data/placements.js'
import { Arrow, ArrowUR, Footer, Reveal, SiteHeader } from '../shared.jsx'
import '../styles/immersive.css'
import '../styles/placements.css'
import CountUp from '../ui/CountUp.jsx'
import { CountBand } from '../ui/immersive/Bands.jsx'
import CinematicHero from '../ui/immersive/CinematicHero.jsx'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const Out = () => (
  <>
    <ArrowUR />
    <span className="sr-only"> (opens in a new tab)</span>
  </>
)
const initials = (n) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function Placements() {
  const hero = pages.placements.hero
  const kit = kitFor('placements')
  const [open, setOpen] = useState(0)
  const marquee = [...RECRUITERS, ...RECRUITERS, ...RECRUITERS]

  return (
    <>
      <SiteHeader />
      <main className="interior pl" id="main" tabIndex={-1}>
        <CinematicHero hero={hero} accent={kit.accent} crop={kit.crop} />

        <CountBand items={pages.placements.stats} tone="blue" label="Placement figures" />
        <p className="pl-note">
          Headline figures as SRMIST has published them. The live statistics for each batch are on the{' '}
          <a href={OFFICIAL.stats} {...ext}>
            official placement statistics page<span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>

        <section className="pl-sec" aria-labelledby="pl-why">
          <Reveal>
            <span className="eyebrow">Why SRM</span>
            <h2 id="pl-why">One Career Centre. Every faculty. Real recruiters.</h2>
          </Reveal>
          <ul className="pl-why">
            {WHY.map(([t, p], i) => (
              <Reveal as="li" key={t} delay={i * 0.06}>
                <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                <h3>{t}</h3>
                <p>{p}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="pl-numbers" aria-label="The network behind placements">
          {NUMBERS.map(([v, l]) => (
            <div key={l}>
              <b>
                <CountUp value={v} duration={1600} />
              </b>
              <span>{l}</span>
            </div>
          ))}
        </section>

        <section className="pl-sec pl-journey" aria-labelledby="pl-j">
          <Reveal>
            <span className="eyebrow">The placement journey</span>
            <h2 id="pl-j">From first coaching session to a signed offer.</h2>
          </Reveal>
          <ol className="pl-steps">
            {JOURNEY.map(([t, p, items], i) => (
              <Reveal as="li" key={t} delay={i * 0.1}>
                <span className="pl-dot" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{t}</h3>
                <p>{p}</p>
                <ul>
                  {items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="pl-recruiters" aria-labelledby="pl-r">
          <Reveal className="pl-rhead">
            <span className="eyebrow">Recruiters</span>
            <h2 id="pl-r">Where SRM students have landed.</h2>
            <p>Organisations named by students on SRMIST’s own Career Centre page. The full recruiter list is on the official site.</p>
          </Reveal>
          <div className="pl-marquee" aria-hidden="true">
            <div className="pl-track">
              {[...marquee, ...marquee].map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
          </div>
          <ul className="sr-only">
            {RECRUITERS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="pl-sec" aria-labelledby="pl-s">
          <Reveal>
            <span className="eyebrow">Student stories</span>
            <h2 id="pl-s">In their words, in short.</h2>
          </Reveal>
          <ul className="pl-stories">
            {STORIES.map((s, i) => (
              <Reveal as="li" key={s.name} delay={i * 0.07}>
                <span className="pl-av" aria-hidden="true">
                  {initials(s.name)}
                </span>
                <div>
                  <b>{s.name}</b>
                  <small>{s.course}</small>
                </div>
                <em>Placed on campus at {s.org}</em>
                <p>{s.line}</p>
              </Reveal>
            ))}
          </ul>
          <p className="pl-note pl-note--left">
            Summarised from the students’ own accounts on SRMIST’s{' '}
            <a href={OFFICIAL.centre} {...ext}>
              Career Centre page<span className="sr-only"> (opens in a new tab)</span>
            </a>
            , where you can read them in full.
          </p>
        </section>

        <section className="pl-sec pl-faq" aria-labelledby="pl-f">
          <Reveal>
            <span className="eyebrow">Good to know</span>
            <h2 id="pl-f">Questions, answered.</h2>
          </Reveal>
          <div className="pl-acc">
            {FAQ.map(([q, a], i) => (
              <div key={q} className={open === i ? 'is-open' : ''}>
                <h3>
                  <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                    {q}
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <div className="pl-ans" role="region" hidden={open !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pl-contact" aria-labelledby="pl-c">
          <Reveal>
            <span className="eyebrow">Career Centre</span>
            <h2 id="pl-c">Talk to the team.</h2>
            <div className="pl-card">
              <div>
                <b>{CONTACT.name}</b>
                <span>{CONTACT.role}</span>
                <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a>
                <small>{CONTACT.alt}</small>
                <a href={`mailto:${OFFICIAL.email}`}>{OFFICIAL.email}</a>
              </div>
              <ul>
                <li>
                  <a href={OFFICIAL.stats} {...ext}>
                    Placement statistics <Out />
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL.activities} {...ext}>
                    Activities <Out />
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL.industry} {...ext}>
                    Industrial collaborations <Out />
                  </a>
                </li>
                <li>
                  <a href={OFFICIAL.staff} {...ext}>
                    Meet the staff <Out />
                  </a>
                </li>
              </ul>
            </div>
            <div className="pl-cta">
              <a className="button" href={OFFICIAL.careers} {...ext}>
                SRM careers portal <Out />
              </a>
              <a className="button button-ghost" href="/staff-finder">
                Find a faculty member <Arrow />
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  )
}
