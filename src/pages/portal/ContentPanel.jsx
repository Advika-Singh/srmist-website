import { useCallback, useEffect, useState } from 'react'
import { api, istDateTime } from '../../lib/portalApi.js'

const LABEL = { draft: 'Draft', pending: 'Waiting for review', rejected: 'Sent back', published: 'Live', archived: 'Archived' }
const BADGE = { draft: 'withdrawn', pending: 'pending', rejected: 'rejected', published: 'approved', archived: 'withdrawn' }
const EVENT = { created: 'Created', edited: 'Edited', submitted: 'Sent for review', published: 'Published', rejected: 'Sent back', unpublished: 'Taken down', archived: 'Archived' }

function Notice({ kind = 'info', children }) {
  if (!children) return null
  return <p className={`pt-notice pt-notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</p>
}

/** One input for one field of a content type. The type's field list comes from the server (server/cms/schemas.js), so a new type needs no new screen. */
function FieldInput({ f, value, error, onChange, locked, idPrefix }) {
  const id = `${idPrefix}-${f.key}`
  const common = { id, value: value ?? '', onChange: (e) => onChange(e.target.value), 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-err` : f.hint ? `${id}-hint` : undefined }
  let input
  if (f.kind === 'text') input = <textarea rows={f.max > 600 ? 8 : 4} maxLength={f.max} {...common} />
  else if (f.kind === 'enum') {
    input = (
      <select {...common}>
        <option value="">Choose…</option>
        {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  } else if (f.kind === 'date') input = <input type="date" {...common} />
  else input = <input type="text" inputMode={f.kind === 'url' || f.kind === 'image' ? 'url' : undefined} maxLength={f.max} autoComplete="off" disabled={locked} {...common} />
  return (
    <div className={`pt-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{f.label}{f.required ? '' : ' (optional)'}</label>
      {input}
      {f.hint && !error && <small id={`${id}-hint`}>{f.hint}</small>}
      {error && <small id={`${id}-err`} className="pt-err" role="alert">{error}</small>}
    </div>
  )
}

function Editor({ types, item, fields, busy, onSave, onCancel }) {
  const [type, setType] = useState(item?.type ?? types[0].id)
  const [data, setData] = useState(item?.data ?? {})
  const t = types.find((x) => x.id === type)
  const prefix = `c${item?.id ?? 'new'}`
  return (
    <form className="pt-form" noValidate onSubmit={(e) => { e.preventDefault(); onSave({ type, data }) }}>
      {!item && (
        <div className="pt-field">
          <label htmlFor={`${prefix}-type`}>What are you writing?</label>
          <select id={`${prefix}-type`} value={type} onChange={(e) => { setType(e.target.value); setData({}) }}>
            {types.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </div>
      )}
      {t.fields.map((f) => (
        <FieldInput key={f.key} f={f} idPrefix={prefix} value={data[f.key]} error={fields[f.key]} locked={Boolean(item) && f.kind === 'slug'} onChange={(v) => setData((d) => ({ ...d, [f.key]: v }))} />
      ))}
      <p className="pt-meta">Plain text only: formatting and HTML are removed. Nothing goes live until an approver publishes it.</p>
      <div className="pt-actions">
        <button type="submit" className="svc-btn svc-btn--primary" disabled={busy}>{busy ? 'Saving…' : item ? 'Save changes' : 'Save as draft'}</button>
        <button type="button" className="svc-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

function History({ id }) {
  const [events, setEvents] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    api(`/content/${id}/history`).then((d) => setEvents(d.events)).catch((e) => setMsg(e.message))
  }, [id])
  if (msg) return <Notice kind="error">{msg}</Notice>
  if (!events) return <Notice>Loading history…</Notice>
  return (
    <ol className="pt-meta" aria-label="History, newest first">
      {events.map((e) => (
        <li key={e.id}><b>{EVENT[e.action] ?? e.action}</b> by {e.actor.name} · {istDateTime(e.at)} IST{e.note ? ` · “${e.note}”` : ''}</li>
      ))}
    </ol>
  )
}

/** The CMS screen of the staff portal: write news, FAQ answers and site text; approvers publish. */
export default function ContentPanel({ me, isApprover }) {
  const [types, setTypes] = useState(null)
  const [items, setItems] = useState(null)
  const [status, setStatus] = useState('')
  const [mine, setMine] = useState(false)
  const [msg, setMsg] = useState('')
  const [fields, setFields] = useState({})
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null) // 'new' | item id
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const [history, setHistory] = useState(null)

  const load = useCallback(() => {
    const q = new URLSearchParams({ ...(status ? { status } : {}), ...(mine ? { mine: '1' } : {}) }).toString()
    return api(`/content?${q}`, { onWaking: () => setMsg('Waking the database…') }).then((d) => { setItems(d.items); setMsg('') }).catch((e) => setMsg(e.message))
  }, [status, mine])
  useEffect(() => { api('/content/types').then((d) => setTypes(d.types)).catch((e) => setMsg(e.message)) }, [])
  useEffect(() => { load() }, [load])

  const act = async (fn) => {
    setBusy(true)
    setMsg('')
    setFields({})
    try {
      await fn()
      setEditing(null)
      setRejecting(null)
      setReason('')
      await load()
    } catch (e) {
      setFields(e.fields || {})
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }
  const post = (it, action, body) => act(() => api(`/content/${it.id}/${action}`, { method: 'POST', body }))
  const title = (it) => it.data.title || it.data.question || it.data.key || it.slug

  return (
    <section>
      <h2>Site content</h2>
      <p className="pt-meta">News, answers to common questions and short pieces of site text. They are saved separately from the site's code and appear on the public site only after an approver publishes them. You cannot approve your own work.</p>
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>

      {types && editing === 'new' && (
        <Editor types={types} fields={fields} busy={busy} onCancel={() => { setEditing(null); setFields({}) }} onSave={(v) => act(() => api('/content', { method: 'POST', body: v }))} />
      )}
      {editing !== 'new' && types && <div className="pt-actions"><button type="button" className="svc-btn svc-btn--primary" onClick={() => { setEditing('new'); setFields({}) }}>Write something new</button></div>}

      <div className="pt-filters" role="group" aria-label="Filter the list">
        <div className="pt-field">
          <label htmlFor="cf-status">Show</label>
          <select id="cf-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Everything</option>
            {Object.entries(LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {isApprover && (
          <div className="pt-field">
            <label htmlFor="cf-mine">Whose</label>
            <select id="cf-mine" value={mine ? '1' : ''} onChange={(e) => setMine(e.target.value === '1')}>
              <option value="">Everyone's</option>
              <option value="1">Only mine</option>
            </select>
          </div>
        )}
      </div>

      {!items && !msg && <Notice>Loading…</Notice>}
      {items && items.length === 0 && <p className="pt-empty">Nothing here yet.</p>}
      <ul className="pt-cards">
        {(items ?? []).map((it) => {
          const own = it.author.email === me.email
          const label = types?.find((x) => x.id === it.type)?.label ?? it.type
          const canReview = isApprover && !own && it.status === 'pending'
          return (
            <li key={it.id} className="pt-card">
              <div className="pt-card-top">
                <span className="pt-type-tag">{label}</span>
                <span className={`pt-badge pt-badge--${BADGE[it.status]}`}>{LABEL[it.status] ?? it.status}</span>
              </div>
              {editing === it.id && types ? (
                <Editor types={types} item={it} fields={fields} busy={busy} onCancel={() => { setEditing(null); setFields({}) }} onSave={(v) => act(() => api(`/content/${it.id}`, { method: 'PATCH', body: { data: v.data } }))} />
              ) : (
                <>
                  <h3>{title(it)}</h3>
                  <p className="pt-body">{it.data.summary || it.data.answer || it.data.text}</p>
                  <p className="pt-meta">By <b>{it.author.name}</b> · changed {istDateTime(it.updated_at)} IST · version {it.version}{it.live && it.status !== 'published' ? ' · an earlier version is still live' : ''}</p>
                  {it.status === 'rejected' && <p className="pt-reason"><b>Reason:</b> {it.reject_reason}{it.reviewer ? ` (${it.reviewer.name})` : ''}</p>}
                  {it.status === 'pending' && isApprover && own && <p className="pt-reason">This is your own work. Another approver needs to review it.</p>}
                  {rejecting === it.id ? (
                    <form className="pt-form" onSubmit={(e) => { e.preventDefault(); post(it, 'reject', { reason }) }}>
                      <div className={`pt-field ${fields.reason ? 'has-error' : ''}`}>
                        <label htmlFor={`cr${it.id}`}>Reason shown to the author</label>
                        <textarea id={`cr${it.id}`} rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} required />
                      </div>
                      <div className="pt-actions">
                        <button type="submit" className="svc-btn svc-btn--primary" disabled={busy || reason.trim().length < 3}>Send back</button>
                        <button type="button" className="svc-btn" onClick={() => setRejecting(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="pt-actions">
                      {canReview && <button type="button" className="svc-btn svc-btn--primary" disabled={busy} onClick={() => post(it, 'publish')}>Publish<span className="sr-only"> {title(it)}</span></button>}
                      {canReview && <button type="button" className="svc-btn" onClick={() => { setRejecting(it.id); setReason('') }}>Send back<span className="sr-only"> {title(it)}</span></button>}
                      {['draft', 'rejected'].includes(it.status) && <button type="button" className="svc-btn svc-btn--primary" disabled={busy} onClick={() => post(it, 'submit')}>Send for review<span className="sr-only"> {title(it)}</span></button>}
                      {it.status !== 'archived' && <button type="button" className="svc-btn" onClick={() => { setEditing(it.id); setFields({}) }}>Edit<span className="sr-only"> {title(it)}</span></button>}
                      {isApprover && it.live && <button type="button" className="svc-btn" disabled={busy} onClick={() => post(it, 'unpublish')}>Take down<span className="sr-only"> {title(it)}</span></button>}
                      {it.status !== 'archived' && (isApprover || (own && ['draft', 'rejected'].includes(it.status))) && (
                        <button type="button" className="svc-btn" disabled={busy} onClick={() => window.confirm(`Archive “${title(it)}”? It leaves the public site and cannot be edited.`) && post(it, 'archive')}>Archive<span className="sr-only"> {title(it)}</span></button>
                      )}
                      <button type="button" className="svc-btn" aria-expanded={history === it.id} onClick={() => setHistory(history === it.id ? null : it.id)}>History<span className="sr-only"> of {title(it)}</span></button>
                    </div>
                  )}
                  {history === it.id && <History id={it.id} />}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
