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
}
