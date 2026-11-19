import { useMemo } from 'react'
import { DEPARTMENTS, FACULTIES } from '../../data/departments.js'
import { EVENTS } from '../../data/events.js'
import { formatRange, photoFor, upcoming as upcomingEvents } from '../../lib/events.js'
import { NIRF_RANKS, PLACEMENT_STATS, RANK_STATS } from '../../data/rankings.js'
import { ABROAD, EXAMS, FEES } from '../../data/students.js'
import { useMotionOk } from '../../lib/useScrollProgress.js'
import AlphaRail from './AlphaRail.jsx'
import { CountBand, Marquee } from './Bands.jsx'
import FacilityCollage from './FacilityCollage.jsx'
import IrisStory from './IrisStory.jsx'
import HorizontalRail from './HorizontalRail.jsx'
import PhotoCorridor from './PhotoCorridor.jsx'
import Stepper from './Stepper.jsx'
import StickyStory from './StickyStory.jsx'

// Turns a moment's `source` into the real content for this page. Nothing is written here that is not on the site or its data files.

// Real SRMIST photos from /public/srmist, cropped per facility. Swap a src when a better photo of that exact place is added.
const FACILITIES = [
  { src: '/srmist/labs.webp', pos: '50% 35%', ratio: 1.54, name: 'Research laboratories', kicker: 'Laboratories', text: 'Hands-on instrument labs where students and researchers work side by side.' },
  { src: '/srmist/research.webp', pos: '50% 40%', ratio: 1.5, name: 'Research centres', kicker: 'Research centres', text: 'Shared infrastructure for nanotechnology, medical research and high-performance computing.' },
  { src: '/srmist/tech-park.webp', pos: '50% 50%', ratio: 1.25, name: 'SRM Tech Park', kicker: 'Tech Park', text: 'Industry, startups and student teams under one roof.' },
  { src: '/srmist/campus-main-building.webp', pos: '50% 60%', ratio: 1.5, name: 'Innovation and incubation', kicker: 'Innovation', text: 'Mentors, makerspaces and incubation for university ideas.' },
  { src: '/srmist/library.webp', pos: '50% 50%', ratio: 2.2, name: 'Central library', kicker: 'Library', text: 'Reading rooms, collections and digital resources open to every student.' },
  { src: '/srmist/students.webp', pos: '50% 40%', ratio: 1.6, name: 'Learning together', kicker: 'Students', text: 'Classrooms, studios and project spaces built for collaboration.' },
  { src: '/srmist/sports.webp', pos: '50% 40%', ratio: 1.5, name: 'Sports and fitness', kicker: 'Sports', text: 'Grounds and courts for teams, training and play.' },
  { src: '/srmist/campus-lakeview.webp', pos: '50% 50%', ratio: 1.5, name: 'The campus itself', kicker: 'Campus', text: 'Green, walkable and open from the lakeside to the main building.' },
]

const IRIS_PHOTOS = [
  { src: '/srmist/campus-lakeview.webp', pos: '50% 55%' },
  { src: '/srmist/students.webp', pos: '50% 40%' },
  { src: '/srmist/sports.webp', pos: '50% 40%' },
]

const rankingStages = () => [
  { kicker: 'NAAC', title: 'NAAC grade', text: 'Fourth accreditation cycle, valid to 2031.', big: RANK_STATS[0][0] },
  { kicker: 'NIRF 2025', title: 'NIRF University', text: 'Rank in the NIRF 2025 University category.', big: `#${RANK_STATS[1][0]}` },
  ...NIRF_RANKS.map(([n, label]) => ({ kicker: 'NIRF 2025', title: `NIRF ${label}`, text: `Rank in the NIRF 2025 ${label} category, as announced by SRMIST.`, big: `#${n}` })),
]

const SCHOLARSHIP_LINKS = [
  [[FEES[2][0], FEES[2][1]], [FEES[3][0], FEES[3][1]]],
  [[FEES[2][0], FEES[2][1]]],
  [[FEES[1][0], FEES[1][1]], [FEES[3][0], FEES[3][1]]],
]

export default function Moments({ slug, page, kit }) {
  const motionOk = useMotionOk()
  const blocks = page.blocks
  const content = useMemo(
    () => ({
      storyBlocks: blocks.map((b) => ({ kicker: b.n, title: b.h3, text: b.p, items: b.items, big: b.n })),
      corridorBlocks: blocks.map((b) => ({ word: b.h3.split(' ')[0], title: b.h3, text: `${b.p} ${b.items.join(' · ')}.` })),
      words: blocks.flatMap((b) => b.items),
    }),
    [blocks],
  )

  return kit.moments.map((m, i) => {
    const key = `${slug}-${m.type}-${i}`
    switch (m.type) {
      case 'story':
        return <StickyStory key={key} heading={page.intro.h2} stages={m.source === 'rankings' ? rankingStages() : content.storyBlocks} startBg="var(--ink)" endBg="var(--paper)" />
      case 'corridor':
        return motionOk ? (
          <PhotoCorridor key={key} stages={content.corridorBlocks} photos={m.photos} startBg="var(--ink)" endBg="var(--paper)" />
        ) : (
          <StickyStory key={key} heading={page.intro.h2} stages={content.storyBlocks} />
        )
      case 'facilities':
        return motionOk ? (
          <FacilityCollage key={key} heading="Where ideas get built." items={FACILITIES} startBg="var(--ink)" endBg="var(--paper)" />
        ) : (
          <StickyStory key={key} heading={page.intro.h2} stages={content.storyBlocks} />
        )
      case 'iris':
        return motionOk ? (
          <IrisStory key={key} stages={content.corridorBlocks} photos={IRIS_PHOTOS} startBg="var(--ink)" endBg="var(--paper)" />
        ) : (
          <StickyStory key={key} heading={page.intro.h2} stages={content.storyBlocks} />
        )
      case 'countband': {
        const items = m.source === 'placementStats' ? PLACEMENT_STATS : m.source === 'rankStats' ? RANK_STATS : page.stats
        return <CountBand key={key} items={items} tone={i % 2 ? 'ink' : 'blue'} />
      }
      case 'marquee':
        return <Marquee key={key} words={content.words} caption="How SRMIST gets you ready" />
      case 'rail': {
        if (m.source === 'abroad') {
          const items = [
            ...ABROAD.map(([title, href]) => ({ title, href, meta: 'Study abroad', cta: 'Learn more' })),
            { title: 'Global immersion programme', meta: 'Study abroad', href: 'https://www.srmist.edu.in/ir/srm-global-immersion-program/', cta: 'Learn more' },
            { title: 'Come to SRM', meta: 'International students', text: blocks[0].items.join(' · '), href: 'https://www.srmist.edu.in/admission-international/', cta: 'International admissions' },
          ]
          return <HorizontalRail key={key} heading="Go beyond SRM" items={items} />
        }
        if (m.source === 'events') {
          // the next events from the official list (data/events.js), then two cards that point at what the list cannot hold
          const items = [
            ...upcomingEvents(EVENTS).slice(0, 8).map((e, i) => ({ meta: formatRange(e.start, e.end), title: e.title, href: e.href, cta: 'Event page', ...photoFor(e, i) })),
            { meta: 'Student-led', title: 'Milan', text: 'The national-level cultural festival; the 2026 edition is the 18th. Dates are on the official page.', href: 'https://www.srmist.edu.in/events/milan-26/', cta: 'Milan page', img: '/srmist/admission-india.webp', pos: '50% 35%' },
            { meta: 'Every date', title: 'The full calendar', text: 'All upcoming events by month, each with a calendar file.', href: '/events/calendar', cta: 'Open the calendar', img: '/srmist/campus-panorama.webp', pos: '50% 50%' },
          ]
          return <HorizontalRail key={key} heading="Coming up" items={items} />
        }
        const items = blocks.flatMap((b) => b.items.map((t) => ({ meta: b.h3, title: t, text: b.p, ...(t === 'Alumni portal' ? { href: 'https://alumni.srmist.edu.in/', cta: 'Open the portal' } : {}) })))
        return <HorizontalRail key={key} heading="Stay part of SRM" items={items} />
      }
      case 'alpha':
        return <AlphaRail key={key} items={DEPARTMENTS} faculties={FACULTIES} />
      case 'stepper':
        if (m.source === 'exams') {
          const steps = EXAMS.map((g) => ({ title: g.title, links: g.links }))
          return <Stepper key={key} heading="Find what you need" intro="Pick a stage; every link goes to the official examinations page or portal." steps={steps} />
        }
        return (
          <Stepper
            key={key}
            heading="Find your scheme"
            intro="Choose a path. We list the kinds of support and link to the official documents; eligibility is decided by SRMIST."
            steps={blocks.map((b, j) => ({ title: b.h3, text: b.p, items: b.items, links: SCHOLARSHIP_LINKS[j] }))}
          />
        )
      default:
        return null
    }
  })
}
