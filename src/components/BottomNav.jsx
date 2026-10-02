import { NavLink, Link } from "react-router-dom"
import { House, MapPin, Plus, HandHeart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const item = ({ isActive }) =>
  cn(
    "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
    isActive ? "text-primary" : "text-muted-foreground"
  )

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 flex items-center border-t bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <NavLink to="/home" className={item}><House className="size-5" /> Home</NavLink>
      <NavLink to="/map" className={item}><MapPin className="size-5" /> Map</NavLink>

      <div className="flex flex-1 justify-center">
        <Link
          to="/donate"
          aria-label="Donate food"
          className="-mt-6 flex size-14 items-center justify-center rounded-full bg-clay text-clay-foreground shadow-lg transition-transform active:scale-95"
        >
          <Plus className="size-7" />
        </Link>
      </div>

      <NavLink to="/requests" className={item}><HandHeart className="size-5" /> Requests</NavLink>
      <NavLink to="/profile" className={item}><User className="size-5" /> Profile</NavLink>
    </nav>
  )
}