import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api, istDateTime, niceDate, setCsrf } from '../../lib/portalApi.js'
import { Footer, SiteHeader } from '../../shared.jsx'
import ContentPanel from './ContentPanel.jsx'
import ItemForm, { toForm } from './ItemForm.jsx'
import '../../services.css'
import '../../styles/portal.css'

const STATUS = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', withdrawn: 'Withdrawn' }
const Badge = ({ s }) => <span className={`pt-badge pt-badge--${s}`}>{STATUS[s] ?? s}</span>

/** What the server stores, from the form's fields. */
const toBody = (v) => ({
  type: v.type,
  title: v.title,
  ...(v.type === 'event'
    ? { description: v.description, event_date: v.event_date, start_time: v.start_time, end_time: v.end_time, venue: v.venue, registration_link: v.registration_link }
    : { body: v.body, link: v.link, expires_at: v.expires_at }),
})

function When({ it }) {
  if (it.type === 'event') return <span>{niceDate(it.event_date)}, {it.start_time}–{it.end_time} · {it.venue}</span>
  return <span>{it.expires_at ? `Shown until ${niceDate(it.expires_at)}` : 'No expiry date'}</span>
}

/** A one-line status message the screen reader announces. */
function Notice({ kind = 'info', children }) {
  if (!children) return null
  return (
    <p className={`pt-notice pt-notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

/* ---------- login ---------- */
function Login({ onUser }) {
  const [cfg, setCfg] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const box = useRef(null)

  const signIn = useCallback(
    async (payload) => {
      setBusy(true)
      setMsg('')
      try {
        const data = await api('/login', { method: 'POST', body: payload, onWaking: () => setMsg('Waking the database… this can take a few seconds the first time.') })
        setCsrf(data.csrf)
        onUser(data.user)
      } catch (e) {
        setMsg(e.message)
      } finally {
        setBusy(false)
      }
    },
    [onUser],
  )

  useEffect(() => {
    api('/config').then(setCfg).catch(() => setCfg({ googleClientId: '', demo: false }))
  }, [])

  useEffect(() => {
    if (!cfg?.googleClientId) return undefined
    const draw = () => {
      if (!window.google?.accounts?.id || !box.current) return
      window.google.accounts.id.initialize({ client_id: cfg.googleClientId, hd: cfg.domain, callback: (r) => signIn({ credential: r.credential }) })
      box.current.innerHTML = ''
      window.google.accounts.id.renderButton(box.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 280 })
    }
    if (window.google?.accounts?.id) draw()
    else {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = draw
      s.onerror = () => setMsg('Google sign-in could not load. Check your connection.')
      document.head.appendChild(s)
    }
    return undefined
  }, [cfg, signIn])

  return (
    <section className="pt-login">
      <h1>Staff portal</h1>
      <p>Sign in with your <b>@srmist.edu.in</b> Google account to post announcements and events. An approver reviews everything before it appears on the public site.</p>
      {!cfg && <Notice>Loading…</Notice>}
      {cfg?.googleClientId && <div ref={box} className="pt-google" aria-label="Sign in with Google" />}
      {cfg && !cfg.googleClientId && !cfg.demo && <Notice kind="error">Sign-in is not configured yet. The site owner needs to add the Google client id.</Notice>}
      {cfg?.demo && (
        <div className="pt-demo">
          <p><b>Demo sign-in</b> (presentation mode only)</p>
          <div className="pt-actions">
            <button type="button" className="svc-btn" disabled={busy} onClick={() => signIn({ demo: 'teacher' })}>Continue as demo teacher</button>
            <button type="button" className="svc-btn svc-btn--primary" disabled={busy} onClick={() => signIn({ demo: 'approver' })}>Continue as demo approver</button>
          </div>
        </div>
      )}
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>
    </section>
  )
}

/* ---------- submit ---------- */
function Submit({ onDone }) {
  const [fields, setFields] = useState({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(null)
  const [round, setRound] = useState(0)

  const send = async (v) => {
    setBusy(true)
    setMsg('')
    setFields({})
    try {
      const data = await api('/items', { method: 'POST', body: toBody(v), onWaking: () => setMsg('Waking the database… one moment.') })
      setDone(data.item)
      setRound((n) => n + 1)
    } catch (e) {
      setFields(e.fields || {})
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <h2>New submission</h2>
      {done && (
        <Notice kind="ok">
          “{done.title}” was sent for approval. It will appear on the public site once an approver accepts it.{' '}
          <button type="button" className="pt-link" onClick={onDone}>See my submissions</button>
        </Notice>
      )}
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>
      <ItemForm key={round} fields={fields} busy={busy} onSubmit={send} />
    </section>
  )
}

/* ---------- my submissions ---------- */
function Mine() {
  const [items, setItems] = useState(null)
  const [msg, setMsg] = useState('')
  const load = useCallback(() => api('/my-items', { onWaking: () => setMsg('Waking the database…') }).then((d) => { setItems(d.items); setMsg('') }).catch((e) => setMsg(e.message)), [])
  useEffect(() => { load() }, [load])

  const withdraw = async (it) => {
    if (!window.confirm(`Withdraw “${it.title}”?`)) return
    try {
      await api(`/items/${it.id}/withdraw`, { method: 'POST' })
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <section>
      <h2>My submissions</h2>
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>
      {!items && !msg && <Notice>Loading…</Notice>}
      {items && items.length === 0 && <p className="pt-empty">You have not submitted anything yet.</p>}
      <ul className="pt-cards">
        {(items ?? []).map((it) => (
          <li key={it.id} className="pt-card">
            <div className="pt-card-top">
              <span className="pt-type-tag">{it.type === 'event' ? 'Event' : 'Announcement'}</span>
              <Badge s={it.status} />
            </div>
            <h3>{it.title}</h3>
            <p className="pt-meta"><When it={it} /></p>
            <p className="pt-meta">Submitted {istDateTime(it.created_at)} IST</p>
            {it.status === 'rejected' && (
              <p className="pt-reason"><b>Reason:</b> {it.reject_reason}{it.reviewer ? ` (${it.reviewer.name})` : ''}</p>
            )}
            {it.status === 'approved' && <p className="pt-meta">Live since {istDateTime(it.live_at)} IST</p>}
            {it.status === 'pending' && (
              <div className="pt-actions">
                <button type="button" className="svc-btn" onClick={() => withdraw(it)}>Withdraw<span className="sr-only"> {it.title}</span></button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- approvals ---------- */
function Approvals({ me }) {
  const [items, setItems] = useState(null)
  const [msg, setMsg] = useState('')
  const [editing, setEditing] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const [fields, setFields] = useState({})
  const [busy, setBusy] = useState(false)
  const load = useCallback(() => api('/queue', { onWaking: () => setMsg('Waking the database…') }).then((d) => { setItems(d.items); setMsg('') }).catch((e) => setMsg(e.message)), [])
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

  return (
    <section>
      <h2>Approvals</h2>
      <p className="pt-meta">Pending items, oldest first. You cannot review your own submissions.</p>
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>
      {!items && !msg && <Notice>Loading…</Notice>}
      {items && items.length === 0 && <p className="pt-empty">Nothing is waiting. Well done.</p>}
      <ul className="pt-cards">
        {(items ?? []).map((it) => {
          const own = it.submitter.email === me.email
          return (
            <li key={it.id} className="pt-card">
              <div className="pt-card-top">
                <span className="pt-type-tag">{it.type === 'event' ? 'Event' : 'Announcement'}</span>
                <Badge s={it.status} />
              </div>
              {editing === it.id ? (
                <ItemForm idPrefix={`e${it.id}`} initial={toForm(it)} lockType fields={fields} busy={busy} submitLabel="Save changes" onCancel={() => { setEditing(null); setFields({}) }} onSubmit={(v) => act(() => api(`/items/${it.id}`, { method: 'PATCH', body: toBody(v) }))} />
              ) : (
                <>
                  <h3>{it.title}</h3>
                  <p className="pt-body">{it.body}</p>
                  {it.link && <p className="pt-meta">Link: <a href={it.link} target="_blank" rel="noopener noreferrer">{it.link}<span className="sr-only"> (opens in a new tab)</span></a></p>}
                  <p className="pt-meta"><When it={it} /></p>
                  <p className="pt-meta">From <b>{it.submitter.name}</b> ({it.submitter.email}) · {istDateTime(it.created_at)} IST</p>
                  {own ? (
                    <p className="pt-reason">This is your own submission. Another approver needs to review it.</p>
                  ) : rejecting === it.id ? (
                    <form className="pt-form" onSubmit={(e) => { e.preventDefault(); act(() => api(`/items/${it.id}/reject`, { method: 'POST', body: { reason } })) }}>
                      <div className={`pt-field ${fields.reason ? 'has-error' : ''}`}>
                        <label htmlFor={`r${it.id}`}>Reason shown to the submitter</label>
                        <textarea id={`r${it.id}`} rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} required />
                      </div>
                      <div className="pt-actions">
                        <button type="submit" className="svc-btn svc-btn--primary" disabled={busy || reason.trim().length < 3}>Reject</button>
                        <button type="button" className="svc-btn" onClick={() => setRejecting(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="pt-actions">
                      <button type="button" className="svc-btn svc-btn--primary" disabled={busy} onClick={() => act(() => api(`/items/${it.id}/approve`, { method: 'POST' }))}>Approve<span className="sr-only"> {it.title}</span></button>
                      <button type="button" className="svc-btn" onClick={() => { setRejecting(it.id); setReason('') }}>Reject<span className="sr-only"> {it.title}</span></button>
                      <button type="button" className="svc-btn" onClick={() => { setEditing(it.id); setFields({}) }}>Edit<span className="sr-only"> {it.title}</span></button>
                    </div>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------- logs ---------- */
const ACTIONS = ['submitted', 'approved', 'rejected', 'edited', 'withdrawn']
function Logs() {
  const [f, setF] = useState({ from: '', to: '', type: '', submitter: '', approver: '', action: '' })
  const [rows, setRows] = useState(null)
  const [msg, setMsg] = useState('')
  const qs = (x) => new URLSearchParams(Object.entries(x).filter(([, v]) => v)).toString()
  const load = useCallback((x) => { setMsg(''); return api(`/logs?${qs(x)}`, { onWaking: () => setMsg('Waking the database…') }).then((d) => { setRows(d.logs); setMsg('') }).catch((e) => setMsg(e.message)) }, [])
  useEffect(() => { load(f) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  return (
    <section>
      <h2>Logs</h2>
      <p className="pt-meta">Every action is recorded and cannot be changed or deleted. Times are in India time (IST).</p>
      <form className="pt-filters" onSubmit={(e) => { e.preventDefault(); load(f) }}>
        <div className="pt-field"><label htmlFor="lf-from">From</label><input id="lf-from" type="date" value={f.from} onChange={set('from')} /></div>
        <div className="pt-field"><label htmlFor="lf-to">To</label><input id="lf-to" type="date" value={f.to} onChange={set('to')} /></div>
        <div className="pt-field"><label htmlFor="lf-type">Type</label><select id="lf-type" value={f.type} onChange={set('type')}><option value="">All</option><option value="announcement">Announcement</option><option value="event">Event</option></select></div>
        <div className="pt-field"><label htmlFor="lf-action">Action</label><select id="lf-action" value={f.action} onChange={set('action')}><option value="">All</option>{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
        <div className="pt-field"><label htmlFor="lf-sub">Posted by</label><input id="lf-sub" value={f.submitter} onChange={set('submitter')} placeholder="name or email" /></div>
        <div className="pt-field"><label htmlFor="lf-app">Approved or rejected by</label><input id="lf-app" value={f.approver} onChange={set('approver')} placeholder="name or email" /></div>
        <div className="pt-actions">
          <button type="submit" className="svc-btn svc-btn--primary">Apply filters</button>
          <a className="svc-btn" href={`/api/portal/logs.csv?${qs(f)}`}>Export CSV<span className="sr-only"> of the filtered logs</span></a>
        </div>
      </form>
      <Notice kind={/Waking/.test(msg) ? 'info' : 'error'}>{msg}</Notice>
      {!rows && !msg && <Notice>Loading…</Notice>}
      {rows && rows.length === 0 && <p className="pt-empty">No log rows match.</p>}
      {rows && rows.length > 0 && (
        <div className="pt-scroll" role="region" aria-label="Log table, scrolls sideways on small screens" tabIndex={0}>
          <table className="pt-table">
            <caption className="sr-only">Portal action log, newest first</caption>
            <thead>
              <tr><th scope="col">Time (IST)</th><th scope="col">Item</th><th scope="col">Posted by</th><th scope="col">Action</th><th scope="col">By</th><th scope="col">Approved</th><th scope="col">Live</th></tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{istDateTime(l.at)}</td>
                  <td><b>{l.item_title}</b><br /><small>{l.item_type}</small></td>
                  <td>{l.submitter_name}<br /><small>{l.submitter_email}</small></td>
                  <td><span className={`pt-badge pt-badge--${l.action === 'submitted' || l.action === 'edited' ? 'pending' : l.action}`}>{l.action}</span></td>
                  <td>{l.actor_name}<br /><small>{l.actor_email}</small></td>
                  <td>{istDateTime(l.approved_at)}</td>
                  <td>{istDateTime(l.live_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/* ---------- the portal ---------- */
export default function PortalApp({ view = 'submit' }) {
  const [me, setMe] = useState(undefined) // undefined: checking, null: signed out
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let live = true
    api('/me', { onWaking: () => setMsg('Waking the database… this can take a few seconds the first time.') })
      .then((d) => { if (live) { setCsrf(d.csrf); setMe(d.user); setMsg('') } })
      .catch((e) => { if (live) { setMe(null); if (e.status !== 401) setMsg(e.message) } })
    return () => { live = false }
  }, [])

  const out = async () => {
    await api('/logout', { method: 'POST' }).catch(() => {})
    setMe(null)
    navigate('/portal/login')
  }

  const isApprover = me?.role === 'approver'
  let current = view
  if (view === 'login') current = 'submit'
  if ((view === 'approvals' || view === 'logs') && !isApprover) current = 'denied'

  const tabs = [['submit', '/portal', 'New submission'], ['mine', '/portal/mine', 'My submissions'], ['content', '/portal/content', 'Site content'], ...(isApprover ? [['approvals', '/portal/approvals', 'Approvals'], ['logs', '/portal/logs', 'Logs']] : [])]

  return (
    <>
      <SiteHeader />
      <main className="interior svc pt-page" id="main" tabIndex={-1}>
        <div className="pt-wrap">
          {me === undefined && <Notice kind={/Waking/.test(msg) ? 'info' : 'info'}>{msg || 'Checking your sign-in…'}</Notice>}
          {me === null && <Login onUser={setMe} />}
          {me === null && msg && <Notice kind="error">{msg}</Notice>}
          {me && (
            <>
              <header className="pt-head">
                <div>
                  <h1>Staff portal</h1>
                  <p className="pt-meta">Signed in as <b>{me.name}</b> ({me.email}) · {isApprover ? 'Approver' : 'Teacher'}</p>
                </div>
                <button type="button" className="svc-btn" onClick={out}>Sign out</button>
              </header>
              <nav className="pt-tabs" aria-label="Portal sections">
                {tabs.map(([k, href, label]) => (
                  <NavLink key={k} to={href} end aria-current={current === k ? 'page' : undefined}>{label}</NavLink>
                ))}
              </nav>
              {current === 'submit' && <Submit onDone={() => navigate('/portal/mine')} />}
              {current === 'mine' && <Mine />}
              {current === 'approvals' && <Approvals me={me} />}
              {current === 'logs' && <Logs />}
              {current === 'content' && <ContentPanel me={me} isApprover={isApprover} />}
              {current === 'denied' && <Notice kind="error">This area is for approvers only.</Notice>}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
