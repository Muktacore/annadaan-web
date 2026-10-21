import { Skeleton } from "@/components/ui/skeleton"

// Same footprint as <DonationCard /> so the layout doesn't jump when data arrives.
export default function DonationCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border bg-card p-4 shadow-sm" role="status" aria-label="Loading donation">
      <Skeleton className="size-14 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  )
}
