import { useEffect, useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

const CATEGORIES = [
  'Portal or website problem',
  'Fees or payments',
  'Examinations & results',
  'Hostel & food',
  'Transport',
  'Academics & faculty',
  'Accessibility barrier',
  'Harassment or safety',
  'Other',
]
const STEPS = ['Received', 'In review', 'Assigned', 'Resolved']

const OFFICIAL = [
  ['ITKM Service Desk (IT problems)', 'https://sd.srmist.edu.in/'],
  ['Student Counselling', 'https://www.srmist.edu.in/life-at-srm/student-counselling-services/'],
  ['Anti-Ragging', 'https://www.srmist.edu.in/life-at-srm/anti-ragging/'],
  ['Equal Opportunity Cell', 'https://www.srmist.edu.in/equal-opportunity-cell/'],
  ['Contact the university', 'https://www.srmist.edu.in/contact-us/'],
]

async function api(path, options) {
  const r = await fetch(path, options)
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { errors: data.errors, status: r.status })
  return data
}

const fmt = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function Tracker({ issue }) {
  const reached = STEPS.indexOf(issue.status === 'Closed' ? 'Resolved' : issue.status)
  return (
    <div className="svc-track">
      <p className="svc-ref-label">Reference</p>
      <p className="svc-ref">{issue.ref}</p>
      <h4>{issue.subject}</h4>
      <p className="svc-fine">
        {issue.category} · logged {fmt(issue.createdAt)}
      </p>
      <ol className="svc-steps" aria-label={`Progress: ${issue.status}`}>
        {STEPS.map((s, i) => (
          <li key={s} className={i < reached ? 'is-done' : i === reached ? 'is-now' : ''} aria-current={i === reached ? 'step' : undefined}>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="svc-now">
        Current status: <b>{issue.status}</b>
      </p>
      <ul className="svc-timeline">
        {[...issue.timeline].reverse().map((t, i) => (
          <li key={i}>
            <time dateTime={t.at}>{fmt(t.at)}</time> <b>{t.status}</b>
            {t.note && <span> — {t.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Support() {
  const id = useId()
  const [params, setParams] = useSearchParams()
  const [mode, setMode] = useState(params.get('ref') ? 'track' : 'report')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [created, setCreated] = useState(null)
  const [category, setCategory] = useState(CATEGORIES.includes(params.get('category')) ? params.get('category') : '')
  const [lookup, setLookup] = useState({ state: 'idle', issue: null, error: '' })
  const [copied, setCopied] = useState(false)
  const refInput = useRef(null)

  const find = async (ref) => {
    setLookup({ state: 'loading', issue: null, error: '' })
    try {
      setLookup({ state: 'done', issue: await api(`/api/complaints?ref=${encodeURIComponent(ref)}`), error: '' })
    } catch (e) {
      setLookup({ state: 'error', issue: null, error: e.message })
    }
  }

  useEffect(() => {
    const ref = params.get('ref')
    if (ref) find(ref)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    setError('')
    setErrors({})
    try {
      const issue = await api('/api/complaints', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-requested-with': 'srm-web' },
        body: JSON.stringify({
          category: f.get('category'),
          subject: f.get('subject'),
          description: f.get('description'),
          place: f.get('place'),
          name: f.get('name'),
          contact: f.get('contact'),
          consent: f.get('consent') === 'on',
          website: f.get('website'),
        }),
      })
      setCreated(issue)
      setState('idle')
    } catch (err) {
      setError(err.message)
      setErrors(err.errors || {})
      setState('idle')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(created.ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the number is on screen to copy by hand */
    }
  }

  const err = (n) => errors[n] && <small className="field-error" id={`${id}-${n}-e`}>{errors[n]}</small>
  const aria = (n) => (errors[n] ? { 'aria-invalid': true, 'aria-describedby': `${id}-${n}-e` } : {})

  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Issues &amp; feedback" title="Tell us what is wrong. Follow it until it is fixed." lede="Every report gets a reference number. Keep it, and you can check where your issue stands any time, without logging in." img="/srmist/admission-india.jpg" pos="50% 35%" />

        <section className="svc-wrap svc-support">
          <div>
            <div className="svc-tabs" role="tablist" aria-label="Report or track">
              {[
                ['report', 'Report an issue'],
                ['track', 'Track an issue'],
              ].map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  id={`${id}-tab-${k}`}
                  aria-selected={mode === k}
                  aria-controls={`${id}-panel`}
                  onClick={() => setMode(k)}
                  className={mode === k ? 'is-on' : ''}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="svc-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${mode}`}>
              {mode === 'report' && created && (
                <div className="svc-done" role="status">
                  <h2>Your issue is logged</h2>
                  <p className="svc-ref-label">Your reference number</p>
                  <p className="svc-ref svc-ref--big">{created.ref}</p>
                  <div className="svc-row">
                    <button className="svc-btn" onClick={copy}>
                      {copied ? 'Copied' : 'Copy number'}
                    </button>
                    <button
                      className="svc-btn svc-btn--ghost"
                      onClick={() => {
                        setMode('track')
                        setParams({ ref: created.ref })
                        find(created.ref)
                      }}
                    >
                      Track it now
                    </button>
                  </div>
                  <p className="svc-fine">Write this down or take a screenshot. We do not email it unless you gave a contact and ticked the box, and we cannot look it up for you without it.</p>
                  <button className="svc-link" onClick={() => setCreated(null)}>
                    Report another issue
                  </button>
                </div>
              )}

              {mode === 'report' && !created && (
                <form className="svc-form" onSubmit={submit} noValidate>
                  <label htmlFor={`${id}-category`}>
                    What is it about?
                    <select id={`${id}-category`} name="category" value={category} onChange={(e) => setCategory(e.target.value)} required {...aria('category')}>
                      <option value="">Choose one</option>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    {err('category')}
                  </label>

                  {category === 'Harassment or safety' && (
                    <div className="svc-alert" role="note">
                      <b>If you or someone else is in danger, do not wait for a form.</b> Contact campus security, a warden or the police first. For ragging or harassment you can also reach the official anti-ragging and counselling teams (links on this page). This tracker is a prototype and is not monitored around the clock.
                    </div>
                  )}

                  <label htmlFor={`${id}-subject`}>
                    Short title
                    <input id={`${id}-subject`} name="subject" maxLength={100} placeholder="For example: LMS login fails for Data Structures" {...aria('subject')} />
                    {err('subject')}
                  </label>
                  <label htmlFor={`${id}-description`}>
                    What happened?
                    <textarea id={`${id}-description`} name="description" rows={5} maxLength={1500} placeholder="What you tried, what you expected, and what you saw instead. Please leave out passwords and ID numbers." {...aria('description')} />
                    {err('description')}
                  </label>
                  <label htmlFor={`${id}-place`}>
                    Where? <span className="svc-opt">(optional: block, hostel, portal page)</span>
                    <input id={`${id}-place`} name="place" maxLength={100} defaultValue={params.get('place') || ''} />
                  </label>

                  <fieldset className="svc-contact">
                    <legend>Want a reply? <span className="svc-opt">(optional)</span></legend>
                    <label htmlFor={`${id}-name`}>
                      Your name
                      <input id={`${id}-name`} name="name" autoComplete="name" maxLength={80} />
                    </label>
                    <label htmlFor={`${id}-contact`}>
                      Email or mobile number
                      <input id={`${id}-contact`} name="contact" autoComplete="email" maxLength={120} {...aria('contact')} />
                      {err('contact')}
                    </label>
                    <label className="svc-check">
                      <input type="checkbox" name="consent" />
                      <span>You may contact me about this issue.</span>
                    </label>
                    {err('consent')}
                  </fieldset>

                  <div className="hp" aria-hidden="true">
                    <label>
                      Leave this empty
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button className="svc-btn svc-btn--primary" type="submit" disabled={state === 'sending'}>
                    {state === 'sending' ? 'Sending…' : 'Submit and get a reference number'}
                  </button>
                  <p className="svc-fine">You can report without giving a name or contact. We never show your details when someone looks up a reference.</p>
                </form>
              )}

              {mode === 'track' && (
                <div>
                  <form
                    className="svc-lookup"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const ref = new FormData(e.currentTarget).get('ref')
                      setParams({ ref })
                      find(ref)
                    }}
                  >
                    <label htmlFor={`${id}-ref`}>
                      Reference number
                      <input id={`${id}-ref`} ref={refInput} name="ref" defaultValue={params.get('ref') || ''} placeholder="SRM-7K4Q-X9MD" autoCapitalize="characters" autoComplete="off" spellCheck="false" maxLength={16} />
                    </label>
                    <button className="svc-btn svc-btn--primary" type="submit" disabled={lookup.state === 'loading'}>
                      {lookup.state === 'loading' ? 'Looking…' : 'Check status'}
                    </button>
                  </form>
                  <div aria-live="polite">
                    {lookup.state === 'error' && (
                      <p className="form-error" role="alert">
                        {lookup.error}
                      </p>
                    )}
                    {lookup.issue && <Tracker issue={lookup.issue} />}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="svc-aside">
            <div className="svc-proto">
              <h3>Please read: this is a prototype</h3>
              <p>This tracker runs on this website only. It is not connected to SRMIST’s own complaint or ticket systems, so staff at the university will not see what you submit here unless the site owner passes it on.</p>
              <p>For anything that needs a fix now, use the official channels:</p>
            </div>
            <ul className="svc-official">
              {OFFICIAL.map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}
