import { useState } from 'react'
import { ABROAD, ACADEMIC_LINKS, CALENDARS, CAREER, EXAMS, FEES, LIFE, OWN_TOOLS, TOOLS } from '../data/students.js'
import { ArrowUR, Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const Out = () => (
  <>
    <ArrowUR />
    <span className="sr-only"> (opens in a new tab)</span>
  </>
)

/** A list of official links as tidy rows. */
function LinkList({ links }) {
  return (
    <ul className="st-links">
      {links.map(([label, href]) => (
        <li key={href + label}>
          <a href={href} {...ext}>
            <span>{label}</span>
            <Out />
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function Students() {
  const [fac, setFac] = useState(0)
  const cal = CALENDARS[fac]

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Students" title="Everything you need, in one place." lede="Portals, fees, exams, academic calendars and student life: every link goes to the official SRMIST page, organised so you can find it in a few seconds." img="/srmist/students.jpg" pos="50% 35%">
  <nav className="vis-quick" aria-label="On this page">
              <a href="#portals">Portals &amp; tools</a>
              <a href="#fees">Fees &amp; loans</a>
              <a href="#exams">Exams</a>
              <a href="#calendars">Academic calendars</a>
              <a href="#more">Careers, abroad &amp; campus life</a>
            </nav>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="portals">
            <h2>Portals &amp; tools</h2>
            <p>Sign in with your registration number or NetID on the official portals. If one is not loading, check that it is up first.</p>
            <ul className="st-cards">
              {TOOLS.map((t) => (
                <li key={t.name} className="st-card">
                  <h3>{t.name}</h3>
                  <p>{t.note}</p>
                  <div className="st-card-links">
                    <a className="svc-btn" href={t.href} {...ext}>
                      {t.extra ? 'Android' : 'Open'}
                      <Out />
                    </a>
                    {t.extra?.map(([label, href]) => (
                      <a key={href} className="svc-link" href={href} {...ext}>
                        {label}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <h3 style={{ marginTop: 28 }}>On this site</h3>
            <ul className="st-cards st-cards--own">
              {OWN_TOOLS.map(([name, note, href]) => (
                <li key={href} className="st-card">
                  <h3>{name}</h3>
                  <p>{note}</p>
                  <a className="svc-btn svc-btn--primary" href={href}>
                    Open
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="vis-block" id="fees">
            <h2>Fees &amp; loans</h2>
            <p>Senior students pay tuition and exam fees through the Student Portal. Fee details are updated under its “Fee Payment” menu.</p>
            <LinkList links={FEES} />
          </div>

          <div className="vis-block" id="exams">
            <h2>Exams</h2>
            <p>Recent time tables, instructions, results and certificate services from the Controller of Examinations.</p>
            <div className="st-cols">
              {EXAMS.map((g) => (
                <div key={g.title}>
                  <h3>{g.title}</h3>
                  <LinkList links={g.links} />
                </div>
              ))}
            </div>
          </div>

          <div className="vis-block" id="calendars">
            <h2>Academic calendars</h2>
            <p>Pick your faculty. Newest first; the 2026–27 pages are on the official site.</p>
            <div className="st-tabs" role="tablist" aria-label="Faculty">
              {CALENDARS.map((c, i) => (
                <button key={c.faculty} role="tab" aria-selected={fac === i} className={fac === i ? 'is-on' : ''} onClick={() => setFac(i)}>
                  {c.faculty}
                </button>
              ))}
            </div>
            <div role="tabpanel" aria-label={`${cal.faculty} calendars`}>
              <LinkList links={cal.links} />
            </div>
            <h3 style={{ marginTop: 28 }}>Academic policies &amp; resources</h3>
            <LinkList links={ACADEMIC_LINKS} />
          </div>

          <div className="vis-block" id="more">
            <h2>Careers, study abroad &amp; campus life</h2>
            <div className="st-cols">
              <div>
                <h3>Career centre</h3>
                <LinkList links={CAREER} />
              </div>
              <div>
                <h3>Study abroad</h3>
                <LinkList links={ABROAD} />
              </div>
              <div>
                <h3>Campus life &amp; support</h3>
                <LinkList links={LIFE} />
              </div>
            </div>
            <p className="svc-fine">
              Looking for something that is not here? The{' '}
              <a href="https://www.srmist.edu.in/students/" {...ext}>
                official Students page<span className="sr-only"> (opens in a new tab)</span>
              </a>{' '}
              has the complete list, including older calendars.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
