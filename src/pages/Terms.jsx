import LegalPage from '../ui/LegalPage.jsx'

// Plain-language terms for THIS prototype. The university's legal team must review and replace before any real launch.
const SECTIONS = [
  {
    id: 'what',
    title: 'What this site is',
    items: [
      ['An independent concept', 'This is a student redesign of the SRMIST website. It is not the official site and is not run by the university.'],
      ['Official sources', 'For admissions, fees, dates and results, the official site and the SRMJEEE portal are the source of truth. Where we link to them, use those.'],
    ],
  },
  {
    id: 'info',
    title: 'About the information here',
    items: [
      ['Real and illustrative data', 'Facts such as dates, rankings and placements come from official pages and carry a source link. Fee figures, staff timetables and availability are illustrative and are labelled that way wherever they appear.'],
      ['Estimates', 'The fee and ROI calculator and the course finder give estimates and suggestions, not offers, quotes or admission decisions.'],
      ['Tentative dates', 'SRMJEEE dates shown here are the tentative dates published by SRMIST and can change.'],
    ],
  },
  {
    id: 'ai',
    title: 'The DAAS assistant and translations',
    items: [
      ['AI can be wrong', 'DAAS and the live translations are produced by an AI model. Check anything important, such as fees, deadlines and eligibility, against the official site.'],
      ['Machine translation', 'Tamil and Hindi text outside the menus is machine-translated and has not been reviewed by a native speaker.'],
    ],
  },
  {
    id: 'use',
    title: 'Using the site',
    items: [
      ['Forms', 'Give accurate details and only your own. Do not submit anyone else’s personal data or use the forms to send spam.'],
      ['Automated access', 'Do not overload the site or its APIs. Forms and the assistant are rate-limited.'],
      ['External links', 'Links to srmist.edu.in and other sites open pages we do not control. Their terms and privacy notices apply there.'],
      ['Names and images', 'SRMIST names, logos and photographs belong to SRMIST and the people shown. They appear here only to show how a redesign would look.'],
    ],
  },
  {
    id: 'liability',
    title: 'Limits and contact',
    items: [
      ['No warranty', 'The site is provided as is. We try to keep it accurate but cannot promise it is complete or always available.'],
      ['Questions or corrections', 'Use the report form with the category “Other” to point out a factual error, and we will fix it.'],
    ],
  },
]

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="The ground rules, in plain words."
      lede="What this site is, how far you can rely on it, and what we ask of you in return."
      sections={SECTIONS}
      note="This is an independent concept redesign. These terms describe the prototype and must be reviewed by the university’s legal team before launch. Last updated 8 November 2026."
    />
  )
}
