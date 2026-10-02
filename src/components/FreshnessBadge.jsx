import { ShieldCheck, Clock, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const CONFIG = {
  safe: { label: "Safe", icon: ShieldCheck, cls: "bg-status-safe-soft text-status-safe" },
  consume_soon: { label: "Consume soon", icon: Clock, cls: "bg-status-soon-soft text-status-soon" },
  unsafe: { label: "Unsafe", icon: TriangleAlert, cls: "bg-status-unsafe-soft text-status-unsafe" },
}

export default function FreshnessBadge({ label, compact = false, className }) {
  const c = CONFIG[label] ?? CONFIG.safe
  const Icon = c.icon
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold",
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-sm",
        c.cls,
        className
      )}
    >
      <Icon className={compact ? "size-3" : "size-4"} />
      {c.label}
    </span>
  )
}