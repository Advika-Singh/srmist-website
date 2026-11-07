import { useMemo, useState } from 'react'
import { FACTS, NOTES, OFFICIAL, OTHER_EXAMS, PHASES, STEPS, THIRD_SUBJECT } from '../data/srmjeee.js'
import { checkEligibility, nextDeadline } from '../lib/srmjeee.js'
import { Arrow, ArrowUR, Footer, Reveal, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../styles/srmjeee.css'

const ext = { target: '_blank', rel: 'noopener noreferrer' }
const Out = () => (
  <>
    <ArrowUR />
    <span className="sr-only"> (opens in a new tab)</span>
  </>
)
const SUBJECTS = ['Physics', 'Mathematics', ...THIRD_SUBJECT]

function Checker() {
  const [status, setStatus] = useState('')
  const [marks, setMarks] = useState('')
  const [subs, setSubs] = useState([])
  const r = useMemo(() => checkEligibility({ status, aggregate: marks === '' ? NaN : Number(marks), subjects: subs }), [status, marks, subs])
  const toggle = (s) => setSubs((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))
  return (
    <div className="sj-check">
      <div className="sj-check-in">
        <fieldset>
          <legend>Class 12</legend>
          <div className="sj-seg">
            {[
              ['passed', 'Passed'],
              ['appearing', 'Appearing this year'],
            ].map(([k, l]) => (
              <button key={k} type="button" className={status === k ? 'is-on' : ''} aria-pressed={status === k} onClick={() => setStatus(k)}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="sj-marks">
          <span>Aggregate % in your three subjects</span>
          <input type="number" inputMode="decimal" min="0" max="100" step="0.1" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 78.5" />
        </label>
        <fieldset>
          <legend>Subjects you studied in Class 12</legend>
          <div className="sj-chips">
            {SUBJECTS.map((s) => (
              <button key={s} type="button" className={subs.includes(s) ? 'is-on' : ''} aria-pressed={subs.includes(s)} onClick={() => toggle(s)}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className={`sj-result sj-result--${r.result}`} aria-live="polite">
        <b>{r.result === 'meets' ? 'You meet the published criteria.' : r.result === 'short' ? 'One or more criteria are not met yet.' : 'Answer the questions to check.'}</b>
        <ul>
          {r.lines.map((l) => (
            <li key={l.text} className={l.ok === true ? 'ok' : l.ok === false ? 'no' : ''}>
              <i aria-hidden="true">{l.ok === true ? '✓' : l.ok === false ? '✕' : '·'}</i>
              {l.text}
            </li>
          ))}
        </ul>
        <small>This only restates the rule SRMIST publishes. SRMIST decides eligibility, so check the official criteria before you apply.</small>
      </div>
    </div>
  )
}

export default function Srmjeee() {
  const next = useMemo(() => nextDeadline(), [])
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="SRMJEEE 2027" title="Your route into B.Tech starts here." lede="Everything about the SRM Joint Engineering Entrance Examination in one place: dates, who can apply, the steps, and a straight line to the official application." img="/srmist/campus-main-building.jpg" pos="50% 55%">
          <div className="sj-hero-cta">
            <a className="button" href={OFFICIAL.apply} {...ext}>
              Register on the official portal <Out />
            </a>
            <a className="button button-ghost" href="#check">
              Check my eligibility
            </a>
          </div>
        </SvcHero>

        <section className="svc-wrap vis-grid">
          <div className="vis-block" id="dates">
            <h2>Dates and deadlines</h2>
            <p>Two phases. You may take either or both, with a separate form for each.</p>
            {next && (
              <div className="sj-count" role="status">
                <b>{next.daysLeft}</b>
                <span>
                  {next.daysLeft === 1 ? 'day' : 'days'} left to apply for <strong>Phase {next.n}</strong> (deadline {next.deadlineLabel})
                </span>
              </div>
            )}
            <div className="sj-phases">
              {PHASES.map((p, i) => (
                <Reveal as="article" key={p.n} delay={i * 0.1} className={`sj-phase ${next?.n === p.n ? 'is-next' : ''}`}>
                  <span>Phase {p.n}</span>
                  <h3>{p.exam}</h3>
                  <p>
                    Apply by <b>{p.deadlineLabel}</b>
                  </p>
                  {next?.n === p.n && <em>Next deadline</em>}
                </Reveal>
              ))}
            </div>
            <p className="svc-fine">
              Dates are tentative and may change, as SRMIST states. Confirm them in the official{' '}
              <a href={OFFICIAL.dates} {...ext}>
                important dates for SRMJEEE UG 2027
                <span className="sr-only"> (PDF, opens in a new tab)</span>
              </a>
              .
            </p>
          </div>

          <div className="vis-block" id="check">
            <h2>Can I apply?</h2>
            <p>SRMIST’s published rule for B.Tech: Class 12 passed, or appearing this year, with at least 60% aggregate in Physics, Mathematics and one more listed subject. Try yours.</p>
            <Checker />
          </div>

          <div className="vis-block" id="steps">
            <h2>How to register</h2>
            <p>Five steps on SRMIST’s own application portal. Nothing is collected on this page.</p>
            <ol className="sj-steps">
              {STEPS.map(([title, text], i) => (
                <Reveal as="li" key={title} delay={i * 0.08}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </ol>
            <div className="svc-row">
              <a className="button" href={OFFICIAL.apply} {...ext}>
                Start on the official portal <Out />
              </a>
              <a className="svc-btn" href={OFFICIAL.engineering} {...ext}>
                Engineering admissions page <Out />
              </a>
            </div>
          </div>

          <div className="vis-block" id="facts">
            <h2>The essentials</h2>
            <dl className="sj-facts">
              {FACTS.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <ul className="sj-notes">
              {NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="svc-fine">
              NRI, PIO and OCI candidates use the{' '}
              <a href={OFFICIAL.international} {...ext}>
                international application form
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>

          <div className="vis-block" id="others">
            <h2>Applying for something other than B.Tech?</h2>
            <p>SRMIST runs separate entrance exams for other programmes. Their dates, manuals and applications are on the official admissions page.</p>
            <ul className="sj-others">
              {OTHER_EXAMS.map(([code, what]) => (
                <li key={code}>
                  <b>{code}</b>
                  <span>{what}</span>
                </li>
              ))}
            </ul>
            <div className="svc-row">
              <a className="svc-btn svc-btn--primary" href={OFFICIAL.admissions} {...ext}>
                Admissions for India <Out />
              </a>
              <a className="svc-btn" href="/admissions">
                Our admissions guide <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
