import { useEffect, useRef, useState } from 'react'

/** "980+" counts from 0 to 980 and keeps the "+". Text like "A++" is shown as it is. Screen readers get the final value at once. */
export default function CountUp({ value, duration = 1500 }) {
  const m = String(value).match(/^(\D*)(\d[\d,]*)(.*)$/)
  const target = m ? Number(m[2].replace(/,/g, '')) : null
  const ref = useRef(null)
  const [n, setN] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (target == null || !el) return
    const still = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused')
    if (still() || typeof IntersectionObserver === 'undefined') return
    setN(0)
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / duration)
          setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, duration])

  if (target == null) return <span ref={ref}>{value}</span>
  const [, pre, , post] = m
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {pre}
        {n.toLocaleString('en-IN')}
        {post}
      </span>
    </span>
  )
}
