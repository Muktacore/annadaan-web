import { useLocation } from "react-router-dom"
import { motion } from "motion/react"
import Sidebar from "@/components/Sidebar"
import BottomNav from "@/components/BottomNav"
import PageTransition from "@/components/PageTransition"
import { EASE_OUT } from "@/lib/motion"

// "Focus" pages hide the bottom nav on mobile (donate, donation detail).
// On laptop the sidebar is always there.
// This is derived from the URL so ONE layout stays mounted across every page —
// that's what lets the sidebar highlight glide instead of re-mounting.
const isFocusPath = (p) => p === "/donate" || p.startsWith("/donation/")

export default function MainLayout() {
  const { pathname } = useLocation()
  const focus = isFocusPath(pathname)

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 md:px-6 lg:px-8">
          <PageTransition />
        </main>
        {!focus && (
          <motion.div
            className="sticky bottom-0 z-30 md:hidden"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <BottomNav />
          </motion.div>
        )}
      </div>
    </div>
  )
}
