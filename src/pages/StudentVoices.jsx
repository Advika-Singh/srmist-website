import { useMemo, useState } from 'react'
import { TOPICS, VOICES, filterVoices } from '../data/student-voices.js'
import { ArrowUR, Footer, Reveal, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../styles/voices.css'

const ASK = '/support?category=Question%20for%20a%20current%20student'

export default function StudentVoices() {
  const [topic, setTopic] = useState('placements')
  const [department, setDepartment] = useState('')
  const departments = useMemo(() => [...new Set(filterVoices(VOICES, { topic }).map((v) => v.department))].sort(), [topic])
  const shown = filterVoices(VOICES, { topic, department })
  const topicName = TOPICS.find(([id]) => id === topic)?.[1] ?? ''
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero
          eyebrow="Ask a current student"
          title="Honest answers, from people who are here."
          lede="Short answers about placements, hostel life, workload and clubs, tagged by department. An answer is shown only when the student agreed to it or when it comes from a public SRMIST page that we link to."
          img="/srmist/students.jpg"
          pos="50% 35%"
        />
        <section className="svc-wrap sv-wrap">
          <p className="sv-proto">Prototype: this page starts small on purpose. It grows as students agree to answer, and we would rather show nothing than make an answer up.</p>
          <div className="sv-filters">
            <div role="group" aria-label="Topic" className="sv-topics">
              {TOPICS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={topic === id ? 'is-on' : ''}
                  aria-pressed={topic === id}
                  onClick={() => {
                    setTopic(id)
                    setDepartment('')
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {departments.length > 1 && (
              <label className="sv-dept">
                <span>Department</span>
                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">All departments</option>
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {shown.length ? (
            <ul className="sv-list">
              {shown.map((v, i) => (
                <Reveal as="li" key={v.id} delay={i * 0.06} className="sv-card">
                  <span className="sv-q">{v.q}</span>
                  <p>{v.a}</p>
                  <small>
                    {v.who} · {v.department}
                  </small>
                  {v.source && (
                    <a href={v.source} target="_blank" rel="noopener noreferrer">
                      Summarised from SRMIST’s public page
                      <ArrowUR />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="sv-empty">
              <b>No {topicName.toLowerCase()} answers yet.</b>
              <p>No student has agreed to answer this topic yet. Ask the first question and it will be passed to a current student.</p>
            </div>
          )}

          <div className="sv-ask">
            <div>
              <h2>Have a question for a student?</h2>
              <p>Tell us what you want to know. It goes in as a question for a current student, and you get a reference number to follow it.</p>
            </div>
            <a className="button" href={ASK}>
              Ask a question
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
