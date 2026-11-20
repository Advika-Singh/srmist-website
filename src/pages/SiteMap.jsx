import { AUX, MENUS, STRIP } from '../data/nav.js'
import { Footer, SiteHeader } from '../shared.jsx'
import Hero from '../ui/Hero.jsx'
import '../services.css'
import '../styles/sitemap.css'

const isOwn = (to) => to.startsWith('/')
const A = ({ to, children }) =>
  isOwn(to) ? (
    <a href={to}>{children}</a>
  ) : (
    <a href={to} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (official site, opens in a new tab)</span>
    </a>
  )

/** The whole site on one page, built from the same menu data as the header, so it can never drift from the real navigation. */
export default function SiteMap() {
  return (
    <>
      <SiteHeader />
      <main className="interior svc sm-page" id="main" tabIndex={-1}>
        <Hero layout="band" eyebrow="Site map" title="Every page, grouped the way people look for it." lede="Three levels: the main menu, the section pages, then the detail pages. Links to the official SRMIST site are marked." img="/srmist/campus-lakeview.webp" pos="50% 50%" />
        <section className="svc-wrap">
          <div className="sm-levels" aria-label="How the site is organised">
            <div><b>Level 1</b><span>Main menu</span></div>
            <div><b>Level 2</b><span>Section pages</span></div>
            <div><b>Level 3</b><span>Detail and service pages</span></div>
          </div>

          <h2 className="sm-h">Main menu</h2>
          <div className="sm-grid">
            {MENUS.map((m) => (
              <section key={m.label} className="sm-card" aria-labelledby={`sm-${m.label}`}>
                <h3 id={`sm-${m.label}`}><A to={m.to}>{m.label}</A></h3>
                <p>{m.blurb}</p>
                {m.cols.map((c) => (
                  <div key={c.title}>
                    <h4>{c.title}</h4>
                    <ul>
                      {c.links.map(([label, to]) => (
                        <li key={label + to}><A to={to}>{label}</A></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <h2 className="sm-h">For each visitor</h2>
          <ul className="sm-chips">
            {STRIP.filter(([, to]) => isOwn(to)).map(([label, to]) => (
              <li key={to}><a href={to}>{label}</a></li>
            ))}
            <li><a href="/course-finder">Programme finder</a></li>
            <li><a href="/staff-finder">Staff finder</a></li>
            <li><a href="/compare">Compare programmes</a></li>
            <li><a href="/dates">Key dates</a></li>
            <li><a href="/events/calendar">Events calendar</a></li>
            <li><a href="/announcements">Announcements</a></li>
          </ul>

          <h2 className="sm-h">Quick links</h2>
          <ul className="sm-chips">
            {AUX.map(([label, to]) => (
              <li key={label}><A to={to}>{label}</A></li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  )
}
