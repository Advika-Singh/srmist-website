// Pure helpers shared by every scroll-driven moment (no React, no browser APIs, so Node can test them).

export const clamp01 = (n) => Math.min(1, Math.max(0, n))

/** Smoothstep: 0 below `a`, 1 above `b`, an eased curve between. */
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Progress inside a window of a longer progress: 0 before `start`, 1 after `end`. */
export const windowProgress = (p, start, end) => clamp01((p - start) / (end - start))

/** Which of `count` equal stages a 0..1 progress falls in (never overflows). */
export const stageIndex = (p, count) => (count <= 0 ? 0 : Math.min(count - 1, Math.floor(clamp01(p) * count * 0.999999)))
