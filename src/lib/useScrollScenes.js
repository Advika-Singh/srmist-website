import { useEffect } from 'react'

/**
 * Scroll-linked motion for un-pinned sections of the landing page.
 * Every element with [data-sx] gets two CSS variables that glide toward where you scrolled:
 *   --sp  0 when its top reaches the bottom of the screen, 1 when its bottom leaves the top
 *   --sc  -1 well above the middle of the screen, 0 centred, 1 well below
 * and <html> gets --page-p (0..1 down the whole page). The page's CSS does the rest, only under `html.sx`,
 * so with motion off (or on small screens) nothing here runs and the layout stays plain.
 * No React re-renders: it writes CSS variables directly.
 */
export function useScrollScenes(enabled) {
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('sx')
    const state = new Map() // element -> { sp, sc, tsp, tsc }
    let raf = 0
    let prev = 0

    const clamp = (n, a, b) => Math.min(b, Math.max(a, n))
    const measure = () => {
      const vh = window.innerHeight
      document.querySelectorAll('[data-sx]').forEach((el) => {
        const r = el.getBoundingClientRect()
        const tsp = clamp((vh - r.top) / (vh + r.height), 0, 1)
        const tsc = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1)
        const s = state.get(el)
        if (s) {
          s.tsp = tsp
          s.tsc = tsc
        } else state.set(el, { sp: tsp, sc: tsc, tsp, tsc })
      })
      const max = root.scrollHeight - vh
      root.style.setProperty('--page-p', max > 0 ? clamp(window.scrollY / max, 0, 1).toFixed(4) : '0')
    }
    const frame = (now) => {
      const dt = prev ? Math.min(100, now - prev) : 16
      prev = now
      const k = 1 - Math.exp(-dt / 90) // frame-rate independent glide
      let moving = false
      state.forEach((s, el) => {
        if (!el.isConnected) return state.delete(el)
        s.sp += (s.tsp - s.sp) * k
        s.sc += (s.tsc - s.sc) * k
        if (Math.abs(s.tsp - s.sp) < 0.0005 && Math.abs(s.tsc - s.sc) < 0.0005) {
          s.sp = s.tsp
          s.sc = s.tsc
        } else moving = true
        el.style.setProperty('--sp', s.sp.toFixed(4))
        el.style.setProperty('--sc', s.sc.toFixed(4))
      })
      if (moving) raf = requestAnimationFrame(frame)
      else {
        raf = 0
        prev = 0
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
      root.classList.remove('sx')
      root.style.removeProperty('--page-p')
      state.forEach((_, el) => {
        el.style.removeProperty('--sp')
        el.style.removeProperty('--sc')
      })
    }
  }, [enabled])
}
