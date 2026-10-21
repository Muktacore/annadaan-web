import { cn } from "@/lib/utils"

// Loading placeholder with a soft shimmer (see .skeleton in index.css).
export function Skeleton({ className, ...props }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xl", className)} {...props} />
}
