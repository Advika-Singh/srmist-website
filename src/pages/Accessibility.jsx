import LegalPage from '../ui/LegalPage.jsx'

// Honest status, taken from the 2026-11-08 review (docs/CONTEXT.md and the audit notes). Update it when the facts change.
const SECTIONS = [
  {
    id: 'built',
    title: 'What is built in',
    items: [
      ['Keyboard and focus', 'A skip link, a visible focus ring on every control, and menus that work with Tab and Esc. Pressing Esc in a menu returns you to its button.'],
      ['Reading and display', 'Dark theme, text size controls, and body text that is never smaller than 16px. Smaller labels are at least 12px.'],
      ['Motion', 'Animations respect your device’s reduced-motion setting, and “Pause animations” in the footer stops them for good.'],
      ['Language', 'English, Tamil and Hindi. Menus use a hand-made dictionary; other text is machine-translated.'],
      ['Touch', 'Controls are at least 44px on touch screens, and tables turn into cards on narrow screens so nothing scrolls sideways.'],
      ['Step-free routes', 'The accessible campus map shows routes and entrances using OpenStreetMap data, which has few accessibility tags, so treat it as a guide.'],
    ],
  },
  {
    id: 'standard',
    title: 'The standard we aim for',
    items: [
      ['Target', 'WCAG 2.2 level AA. Colour pairs are checked by a script and manual checks cover keyboard use and 320px width.'],
    ],
  },
  {
    id: 'gaps',
    title: 'Known gaps',
    items: [
      ['Screen readers', 'We have not yet tested with NVDA, JAWS or VoiceOver. Expect rough edges until we have.'],
      ['Dark theme and phones', 'Checked on the main pages only.'],
      ['Machine translation', 'Tamil and Hindi have not been reviewed by native speakers.'],
      ['Photos and maps', 'Some photos are decorative and have no description. The map is a drawing, not a text alternative.'],
    ],
  },
  {
    id: 'help',
    title: 'Tell us about a barrier',
    items: [['Report it', 'If something blocks you, report it with the form below. Say which page and which assistive technology you used, and we will reply with a reference number.']],
  },
]

export default function Accessibility() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      title="What we do, and what we haven’t fixed yet."
      lede="An honest list of what works today, what does not, and how to tell us when something gets in your way."
      sections={SECTIONS}
      note="This is an independent concept redesign, not an official SRMIST statement. Last reviewed 8 November 2026."
    >
      <div className="vis-block">
        <a className="button button-gold" href="/support?category=Accessibility%20barrier">
          Report an accessibility barrier
        </a>
      </div>
    </LegalPage>
  )
}
