import { NavLink, Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import {
  House,
  MapPin,
  HandHeart,
  History,
  User,
  Plus,
  LogOut,
  Leaf,
  Info,
  CircleHelp,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import ThemeToggle from "@/components/ThemeToggle"
import { logOut } from "@/lib/auth"
import { SPRING_SNAPPY } from "@/lib/motion"

const base =
  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200"

const idle =
  "text-muted-foreground hover:bg-accent hover:text-foreground"

const link = ({ isActive }) =>
  cn(
    base,
    "group relative isolate",
    isActive ? "text-primary-foreground" : idle
  )

// One nav row. The green highlight is a shared-layout element, so it
// glides from the old item to the new one instead of just swapping.
function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} className={link}>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-pill"
              className="absolute inset-0 -z-10 rounded-2xl bg-primary shadow-sm"
              transition={SPRING_SNAPPY}
            />
          )}
          <Icon className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (err) {
      console.error("Logout failed:", err)
    }

    navigate("/login")
  }

  return (
    <aside className="annadaan-sidebar sticky top-0 hidden h-dvh w-[200px] shrink-0 flex-col overflow-hidden border-r bg-sidebar px-[14px] py-6 md:flex lg:w-[220px] lg:px-5">
      {/* Brand */}
      <Link
        to="/home"
        className="annadaan-sidebar__brand flex shrink-0 items-center gap-2.5 px-2 py-2"
      >
        <img
          src="/images/annadaan-logo.png"
          alt="AnnaDaan logo"
          className="size-9 shrink-0 object-contain"
        />

        <span className="text-lg font-extrabold tracking-tight text-primary lg:text-xl">
          AnnaDaan
        </span>
      </Link>

      {/* Primary action */}
      <Link
        to="/donate"
        className="annadaan-sidebar__donate mt-7 flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-clay px-3 py-3 text-sm font-bold text-clay-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:translate-y-0 active:scale-[0.98]"
      >
        <Plus className="size-5 shrink-0" />
        <span>Donate food</span>
      </Link>

      {/* Navigation */}
      <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pb-2 [scrollbar-width:none]">
        <NavItem to="/home" end icon={House} label="Home" />
        <NavItem to="/map" icon={MapPin} label="Map" />
        <NavItem to="/requests" icon={HandHeart} label="My requests" />
        <NavItem to="/history" icon={History} label="Donation history" />
        <NavItem to="/profile" icon={User} label="Profile" />
        <NavItem to="/about" icon={Info} label="About" />
        <NavItem to="/help" icon={CircleHelp} label="Help" />
      </nav>

      {/* Account controls */}
      <div className="annadaan-sidebar__account relative z-10 mt-4 shrink-0 space-y-1 border-t border-sidebar-border pt-4">
        <p
          title={user?.email || ""}
          className="truncate px-3 pb-2 text-center text-xs text-muted-foreground"
        >
          {user?.email}
        </p>

        <ThemeToggle
          variant="row"
          className={cn(
            base,
            "justify-start bg-sidebar-accent/70 text-sidebar-foreground hover:bg-sidebar-accent"
          )}
        />

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            base,
            "text-destructive hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          <LogOut className="size-5 shrink-0" />
          <span>Log out</span>
        </button>
      </div>

      {/* Decorative botanical accent */}
      <div
        className="annadaan-sidebar__botanical pointer-events-none absolute -bottom-9 -left-8 -z-0 opacity-30"
        aria-hidden="true"
      >
        <Leaf className="size-16 -rotate-45 text-sage" />
        <Leaf className="ml-7 -mt-5 size-12 rotate-12 text-primary" />
        <Leaf className="ml-1 -mt-3 size-10 rotate-[65deg] text-sage" />
      </div>
    </aside>
  )
}