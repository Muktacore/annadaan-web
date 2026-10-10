import PageHeader from "@/components/PageHeader"
import { useMemo } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  History,
  Leaf,
  PackageCheck,
} from "lucide-react"

import CategoryIcon from "@/components/CategoryIcon"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { receivedHistory, CATEGORY_LABELS } from "@/lib/mockData"
import { useAuth } from "@/context/AuthContext"
import { useMyDonations } from "@/hooks/useMyDonations"

function HistoryRow({ item, type }) {
  const isDonation = type === "donated"
  const isExpired = item.status === "expired"

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-3xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isExpired
          ? "border-border"
          : "border-[#D8DDCC] hover:border-[#91A98D]"
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl",
          isExpired
            ? "bg-muted text-muted-foreground"
            : "bg-[#E3EBD9] text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]"
        )}
      >
        <CategoryIcon
          category={item.foodCategory}
          className="size-6"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold">
          {CATEGORY_LABELS[item.foodCategory] ?? "Food donation"}
        </p>

        <p className="text-sm text-muted-foreground">
          {item.quantity} {item.unit}
          {isDonation ? " · Donated" : ` · From ${item.from}`}
        </p>

        <p className="text-xs text-muted-foreground">
          {item.date}
        </p>
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          isExpired
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isExpired ? (
          <Clock3 className="size-3" />
        ) : (
          <CheckCircle2 className="size-3" />
        )}

        {isExpired
          ? "Expired"
          : isDonation
            ? (item.status === "claimed" ? "Completed" : "Available")
            : "Received"}
      </span>
    </article>
  )
}

function EmptyHistory({ received = false }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#D8DDCC] bg-card/70 px-6 py-12 text-center dark:border-[#34483A]">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E3EBD9] text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
        <History className="size-7" />
      </div>

      <div>
        <p className="font-semibold">Nothing here yet</p>

        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {received
            ? "Food you receive through AnnaDaan will appear here."
            : "Your completed food donations will appear here."}
        </p>
      </div>
    </div>
  )
}

export default function DonationHistory() {
  return (
    <>
      <PageHeader title="History" />
      <HistoryContent />
    </>
  )
}

function HistoryContent() {
  const { user } = useAuth()
  const { donations: myDonations } = useMyDonations(user?.uid)
  const donatedHistory = useMemo(
    () =>
      myDonations.map((d) => ({
        id: d.id,
        foodCategory: d.foodCategory,
        quantity: d.quantity,
        unit: d.unit,
        status: d.status,
        date: d.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    [myDonations]
  )
  const donatedCount = donatedHistory.length
  const receivedCount = receivedHistory.length

  const totalShared = useMemo(
    () =>
      donatedHistory.reduce(
        (sum, item) =>
          sum + (item.status === "claimed" ? item.quantity : 0),
        0
      ),
    [donatedHistory]
  )

  return (
    <div className="space-y-6 px-5 pt-2 pb-8 md:space-y-8 md:px-0 md:pt-4">

      {/* Page Heading */}
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-[#52745A] dark:text-[#A4C5A4]">
          <History className="size-4" />
          Your impact
        </p>

        <h1 className="mt-1 text-2xl font-extrabold md:text-4xl">
          Donation history
        </h1>

        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          A record of the food shared and received through AnnaDaan.
        </p>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-2 gap-3 md:max-w-lg md:gap-4">

        {/* Terracotta Card */}
        <div className="rounded-3xl border border-[#E5CCB8] bg-[#F3E3D5] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 dark:border-[#614638] dark:bg-[#382C25] md:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#E5C5AB] text-[#79533D] dark:bg-[#574033] dark:text-[#E5B997]">
            <ArrowUpRight className="size-5" />
          </div>

          <p className="mt-3 text-2xl font-extrabold text-[#704A32] dark:text-[#F0C5A2]">
            {donatedCount}
          </p>

          <p className="text-xs text-[#87684F] dark:text-[#C9AD96] md:text-sm">
            Donations recorded
          </p>
        </div>

        {/* Sage Card */}
        <div className="rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 dark:border-[#3C5742] dark:bg-[#293B2F] md:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#CBDCC1] text-[#496D53] dark:bg-[#3A5742] dark:text-[#B1D1AA]">
            <Leaf className="size-5" />
          </div>

          <p className="mt-3 text-2xl font-extrabold text-[#315D45] dark:text-[#B7D9B3]">
            {totalShared}
          </p>

          <p className="text-xs text-[#617D62] dark:text-[#A6C0A3] md:text-sm">
            Units successfully shared
          </p>
        </div>

      </div>

      {/* History Tabs */}
      <Tabs defaultValue="donated">

        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#E9E3D6] p-1 dark:bg-[#29352D] md:max-w-md">

          <TabsTrigger
            value="donated"
            className="gap-2 rounded-xl transition-colors data-[state=active]:bg-[#496D53] data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#6B9675] dark:data-[state=active]:text-[#142319]"
          >
            <ArrowUpRight className="size-4" />
            Donated ({donatedCount})
          </TabsTrigger>

          <TabsTrigger
            value="received"
            className="gap-2 rounded-xl transition-colors data-[state=active]:bg-[#496D53] data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#6B9675] dark:data-[state=active]:text-[#142319]"
          >
            <ArrowDownLeft className="size-4" />
            Received ({receivedCount})
          </TabsTrigger>

        </TabsList>

        {/* Donated History */}
        <TabsContent value="donated" className="mt-4 space-y-3">
          {donatedHistory.length ? (
            donatedHistory.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                type="donated"
              />
            ))
          ) : (
            <EmptyHistory />
          )}
        </TabsContent>

        {/* Received History */}
        <TabsContent value="received" className="mt-4 space-y-3">
          {receivedHistory.length ? (
            receivedHistory.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                type="received"
              />
            ))
          ) : (
            <EmptyHistory received />
          )}
        </TabsContent>

      </Tabs>

      {/* Footer Note */}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <PackageCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        Donated history is live from your account. Received history will appear once
        food requests are connected.
      </p>

    </div>
  )
}