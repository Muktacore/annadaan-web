import { AnimatePresence, motion } from "motion/react"
import { useLocation, useOutlet } from "react-router-dom"
import { EASE_OUT } from "@/lib/motion"

// Direction hints keep your "give / receive" idea — but as a gentle nudge,
// not a big slide. Giving moves in from the right, receiving from the left,
// everything else just rises a touch.
const NUDGE = 14

function getVariant(pathname) {
  if (pathname === "/donate" || pathname === "/history") {
    return { initial: { opacity: 0, x: NUDGE }, exit: { opacity: 0, x: -NUDGE / 2 } }
  }
  if (pathname === "/map" || pathname.startsWith("/requests")) {
    return { initial: { opacity: 0, x: -NUDGE }, exit: { opacity: 0, x: NUDGE / 2 } }
  }
  return { initial: { opacity: 0, y: 10 }, exit: { opacity: 0, y: -6 } }
}

/**
 * Animates between routes inside <MainLayout />.
 * useOutlet() (instead of <Outlet />) freezes the OLD page while it fades out,
 * otherwise the new page would flash in during the exit animation.
 */
export default function PageTransition() {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const v = getVariant(pathname)

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => window.scrollTo({ top: 0, left: 0 })}
    >
      <motion.div
        key={pathname}
        className="overflow-x-clip"
        initial={v.initial}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ ...v.exit, transition: { duration: 0.12, ease: "easeIn" } }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
