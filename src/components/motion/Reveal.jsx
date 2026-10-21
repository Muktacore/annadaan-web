import { motion } from "motion/react"
import { fadeUp, staggerParent, staggerItem } from "@/lib/motion"

/**
 * Reveal — fade + rise one block.
 *   <Reveal delay={0.1}>…</Reveal>
 *   <Reveal inView>…</Reveal>          // animates when scrolled into view
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user">.
 */
export function Reveal({ children, delay = 0, inView = false, className, as = "div" }) {
  const Comp = motion[as] ?? motion.div
  const trigger = inView
    ? { whileInView: "visible", viewport: { once: true, margin: "0px 0px -40px 0px" } }
    : { animate: "visible" }

  return (
    <Comp
      variants={fadeUp}
      initial="hidden"
      custom={delay}
      className={className}
      {...trigger}
    >
      {children}
    </Comp>
  )
}

/**
 * Stagger + StaggerItem — children enter one after another.
 *   <Stagger className="grid gap-3">
 *     {items.map(i => <StaggerItem key={i.id}>…</StaggerItem>)}
 *   </Stagger>
 */
export function Stagger({ children, className, stagger = 0.06, delay = 0, inView = false }) {
  const trigger = inView
    ? { whileInView: "visible", viewport: { once: true, margin: "0px 0px -40px 0px" } }
    : { animate: "visible" }

  return (
    <motion.div
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      className={className}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
