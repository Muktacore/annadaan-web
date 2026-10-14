import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { MapPin, Clock, Thermometer, Package, MessageCircle, HandHeart, Info, TriangleAlert } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import AnimatedCheck from "@/components/AnimatedCheck"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useDonation } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useMyClaims, useDonationClaims } from "@/hooks/useClaims"
import { distanceKm as calcKm } from "@/lib/donations"
import { createClaim, acceptClaim, completeClaim, CLAIM_LABELS } from "@/lib/claims"
import { liveRow, swap, DURATION, EASE_OUT } from "@/lib/motion"
import {
  CATEGORY_LABELS, STORAGE_LABELS, COVERED_LABELS, SOURCE_LABELS, formatElapsed,
} from "@/lib/mockData"

const CLAIM_PILL = {
  Pending: "bg-muted text-muted-foreground",
  RequestAccepted: "bg-sage/30 text-foreground",
  Claimed: "bg-primary text-primary-foreground",
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
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
  const { donation, loading } = useDonation(id)
  const origin = useUserLocation()
  const { claims: myClaims } = useMyClaims(user?.uid)
  const isOwner = Boolean(donation && user && donation.donorId === user.uid)
  const { claims: incoming } = useDonationClaims(
    isOwner ? user.uid : null,
    isOwner ? donation.id : null
  )
  const [busy, setBusy] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(""), 4000)
    return () => clearTimeout(t)
  }, [error])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(""), 4000)
    return () => clearTimeout(t)
  }, [error])

  const d = donation ? { ...donation, distanceKm: calcKm(origin, donation.location) } : null
  const myClaim = d ? myClaims.find((c) => c.donationId === d.id) : null

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      console.error(err)
      setError(err?.message || "Something went wrong")
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

  if (loading) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Donation" />
        <p className="px-5 pt-6 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!d) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Donation" />
        <p className="px-5 pt-6 text-muted-foreground">
          Donation not found. <Link to="/home" className="text-primary underline">Go home</Link>
        </p>
      </div>
    )
  }

  const available = d.status === "available" && d.freshnessLabel !== "unsafe"
  const enabled = Boolean(myClaim) || available
  const label = myClaim ? "View my request" : available ? "Request food" : "Unavailable"
  const hasFreshness = Boolean(d.freshnessLabel)
  const lowConfidence = hasFreshness && d.confidenceScore < 0.6

  return (
    <div className="flex min-h-dvh flex-col md:min-h-0">
      <PageHeader title="Donation details" />

      <div className="grid flex-1 gap-5 px-5 pt-2 pb-6 md:grid-cols-2 md:gap-8 md:px-0">
        <div className="space-y-5">
          <div className="flex h-44 items-center justify-center rounded-3xl bg-secondary text-primary md:h-72">
            {d.foodPhotoUrl ? (
              <img src={d.foodPhotoUrl} alt="Donated food" className="size-full rounded-3xl object-cover" />
            ) : (
              <CategoryIcon category={d.foodCategory} className="size-20 md:size-28" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={Clock} label="Cooked" value={d.cookedAt ? formatElapsed(d.cookedAt) : "-"} />
            <InfoTile icon={Thermometer} label="Storage" value={STORAGE_LABELS[d.storageCondition]} />
            <InfoTile icon={Package} label="Cover" value={COVERED_LABELS[d.isCovered]} />
            <InfoTile icon={MapPin} label="Distance" value={d.distanceKm != null ? `${d.distanceKm} km away` : "-"} />
          </div>

          <div className="flex items-center gap-3 rounded-3xl border bg-card p-4">
            <Avatar>
              <AvatarFallback className="bg-secondary text-primary">{d.donorName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{d.donorName}</p>
              <p className="text-xs text-muted-foreground">{isOwner ? "You (donor)" : "Donor"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold md:text-3xl">{CATEGORY_LABELS[d.foodCategory]}</h2>
              <p className="text-sm text-muted-foreground">
                {d.quantity} {d.quantity === 1 ? d.unit.replace(/s$/, "") : d.unit}
              </p>
            </div>
            {d.freshnessLabel && <FreshnessBadge label={d.freshnessLabel} />}
          </div>

          {hasFreshness ? (
            <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
              <h3 className="font-semibold">Freshness check</h3>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span>{Math.round(d.confidenceScore * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <motion.div
                    className="h-2 origin-left rounded-full bg-primary"
                    style={{ width: `${d.confidenceScore * 100}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
                  />
                </div>
              </div>
              {lowConfidence && (
                <p className="flex items-start gap-2 rounded-2xl bg-status-soon-soft p-3 text-xs text-status-soon">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  Low confidence. Please check the food yourself before eating.
                </p>
              )}
              <ul className="space-y-2">
                {(d.explanation ?? []).map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" /> {line}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">Checked by: {SOURCE_LABELS[d.freshnessSource]}</p>
            </section>
          ) : (
            <section className="rounded-3xl border bg-card p-4 text-sm text-muted-foreground shadow-sm md:p-6">
              Freshness check pending. The safety check runs once the donation is analysed.
            </section>
          )}

          {isOwner && (
            <section className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
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
                          <Button size="sm" disabled={busy} onClick={() => run(() => acceptClaim(c.id))}>
                            Accept
                          </Button>
                        )}
                        {c.status === "RequestAccepted" && (
                          <Button size="sm" disabled={busy} onClick={() => run(() => completeClaim(c))}>
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
            </section>
          )}

          {!isOwner && (
            <div className="hidden gap-3 md:flex">
              <Actions enabled={enabled} label={label} busy={busy} done={requested} onRequest={handleRequest} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            role="alert"
            {...swap}
            className="fixed inset-x-5 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background shadow-lg md:bottom-8"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            role="alert"
            {...swap}
            className="fixed inset-x-5 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-foreground px-4 py-3 text-center text-sm font-medium text-background shadow-lg md:bottom-8"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOwner && (
        <div className="sticky bottom-0 flex gap-3 border-t bg-background/95 p-4 backdrop-blur md:hidden">
          <Actions enabled={enabled} label={label} busy={busy} done={requested} onRequest={handleRequest} />
        </div>
      )}
    </div>
  )
}
