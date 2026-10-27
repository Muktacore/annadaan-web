import { NavLink, Link } from "react-router-dom"
import { House, MapPin, Plus, HandHeart, User } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_SNAPPY, SPRING_BOUNCY } from "@/lib/motion"

const item = ({ isActive }) =>
  cn(
    "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
    isActive ? "text-primary" : "text-muted-foreground"
  )

// Icon with a soft pill that glides between tabs (shared layoutId).
function Tab({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} className={item}>
      {({ isActive }) => (
        <>
          <span className="relative flex h-7 w-14 items-center justify-center">
            {isActive && (
              <motion.span
                layoutId="bottomnav-pill"
                className="absolute inset-0 rounded-full bg-primary/15"
                transition={SPRING_SNAPPY}
              />
            )}
            <motion.span
              className="relative"
              animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
              whileTap={{ scale: 0.88 }}
              transition={SPRING_SNAPPY}
            >
              <Icon className="size-5" />
            </motion.span>
          </span>
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function BottomNav() {
  return (
    <nav className="flex items-center border-t bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <Tab to="/home" icon={House} label="Home" />
      <Tab to="/map" icon={MapPin} label="Map" />

      <div className="flex flex-1 justify-center">
        <motion.div whileTap={{ scale: 0.9 }} transition={SPRING_BOUNCY} className="-mt-6">
          <Link
            to="/donate"
            aria-label="Donate food"
            className="flex size-14 items-center justify-center rounded-full bg-clay text-clay-foreground shadow-lg"
          >
            <Plus className="size-7" />
          </Link>
        </motion.div>
      </div>

      <Tab to="/requests" icon={HandHeart} label="Requests" />
      <Tab to="/profile" icon={User} label="Profile" />
    </nav>
  )
}
