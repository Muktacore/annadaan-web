import { useEffect, useState } from "react"

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)

// Counter that increments whenever `value` changes after the first render.
// Used to trigger one-off tilts / nods without re-running animations on every render.
export function usePulse(value) {
  const [state, setState] = useState({ prev: value, count: 0 })
  if (state.prev !== value) setState({ prev: value, count: state.count + 1 })
  return state.count
}

// Briefly glance toward one or more targets (module-level constant arrays), then return to idle.
export function useGlance(targets, { delay = 1400, hold = 1800, every = 0, enabled = true } = {}) {
  const [gaze, setGaze] = useState(null)
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return undefined
    let t1
    let t2
    let i = 0
    let cancelled = false
    const run = () => {
      if (cancelled) return
      setGaze(targets[i % targets.length])
      i += 1
      t1 = setTimeout(() => {
        setGaze(null)
        if (every) t2 = setTimeout(run, every)
      }, hold)
    }
    t2 = setTimeout(run, delay)
    return () => {
      cancelled = true
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [enabled, targets, delay, hold, every])
  return gaze
}

// One-shot counter (e.g. a single wave shortly after the page opens).
export function useOnceAfter(delay = 700) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const t = setTimeout(() => setN(1), delay)
    return () => clearTimeout(t)
  }, [delay])
  return n
}

// Counts focus/change interactions inside the <form> that contains `rootRef`.
export function useFormReaction(rootRef) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const form = rootRef.current?.closest("form")
    if (!form) return undefined
    let last = 0
    const onEvt = () => {
      const now = Date.now()
      if (now - last < 900) return
      last = now
      setCount((c) => c + 1)
    }
    form.addEventListener("focusin", onEvt)
    form.addEventListener("change", onEvt)
    return () => {
      form.removeEventListener("focusin", onEvt)
      form.removeEventListener("change", onEvt)
    }
  }, [rootRef])
  return count
}

// Counter that increments only when a *previously known* signature changes
// (i.e. a genuine update – not the first data load).
export function useUpdateNod(signature) {
  const [state, setState] = useState({ prev: signature, count: 0 })
  if (state.prev !== signature) {
    setState({ prev: signature, count: state.prev ? state.count + 1 : state.count })
  }
  return state.count
}
