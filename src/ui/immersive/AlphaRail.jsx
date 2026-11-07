import { useEffect, useMemo, useState } from 'react'
import { groupByLetter } from '../../lib/alpha.js'
import { ArrowUR } from '../../shared.jsx'

/** A to Z directory: a sticky letter rail that jumps to a group, follows the scroll, and a faculty filter. items: [{ name, href, faculty }] */
export default function AlphaRail({ items, faculties, heading = 'Departments A–Z' }) {
  const [faculty, setFaculty] = useState('All')
  const [active, setActive] = useState('A')
  const shown = useMemo(() => (faculty === 'All' ? items : items.filter((d) => d.faculty === faculty)), [items, faculty])
  const groups = useMemo(() => groupByLetter(shown), [shown])
  const have = new Set(groups.map((g) => g.letter))
  const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

  // follow the scroll: the active letter is the last group whose heading has passed the sticky bar
  useEffect(() => {
    const onScroll = () => {
      let cur = groups[0]?.letter
      for (const g of groups) {
        const el = document.getElementById(`al-${g.letter}`)
        if (el && el.getBoundingClientRect().top < 220) cur = g.letter
      }
      if (cur) setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [groups])

  // /departments#M
  useEffect(() => {
    const id = location.hash.slice(1)
    if (id && /^[A-Z#]$/i.test(id)) setTimeout(() => document.getElementById(`al-${id.toUpperCase()}`)?.scrollIntoView({ block: 'start' }), 300)
  }, [])

  const jump = (l) => document.getElementById(`al-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="al" aria-labelledby="al-h">
      <div className="al-head">
        <h2 id="al-h">{heading}</h2>
        <div className="al-filter" role="group" aria-label="Faculty">
          {['All', ...faculties].map((f) => (
            <button key={f} aria-pressed={faculty === f} className={faculty === f ? 'is-on' : ''} onClick={() => setFaculty(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="al-body">
        <nav className="al-letters" aria-label="Jump to letter">
          {letters.map((l) => (
            <button key={l} disabled={!have.has(l)} aria-current={active === l ? 'true' : undefined} className={active === l ? 'is-on' : ''} onClick={() => jump(l)}>
              {l}
            </button>
          ))}
        </nav>
        <div className="al-list">
          {groups.map((g) => (
            <section key={g.letter} id={`al-${g.letter}`} aria-label={`Departments starting with ${g.letter}`}>
              <h3>{g.letter}</h3>
              <ul>
                {g.items.map((d) => (
                  <li key={d.name}>
                    <a href={d.href} target="_blank" rel="noopener noreferrer">
                      <span>{d.name}</span>
                      <small>{d.faculty}</small>
                      <ArrowUR />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!groups.length && <p className="hs-missing">[No departments listed for this faculty yet]</p>}
        </div>
      </div>
    </section>
  )
}
