import { useEffect, useState } from 'react'
import { niceDate } from '../lib/portalApi.js'
import { Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'
import '../styles/portal.css'

/** Announcements posted by staff through the portal and approved by an approver. Nothing here is shown until it is approved. */
export default function Announcements() {
  const [items, setItems] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let live = true
    fetch('/api/public/items?type=announcement')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => live && setItems(d.items))
      .catch(() => live && setFailed(true))
    return () => { live = false }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="interior svc pt-page idv-zigzag" id="main" tabIndex={-1}>
        <SvcHero eyebrow="Announcements" title="Notices from across the university." lede="Posted by faculty and staff, checked by an approver before they appear here." img="/srmist/campus-lakeview.webp" pos="50% 50%" />
        <div className="pt-wrap">
          {!items && !failed && <p className="pt-notice pt-notice--info" role="status">Loading announcements…</p>}
          {failed && <p className="pt-notice pt-notice--error" role="alert">Announcements could not be loaded right now. Please try again in a moment.</p>}
          {items && items.length === 0 && <p className="pt-empty">There are no announcements at the moment. Please check back soon.</p>}
          <ul className="pt-cards">
            {(items ?? []).map((a) => (
              <li key={a.id} className="pt-card">
                <h2 className="pt-h3">{a.title}</h2>
                <p className="pt-body">{a.body}</p>
                {a.link && <p className="pt-meta"><a href={a.link} target="_blank" rel="noopener noreferrer">Read more<span className="sr-only"> about {a.title} (opens in a new tab)</span></a></p>}
                {a.expires_at && <p className="pt-meta">Shown until {niceDate(a.expires_at)}</p>}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  )
}
