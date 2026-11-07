import { useEffect, useState } from 'react'
import { Arrow, Footer } from '../shared.jsx'
import { getVariant, track } from '../lib/experiments.js'
import { Tabs } from '../ui/blocks.jsx'
import EnquiryForm from '../ui/EnquiryForm.jsx'
import FeeCalculator from '../ui/FeeCalculator.jsx'
import { askAssistant, openSearch } from '../ui/SmartSearch.jsx'

const PATHWAYS = [
  {
    id: 'india',
    label: 'India',
    title: 'Admissions India',
    text: 'Undergraduate, postgraduate and doctoral programmes across every college.',
    points: ['Choose a field, then a programme', 'Apply online; progress is saved at each step', 'Keep marksheets and ID ready to upload'],
    cta: ['Apply now', '/apply'],
    phone: ['Engineering, Agriculture, Architecture', '+91 70 2645 2645', '+917026452645'],
  },
  {
    id: 'medical',
    label: 'Medical & Dental',
    title: 'Medical & health sciences',
    text: 'Dedicated pathways for medicine, dentistry, pharmacy, nursing and allied health, with NEET-based admission where it applies.',
    points: ['Check the entrance-exam requirement for your programme', 'Apply online, then follow counselling updates', 'Ask the office about scholarships and quotas'],
    cta: ['Apply now', '/apply'],
    phone: ['Medical, Law, Management, Hotel Management', '+91 70 2647 2647', '+917026472647'],
  },
  {
    id: 'international',
    label: 'International',
    title: 'International applicants',
    text: 'A global community with application, visa and arrival support from one team.',
    points: ['Separate application portal for overseas applicants', 'Help with visas and arrival', 'A buddy and orientation in your first weeks'],
    cta: ['International admissions', 'https://www.srmist.edu.in/admission-international/'],
    phone: ['University enquiries', '+91 44 2741 7000', '+914427417000'],
  },
]

const STEPS = [
  ['Pick a programme', 'Search the Programme Finder or ask SRM Guide.'],
  ['Create your application', 'Name, contact details and your choice of campus.'],
  ['Check and submit', 'Review every answer before it goes in.'],
  ['Hear from us', 'The admissions team contacts you with the next step.'],
]

/**
 * The Admissions portal: its own screen, with a stripped-down header so nothing competes with the
 * one goal (apply, or get an answer). Hero copy is an A/B experiment: `?v=B` forces variant B.
 */
export default function Admissions() {
  const [variant] = useState(() => getVariant('admissions-hero'))
  const [pathway, setPathway] = useState('india')

  useEffect(() => {
    track('admissions_view', { variant })
  }, [variant])

  useEffect(() => {
    // honour /admissions#fees and friends once the sections exist
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
  }, [])

  const hero =
    variant === 'B'
      ? { h1: 'What will your degree really cost?', p: 'Work out tuition, hostel and mess in under a minute, then apply when it makes sense.', cta: ['Estimate my fees', '#fees'], second: ['Start application', '/apply'] }
      : { h1: 'Your place at SRM starts here.', p: 'Everything you need to apply for 2027 admissions: pathways, costs, and people to ask.', cta: ['Start your application', '/apply'], second: ['Estimate my fees', '#fees'] }

  const cta = (e, label) => track('admissions_cta', { variant, label })

  return (
    <>
      <header className="portal-bar">
        <a className="snav-brand" href="/" aria-label="SRM Institute of Science and Technology, home">
          <img src="/brand/srm-logo.svg" alt="SRM Institute of Science and Technology" width="160" height="54" decoding="async" />
        </a>
        <span className="portal-title">Admissions 2027</span>
        <nav className="portal-links" aria-label="Admissions sections">
          <a href="#pathways">Pathways</a>
          <a href="#fees">Fees</a>
          <a href="#enquire">Ask us</a>
        </nav>
        <button className="portal-search" onClick={openSearch} aria-label="Search the site">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
        </button>
        <a className="portal-back" href="/">← Back to srmist</a>
      </header>

      <main className="portal" id="main" tabIndex={-1}>
        <section className="portal-hero" data-variant={variant}>
          <span className="eyebrow">Admissions 2027 · Deemed to be University</span>
          <h1>{hero.h1}</h1>
          <p>{hero.p}</p>
          <div className="portal-cta">
            <a className="button" href={hero.cta[1]} onClick={(e) => cta(e, hero.cta[0])}>
              {hero.cta[0]} <Arrow />
            </a>
            <a className="button button-ghost" href={hero.second[1]} onClick={(e) => cta(e, hero.second[0])}>
              {hero.second[0]}
            </a>
            <button className="button button-ghost" onClick={() => askAssistant('How do I apply?')}>
              Ask DAAS
            </button>
          </div>
          <ol className="portal-steps" aria-label="How applying works">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span>{i + 1}</span>
                <b>{t}</b>
                <small>{d}</small>
              </li>
            ))}
          </ol>
        </section>

        <section className="portal-section" id="pathways">
          <h2>Choose your pathway</h2>
          <Tabs
            label="Admission pathways"
            tabs={PATHWAYS.map((p) => ({
              id: p.id,
              label: p.label,
              render: () => (
                <div className="pathway-card">
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                    <a className="button" href={p.cta[1]} {...(/^https?:/.test(p.cta[1]) ? { target: '_blank', rel: 'noreferrer' } : {})} onClick={(e) => cta(e, p.cta[0])}>
                      {p.cta[0]} <Arrow />
                    </a>
                  </div>
                  <ul>
                    {p.points.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                    <li className="pathway-phone">
                      <small>{p.phone[0]}</small>
                      <a href={`tel:${p.phone[2]}`}>{p.phone[1]}</a>
                    </li>
                  </ul>
                </div>
              ),
            }))}
            onChange={setPathway}
          />
          <span className="sr-only" aria-live="polite">Showing {pathway} pathway</span>
        </section>

        <section className="portal-section portal-fees" id="fees">
          <h2>Fee &amp; ROI calculator</h2>
          <p className="portal-lead">Choose a programme and where you will live. The estimate updates as you change either.</p>
          <FeeCalculator />
        </section>

        <section className="portal-section portal-enquire" id="enquire">
          <div>
            <h2>Not sure yet? Ask us.</h2>
            <p className="portal-lead">Leave a number and a counsellor will call. No commitment.</p>
            <p>
              Prefer to talk now? <a className="text-link" href="tel:+917026452645">+91 70 2645 2645</a>
            </p>
          </div>
          <EnquiryForm source="admissions" />
        </section>
      </main>
      <Footer />
    </>
  )
}
