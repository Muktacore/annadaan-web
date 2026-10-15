import { useEffect } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

// A number that counts up to `value` and glides to new values when live data
// changes. Reduced motion: shows the final number immediately.
export default function CountUp({ value = 0, duration = 0.9, className = "" }) {
  const reduce = useReducedMotion()
  const target = Number.isFinite(Number(value)) ? Number(value) : 0
  const mv = useMotionValue(reduce ? target : 0)
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (reduce) {
      mv.set(target)
      return undefined
    }
    const controls = animate(mv, target, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [target, reduce, duration, mv])

  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>
}
