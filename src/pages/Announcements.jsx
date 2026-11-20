import { useEffect, useState } from 'react'
import { useContentList, useSnippet } from '../lib/cms.js'
import { niceDate } from '../lib/portalApi.js'
import { Footer, SiteHeader } from '../shared.jsx'
import Hero from '../ui/Hero.jsx'
import '../services.css'
import '../styles/portal.css'

/** Announcements posted by staff through the portal and approved by an approver. Nothing here is shown until it is approved. */
export default function Announcements() {
  const [items, setItems] = useState(null)
  const [failed, setFailed] = useState(false)
  const news = useContentList('news', 10) // edited in the staff portal under Site content
  const lede = useSnippet('announcements.intro', 'Posted by faculty and staff, checked by an approver before they appear here.')
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
        <Hero layout="band" eyebrow="Announcements" title="Notices from across the university." lede={lede} img="/srmist/campus-lakeview.webp" pos="50% 50%" />
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
          {news && news.length > 0 && (
            <section aria-labelledby="cms-news">
              <h2 id="cms-news" className="pt-h3">News</h2>
              <ul className="pt-cards">
                {news.map((n) => (
                  <li key={n.slug} className="pt-card">
                    {n.image && <img src={n.image} alt={n.image_alt || ''} loading="lazy" width="640" height="360" style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }} />}
                    <h3 className="pt-h3">{n.title}</h3>
                    <p className="pt-meta">{niceDate(n.date)}</p>
                    <p className="pt-body">{n.summary}</p>
                    {n.body && <p className="pt-body" style={{ whiteSpace: 'pre-line' }}>{n.body}</p>}
                    {n.link && <p className="pt-meta"><a href={n.link} target="_blank" rel="noopener noreferrer">Read more<span className="sr-only"> about {n.title} (opens in a new tab)</span></a></p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
