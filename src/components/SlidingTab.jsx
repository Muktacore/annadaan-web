import { motion } from "motion/react"
import { TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { SPRING_SNAPPY } from "@/lib/motion"

// Tab trigger with a green pill that glides between tabs (shared layoutId).
// Parent <Tabs> must be controlled so it can pass `active`.
export default function SlidingTab({ value, active, layoutId, pillClassName, className, children }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative rounded-xl bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent dark:data-[state=active]:text-[#142319]",
        className
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          transition={SPRING_SNAPPY}
          className={cn("absolute inset-0 rounded-xl shadow-sm", pillClassName)}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </TabsTrigger>
  )
}
