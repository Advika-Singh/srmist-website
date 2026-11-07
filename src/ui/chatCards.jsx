import { useState } from 'react'
import { PROGRAMMES, applyHref } from '../data/programmes.js'
import { FEE_PROGRAMMES, HOSTELS, estimate, inr } from '../data/fees.js'
import { track } from '../lib/experiments.js'
import EnquiryForm from './EnquiryForm.jsx'

/**
 * What makes SRM Guide more than a text bot: it turns what someone says into things they can DO
 * inside the conversation. Cards are chosen on the device, instantly and without sending anything
 * to a model, so they appear even when the AI service is slow or down. The model's written answer
 * then arrives alongside them.
 *
 *   programme card → facts + one-tap "Apply for this" that pre-selects the field in the form
 *   fee card       → a live calculator (programme × hostel) inside the bubble
 *   apply card     → direct link to the application and the Admissions portal
 *   callback card  → a real form that posts to /api/enquiry, validated, no page change
 */
export function cardsFor(text) {
  const t = text.toLowerCase()
  const cards = []

  const matched = PROGRAMMES.filter((p) => p.words.split(' ').some((w) => w.length > 2 && new RegExp(`\\b${w.replace(/\./g, '\\.')}\\b`).test(t)))
  for (const p of matched.slice(0, 2)) cards.push({ type: 'programme', id: p.id })

  const fee = /\b(fee|fees|cost|costs|tuition|afford|expensive|cheap|price|budget|how much)\b/.test(t)
  if (fee) cards.push({ type: 'fees', programme: matched[0]?.id })

  if (/\b(call ?back|call me|counsel+or|talk to|speak to|phone me|contact me|ring me)\b/.test(t)) cards.push({ type: 'callback', field: matched[0]?.field })
  else if (/\b(apply|application|admission|admissions|join|enrol|enroll|register|how do i get in)\b/.test(t)) {
    cards.push({ type: 'apply', field: matched[0]?.id })
    if (!matched.length) cards.push({ type: 'callback' })
  }
  return cards.slice(0, 3)
}

function ProgrammeCard({ id }) {
  const p = PROGRAMMES.find((x) => x.id === id)
  if (!p) return null
  return (
    <article className="cc cc-programme">
      <span className="cc-kicker">Programme</span>
      <h4>{p.field}</h4>
      <dl>
        <div><dt>Levels</dt><dd>{p.levels}</dd></div>
        <div><dt>Typical length</dt><dd>{p.duration}</dd></div>
        <div><dt>Includes</dt><dd>{p.examples}</dd></div>
      </dl>
      <div className="cc-actions">
        <a className="cc-primary" href={applyHref(p.id)} onClick={() => track('chat_card_apply', { programme: p.id })}>
          Apply for this
        </a>
        <a href="/programmes">All programmes</a>
      </div>
    </article>
  )
}

function FeeCard({ programme }) {
  const [prog, setProg] = useState(FEE_PROGRAMMES.some((p) => p.id === programme) ? programme : 'engineering')
  const [hostel, setHostel] = useState('triple')
  const e = estimate({ programme: prog, hostel })
  return (
    <article className="cc cc-fees">
      <span className="cc-kicker">Fee estimate</span>
      <div className="cc-row">
        <label>
          <span className="sr-only">Programme</span>
          <select value={prog} onChange={(ev) => setProg(ev.target.value)} aria-label="Programme">
            {FEE_PROGRAMMES.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Accommodation</span>
          <select value={hostel} onChange={(ev) => setHostel(ev.target.value)} aria-label="Accommodation">
            {HOSTELS.map((h) => (
              <option key={h.id} value={h.id}>{h.label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="cc-big" role="status" aria-live="polite">
        {inr(e.total)} <small>over {e.programme.years} years</small>
      </p>
      <small className="cc-note">First year {inr(e.first)}. Illustrative; confirm with Admissions.</small>
      <div className="cc-actions">
        <a className="cc-primary" href="/admissions#fees">Full breakdown</a>
      </div>
    </article>
  )
}

function ApplyCard({ field }) {
  return (
    <article className="cc cc-apply">
      <span className="cc-kicker">Ready when you are</span>
      <h4>Apply online in about 10 minutes</h4>
      <p>Your progress is saved at every step.</p>
      <div className="cc-actions">
        <a className="cc-primary" href={field ? applyHref(field) : '/apply'} onClick={() => track('chat_card_apply', { programme: field || 'any' })}>
          Start application
        </a>
        <a href="/admissions">Admissions portal</a>
      </div>
    </article>
  )
}

function CallbackCard({ field }) {
  return (
    <article className="cc cc-callback">
      <span className="cc-kicker">Talk to a counsellor</span>
      <EnquiryForm compact source="chat" defaultField={field || ''} />
    </article>
  )
}

export function ChatCards({ cards }) {
  if (!cards?.length) return null
  return (
    <div className="cc-stack">
      {cards.map((c, i) =>
        c.type === 'programme' ? <ProgrammeCard key={i} id={c.id} /> :
        c.type === 'fees' ? <FeeCard key={i} programme={c.programme} /> :
        c.type === 'apply' ? <ApplyCard key={i} field={c.field} /> :
        c.type === 'callback' ? <CallbackCard key={i} field={c.field} /> : null,
      )}
    </div>
  )
}
