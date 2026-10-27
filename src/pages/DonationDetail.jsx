import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { MapPin, Clock, Thermometer, Package, MessageCircle, HandHeart, Info, TriangleAlert, Loader2 } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"
import { EASE_OUT, SPRING_SOFT } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useDonation } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useMyClaims, useDonationClaims } from "@/hooks/useClaims"
import { distanceKm as calcKm } from "@/lib/donations"
import { createClaim, acceptClaim, completeClaim, CLAIM_LABELS } from "@/lib/claims"
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
    <StaggerItem className="rounded-2xl border bg-card p-3 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </StaggerItem>
  )
}

function Actions({ enabled, label, busy, onRequest }) {
  return (
    <>
      <Button variant="outline" size="lg" className="flex-1" onClick={() => toast("Chat is coming soon", { description: "For now, request the food and the donor will see it." })}>
        <MessageCircle /> Message
      </Button>
      <Button size="lg" className="flex-1" disabled={!enabled || busy} onClick={onRequest}>
        {busy ? <Loader2 className="animate-spin" /> : <HandHeart />} {label}
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
      navigate("/requests")
    }, "Request sent")
  }

  if (loading) {
    return (
      <div className="min-h-dvh md:min-h-0" role="status" aria-label="Loading donation">
        <PageHeader title="Donation details" />
        <div className="grid gap-5 px-5 pt-2 pb-6 md:grid-cols-2 md:gap-8 md:px-0">
          <div className="space-y-5">
            <Skeleton className="h-44 rounded-3xl md:h-72" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
            <Skeleton className="h-20 rounded-3xl" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        </div>
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
            <Reveal as="section" delay={0.12} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
              <h3 className="font-semibold">Freshness check</h3>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Confidence</span>
                  <span>{Math.round(d.confidenceScore * 100)}%</span>
                </div>
                {/* The fill slides in with transform (not width) so it stays smooth on phones. */}
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-2 w-full rounded-full bg-primary"
                    initial={{ x: "-100%" }}
                    animate={{ x: `${-(1 - (Number(d.confidenceScore) || 0)) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.35, ease: EASE_OUT }}
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
            </Reveal>
          ) : (
            <Reveal as="section" delay={0.12} className="rounded-3xl border bg-card p-4 text-sm text-muted-foreground shadow-sm md:p-6">
              Freshness check pending. The safety check runs once the donation is analysed.
            </Reveal>
          )}

          {isOwner && (
            <Reveal as="section" delay={0.18} className="space-y-3 rounded-3xl border bg-card p-4 shadow-sm md:p-6">
              <h3 className="font-semibold">Requests ({incoming.length})</h3>
              {incoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one has requested this yet.</p>
              ) : (
                incoming.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING_SOFT}
                    className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.recipientName}</p>
                      <p className="text-xs text-muted-foreground">Requested {formatElapsed(c.requestedAt)}</p>
                    </div>
                    {c.status === "Pending" && (
                      <Button size="sm" disabled={busy} onClick={() => run(() => acceptClaim(c.id), "Request accepted")}>
                        {busy && <Loader2 className="animate-spin" />}
                        Accept
                      </Button>
                    )}
                    {c.status === "RequestAccepted" && (
                      <Button size="sm" disabled={busy} onClick={() => run(() => completeClaim(c), "Marked as picked up")}>
                        {busy && <Loader2 className="animate-spin" />}
                        Mark picked up
                      </Button>
                    )}
                    {c.status === "Claimed" && (
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", CLAIM_PILL.Claimed)}>
                        {CLAIM_LABELS.Claimed}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </Reveal>
          )}

          {!isOwner && (
            <Reveal delay={0.22} className="hidden gap-3 md:flex">
              <Actions enabled={enabled} label={label} busy={busy} onRequest={handleRequest} />
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
          <Actions enabled={enabled} label={label} busy={busy} onRequest={handleRequest} />
        </motion.div>
      )}
    </div>
  )
}
