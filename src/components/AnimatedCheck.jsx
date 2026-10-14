import { motion, useReducedMotion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

// A check mark that draws itself. Inherits color from the parent (currentColor),
// so it works on brand-colored circles and pills. Skips the drawing when the
// person prefers reduced motion.
export default function AnimatedCheck({ className = "size-5", delay = 0.1 }) {
  const reduce = useReducedMotion()

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay, ease: EASE_OUT }}
      />
    </svg>
  )
}
