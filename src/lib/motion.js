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
}
