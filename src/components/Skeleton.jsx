import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

// Loading placeholders in the app's warm tones. The shimmer is a soft highlight
// that slides across (transform only) and is switched off for reduced motion.

const SHIMMER = {
  background:
    "linear-gradient(90deg, transparent, color-mix(in srgb, var(--card) 75%, transparent), transparent)",
}

export function Skeleton({ className }) {
  const reduce = useReducedMotion()
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", className)} aria-hidden="true">
      {!reduce && (
        <motion.div
          className="absolute inset-0"
          style={SHIMMER}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.4, ease: "linear", repeat: Infinity, repeatDelay: 0.2 }}
        />
      )}
    </div>
  )
}

function Wrap({ children, label = "Loading" }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      {children}
    </div>
  )
}

// Same footprint as DonationCard so the layout does not jump when data arrives.
export function DonationCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border bg-card p-4 shadow-sm">
      <Skeleton className="size-14 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

export function DonationListSkeleton({ count = 4, className = "space-y-3" }) {
  return (
    <Wrap label="Loading donations">
      <div className={className}>
        {Array.from({ length: count }, (_, i) => (
          <DonationCardSkeleton key={i} />
        ))}
      </div>
    </Wrap>
  )
}

export function StatTileSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border bg-card p-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  )
}

// Mirrors the DonationDetail two-column layout.
export function DonationDetailSkeleton() {
  return (
    <Wrap label="Loading donation">
      <div className="grid gap-5 px-5 pt-2 pb-6 md:grid-cols-2 md:gap-8 md:px-0">
        <div className="space-y-5">
          <Skeleton className="h-44 rounded-3xl md:h-72" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <StatTileSkeleton key={i} />
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-3xl border bg-card p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </Wrap>
  )
}
