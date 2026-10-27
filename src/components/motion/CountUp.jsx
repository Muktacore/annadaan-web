import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

/**
 * Numbers that count up once when they scroll into view.
 *   <CountUp value={128} />            → 128
 *   <CountUp value={64} suffix=" kg" /> → 64 kg
 */
export default function CountUp({ value, suffix = "", duration = 1.1, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    // reduced motion: render() already shows the final value, nothing to animate
    if (!inView || reduce) return
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduce, value, duration])

  return (
    <span ref={ref} className={className}>
      {reduce ? value : n}
      {suffix}
    </span>
  )
}
