import { useEffect } from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

// Circular confidence meter: the ring sweeps round while the number counts up.
// Brand olive only (text-primary on a text-muted track) -- never the freshness
// colors. With reduced motion it simply shows the final value.
export default function ConfidenceRing({ value = 0, size = 88, stroke = 8, className = "" }) {
  const score = Math.min(1, Math.max(0, Number(value) || 0))
  const reduce = useReducedMotion()
  const count = useMotionValue(reduce ? score * 100 : 0)
  const label = useTransform(count, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    if (reduce) {
      count.set(score * 100)
      return undefined
    }
    const controls = animate(count, score * 100, { duration: 0.8, delay: 0.15, ease: EASE_OUT })
    return () => controls.stop()
  }, [score, reduce, count])

  const r = (size - stroke) / 2
  const c = size / 2

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Confidence ${Math.round(score * 100)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-primary"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: score, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
        />
      </svg>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums"
      >
        {label}
      </motion.span>
    </div>
  )
}
