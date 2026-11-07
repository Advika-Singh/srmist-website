import { useEffect, useMemo, useRef, useState } from 'react'
import { QUESTIONS } from '../data/finder-questions.js'
import { applyHref } from '../data/programmes.js'
import { recommend, unanswered } from '../lib/courseFinder.js'
import { Arrow, ArrowUR, Footer, LINK, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../styles/finder.css'

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

function Question({ q, value, onChange, onNext }) {
  const picked = [].concat(value ?? [])
  const toggle = (id) => {
    if (q.kind === 'single') {
      onChange(id)
      // a single choice moves on by itself after a beat, so the quiz feels quick
      setTimeout(onNext, 320)
      return
    }
    if (picked.includes(id)) onChange(picked.filter((x) => x !== id))
    else if (picked.length < q.max) onChange([...picked, id])
  }
  const full = q.kind === 'multi' && picked.length >= q.max
  return (
    <fieldset className="cf-q">
      <legend>
        <span>{q.prompt}</span>
        {q.hint && <small>{q.hint}</small>}
      </legend>
      <div className="cf-opts" role={q.kind === 'single' ? 'radiogroup' : 'group'}>
        {q.options.map((o, i) => {
          const on = picked.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              role={q.kind === 'single' ? 'radio' : undefined}
              aria-checked={q.kind === 'single' ? on : undefined}
              aria-pressed={q.kind === 'multi' ? on : undefined}
              disabled={full && !on}
              className={`cf-opt ${on ? 'is-on' : ''}`}
              style={{ '--i': i }}
              onClick={() => toggle(o.id)}
            >
              <span className="cf-tick">{on && <Check />}</span>
              <span>{o.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Result({ r, i }) {
  return (
    <article className={`cf-res ${i === 0 ? 'cf-res--top' : ''}`} style={{ '--i': i, '--s': r.strength }}>
      <span className="cf-badge">{r.label}</span>
      <h3>{r.field}</h3>
      <div className="cf-bar" aria-hidden="true">
        <i />
      </div>
      {r.reasons.length > 0 && (
        <p className="cf-why">
          Because you said: {r.reasons.map((x, k) => (
            <em key={k}>{x}</em>
          ))}
        </p>
      )}
      <dl>
        <div>
          <dt>Programmes</dt>
          <dd>{r.examples}</dd>
        </div>
        <div>
          <dt>Typical length</dt>
          <dd>{r.duration}</dd>
        </div>
        <div>
          <dt>Levels</dt>
          <dd>{r.levels}</dd>
        </div>
      </dl>
      <div className="cf-go">
        <a className="button" href={applyHref(r.id)}>
          Start an application <Arrow />
        </a>
        <a className="cf-link" href={LINK.programmes} target="_blank" rel="noopener noreferrer">
          See programmes on srmist.edu.in <ArrowUR />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  )
}

export default function CourseFinder() {
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const top = useRef(null)
  const q = QUESTIONS[step]

  const results = useMemo(() => (done ? recommend(answers) : []), [done, answers])
  const missing = unanswered(answers)

  const set = (id) => (v) => setAnswers((a) => ({ ...a, [id]: v }))
  const next = () => {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1)
    else if (unanswered(answersRef.current).length === 0) setDone(true)
  }
  // `next` is also called from a timer, so it reads the latest answers through a ref
  const answersRef = useRef(answers)
  answersRef.current = answers

  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [step, done])

  const canNext = q.optional || [].concat(answers[q.id] ?? []).length > 0
  const restart = () => {
    setAnswers({})
    setStep(0)
    setDone(false)
  }

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Course finder" title="Not sure what to study? Start here." lede="Answer five quick questions about what you enjoy and where you want to go. We will suggest the fields of study at SRMIST worth looking at first." img="/srmist/labs.jpg" pos="50% 35%" />

        <section className="svc-wrap cf-wrap" ref={top} aria-live="polite">
          {!done ? (
            <div className="cf">
              <div className="cf-progress" role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS.length} aria-valuenow={step + 1} aria-label="Question progress">
                {QUESTIONS.map((x, i) => (
                  <i key={x.id} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} />
                ))}
              </div>
              <p className="cf-count">
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <div key={q.id} className="cf-step">
                <Question q={q} value={answers[q.id]} onChange={set(q.id)} onNext={next} />
              </div>
              <div className="cf-nav">
                <button type="button" className="svc-btn" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  Back
                </button>
                {(q.kind === 'multi' || step === QUESTIONS.length - 1) && (
                  <button type="button" className="svc-btn svc-btn--primary" onClick={next} disabled={!canNext}>
                    {step === QUESTIONS.length - 1 ? 'Show my recommendations' : q.optional && !(answers[q.id] ?? []).length ? 'Skip' : 'Next'}
                  </button>
                )}
              </div>
              {step === QUESTIONS.length - 1 && missing.length > 0 && <p className="svc-fine">Answer every question before the last step. {missing.length} left.</p>}
            </div>
          ) : (
            <div className="cf-results">
              <h2>Here is where to look first.</h2>
              {results.length === 0 ? (
                <p>We could not match those answers. Try a different mix, or look through every field on the programmes page.</p>
              ) : (
                <div className="cf-res-grid">
                  {results.map((r, i) => (
                    <Result key={r.id} r={r} i={i} />
                  ))}
                </div>
              )}
              <p className="svc-fine">This is a starting point, not an admissions decision. Eligibility, entrance requirements and seat availability for each programme are on its official page, and the admissions office can confirm them.</p>
              <div className="svc-row">
                <button type="button" className="svc-btn" onClick={restart}>
                  Start again
                </button>
                <a className="svc-btn" href="/#programmes">
                  Browse every field
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
