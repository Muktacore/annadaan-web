import { Link, useNavigate } from "react-router-dom"
import { Utensils, Leaf, Users, Plus, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import DonationCard from "@/components/DonationCard"
import ThemeToggle from "@/components/ThemeToggle"
import { donations, currentUser } from "@/lib/mockData"

const STATS = [
  { icon: Utensils, value: "128", label: "Meals shared" },
  { icon: Leaf, value: "64 kg", label: "Food saved" },
  { icon: Users, value: "23", label: "Donors nearby" },
]

export default function Home() {
  const navigate = useNavigate()
  const nearby = donations
    .filter((d) => d.status === "available")
    .sort((a, b) => a.distanceKm - b.distanceKm)

  return (
    <div className="space-y-6 px-5 pt-8 pb-6 md:space-y-8 md:px-0 md:pt-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Namaste,</p>
          <h1 className="text-2xl font-extrabold md:text-4xl">{currentUser.name.split(" ")[0]} 👋</h1>
        </div>
        <ThemeToggle className="md:hidden" />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:gap-6">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center rounded-3xl border bg-card p-3 text-center shadow-sm md:p-5">
              <Icon className="size-5 text-primary md:size-7" />
              <p className="mt-2 text-lg font-bold md:text-2xl">{value}</p>
              <p className="text-[11px] leading-tight text-muted-foreground md:text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-clay p-5 text-clay-foreground shadow-md md:p-8">
          <Sprout className="absolute -right-3 -bottom-3 size-28 opacity-20 md:size-44" />
          <p className="text-lg font-bold md:text-2xl">Become a donor</p>
          <p className="mt-1 max-w-sm text-sm opacity-90 md:text-base">
            Every plate you share keeps good food out of the bin and feeds someone nearby.
          </p>
          <Button className="mt-4 bg-card text-foreground hover:bg-card/90" onClick={() => navigate("/donate")}>
            <Plus /> Donate food
          </Button>
        </div>
      </div>

      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold md:text-xl">Nearby donations</h2>
          <Link to="/map" className="text-sm font-medium text-primary">View map</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {nearby.map((d, i) => (
            <DonationCard key={d.id} donation={d} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}