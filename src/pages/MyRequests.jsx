import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  ChevronRight,
  Clock,
  MessageCircle,
  X,
  Check,
  HeartHandshake,
  PackageCheck,
  Sparkles,
  ArrowUpRight,
  History,
  HandHeart,
  Loader2,
} from "lucide-react"

import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import BaseFreshnessBadge from "@/components/FreshnessBadge"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"
import DonationCardSkeleton from "@/components/DonationCardSkeleton"
import SlidingTab from "@/components/SlidingTab"
import CountUp from "@/components/motion/CountUp"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { EASE_OUT, DUR, SPRING_BOUNCY } from "@/lib/motion"
import { useAuth } from "@/context/AuthContext"
import { useMyClaims, useClaim } from "@/hooks/useClaims"
import { cancelClaim } from "@/lib/claims"

import {
  CATEGORY_LABELS,
  formatElapsed,
} from "@/lib/mockData"

// Only render a freshness badge once an ML/rule result exists.
const FreshnessBadge = (props) =>
  props.label ? <BaseFreshnessBadge {...props} /> : null

const CLAIM_STEPS = ["Pending", "RequestAccepted", "Claimed"]

const CLAIM_LABELS = {
  Pending: "Pending",
  RequestAccepted: "Accepted",
  Claimed: "Claimed",
}

const CLAIM_BADGE = {
  Pending:
    "bg-muted text-muted-foreground",
  RequestAccepted:
    "bg-sage/30 text-foreground",
  Claimed:
    "bg-primary text-primary-foreground",
}

function RequestRow({ request }) {
  const donation = request

  if (!donation) return null

  const isClaimed = request.status === "Claimed"

  return (
    <Link
      to={`/requests/${request.id}`}
      className="group flex min-w-0 items-center gap-3 rounded-3xl border border-[#E9DDC9] bg-[#FFFCF5] p-3.5 shadow-[0_3px_12px_rgba(92,70,43,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8C6A8] hover:shadow-md active:translate-y-0 active:scale-[0.985] dark:border-[#4B4939] dark:bg-[#292D25] dark:hover:border-[#71876D] sm:gap-4 sm:p-4"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl sm:size-14",
          isClaimed
            ? "bg-[#E3EBD9] text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]"
            : "bg-[#F5E2D5] text-[#A65F45] dark:bg-[#482F29] dark:text-[#E5A58A]"
        )}
      >
        <CategoryIcon
          category={donation.foodCategory}
          className="size-6 transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-semibold text-[#37382F] dark:text-[#F1EEE4]">
          {CATEGORY_LABELS[donation.foodCategory] ?? "Food donation"}
        </p>

        <p className="truncate text-sm text-muted-foreground">
          From {donation.donorName}
        </p>

        <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span className="truncate">
            Requested {formatElapsed(request.requestedAt)}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-[11px]",
            CLAIM_BADGE[request.status]
          )}
        >
          {CLAIM_LABELS[request.status]}
        </span>

        <ChevronRight className="size-4 text-[#A69C89] transition-transform group-hover:translate-x-1 dark:text-[#A7A18F]" />
      </div>
    </Link>
  )
}

function EmptyState({ label, history = false }) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-dashed border-[#D8CDB8] bg-[#FAF6EB] px-5 py-8 text-center dark:border-[#4B4939] dark:bg-[#252C25] sm:py-10">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-[#E9EBD9] dark:bg-[#344334]" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 size-24 rounded-full bg-[#F3E0D1] dark:bg-[#44332C]" />

      {/* Character gets its own space */}
      <div className="relative z-10 flex h-28 w-full items-center justify-center sm:h-32">
        <FoodBoxCharacter
          type={history ? "celebrating" : "meditating"}
          static
          className="!h-28 !w-28 max-w-full sm:!h-32 sm:!w-32"
          imageClassName="h-full w-full object-contain"
        />
      </div>

      {/* Text stays separate from the character */}
      <div className="relative z-10 mt-3 max-w-sm">
        <p className="text-xl font-bold text-[#465640] dark:text-[#E8E9D9]">
          {history ? "A little kindness goes a long way!" : "Nothing here yet"}
        </p>

        <p className="mx-auto mt-2 text-sm leading-6 text-muted-foreground">
          {label}
        </p>
      </div>

      {!history && (
        <Link
          to="/home"
          className="relative z-10 mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
        >
          Explore donations
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

function RequestList({ items, loading, emptyLabel, history = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <DonationCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <Reveal>
        <EmptyState history={history} label={emptyLabel} />
      </Reveal>
    )
  }

  // Tab content mounts when its tab opens, so this stagger doubles as the cross-fade.
  return (
    <Stagger className="space-y-3" stagger={0.05}>
      {items.map((r) => (
        <StaggerItem key={r.id}>
          <RequestRow request={r} />
        </StaggerItem>
      ))}
    </Stagger>
  )
}

export default function MyRequests() {
  const { user } = useAuth()
  const { claims: requests, loading } = useMyClaims(user?.uid)
  const [tab, setTab] = useState("active")
  const active = requests.filter((r) => r.status !== "Claimed")
  const history = requests.filter((r) => r.status === "Claimed")

  return (
    <Stagger className="space-y-6 px-5 pt-8 pb-8 md:space-y-8 md:px-0 md:pt-10">

      {/* Heading */}
      <StaggerItem>
        <p className="flex items-center gap-2 text-sm font-medium text-[#66805F] dark:text-[#A4C5A4]">
          <HeartHandshake className="size-4" />
          Your food journey
        </p>

        <h1 className="mt-1 text-2xl font-extrabold md:text-4xl">
          My requests
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
          Keep track of the food you've requested and the meals coming your way.
        </p>
      </StaggerItem>

      {/* Warm Summary Cards */}
      <StaggerItem className="grid grid-cols-2 gap-3 sm:gap-4">

        <div className="relative overflow-hidden rounded-3xl border border-[#E9CDB7] bg-[#F6E5D8] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] dark:border-[#614638] dark:bg-[#382C25] sm:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#E9C5A9] text-[#79533D] dark:bg-[#574033] dark:text-[#E5B997]">
            <Clock className="size-5" />
          </div>

          <p className="mt-4 text-2xl font-extrabold text-[#704A32] dark:text-[#F0C5A2]">
            <CountUp value={active.length} />
          </p>

          <p className="text-xs text-[#87684F] dark:text-[#C9AD96] sm:text-sm">
            Active requests
          </p>

          <span className="absolute -bottom-7 -right-5 size-20 rounded-full bg-[#E5B89D]/40 dark:bg-[#A66D50]/15" />
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] dark:border-[#3C5742] dark:bg-[#293B2F] sm:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
            <PackageCheck className="size-5" />
          </div>

          <p className="mt-4 text-2xl font-extrabold text-[#315D45] dark:text-[#B7D9B3]">
            <CountUp value={history.length} />
          </p>

          <p className="text-xs text-[#617D62] dark:text-[#A6C0A3] sm:text-sm">
            Completed requests
          </p>

          <span className="absolute -bottom-7 -right-5 size-20 rounded-full bg-[#B6C5A4]/40 dark:bg-[#6D8B6A]/15" />
        </div>

      </StaggerItem>

      {/* Requests Section */}
      <StaggerItem>
        <section className="space-y-4">

          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#F3E7BD] text-[#80652F] dark:bg-[#403720] dark:text-[#D0B978]">
              <Sparkles className="size-4" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Your requests
              </h2>
              <p className="text-xs text-muted-foreground">
                Every connection counts.
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>

            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#EEE7D9] p-1 dark:bg-[#30372E] md:max-w-md">
              <SlidingTab
                value="active"
                active={tab === "active"}
                layoutId="requests-tab-pill"
                pillClassName="bg-[#526C53] dark:bg-[#6B9675]"
              >
                <ArrowUpRight className="size-4" />
                Active ({active.length})
              </SlidingTab>

              <SlidingTab
                value="history"
                active={tab === "history"}
                layoutId="requests-tab-pill"
                pillClassName="bg-[#526C53] dark:bg-[#6B9675]"
              >
                <History className="size-4" />
                History ({history.length})
              </SlidingTab>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <RequestList
                items={active}
                loading={loading}
                emptyLabel="No active requests. Browse nearby donations to get started."
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <RequestList
                items={history}
                loading={loading}
                history
                emptyLabel="Your completed food requests will show up here."
              />
            </TabsContent>

          </Tabs>
        </section>
      </StaggerItem>

      {/* Warm Footer */}
      <StaggerItem>
        <div className="flex items-start gap-3 rounded-3xl border border-[#E8D69D] bg-[#F7EDCF] p-4 dark:border-[#66542F] dark:bg-[#403720]">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E8D59C] text-[#80652F] dark:bg-[#574829] dark:text-[#E8C96B]">
            <HandHeart className="size-5" />
          </div>

          <p className="pt-1 text-xs leading-5 text-[#80652F] dark:text-[#D0B978]">
            Every shared meal is a little act of kindness. Thank you for being part of AnnaDaan.
          </p>
        </div>
      </StaggerItem>

    </Stagger>
  )
}

// Celebrates once when a request is Claimed, then settles into a still pose.
// Parent passes key={status} so a live status change replays it.
function JourneyMascot({ status }) {
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 2800)
    return () => clearTimeout(t)
  }, [])

  const type =
    status === "Claimed"
      ? "celebrating"
      : status === "RequestAccepted"
        ? "waving"
        : "running"

  return (
    <FoodBoxCharacter
      type={type}
      static={status !== "Claimed" || settled}
      className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
      imageClassName="h-full w-full object-contain"
    />
  )
}

function RequestDetailSkeleton() {
  return (
    <div className="pb-10 md:pb-0" role="status" aria-label="Loading request">
      <PageHeader title="Request details" />

      <div className="mx-auto max-w-2xl space-y-5 px-5 pt-3 md:px-0">
        <div className="overflow-hidden rounded-3xl border bg-card">
          <div className="flex items-center gap-3 p-4 sm:p-5">
            <Skeleton className="size-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-20 w-full rounded-3xl" />
      </div>
    </div>
  )
}

export function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { claim: request, loading } = useClaim(id)
  const donation = request

  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  if (loading) {
    return <RequestDetailSkeleton />
  }

  if (!request || !donation) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Request" />

        <p className="px-5 pt-6 text-muted-foreground">
          Request not found.{" "}
          <Link to="/requests" className="text-primary underline">
            Back to requests
          </Link>
        </p>
      </div>
    )
  }

  const currentStep = CLAIM_STEPS.indexOf(request.status)

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelClaim(request.id)
      toast.success("Request cancelled")
      navigate("/requests")
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Could not cancel the request")
      setCancelling(false)
      setConfirmingCancel(false)
    }
  }

  return (
    <div className="pb-10 md:pb-0">
      <PageHeader title="Request details" />

      <Stagger className="mx-auto max-w-2xl space-y-5 px-5 pt-3 md:px-0">

        {/* Donation Overview */}
        <StaggerItem>
          <section className="overflow-hidden rounded-3xl border border-[#D8DDCC] bg-card shadow-sm dark:border-border">

            <div className="flex items-center gap-3 bg-[#E5EDDC] p-4 dark:bg-[#293B2F] sm:p-5">

              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
                <CategoryIcon
                  category={donation.foodCategory}
                  className="size-7"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#344B36] dark:text-foreground">
                  {CATEGORY_LABELS[donation.foodCategory]}
                </p>

                <p className="text-sm text-[#617D62] dark:text-[#A6C0A3]">
                  {donation.quantity} {donation.unit}
                </p>
              </div>

              <FreshnessBadge
                label={donation.freshnessLabel}
                compact
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-4 text-sm">
              <span className="text-muted-foreground">
                Requested {formatElapsed(request.requestedAt)}
              </span>

              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", CLAIM_BADGE[request.status])}>
                {CLAIM_LABELS[request.status]}
              </span>
            </div>
          </section>
        </StaggerItem>

        {/* Mascot message */}
        <StaggerItem>
          <div className="flex items-center gap-4 rounded-3xl border border-[#D8DDCC] bg-card p-4 dark:border-border sm:p-5">

            <JourneyMascot key={request.status} status={request.status} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Your food journey
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {request.status === "Claimed"
                  ? "A meal shared, a smile created!"
                  : request.status === "RequestAccepted"
                    ? "Good news! Your request was accepted."
                    : "Your request is on its way."}
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {request.status === "Claimed"
                  ? "Thanks for being part of the Anna Daan community."
                  : request.status === "RequestAccepted"
                    ? "Your food connection is moving forward."
                    : "We\u2019re waiting for the donor to respond."}
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Status */}
        <StaggerItem>
          <section className="rounded-3xl border border-[#E9DDC9] bg-[#FFFCF5] p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9A8065] dark:text-[#BBA58C]">
                Your food journey
              </p>

              <h3 className="mt-1 text-xl font-bold">
                Request status
              </h3>
            </div>

            {/* Portrait progress */}
            <div className="space-y-4 sm:hidden">
              {CLAIM_STEPS.map((step, i) => {
                const completed = i < currentStep
                const reached = i <= currentStep

                return (
                  <div key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...SPRING_BOUNCY, delay: 0.15 + i * 0.2 }}
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          reached
                            ? "bg-[#526C53] text-white dark:bg-[#6B9675] dark:text-[#142319]"
                            : "bg-muted text-muted-foreground",
                          i === currentStep && "ring-4 ring-[#526C53]/20 dark:ring-[#6B9675]/25"
                        )}
                      >
                        {completed ? <Check className="size-4" /> : i + 1}
                      </motion.div>

                      {i < CLAIM_STEPS.length - 1 && (
                        <div className="relative mt-1 min-h-7 w-0.5 flex-1 overflow-hidden bg-border">
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: completed ? 1 : 0 }}
                            transition={{ duration: 0.45, delay: 0.3 + i * 0.2, ease: EASE_OUT }}
                            className="absolute inset-0 origin-top bg-[#6B9675]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pb-4">
                      <p className={cn("text-sm font-semibold", reached ? "text-foreground" : "text-muted-foreground")}>
                        {CLAIM_LABELS[step]}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {i === currentStep
                          ? "Your request is at this stage."
                          : completed
                            ? "This stage is complete."
                            : "Waiting for the previous stage."}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop progress */}
            <div className="hidden items-center sm:flex">
              {CLAIM_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">

                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...SPRING_BOUNCY, delay: 0.15 + i * 0.2 }}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full text-xs font-bold",
                        i <= currentStep
                          ? "bg-[#526C53] text-white dark:bg-[#6B9675] dark:text-[#142319]"
                          : "bg-muted text-muted-foreground",
                        i === currentStep && "ring-4 ring-[#526C53]/20 dark:ring-[#6B9675]/25"
                      )}
                    >
                      {i < currentStep ? <Check className="size-4" /> : i + 1}
                    </motion.div>

                    <span className={cn("text-xs font-medium", i <= currentStep ? "text-foreground" : "text-muted-foreground")}>
                      {CLAIM_LABELS[step]}
                    </span>
                  </div>

                  {i < CLAIM_STEPS.length - 1 && (
                    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden bg-muted">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i < currentStep ? 1 : 0 }}
                        transition={{ duration: 0.45, delay: 0.3 + i * 0.2, ease: EASE_OUT }}
                        className="absolute inset-0 origin-left bg-[#6B9675]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </section>
        </StaggerItem>

        {/* Donor */}
        <StaggerItem>
          <section className="flex items-center gap-3 rounded-3xl border border-[#E9DDC9] bg-[#FFFCF5] p-4 shadow-sm dark:border-border dark:bg-card">

            <Avatar className="size-12">
              <AvatarFallback className="bg-[#E3EBD9] font-semibold text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
                {donation.donorName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {donation.donorName}
              </p>

              <p className="text-xs text-muted-foreground">
                Food donor
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => toast("Chat is coming soon")}
              aria-label="Message donor"
              className="shrink-0 rounded-xl border-[#D8DDCC] text-[#496D53] dark:border-border dark:text-[#A7C6A5]"
            >
              <MessageCircle />
            </Button>
          </section>
        </StaggerItem>

        {/* Cancel */}
        {request.status === "Pending" && (
          <StaggerItem>
            <div className="rounded-3xl border border-[#E7CFC1] bg-[#F9EEE8] p-4 dark:border-[#614638] dark:bg-[#382C25]">

              <AnimatePresence mode="wait" initial={false}>
                {confirmingCancel ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DUR.fast }}
                  >
                    <p className="mb-3 text-sm font-medium text-[#A65F45] dark:text-[#E5A58A]">
                      Cancel this request? The donor will no longer see it.
                    </p>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        disabled={cancelling}
                        onClick={() => setConfirmingCancel(false)}
                        className="h-11 flex-1 rounded-xl"
                      >
                        Keep request
                      </Button>

                      <Button
                        disabled={cancelling}
                        onClick={handleCancel}
                        className="h-11 flex-1 rounded-xl bg-[#A65F45] text-white hover:bg-[#8F4F38] dark:bg-[#C77D5B] dark:text-[#2A1710]"
                      >
                        {cancelling ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <X />
                        )}
                        {cancelling ? "Cancelling" : "Yes, cancel"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: DUR.fast }}
                  >
                    <p className="mb-3 text-sm text-[#87684F] dark:text-[#C9AD96]">
                      Your request is awaiting a response.
                    </p>

                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-[#DDB9A8] bg-transparent text-[#A65F45] hover:bg-[#F3DFD7] dark:border-[#754B39] dark:text-[#E5A58A] dark:hover:bg-[#493027]"
                      onClick={() => setConfirmingCancel(true)}
                    >
                      <X />
                      Cancel request
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </StaggerItem>
        )}

        {request.status === "Claimed" && (
          <StaggerItem>
            <div className="flex items-center gap-3 rounded-2xl bg-[#E5EDDC] p-4 text-sm text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
              <HandHeart className="size-5 shrink-0" />
              This request has been completed. Thank you for being part of AnnaDaan.
            </div>
          </StaggerItem>
        )}

      </Stagger>
    </div>
  )
}
