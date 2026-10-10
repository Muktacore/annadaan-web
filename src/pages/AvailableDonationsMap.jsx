
import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import {
  MapPin,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  Navigation,
  Leaf,
} from "lucide-react"

import DonationCard from "@/components/DonationCard"
import CategoryIcon from "@/components/CategoryIcon"
import BaseFreshnessBadge from "@/components/FreshnessBadge"
import { useAvailableDonations } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { distanceKm as calcKm } from "@/lib/donations"

// Only render a freshness badge once an ML/rule result exists.
const FreshnessBadge = (props) =>
  props.label ? <BaseFreshnessBadge {...props} /> : null

import { donations, CATEGORY_LABELS } from "@/lib/mockData"

const STATUS_COLOR = {
  safe: "#4F8A4B",
  consume_soon: "#C98A1E",
  unsafe: "#B3392F",
}

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }

    map.fitBounds(points, { padding: [32, 32] })
  }, [points, map])

  return null
}

export default function AvailableDonationsMap() {
  const { donations: live } = useAvailableDonations()
  const origin = useUserLocation()

  const available = useMemo(
    () =>
      live
        .filter((d) => d.status === "available" && d.location)
        .map((d) => ({ ...d, distanceKm: calcKm(origin, d.location) })),
    [live, origin]
  )

  const points = useMemo(
    () => available.map((d) => [d.location.lat, d.location.lng]),
    [available]
  )

  const center = points[0] ?? [19.3919, 72.8397]

  return (
    <div className="space-y-6 px-5 pt-8 pb-8 md:space-y-8 md:px-0 md:pt-10">

      {/* Heading */}
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-[#52745A] dark:text-[#A4C5A4]">
          <Leaf className="size-4" />
          Food sharing around you
        </p>

        <h1 className="mt-1 text-2xl font-extrabold md:text-4xl">
          Nearby donations
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
          Discover available food and connect with people sharing a little kindness.
        </p>
      </div>

      {/* Availability Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 dark:border-[#3C5742] dark:bg-[#293B2F] sm:p-5">

        <div className="absolute -right-8 -top-10 size-32 rounded-full bg-[#B6C5A4]/35 dark:bg-[#6D8B6A]/15" />

        <div className="relative flex items-center gap-3 sm:gap-4">

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
            <HeartHandshake className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-2xl font-extrabold text-[#315D45] dark:text-[#B7D9B3]">
              {available.length}
            </p>

            <p className="text-sm text-[#617D62] dark:text-[#A6C0A3]">
              Food donations available
            </p>
          </div>

          <div className="hidden items-center gap-1.5 rounded-full bg-[#D1E2C9] px-3 py-2 text-xs font-semibold text-[#496D53] dark:bg-[#3A5742] dark:text-[#B1D1AA] sm:flex">
            <Sparkles className="size-3.5" />
            Share kindness
          </div>

        </div>
      </section>

      {/* Map and Donations */}
      <div className="grid min-w-0 gap-5 md:grid-cols-[1.1fr_1fr] md:gap-8">

        {/* Donation List */}
        <section className="order-2 min-w-0 space-y-4 md:order-1">

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Available food
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Explore what's being shared
              </p>
            </div>

            <span className="rounded-full bg-[#F3E7BD] px-3 py-1.5 text-xs font-semibold text-[#80652F] dark:bg-[#403720] dark:text-[#D0B978]">
              {available.length} listings
            </span>
          </div>

          {available.length ? (
            <div className="space-y-3">
              {available.map((d) => (
                <div
                  key={d.id}
                  className="min-w-0 rounded-3xl transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <DonationCard donation={d} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#D8DDCC] bg-[#F7F5ED] px-5 py-12 text-center dark:border-[#34483A] dark:bg-[#202C24]">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E3EBD9] text-[#496D53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
                <HeartHandshake className="size-7" />
              </div>

              <p className="font-semibold">No donations available right now</p>

              <p className="max-w-xs text-sm text-muted-foreground">
                Check back later for new food listings.
              </p>
            </div>
          )}

        </section>

        {/* Map */}
        <section className="order-1 min-w-0 md:order-2">

          <div className="overflow-hidden rounded-3xl border border-[#D8DDCC] bg-card shadow-sm dark:border-border">

            <div className="flex items-center justify-between gap-3 bg-[#E5EDDC] px-4 py-3 dark:bg-[#293B2F] sm:px-5">

              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
                  <MapPin className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#344B36] dark:text-foreground">
                    Donation map
                  </p>

                  <p className="text-xs text-[#617D62] dark:text-[#A6C0A3]">
                    Tap a marker to explore
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-[#496D53] dark:bg-[#3A5742] dark:text-[#B1D1AA]">
                Live map view
              </span>

            </div>

            <div className="relative h-[40vh] min-h-[300px] max-h-[480px] overflow-hidden sm:h-[48vh] md:sticky md:top-6 md:h-[70vh] md:max-h-[720px]">

              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds points={points} />

                {available.map((d) => (
                  <CircleMarker
                    key={d.id}
                    center={[d.location.lat, d.location.lng]}
                    radius={10}
                    pathOptions={{
                      color: "#fff",
                      weight: 2,
                      fillColor:
                        STATUS_COLOR[d.freshnessLabel] ?? "#81927A",
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px] space-y-2 p-1">

                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            category={d.foodCategory}
                            className="size-5 text-primary"
                          />

                          <p className="text-sm font-semibold">
                            {CATEGORY_LABELS[d.foodCategory]}
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {d.donorName} · {d.quantity} {d.unit} · {d.distanceKm != null ? `${d.distanceKm} km` : "nearby"}
                        </p>

                        <FreshnessBadge
                          label={d.freshnessLabel}
                          compact
                        />

                        <Link
                          to={`/donation/${d.id}`}
                          className="flex items-center gap-1 pt-1 text-xs font-semibold text-primary"
                        >
                          View details
                          <ArrowRight className="size-3" />
                        </Link>

                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

            </div>

          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
            <Navigation className="size-3.5 shrink-0" />
            Tap a pin to see donation details.
          </p>

        </section>

      </div>
    </div>
  )
}