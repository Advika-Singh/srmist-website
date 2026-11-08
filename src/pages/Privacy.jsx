import { Footer, SiteHeader } from '../shared.jsx'
import SvcHero from '../ui/SvcHero.jsx'
import '../services.css'

// Plain-language notice. It describes what THIS concept site does today (read from the code), nothing more.
// Have the university's legal team review and replace it before any real launch (India's DPDP Act, 2023).
const SECTIONS = [
  {
    id: 'collect',
    title: 'What we collect',
    items: [
      ['Enquiry and call-back forms', 'Name, phone, email, programme of interest and your message, only when you submit the form. A hidden field and a per-address rate limit block automated spam.'],
      ['Issue reports', 'The details you type into the report form, plus a reference number so you can track it.'],
      ['Search and assistant questions', 'We write one redacted line (emails, phone numbers and numbers longer than a few digits are removed) so we can see which questions go unanswered. Nothing is stored in a database.'],
      ['DAAS assistant', 'Your message is sent to Google’s Gemini service to produce a reply. Do not type personal or sensitive details into it.'],
    ],
  },
  {
    id: 'device',
    title: 'What stays on your device',
    items: [
      ['Preferences', 'Theme, language, text size and the “pause animations” setting are saved in your browser so the site remembers them.'],
      ['Search memory', 'What you opened from search, used only to rank results for you. It never leaves your browser.'],
      ['Experiment group', 'A random label that decides which wording of the Admissions page you see (A or B).'],
      ['No tracking cookies', 'This site sets no advertising or analytics cookies, so there is nothing to accept or decline. If that changes, a consent choice will appear before anything is switched on.'],
    ],
  },
  {
    id: 'use',
    title: 'How it is used and shared',
    items: [
      ['Use', 'To answer your enquiry, track your report and fix the site. Not for advertising.'],
      ['Sharing', 'Translations send nearby page text to Google Gemini. Enquiries go to the admissions team only when the university connects a delivery channel; until then they are logged, and the form tells you so.'],
      ['Sale', 'We do not sell personal data.'],
    ],
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    items: [
      ['Access, correction, erasure', 'You can ask what we hold about you, ask us to correct it, or ask us to delete it, and withdraw consent at any time.'],
      ['Grievance', 'Use the report form with the category “Privacy request”, or call the university enquiries line shown in the footer.'],
      ['Children', 'If you are under 18, ask a parent or guardian to submit forms for you.'],
      ['Retention', 'Enquiries and reports are kept only as long as needed to answer them. A fixed retention period is for the university to set.'],
    ],
  },
]

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="interior svc" id="main" tabIndex={-1}>
        <SvcHero
          eyebrow="Privacy and cookies"
          title="What we do with your data."
          lede="In plain words: what this site collects, what stays in your browser, who sees it, and how to ask us to change or delete it."
          img="/srmist/library.jpg"
          pos="50% 50%"
        />
        <section className="svc-wrap vis-grid">
          {SECTIONS.map((s) => (
            <div className="vis-block" key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              <dl className="priv-list">
                {s.items.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <div className="vis-block">
            <p className="source-note">
              This is an independent concept redesign, not an official SRMIST page. This notice describes what the prototype does and must be reviewed by the university before launch.
              Last updated 8 November 2026.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
