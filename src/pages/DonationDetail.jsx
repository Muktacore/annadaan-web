import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  MapPin, Clock, Thermometer, Package, MessageCircle, HandHeart, Info, TriangleAlert, Trash2,
  ChevronDown, Lightbulb,
} from "lucide-react"
import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import AnimatedCheck from "@/components/AnimatedCheck"
import ConfidenceRing from "@/components/ConfidenceRing"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"
import { DonationDetailSkeleton } from "@/components/Skeleton"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useDonation } from "@/hooks/useDonations"
import { useMinLoading } from "@/hooks/useMinLoading"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useMyClaims, useDonationClaims } from "@/hooks/useClaims"
import { distanceKm as calcKm } from "@/lib/donations"
import { explainDonation } from "@/lib/freshnessExplain"
import { createClaim, acceptClaim, completeClaim, deleteDonationWithClaims, CLAIM_LABELS } from "@/lib/claims"
import { liveRow, swap, fade, tween, DURATION, STAGGER, EASE_OUT } from "@/lib/motion"
import {
  CATEGORY_LABELS, STORAGE_LABELS, COVERED_LABELS, SOURCE_LABELS, formatElapsed,
} from "@/lib/mockData"

const CLAIM_PILL = {
  Pending: "bg-muted text-muted-foreground",
  RequestAccepted: "bg-sage/30 text-foreground",
  Claimed: "bg-primary text-primary-foreground",
}

// The explanation templates may hand back strings or small objects, and a
// field may be one string or a list. Normalise so the UI never crashes.
const lineText = (x) =>
  typeof x === "string" ? x : x?.text ?? x?.message ?? x?.label ?? ""
const toLines = (v) =>
  (Array.isArray(v) ? v : v ? [v] : []).map(lineText).filter(Boolean)

function safeExplain(d) {
  try {
    const e = explainDonation(d)
    if (!e || !e.headline) return null
    return {
      headline: lineText(e.headline),
      summary: lineText(e.summary),
      reasons: toLines(e.reasons),
      advice: toLines(e.advice),
      caveats: toLines(e.caveats),
      disclaimer: lineText(e.disclaimer),
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <StaggerItem className="rounded-2xl border bg-card p-3 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </StaggerItem>
  )
}

function Actions({ enabled, label, busy, done, onRequest }) {
  const state = done ? "done" : busy ? "busy" : "idle"

  return (
    <>
      <Button variant="outline" size="lg" className="flex-1" disabled>
        <MessageCircle /> Chat soon
      </Button>
      <Button
        size="lg"
        className="flex-1 motion-safe:active:scale-[0.98]"
        disabled={!enabled || busy}
        onClick={onRequest}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={state} {...swap} className="inline-flex items-center gap-2">
            {state === "done" && (
              <>
                <AnimatedCheck className="size-4" delay={0} /> Requested
              </>
            )}
            {state === "busy" && (
              <>
                <span className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
                Requesting...
              </>
            )}
            {state === "idle" && (
              <>
                <HandHeart className="size-4" /> {label}
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
    </>
  )
}

export default function DonationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { donation, loading: dataLoading } = useDonation(id)
  const loading = useMinLoading(dataLoading)
  const origin = useUserLocation()
  const { claims: myClaims } = useMyClaims(user?.uid)
  const isOwner = Boolean(donation && user && donation.donorId === user.uid)
  const { claims: incoming } = useDonationClaims(
    isOwner ? user.uid : null,
    isOwner ? donation.id : null
  )
  const [busy, setBusy] = useState(false)
  const [requested, setRequested] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const d = donation ? { ...donation, distanceKm: calcKm(origin, donation.location) } : null
  const myClaim = d ? myClaims.find((c) => c.donationId === d.id) : null

  const run = async (fn, successMsg) => {
    setBusy(true)
    try {
      await fn()
      if (successMsg) toast.success(successMsg)
    } catch (err) {
      console.error(err)
      toast.error(err?.message || "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  const handleRequest = () => {
    if (myClaim) return navigate(`/requests/${myClaim.id}`)
    return run(async () => {
      await createClaim({ user, donation: d })
      setRequested(true)
      await new Promise((resolve) => setTimeout(resolve, 650))
      navigate("/requests")
    })
  }

  const handleDelete = () =>
    run(async () => {
      await deleteDonationWithClaims(d.id, incoming)
      navigate("/home", { replace: true })
    }, "Donation deleted")

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col md:min-h-0">
        <PageHeader title="Donation details" />
        <DonationDetailSkeleton />
      </div>
    )
  }

  if (!d) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Donation" />
        <Reveal className="flex flex-col items-center gap-2 px-5 pt-10 text-center">
          <FoodBoxCharacter type="squashed" className="w-36!" />
          <p className="font-semibold">Donation not found</p>
          <p className="text-sm text-muted-foreground">
            It may have been claimed or removed.{" "}
            <Link to="/home" className="text-primary underline">Go home</Link>
          </p>
        </Reveal>
      </div>
    )
  }

  const available = d.status === "available" && d.freshnessLabel !== "unsafe"
  const enabled = Boolean(myClaim) || available
  const label = myClaim ? "View my request" : available ? "Request food" : "Unavailable"
  const hasFreshness = Boolean(d.freshnessLabel)
  const lowConfidence = hasFreshness && d.confidenceScore < 0.6
  const blockDelete = d.status !== "available" || incoming.some((c) => c.status !== "Pending")
  const explained = hasFreshness ? safeExplain(d) : null
  const hasMore = Boolean(explained && (explained.caveats.length > 0 || explained.disclaimer))

  return (
    <div className="flex min-h-dvh flex-col md:min-h-0">
      <PageHeader title="Donation details" />

      <div className="grid flex-1 gap-5 px-5 pt-2 pb-6 md:grid-cols-2 md:gap-8 md:px-0">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-secondary text-primary md:h-72"
          >
            {d.foodPhotoUrl ? (
              <img src={d.foodPhotoUrl} alt="Donated food" className="size-full rounded-3xl object-cover" />
            ) : (
              <CategoryIcon category={d.foodCategory} className="size-20 md:size-28" />
            )}
          </motion.div>

          <Stagger delay={0.1} className="grid grid-cols-2 gap-3">
            <InfoTile icon={Clock} label="Cooked" value={d.cookedAt ? formatElapsed(d.cookedAt) : "-"} />
            <InfoTile icon={Thermometer} label="Storage" value={STORAGE_LABELS[d.storageCondition]} />
            <InfoTile icon={Package} label="Cover" value={COVERED_LABELS[d.isCovered]} />
            <InfoTile icon={MapPin} label="Distance" value={d.distanceKm != null ? `${d.distanceKm} km away` : "-"} />
          </Stagger>

          <Reveal delay={0.3} className="flex items-center gap-3 rounded-3xl border bg-card p-4">
            <Avatar>
              <AvatarFallback className="bg-secondary text-primary">{d.donorName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{d.donorName}</p>
              <p className="text-xs text-muted-foreground">{isOwner ? "You (donor)" : "Donor"}</p>
            </div>
          </Reveal>
        </div>

        <div className="space-y-5">
          <Reveal delay={0.05} className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold md:text-3xl">{CATEGORY_LABELS[d.foodCategory]}</h2>
              <p className="text-sm text-muted-foreground">
                {d.quantity} {d.quantity === 1 ? d.unit.replace(/s$/, "") : d.unit}
              </p>
            </div>
            {d.freshnessLabel && <FreshnessBadge label={d.freshnessLabel} />}
          </Reveal>

          {hasFreshness ? (
            <Reveal as="section" delay={0.12} className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
              <h3 className="font-semibold">Freshness check</h3>

              <div className="flex items-center gap-4">
                <ConfidenceRing value={d.confidenceScore} />
                <div className="min-w-0 space-y-1">
                  {explained ? (
                    <>
                      <p className="font-semibold leading-snug">{explained.headline}</p>
                      {explained.summary && (
                        <p className="text-sm text-muted-foreground">{explained.summary}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Confidence in this check</p>
                  )}
                </div>
              </div>

              {lowConfidence && (
                <p className="flex items-start gap-2 rounded-2xl bg-status-soon-soft p-3 text-xs text-status-soon">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  Low confidence. Please check the food yourself before eating.
                </p>
              )}

              {explained ? (
                <>
                  {explained.reasons.length > 0 && (
                    <ul className="space-y-2">
                      {explained.reasons.map((line, i) => (
                        <motion.li
                          key={`${i}-${line}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { ...tween(DURATION.base), delay: 0.55 + Math.min(i, 6) * STAGGER * 1.5 },
                          }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Info className="mt-0.5 size-4 shrink-0 text-primary" /> {line}
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {explained.advice.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { ...tween(DURATION.base), delay: 0.65 + Math.min(explained.reasons.length, 6) * STAGGER * 1.5 },
                      }}
                      className="flex items-start gap-2 rounded-2xl bg-secondary p-3 text-sm"
                    >
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="space-y-1">
                        {explained.advice.map((line, i) => (
                          <p key={`${i}-${line}`}>{line}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {hasMore && (
                    <div>
                      <button
                        type="button"
                        aria-expanded={showMore}
                        onClick={() => setShowMore((v) => !v)}
                        className="flex w-full items-center justify-between rounded-xl py-1 text-xs font-medium text-muted-foreground"
                      >
                        Details and caveats
                        <motion.span animate={{ rotate: showMore ? 180 : 0 }} transition={tween(DURATION.fast)}>
                          <ChevronDown className="size-4" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {showMore && (
                          <motion.div key="more" {...fade} className="mt-2 space-y-2 text-xs text-muted-foreground">
                            {explained.caveats.length > 0 && (
                              <ul className="list-disc space-y-1 pl-4">
                                {explained.caveats.map((line, i) => (
                                  <li key={`${i}-${line}`}>{line}</li>
                                ))}
                              </ul>
                            )}
                            {explained.disclaimer && <p>{explained.disclaimer}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              ) : (
                <ul className="space-y-2">
                  {(d.explanation ?? []).map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm">
                      <Info className="mt-0.5 size-4 shrink-0 text-primary" /> {line}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted-foreground">Checked by: {SOURCE_LABELS[d.freshnessSource]}</p>
            </Reveal>
          ) : (
            <Reveal as="section" delay={0.12} className="rounded-3xl border bg-card p-4 text-sm text-muted-foreground shadow-sm md:p-6">
              Freshness check pending. The safety check runs once the donation is analysed.
            </Reveal>
          )}

          {isOwner && (
            <Reveal as="section" delay={0.18} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
              <h3 className="font-semibold">Requests ({incoming.length})</h3>
              <AnimatePresence initial={false}>
                {incoming.length === 0 && (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: DURATION.base, delay: DURATION.base } }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    className="text-sm text-muted-foreground"
                  >
                    No one has requested this yet.
                  </motion.p>
                )}
                {incoming.map((c) => (
                  <motion.div
                    key={c.id}
                    {...liveRow}
                    className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.recipientName}</p>
                      <p className="text-xs text-muted-foreground">Requested {formatElapsed(c.requestedAt)}</p>
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={c.status} {...swap} className="shrink-0">
                        {c.status === "Pending" && (
                          <Button size="sm" disabled={busy} onClick={() => run(() => acceptClaim(c.id), "Request accepted")}>
                            Accept
                          </Button>
                        )}
                        {c.status === "RequestAccepted" && (
                          <Button size="sm" disabled={busy} onClick={() => run(() => completeClaim(c), "Marked as picked up")}>
                            Mark picked up
                          </Button>
                        )}
                        {c.status === "Claimed" && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                              CLAIM_PILL.Claimed
                            )}
                          >
                            <AnimatedCheck className="size-3" delay={0.05} />
                            {CLAIM_LABELS.Claimed}
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Reveal>
          )}

          {isOwner && (
            <div>
              <AnimatePresence mode="wait" initial={false}>
                {confirmingDelete ? (
                  <motion.div
                    key="confirm"
                    {...swap}
                    className="space-y-3 rounded-3xl border border-destructive/40 bg-card p-4"
                  >
                    <p className="text-sm font-semibold">Delete this donation?</p>
                    <p className="text-xs text-muted-foreground">
                      {incoming.length > 0
                        ? `${incoming.length} pending request${incoming.length === 1 ? "" : "s"} will be removed too. This can't be undone.`
                        : "This can't be undone."}
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" disabled={busy} onClick={() => setConfirmingDelete(false)}>
                        Keep it
                      </Button>
                      <Button variant="destructive" className="flex-1" disabled={busy} onClick={handleDelete}>
                        {busy ? "Deleting..." : "Yes, delete"}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="ask" {...swap}>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      disabled={blockDelete}
                      onClick={() => setConfirmingDelete(true)}
                    >
                      <Trash2 /> Delete donation
                    </Button>
                    {blockDelete && (
                      <p className="mt-2 text-center text-xs text-muted-foreground">
                        This donation has an accepted request or was already picked up, so it can't be deleted.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!isOwner && (
            <Reveal delay={0.22} className="hidden gap-3 md:flex">
              <Actions enabled={enabled} label={label} busy={busy} done={requested} onRequest={handleRequest} />
            </Reveal>
          )}
        </div>
      </div>

      {!isOwner && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease: EASE_OUT }}
          className="sticky bottom-0 flex gap-3 border-t bg-background/95 p-4 backdrop-blur md:hidden"
        >
          <Actions enabled={enabled} label={label} busy={busy} done={requested} onRequest={handleRequest} />
        </motion.div>
      )}
    </div>
  )
}
