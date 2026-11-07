import { useRef } from 'react'
import { STORIES } from '../data/innovation.js'
import '../styles/innovation.css'
import StoryCard from './StoryCard.jsx'

/** Home-page strip of sourced student stories. Scrolled by hand (arrows, swipe or keyboard); it never moves on its own. */
export default function InnovationRail() {
  const track = useRef(null)
  const by = (dir) => track.current?.scrollBy({ left: dir * Math.min(360, track.current.clientWidth * 0.8), behavior: 'smooth' })
  return (
    <section className="in-rail" aria-labelledby="in-rail-h">
      <div className="in-rail-head">
        <div>
          <span className="eyebrow">Student innovation</span>
          <h2 id="in-rail-h">Built by students, in the news.</h2>
        </div>
        <div className="in-rail-ctl">
          <button type="button" aria-label="Previous stories" onClick={() => by(-1)}>
            ←
          </button>
          <button type="button" aria-label="Next stories" onClick={() => by(1)}>
            →
          </button>
        </div>
      </div>
      <div className="in-track" ref={track} tabIndex={0} role="region" aria-label="Student innovation stories">
        {STORIES.map((s) => (
          <StoryCard key={s.id} s={s} />
        ))}
      </div>
      <p className="in-rail-more">
        <a href="/innovation">See all student stories</a>
      </p>
    </section>
  )
}
