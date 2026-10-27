<<<<<<< HEAD
// Shared motion tokens for AnnaDaan. Everything animated in the app should pull
// its timing from here so the whole product moves the same way.
//
// Rules: 150-300 ms, soft ease-out or a low-bounce spring, transform/opacity
// only (plus SVG path drawing), brand colors only. Never use the freshness
// colors (safe / consume_soon / unsafe) for motion or for claim states.
// Reduced motion is handled once, by <MotionConfig reducedMotion="user"> in main.jsx.

export const DURATION = { fast: 0.15, base: 0.22, slow: 0.3 }

export const EASE_OUT = [0.22, 1, 0.36, 1]

export const SPRING = { type: "spring", stiffness: 260, damping: 28 }
export const SPRING_POP = { type: "spring", stiffness: 320, damping: 22 }

export const tween = (duration = DURATION.base) => ({ duration, ease: EASE_OUT })

// Page entering inside MainLayout. Enter-only: exit animations would need a
// snapshot of the outgoing route, which is not worth the complexity here.
export const pageEnter = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: tween(DURATION.base) },
}

// List items. The delay is capped so long lists never feel slow, and it lives
// inside `animate` so gestures such as whileTap are never delayed.
export const STAGGER = 0.04
export const MAX_STAGGER_ITEMS = 8

export const listItem = (index = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...tween(DURATION.slow),
      delay: Math.min(index, MAX_STAGGER_ITEMS) * STAGGER,
    },
  },
})

// Rows that appear and disappear live (a claim arriving, being accepted or
// cancelled). Use inside <AnimatePresence>; siblings glide into place.
export const liveRow = {
  layout: "position",
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { ...tween(DURATION.base), layout: SPRING },
}

// A small swap inside a row (button -> button -> pill). Use with
// <AnimatePresence mode="wait" initial={false}> and a key that changes.
export const swap = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: tween(DURATION.fast),
}

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: tween(DURATION.fast),
=======
// ─────────────────────────────────────────────────────────────
// AnnaDaan motion tokens — the single source of truth for timing.
// Every animation in the app should pull from here so the whole
// product "feels" consistent (same easing, same speed, same weight).
//
// Rule of thumb:  small UI feedback  → 0.15s
//                 elements entering   → 0.3 – 0.4s
//                 whole-page moves    → 0.3s max
// ─────────────────────────────────────────────────────────────

export const EASE_OUT = [0.22, 1, 0.36, 1] // soft, confident deceleration

export const DUR = { fast: 0.15, base: 0.3, slow: 0.5 }

export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 24 }
export const SPRING_SNAPPY = { type: "spring", stiffness: 420, damping: 32 }
export const SPRING_BOUNCY = { type: "spring", stiffness: 300, damping: 15 }

// Fade + rise. Use with  variants={fadeUp} initial="hidden" animate="visible" custom={delaySeconds}
export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: EASE_OUT },
  }),
}

// Parent + child pair for lists / grids.
export const staggerParent = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
}

// Gentle "pop" for success states / badges.
export const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: SPRING_BOUNCY },
>>>>>>> mukta-on-main
}
