import { createContext, useEffect, useState } from 'react'
import { Arrow, SiteHeader } from '../shared.jsx'

const STEPS = [
  { path: '/apply', label: 'Start' },
  { path: '/apply/programme', label: 'Programme' },
  { path: '/apply/details', label: 'Your details' },
  { path: '/apply/review', label: 'Review' },
]

const FIELDS = [
  'Engineering & Technology',
  'Medicine & Health',
  'Management',
  'Science & Humanities',
  'Law',
  'Architecture',
  'Agricultural Sciences',
  'Hotel Management',
]
const CAMPUSES = ['Kattankulathur — Chennai', 'Ramapuram — Chennai', 'Vadapalani — Chennai', 'Tiruchirappalli']
const LEVELS = ['Undergraduate', 'Postgraduate', 'Doctoral']

// Answers are kept while you move between steps (and between pages).
const initial = {
  pathway: 'Indian applicant',
  level: '',
  field: '',
  campus: '',
  intake: '2026',
  first: '',
  last: '',
  email: '',
  mobile: '',
  dob: '',
  city: '',
  updates: false,
  confirmed: false,
  submitted: false,
}
const Ctx = createContext(null)
let saved = { ...initial }

function useForm() {
  const [form, setForm] = useState(() => {
    // Links from the chat, search and programme cards arrive as /apply/programme?field=Law
    const field = new URLSearchParams(window.location.search).get('field')
    if (field && FIELDS.includes(field)) saved = { ...saved, field }
    return saved
  })
  const set = (patch) =>
    setForm((f) => {
      saved = { ...f, ...patch }
      return saved
    })
  return [form, set]
}

function Layout({ path, form, children }) {
  const current = STEPS.findIndex((s) => s.path === path)
  return (
    <>
      <SiteHeader />
      <main className="application-page" id="main" tabIndex={-1}>
        <aside className="application-aside">
          <div>
            <span className="eyebrow">SRMIST admissions · 2027</span>
            <h1>Your future starts with one small step.</h1>
            <p>Save your progress at any stage. Most applicants finish in around 10 minutes.</p>
          </div>
          <div className="apply-orbit" aria-hidden="true">
            <span className="orbit-book">BOOK</span>
            <span className="orbit-code">&lt;/&gt;</span>
            <span className="orbit-atom">A+</span>
            <i />
          </div>
          <small>Need help? +91 70 2645 2645</small>
        </aside>
        <section className="application-workspace">
          <div className="application-progress">
            {STEPS.map((s, i) => (
              <a key={s.path} className={i <= current ? 'done' : ''} href={s.path}>
                <span>{i + 1}</span>
                {s.label}
              </a>
            ))}
          </div>
          <div className="application-panel" key={path + form.submitted}>
            {children}
          </div>
        </section>
      </main>
    </>
  )
}

function StepStart({ form, set }) {
  const cards = [
    ['01', 'Indian applicant', 'Indian citizen or resident applying to a programme in India.'],
    ['02', 'International applicant', 'International citizen, NRI or sponsored candidate.'],
  ]
  return (
    <>
      <span className="eyebrow">Step 1 of 4</span>
      <h2>How would you like to apply?</h2>
      <p className="panel-lede">Choose the pathway that best describes you.</p>
      <div className="choice-cards">
        {cards.map(([n, title, text]) => (
          <label key={title}>
            <input
              type="radio"
              name="pathway"
              checked={form.pathway === title}
              onChange={() => set({ pathway: title })}
            />
            <span>{n}</span>
            <b>{title}</b>
            <small>{text}</small>
          </label>
        ))}
      </div>
      <a className="button apply-next" href="/apply/programme">
        Continue <Arrow />
      </a>
    </>
  )
}

function Select({ label, value, onChange, placeholder, options }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

function StepProgramme({ form, set }) {
  return (
    <>
      <span className="eyebrow">Step 2 of 4</span>
      <h2>Choose your direction.</h2>
      <p className="panel-lede">You can change these choices before submitting.</p>
      <div className="application-fields">
        <Select label="Study level" value={form.level} onChange={(level) => set({ level })} placeholder="Select a level" options={LEVELS} />
        <Select label="Field of study" value={form.field} onChange={(field) => set({ field })} placeholder="Select a field" options={FIELDS} />
        <Select label="Preferred campus" value={form.campus} onChange={(campus) => set({ campus })} placeholder="Select a campus" options={CAMPUSES} />
        <Select label="Intake" value={form.intake} onChange={(intake) => set({ intake })} options={['2026', '2027']} />
      </div>
      <div className="apply-buttons">
        <a href="/apply">Back</a>
        <a className="button apply-next" href="/apply/details">
          Continue <Arrow />
        </a>
      </div>
    </>
  )
}

function Input({ label, name, form, set, ...rest }) {
  return (
    <label>
      {label}
      <input value={form[name]} onChange={(e) => set({ [name]: e.target.value })} {...rest} />
    </label>
  )
}

function StepDetails({ form, set }) {
  return (
    <>
      <span className="eyebrow">Step 3 of 4</span>
      <h2>Tell us about you.</h2>
      <p className="panel-lede">Use an email and phone number you can access regularly.</p>
      <div className="application-fields">
        <Input label="First name" name="first" form={form} set={set} placeholder="Your first name" required />
        <Input label="Last name" name="last" form={form} set={set} placeholder="Your last name" required />
        <Input label="Email address" name="email" form={form} set={set} placeholder="you@example.com" type="email" required />
        <Input label="Mobile number" name="mobile" form={form} set={set} placeholder="+91 00000 00000" type="tel" required />
        <Input label="Date of birth" name="dob" form={form} set={set} type="date" />
        <Input label="Current city" name="city" form={form} set={set} placeholder="City, State" />
      </div>
      <label className="consent">
        <input type="checkbox" checked={form.updates} onChange={(e) => set({ updates: e.target.checked })} />
        I agree to receive application updates from SRMIST.
      </label>
      <div className="apply-buttons">
        <a href="/apply/programme">Back</a>
        <a className="button apply-next" href="/apply/review">
          Review application <Arrow />
        </a>
      </div>
    </>
  )
}

function StepReview({ form, set }) {
  if (form.submitted) {
    return (
      <div className="application-success">
        <span className="success-mark">
          <svg viewBox="0 0 24 24">
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
        <span className="eyebrow">Application received</span>
        <h2>You’re on your way.</h2>
        <p>Your reference is SRM26-1847. A confirmation has been prepared for your email.</p>
        <a className="button" href="/">
          Return to homepage <Arrow />
        </a>
      </div>
    )
  }
  const programme =
    [form.level || 'Undergraduate', (form.field || 'Engineering').replace(/ &.*$/, '')].join(' · ')
  const person = [form.first, form.last].filter(Boolean).join(' ')
  const rows = [
    ['Application pathway', form.pathway, '/apply'],
    ['Programme choice', programme, '/apply/programme'],
    ['Personal details', person || 'Contact and identity information', '/apply/details'],
  ]
  return (
    <>
      <span className="eyebrow">Step 4 of 4</span>
      <h2>One last look.</h2>
      <p className="panel-lede">Confirm the sections below, then submit your application.</p>
      <div className="review-list">
        {rows.map(([label, value, href]) => (
          <a key={label} href={href}>
            <span>{label}</span>
            <b>{value}</b>
            <small>Edit</small>
          </a>
        ))}
      </div>
      <label className="consent">
        <input type="checkbox" checked={form.confirmed} onChange={(e) => set({ confirmed: e.target.checked })} />
        I confirm that the information provided is accurate.
      </label>
      <div className="apply-buttons">
        <a href="/apply/details">Back</a>
        <button className="button apply-next" onClick={() => set({ submitted: true })}>
          Submit application <Arrow />
        </button>
      </div>
    </>
  )
}

export default function Apply({ path }) {
  const [form, set] = useForm()
  // A finished application is cleared as soon as someone starts a new one.
  useEffect(() => {
    if (path === '/apply' && form.submitted) set({ ...initial })
  }, [path])
  const Step = { '/apply': StepStart, '/apply/programme': StepProgramme, '/apply/details': StepDetails, '/apply/review': StepReview }[path]
  return (
    <Ctx.Provider value={form}>
      <Layout path={path} form={form}>
        <Step form={form} set={set} />
      </Layout>
    </Ctx.Provider>
  )
}
