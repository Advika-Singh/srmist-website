import { useState } from 'react'

const EMPTY = { type: 'announcement', title: '', body: '', link: '', expires_at: '', description: '', event_date: '', start_time: '', end_time: '', venue: '', registration_link: '' }

/** From a stored item to the form's fields. */
export const toForm = (item) => ({
  ...EMPTY,
  type: item.type,
  title: item.title || '',
  body: item.type === 'announcement' ? item.body || '' : '',
  description: item.type === 'event' ? item.body || '' : '',
  link: item.type === 'announcement' ? item.link || '' : '',
  registration_link: item.type === 'event' ? item.link || '' : '',
  expires_at: item.expires_at || '',
  event_date: item.event_date || '',
  start_time: item.start_time || '',
  end_time: item.end_time || '',
  venue: item.venue || '',
})

function Field({ id, label, hint, error, children }) {
  return (
    <div className={`pt-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <small id={`${id}-err`} className="pt-err" role="alert">
          {error}
        </small>
      )}
    </div>
  )
}

/**
 * The submission form, used for new items and for an approver's edit. Same limits as the server (server/portal/validate.js),
 * which is the real check; `fields` carries the server's per-field messages back.
 * `lockType` hides the type choice (editing keeps the type).
 */
export default function ItemForm({ initial, fields = {}, busy, submitLabel = 'Submit for approval', lockType = false, onSubmit, onCancel, idPrefix = 'f' }) {
  const [v, setV] = useState(initial ?? EMPTY)
  const [local, setLocal] = useState({})
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const err = (k) => local[k] || fields[k]
  const aria = (k, hint) => ({ 'aria-invalid': err(k) ? 'true' : undefined, 'aria-describedby': err(k) ? `${idPrefix}-${k}-err` : hint ? `${idPrefix}-${k}-hint` : undefined })
  const ev = v.type === 'event'

  const check = () => {
    const e = {}
    if (v.title.trim().length < 3) e.title = 'The title needs at least 3 characters.'
    const text = ev ? v.description : v.body
    if (text.trim().length < 3) e[ev ? 'description' : 'body'] = 'This needs at least 3 characters.'
    if (ev) {
      if (!v.event_date) e.event_date = 'Choose the date.'
      if (!v.start_time) e.start_time = 'Choose the start time.'
      if (!v.end_time) e.end_time = 'Choose the end time.'
      else if (v.start_time && v.end_time <= v.start_time) e.end_time = 'The end time must be after the start time.'
      if (v.venue.trim().length < 2) e.venue = 'Give the venue.'
    }
    setLocal(e)
    return Object.keys(e).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    if (!check()) return
    onSubmit(v)
  }

  const id = (k) => `${idPrefix}-${k}`
  return (
    <form className="pt-form" onSubmit={submit} noValidate>
      {!lockType && (
        <fieldset className="pt-type">
          <legend>What are you posting?</legend>
          {[['announcement', 'Announcement'], ['event', 'Event']].map(([k, l]) => (
            <label key={k} className={v.type === k ? 'is-on' : ''}>
              <input type="radio" name={`${idPrefix}-type`} value={k} checked={v.type === k} onChange={() => setV((x) => ({ ...x, type: k }))} />
              {l}
            </label>
          ))}
        </fieldset>
      )}

      <Field id={id('title')} label="Title" error={err('title')} hint="3 to 140 characters.">
        <input id={id('title')} value={v.title} onChange={set('title')} maxLength={140} autoComplete="off" {...aria('title', true)} />
      </Field>

      {ev ? (
        <>
          <Field id={id('description')} label="Description" error={err('description')} hint="What it is and who it is for.">
            <textarea id={id('description')} rows={5} value={v.description} onChange={set('description')} maxLength={4000} {...aria('description', true)} />
          </Field>
          <div className="pt-row">
            <Field id={id('event_date')} label="Date" error={err('event_date')}>
              <input id={id('event_date')} type="date" value={v.event_date} onChange={set('event_date')} {...aria('event_date')} />
            </Field>
            <Field id={id('start_time')} label="Starts" error={err('start_time')}>
              <input id={id('start_time')} type="time" value={v.start_time} onChange={set('start_time')} {...aria('start_time')} />
            </Field>
            <Field id={id('end_time')} label="Ends" error={err('end_time')}>
              <input id={id('end_time')} type="time" value={v.end_time} onChange={set('end_time')} {...aria('end_time')} />
            </Field>
          </div>
          <Field id={id('venue')} label="Venue" error={err('venue')}>
            <input id={id('venue')} value={v.venue} onChange={set('venue')} maxLength={140} {...aria('venue')} />
          </Field>
          <Field id={id('registration_link')} label="Registration link (optional)" error={err('registration_link')} hint="A full address starting with https://">
            <input id={id('registration_link')} type="url" inputMode="url" value={v.registration_link} onChange={set('registration_link')} {...aria('registration_link', true)} />
          </Field>
        </>
      ) : (
        <>
          <Field id={id('body')} label="Announcement" error={err('body')} hint="Up to 4,000 characters.">
            <textarea id={id('body')} rows={6} value={v.body} onChange={set('body')} maxLength={4000} {...aria('body', true)} />
          </Field>
          <div className="pt-row">
            <Field id={id('link')} label="Link (optional)" error={err('link')} hint="A full address starting with https://">
              <input id={id('link')} type="url" inputMode="url" value={v.link} onChange={set('link')} {...aria('link', true)} />
            </Field>
            <Field id={id('expires_at')} label="Show until (optional)" error={err('expires_at')} hint="It leaves the site after this day.">
              <input id={id('expires_at')} type="date" value={v.expires_at} onChange={set('expires_at')} {...aria('expires_at', true)} />
            </Field>
          </div>
        </>
      )}

      <div className="pt-actions">
        <button type="submit" className="svc-btn svc-btn--primary" disabled={busy}>
          {busy ? 'Sending…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="svc-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
