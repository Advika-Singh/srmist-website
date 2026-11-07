import ScrollTriplet from './ScrollTriplet.jsx'
import { useMotionOk } from './lib/useScrollProgress.js'
import { LINK } from './shared.jsx'
import PhotoCorridor from './ui/immersive/PhotoCorridor.jsx'

/**
 * "Learn · Leap · Lead" as a scroll-driven 3D corridor, after the Melius landing page: photos line both walls
 * and fly past the camera as you scroll, while the headline stays on top and its word changes.
 * Wide, tall screens that allow motion get the corridor; phones, short screens and reduced-motion get the
 * plain stacked rows (ScrollTriplet) so nothing is lost.
 */
const STAGES = [
  {
    word: 'Learn',
    title: 'Learn across every discipline.',
    text: 'Engineering, medicine, law, management, science, agriculture, architecture and hotel management: eight fields of study on six campuses.',
    href: LINK.academics,
    cta: 'Explore academics',
  },
  {
    word: 'Leap',
    title: 'Leap beyond the classroom.',
    text: 'More than 200 students are sponsored abroad every year to 35+ partner universities, with a semester abroad programme and a global immersion programme.',
    href: LINK.international,
    cta: 'Go global',
  },
  {
    word: 'Lead',
    title: 'Lead what comes next.',
    text: '980+ companies visited in 2023–24 with a highest package of 52 LPA, and research that has produced 920+ patents and 47,000+ publications.',
    href: LINK.placements,
    cta: 'See the outcomes',
  },
]

const PHOTOS = [
  '/srmist/campus-main-building.jpg',
  '/srmist/students.jpg',
  '/srmist/tech-park.jpg',
  '/srmist/labs.jpg',
  '/srmist/hero.webp',
  '/srmist/sports.jpg',
  '/srmist/library.jpg',
  '/srmist/admission-india.jpg',
  '/srmist/research.jpg',
]

export default function ScrollTunnel({ style, startBg = 'var(--blue)', endBg = 'var(--blue)' }) {
  const motionOk = useMotionOk()
  if (!motionOk) return <ScrollTriplet style={style} />
  return <PhotoCorridor stages={STAGES} photos={PHOTOS} startBg={startBg} endBg={endBg} style={style} label="Learn · Leap · Lead" />
}
