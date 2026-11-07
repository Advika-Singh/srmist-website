import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { INDEX } from '../data/search-index.js'
import { readHits, recordHit, search } from '../lib/search.js'

const TYPE_LABEL = { action: 'Do', page: 'Page', programme: 'Programme' }

export const openSearch = () => window.dispatchEvent(new Event('srm:search'))
export const askAssistant = (text = '') => window.dispatchEvent(new CustomEvent('srm:ask', { detail: text }))

/**
 * Cmd/Ctrl+K command palette. Understands typos ("scholarshp"), intent ("how much does it cost")
 * and learns from what this visitor opens. Anything it can't answer is handed to the AI assistant.
 */
export default function SmartSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const input = useRef(null)
  const opener = useRef(null)
  const listId = useId()

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement
      setQ('')
      setActive(0)
      setOpen(true)
    }
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        open ? setOpen(false) : show()
      } else if (e.key === '/' && !open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('srm:search', show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('srm:search', show)
    }
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.classList.toggle('palette-open', open)
    if (open) requestAnimationFrame(() => input.current?.focus())
    else opener.current?.focus?.()
  }, [open])

  const hits = useMemo(() => (open ? readHits() : {}), [open])
  const { results, corrected, suggestions } = useMemo(() => search(INDEX, q, hits), [q, hits])

  // The last row always hands the question to the assistant.
  const rows = useMemo(() => {
    const out = [...results]
    if (q.trim()) out.push({ type: 'ai', title: `Ask DAAS: “${q.trim()}”`, hint: 'Get an answer with links, cards and forms', href: '#ask' })
    return out
  }, [results, q])

  useEffect(() => setActive(0), [q])

  const run = (row) => {
    if (!row) return
    recordHit(row.href)
    setOpen(false)
    if (row.type === 'ai') return askAssistant(q.trim())
    if (row.href === '#ask') return askAssistant()
    if (row.href === '#callback') return askAssistant('Please arrange a call back from a counsellor')
    if (/^https?:|\.html([?#]|$)/.test(row.href)) return void (window.location.href = row.href)
    navigate(row.href)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % rows.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + rows.length) % rows.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(rows[active])
    } else if (e.key === 'Tab') {
      // keep focus inside the dialog
      e.preventDefault()
      input.current?.focus()
    }
  }

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  if (!open) return null
  return (
    <div className="palette" role="dialog" aria-modal="true" aria-label="Search the SRMIST website" onKeyDown={onKeyDown}>
      <button className="palette-scrim" aria-label="Close search" tabIndex={-1} onClick={() => setOpen(false)} />
      <div className="palette-box">
        <div className="palette-input">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={`${listId}-${active}`}
            aria-autocomplete="list"
            aria-label="Search programmes, fees, hostels, scholarships"
            placeholder="Try “how much does B.Tech cost” or “hostle”"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            maxLength={120}
          />
          <kbd aria-hidden="true">Esc</kbd>
        </div>

        {corrected && (
          <p className="palette-fix">
            Showing results for <button onClick={() => setQ(corrected)}>{corrected}</button>
          </p>
        )}
        <p className="palette-label" id={`${listId}-label`}>
          {suggestions ? (Object.keys(hits).length ? 'Suggested for you' : 'Quick actions') : 'Results'}
        </p>
        <ul className="palette-list" id={listId} role="listbox" aria-labelledby={`${listId}-label`}>
          {rows.map((r, i) => (
            <li
              key={r.type + r.href + r.title}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`${i === active ? 'on' : ''} ${r.type === 'ai' ? 'ai' : ''}`}
              onMouseMove={() => setActive(i)}
              onClick={() => run(r)}
            >
              <span className={`palette-type t-${r.type}`}>{r.type === 'ai' ? 'AI' : TYPE_LABEL[r.type]}</span>
              <span className="palette-text">
                <b>{r.title}</b>
                {r.hint && <small>{r.hint}</small>}
              </span>
              <span className="palette-go" aria-hidden="true">↵</span>
            </li>
          ))}
        </ul>
        <div className="palette-foot" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Ctrl</kbd>/<kbd>⌘</kbd><kbd>K</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
