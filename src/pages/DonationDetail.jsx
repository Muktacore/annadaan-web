import { useParams, useNavigate, Link } from "react-router-dom"
import { MapPin, Clock, Thermometer, Package, MessageCircle, HandHeart, Info, TriangleAlert } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import CategoryIcon from "@/components/CategoryIcon"
import FreshnessBadge from "@/components/FreshnessBadge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useDonation } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { distanceKm as calcKm } from "@/lib/donations"
import {
  CATEGORY_LABELS, STORAGE_LABELS, COVERED_LABELS, SOURCE_LABELS, formatElapsed,
} from "@/lib/mockData"

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

function Actions({ canRequest, navigate }) {
  return (
    <>
      <Button variant="outline" size="lg" className="flex-1" onClick={() => alert("Chat comes later")}>
        <MessageCircle /> Message
      </Button>
      <Button size="lg" className="flex-1" disabled={!canRequest} onClick={() => navigate("/requests")}>
        <HandHeart /> {canRequest ? "Request food" : "Unavailable"}
      </Button>
    </>
  )
}

export default function DonationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { donation, loading } = useDonation(id)
  const origin = useUserLocation()
  const d = donation ? { ...donation, distanceKm: calcKm(origin, donation.location) } : null

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

  const canRequest = d.status === "available" && d.freshnessLabel !== "unsafe"
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
            <InfoTile icon={Clock} label="Cooked" value={formatElapsed(d.cookedAt)} />
            <InfoTile icon={Thermometer} label="Storage" value={STORAGE_LABELS[d.storageCondition]} />
            <InfoTile icon={Package} label="Cover" value={COVERED_LABELS[d.isCovered]} />
            <InfoTile icon={MapPin} label="Distance" value={d.distanceKm != null ? `${d.distanceKm} km away` : "-"} />
          </div>

          <div className="flex items-center gap-3 rounded-3xl border bg-card p-4">
            <Avatar>
              <AvatarFallback className="bg-secondary text-primary">{d.donorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{d.donorName}</p>
              <p className="text-xs text-muted-foreground">Donor</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold md:text-3xl">{CATEGORY_LABELS[d.foodCategory]}</h2>
              <p className="text-sm text-muted-foreground">{d.quantity} {d.unit}</p>
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
              {d.explanation.map((line) => (
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

          <div className="hidden gap-3 md:flex">
            <Actions canRequest={canRequest} navigate={navigate} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-3 border-t bg-background/95 p-4 backdrop-blur md:hidden">
        <Actions canRequest={canRequest} navigate={navigate} />
      </div>
    </div>
  )
}