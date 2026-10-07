
import { NavLink, Link, useNavigate } from "react-router-dom"
import { House, MapPin, HandHeart, History, User, Plus, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser } from "@/lib/mockData"
import ThemeToggle from "@/components/ThemeToggle"
import { logOut } from "@/lib/auth"
import { logOut } from "@/lib/auth"

const base = "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors"
const idle = "text-muted-foreground hover:bg-accent hover:text-foreground"
const link = ({ isActive }) => cn(base, isActive ? "bg-primary text-primary-foreground" : idle)

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logOut()
    } catch (err) {
      console.error("Logout failed:", err)
    }
    navigate("/login")
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card p-5 md:flex">
      <Link to="/home" className="flex items-center gap-3 px-2 py-2">
        <img
          src="/images/annadaan-logo.png"
          alt="AnnaDaan logo"
          className="size-12 shrink-0 object-contain"
        />
        <span className="text-xl font-extrabold text-primary">
          AnnaDaan
        </span>
      </Link>

      <Link
        to="/donate"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-clay py-3 text-sm font-semibold text-clay-foreground shadow-md transition-transform hover:brightness-105 active:scale-95"
      >
        <Plus className="size-5" /> Donate food
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        <NavLink to="/home" className={link}><House className="size-5" /> Home</NavLink>
        <NavLink to="/map" className={link}><MapPin className="size-5" /> Map</NavLink>
        <NavLink to="/requests" className={link}><HandHeart className="size-5" /> My requests</NavLink>
        <NavLink to="/history" className={link}><History className="size-5" /> Donation history</NavLink>
        <NavLink to="/profile" className={link}><User className="size-5" /> Profile</NavLink>
      </nav>

      <div className="space-y-1 border-t pt-4">
        <p className="truncate px-4 pb-2 text-xs text-muted-foreground">
          {currentUser.email}
        </p>

        <ThemeToggle variant="row" className={cn(base, idle)} />

        <button
          onClick={handleLogout}
          className={cn(base, idle, "text-destructive hover:text-destructive")}
        >
          <LogOut className="size-5" /> Log out
        </button>
      </div>
    </aside>
  )
}