import { ShieldCheck, Clock, TriangleAlert } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_SOFT } from "@/lib/motion"

const CONFIG = {
  safe: { label: "Safe", icon: ShieldCheck, cls: "bg-status-safe-soft text-status-safe" },
  consume_soon: { label: "Consume soon", icon: Clock, cls: "bg-status-soon-soft text-status-soon" },
  unsafe: { label: "Unsafe", icon: TriangleAlert, cls: "bg-status-unsafe-soft text-status-unsafe" },
}

export default function FreshnessBadge({ label, compact = false, className }) {
  const c = CONFIG[label] ?? CONFIG.safe
  const Icon = c.icon
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_SOFT}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1 rounded-full font-semibold",
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-sm",
        c.cls,
        className
      )}
    >
      <Icon className={compact ? "size-3" : "size-4"} />
      {c.label}
      {/* Only "consume soon" gets a pulse — it's the one that needs attention.
          Safe / unsafe stay calm. */}
      {label === "consume_soon" && (
        <span
          aria-hidden="true"
          className="soft-pulse absolute -right-0.5 -top-0.5 size-2 rounded-full bg-status-soon"
        />
      )}
    </motion.span>
  )
}
