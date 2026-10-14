import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { MapPin, Clock, Thermometer, Package, MessageCircle, HandHeart, Info, TriangleAlert } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { Companion } from "@/components/characters/Companion"
import { useGlance, usePulse } from "@/components/characters/companionHooks"

// glance toward the donation information after the page settles
const INFO_GLANCE = [{ x: -0.6, y: 0.7 }]
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    <div className="rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function Actions({ enabled, label, busy, onRequest, onAttend }) {
  return (
    <>
      <Button variant="outline" size="lg" className="flex-1" onClick={() => alert("Chat comes later")}>
        <MessageCircle /> Message
      </Button>
      <Button size="lg" className="flex-1" disabled={!enabled || busy} onClick={onRequest} onPointerEnter={onAttend} onFocus={onAttend}>
        <HandHeart /> {label}
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
  const [failed, setFailed] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [attend, setAttend] = useState(0)
  const glance = useGlance(INFO_GLANCE, { delay: 1800, hold: 1800 })
  const attendPulse = usePulse(attend)

  const d = donation ? { ...donation, distanceKm: calcKm(origin, donation.location) } : null
  const myClaim = d ? myClaims.find((c) => c.donationId === d.id) : null

  const run = async (fn) => {
    setBusy(true)
    setFailed(false)
    try {
      await fn()
    } catch (err) {
      console.error(err)
      setFailed(true)
      alert(err?.message || "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  const handleRequest = () => {
    if (myClaim) return navigate(`/requests/${myClaim.id}`)
    return run(async () => {
      await createClaim({ user, donation: d })
      setSucceeded(true)
      navigate("/requests")
    })
  }

  if (loading) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Donation" />
        <div className="flex items-center gap-4 px-5 pt-6">
          <Companion role="details" expression="relaxed" className="w-[72px]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!d) {
    return (
      <div className="min-h-dvh">
        <PageHeader title="Donation" />
        <div className="flex items-center gap-4 px-5 pt-6">
          <Companion role="details" expression="concerned" className="w-[72px]" />
          <p className="text-muted-foreground">
            Donation not found. <Link to="/home" className="text-primary underline">Go home</Link>
          </p>
        </div>
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

      <div className="px-5 pt-1 md:px-0">
        <Companion
          role="details"
          expression={succeeded ? "happy" : failed ? "concerned" : busy ? "relaxed" : "attentive"}
          gaze={glance}
          tilt={attendPulse}
          className="w-[clamp(64px,15vw,88px)]"
        />
      </div>

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
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${d.confidenceScore * 100}%` }} />
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
              {incoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No one has requested this yet.</p>
              ) : (
                incoming.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.recipientName}</p>
                      <p className="text-xs text-muted-foreground">Requested {formatElapsed(c.requestedAt)}</p>
                    </div>
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
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", CLAIM_PILL.Claimed)}>
                        {CLAIM_LABELS.Claimed}
                      </span>
                    )}
                  </div>
                ))
              )}
            </section>
          )}

          {!isOwner && (
            <div className="hidden gap-3 md:flex">
              <Actions enabled={enabled} label={label} busy={busy} onRequest={handleRequest} onAttend={() => setAttend((n) => n + 1)} />
            </div>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="sticky bottom-0 flex gap-3 border-t bg-background/95 p-4 backdrop-blur md:hidden">
          <Actions enabled={enabled} label={label} busy={busy} onRequest={handleRequest} onAttend={() => setAttend((n) => n + 1)} />
        </div>
      )}
    </div>
  )
}
