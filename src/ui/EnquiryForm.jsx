import { useId, useState } from 'react'
import { PROGRAMMES } from '../data/programmes.js'
import { track } from '../lib/experiments.js'

/** POSTs to /api/enquiry. The x-requested-with header is the CSRF guard: a cross-site <form> cannot set it. */
export async function submitEnquiry(payload) {
  const r = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-requested-with': 'srm-web' },
    body: JSON.stringify(payload),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { errors: data.errors })
  return data
}

/**
 * One enquiry form used on the Admissions page and inside the chat. `compact` drops the level field
 * and tightens spacing for the chat bubble.
 */
export default function EnquiryForm({ source = 'web', defaultField = '', compact = false, onDone }) {
  const id = useId()
  const [state, setState] = useState('idle') // idle | sending | done
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    setError('')
    setErrors({})
    try {
      await submitEnquiry({
        name: f.get('name'),
        phone: f.get('phone'),
        email: f.get('email'),
        field: f.get('field'),
        level: f.get('level') || '',
        consent: f.get('consent') === 'on',
        website: f.get('website'), // honeypot, left empty by people
        source,
      })
      track('enquiry_submitted', { source })
      setState('done')
      onDone?.()
    } catch (err) {
      setError(err.message)
      setErrors(err.errors || {})
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div className="form-success" role="status">
        <b>Thank you. Your request is in.</b>
        <p>A counsellor will get in touch. For anything urgent, call +91 70 2645 2645.</p>
      </div>
    )
  }

  const field = (name, label, input, hint) => (
    <label htmlFor={`${id}-${name}`} className={errors[name] ? 'has-error' : undefined}>
      {label}
      {input}
      {errors[name] && <small className="field-error" id={`${id}-${name}-e`}>{errors[name]}</small>}
      {hint && !errors[name] && <small>{hint}</small>}
    </label>
  )

  return (
    <form className={`enq ${compact ? 'enq-compact' : ''}`} onSubmit={submit} noValidate>
      {field('name', 'Full name', <input id={`${id}-name`} name="name" required autoComplete="name" maxLength={80} aria-describedby={errors.name ? `${id}-name-e` : undefined} />)}
      {field('phone', 'Mobile number', <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="+91 …" aria-describedby={errors.phone ? `${id}-phone-e` : undefined} />)}
      {!compact && field('email', 'Email (optional if you gave a number)', <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={120} aria-describedby={errors.email ? `${id}-email-e` : undefined} />)}
      {field(
        'field',
        'Field of interest',
        <select id={`${id}-field`} name="field" defaultValue={defaultField}>
          <option value="">Not sure yet</option>
          {PROGRAMMES.map((p) => (
            <option key={p.id}>{p.field}</option>
          ))}
        </select>,
      )}
      {!compact &&
        field(
          'level',
          'Study level',
          <select id={`${id}-level`} name="level" defaultValue="">
            <option value="">Choose one</option>
            <option>Undergraduate</option>
            <option>Postgraduate</option>
            <option>Doctoral</option>
          </select>,
        )}
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className={`enq-consent ${errors.consent ? 'has-error' : ''}`}>
        <input type="checkbox" name="consent" />
        <span>I agree to be contacted about admissions by phone, SMS or email.</span>
      </label>
      {errors.consent && <small className="field-error">{errors.consent}</small>}
      {errors.contact && <small className="field-error">{errors.contact}</small>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Request a call back'}
      </button>
    </form>
  )
}
