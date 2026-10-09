import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { MapPin, Clock } from "lucide-react"
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import { CATEGORY_LABELS, formatElapsed } from "@/lib/mockData"

export default function DonationCard({ donation: d, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={`/donation/${d.id}`}
        className="flex items-center gap-3 rounded-3xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          {d.foodPhotoUrl ? (
            <img src={d.foodPhotoUrl} alt="" className="size-full rounded-2xl object-cover" />
          ) : (
            <CategoryIcon category={d.foodCategory} className="size-7" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-semibold">
            {CATEGORY_LABELS[d.foodCategory]} · {d.quantity} {d.unit}
          </p>
          <p className="truncate text-sm text-muted-foreground">{d.donorName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {d.distanceKm != null ? `${d.distanceKm} km` : "Nearby"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatElapsed(d.cookedAt)}
            </span>
          </div>
        </div>
        {d.freshnessLabel && <FreshnessBadge label={d.freshnessLabel} compact />}
      </Link>
    </motion.div>
  )
}