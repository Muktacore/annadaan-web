import { cn } from "@/lib/utils"
import Character from "./Character"

// A character on a soft sage tile – decorative only (aria-hidden, no pointer events).
export function Companion({ className, bare = false, ...props }) {
  if (bare) {
    return (
      <div aria-hidden="true" className={cn("pointer-events-none shrink-0 char-fade-in", className)}>
        <Character {...props} className="block h-auto w-full" />
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative aspect-[5/6] shrink-0 overflow-hidden rounded-[1.5rem] bg-[#DDE8D8] char-fade-in dark:bg-[#2B3B2F]",
        className
      )}
    >
      <div className="absolute -right-5 -top-5 size-16 rounded-full bg-white/45 dark:bg-white/5" />
      <div className="absolute -bottom-6 -left-6 size-16 rounded-full bg-[#C7D8C1]/60 dark:bg-white/5" />
      <Character {...props} className="absolute inset-0 size-full" />
    </div>
  )
}

// Larger variant used inside empty states.
export function EmptyCompanion({ prop = "box", className, ...props }) {
  return (
    <Companion
      role="empty"
      prop={prop}
      className={cn("w-[clamp(120px,34vw,164px)]", className)}
      expression="encouraging"
      {...props}
    />
  )
}
