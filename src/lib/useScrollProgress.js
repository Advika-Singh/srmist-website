import { useEffect, useRef, useState } from 'react'
import { clamp01 } from './motion.js'

/**
 * Calls `onProgress(p)` every frame while `ref`'s element scrolls through its pinned length (p goes 0 to 1),
 * with a frame-rate independent ease so the motion glides toward where you scrolled.
 * It does not re-render React: callers set CSS variables or styles directly, which keeps scrolling smooth.
 * Pass `enabled = false` to switch it off (for the plain fallback layout).
 */
export function useScrollProgress(ref, onProgress, enabled = true) {
  const cb = useRef(onProgress)
  cb.current = onProgress

  useEffect(() => {
    if (!enabled) return
    let target = 0
    let current = 0
    let raf = 0
    let prevT = 0

    const measure = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      target = total > 0 ? clamp01(-r.top / total) : 0
    }
    const frame = (now) => {
      const dt = prevT ? Math.min(100, now - prevT) : 16
      prevT = now
      current += (target - current) * (1 - Math.exp(-dt / 110))
      if (Math.abs(target - current) < 0.0004) current = target
      cb.current(current)
      if (current !== target) raf = requestAnimationFrame(frame)
      else {
        raf = 0
        prevT = 0
      }
    }
    const kick = () => {
      measure()
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', kick)
      cancelAnimationFrame(raf)
    }
  }, [ref, enabled])
}

/** True when pinned and 3D moments should run (same gate as the home page corridor). */
export const MOTION_QUERY = '(min-width: 640px) and (min-height: 480px) and (prefers-reduced-motion: no-preference)'


/** React hook: true while pinned and 3D moments are allowed (wide, tall screen, no reduced-motion request). */
export function useMotionOk() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(MOTION_QUERY)
    const update = () => setOk(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return ok
}
