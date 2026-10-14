
import { Link, useParams, useNavigate } from "react-router-dom"
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
} from "lucide-react"

import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import BaseFreshnessBadge from "@/components/FreshnessBadge"

// Only render a freshness badge once an ML/rule result exists.
const FreshnessBadge = (props) =>
  props.label ? <BaseFreshnessBadge {...props} /> : null
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useMyClaims, useClaim } from "@/hooks/useClaims"
import { cancelClaim } from "@/lib/claims"

import {
  CATEGORY_LABELS,
  formatElapsed,
} from "@/lib/mockData"

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
      className="group flex min-w-0 items-center gap-3 rounded-3xl border border-[#E9DDC9] bg-[#FFFCF5] p-3.5 shadow-[0_3px_12px_rgba(92,70,43,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B8C6A8] hover:shadow-md dark:border-[#4B4939] dark:bg-[#292D25] dark:hover:border-[#71876D] sm:gap-4 sm:p-4"
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
          className="size-6"
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
    <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-dashed border-[#D8CDB8] bg-[#FAF6EB] px-5 py-12 text-center dark:border-[#4B4939] dark:bg-[#252C25] sm:py-14">

      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[#E9EBD9] dark:bg-[#344334]" />
      <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-[#F3E0D1] dark:bg-[#44332C]" />

      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-[#E3EBD9] text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
        {history ? (
          <History className="size-7" />
        ) : (
          <HeartHandshake className="size-7" />
        )}
      </div>

      <div className="relative">
        <p className="text-xl font-bold text-[#465640] dark:text-[#E8E9D9]">
          Nothing here yet
        </p>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function MyRequests() {
  const { user } = useAuth()
  const { claims: requests } = useMyClaims(user?.uid)
  const active = requests.filter((r) => r.status !== "Claimed")
  const history = requests.filter((r) => r.status === "Claimed")

  return (
    <div className="space-y-6 px-5 pt-8 pb-8 md:space-y-8 md:px-0 md:pt-10">

      {/* Heading */}
      <div>
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
      </div>

      {/* Warm Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">

        <div className="relative overflow-hidden rounded-3xl border border-[#E9CDB7] bg-[#F6E5D8] p-4 shadow-sm dark:border-[#614638] dark:bg-[#382C25] sm:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#E9C5A9] text-[#79533D] dark:bg-[#574033] dark:text-[#E5B997]">
            <Clock className="size-5" />
          </div>

          <p className="mt-4 text-2xl font-extrabold text-[#704A32] dark:text-[#F0C5A2]">
            {active.length}
          </p>

          <p className="text-xs text-[#87684F] dark:text-[#C9AD96] sm:text-sm">
            Active requests
          </p>

          <span className="absolute -bottom-7 -right-5 size-20 rounded-full bg-[#E5B89D]/40 dark:bg-[#A66D50]/15" />
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 shadow-sm dark:border-[#3C5742] dark:bg-[#293B2F] sm:p-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
            <PackageCheck className="size-5" />
          </div>

          <p className="mt-4 text-2xl font-extrabold text-[#315D45] dark:text-[#B7D9B3]">
            {history.length}
          </p>

          <p className="text-xs text-[#617D62] dark:text-[#A6C0A3] sm:text-sm">
            Completed requests
          </p>

          <span className="absolute -bottom-7 -right-5 size-20 rounded-full bg-[#B6C5A4]/40 dark:bg-[#6D8B6A]/15" />
        </div>

      </div>

      {/* Requests Section */}
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

        <Tabs defaultValue="active">

          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#EEE7D9] p-1 dark:bg-[#30372E] md:max-w-md">

            <TabsTrigger
              value="active"
              className="gap-2 rounded-xl transition-colors data-[state=active]:bg-[#526C53] data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#6B9675] dark:data-[state=active]:text-[#142319]"
            >
              <ArrowUpRight className="size-4" />
              Active ({active.length})
            </TabsTrigger>

            <TabsTrigger
              value="history"
              className="gap-2 rounded-xl transition-colors data-[state=active]:bg-[#526C53] data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#6B9675] dark:data-[state=active]:text-[#142319]"
            >
              <History className="size-4" />
              History ({history.length})
            </TabsTrigger>

          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-3">
            {active.length ? (
              active.map((r) => (
                <RequestRow key={r.id} request={r} />
              ))
            ) : (
              <EmptyState label="No active requests. Browse nearby donations to get started." />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-3">
            {history.length ? (
              history.map((r) => (
                <RequestRow key={r.id} request={r} />
              ))
            ) : (
              <EmptyState
                history
                label="Your completed food requests will show up here."
              />
            )}
          </TabsContent>

        </Tabs>
      </section>

      {/* Warm Footer */}
      <div className="flex items-start gap-3 rounded-3xl border border-[#E8D69D] bg-[#F7EDCF] p-4 dark:border-[#66542F] dark:bg-[#403720]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#E8D59C] text-[#80652F] dark:bg-[#574829] dark:text-[#E8C96B]">
          <HandHeart className="size-5" />
        </div>

        <p className="pt-1 text-xs leading-5 text-[#80652F] dark:text-[#D0B978]">
          Every shared meal is a little act of kindness. Thank you for being part of AnnaDaan.
        </p>
      </div>

    </div>
  )
}

export function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { claim: request, loading } = useClaim(id)
  const donation = request

  if (loading) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Request" />
        <p className="px-5 pt-6 text-muted-foreground">Loading...</p>
      </div>
    )
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

  return (
    <div className="pb-10 md:pb-0">
      <PageHeader title="Request details" />

      <div className="mx-auto max-w-2xl space-y-5 px-5 pt-3 md:px-0">

        {/* Donation Overview */}
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

        {/* Status */}
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
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        reached
                          ? "bg-[#526C53] text-white dark:bg-[#6B9675] dark:text-[#142319]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {completed ? <Check className="size-4" /> : i + 1}
                    </div>

                    {i < CLAIM_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "mt-1 min-h-7 w-0.5 flex-1",
                          completed ? "bg-[#6B9675]" : "bg-border"
                        )}
                      />
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
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-xs font-bold",
                      i <= currentStep
                        ? "bg-[#526C53] text-white dark:bg-[#6B9675] dark:text-[#142319]"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i < currentStep ? <Check className="size-4" /> : i + 1}
                  </div>

                  <span className={cn("text-xs font-medium", i <= currentStep ? "text-foreground" : "text-muted-foreground")}>
                    {CLAIM_LABELS[step]}
                  </span>
                </div>

                {i < CLAIM_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      i < currentStep ? "bg-[#6B9675]" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

        </section>

        {/* Donor */}
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
            onClick={() => alert("Chat comes later")}
            aria-label="Message donor"
            className="shrink-0 rounded-xl border-[#D8DDCC] text-[#496D53] dark:border-border dark:text-[#A7C6A5]"
          >
            <MessageCircle />
          </Button>
        </section>

        {/* Cancel */}
        {request.status === "Pending" && (
          <div className="rounded-3xl border border-[#E7CFC1] bg-[#F9EEE8] p-4 dark:border-[#614638] dark:bg-[#382C25]">

            <p className="mb-3 text-sm text-[#87684F] dark:text-[#C9AD96]">
              Your request is awaiting a response.
            </p>

            <Button
              variant="outline"
              className="w-full rounded-xl border-[#DDB9A8] bg-transparent text-[#A65F45] hover:bg-[#F3DFD7] dark:border-[#754B39] dark:text-[#E5A58A] dark:hover:bg-[#493027]"
              onClick={async () => {
                try {
                  await cancelClaim(request.id)
                  navigate("/requests")
                } catch (err) {
                  console.error(err)
                  alert(err?.message || "Could not cancel the request")
                }
              }}
            >
              <X />
              Cancel request
            </Button>
          </div>
        )}

        {request.status === "Claimed" && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#E5EDDC] p-4 text-sm text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
            <HandHeart className="size-5 shrink-0" />
            This request has been completed. Thank you for being part of AnnaDaan.
          </div>
        )}

      </div>
    </div>
  )
}
