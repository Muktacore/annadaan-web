import { useEffect, useMemo, useRef, useState } from "react"
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
  AlertCircle,
} from "lucide-react"

import DonationCard from "@/components/DonationCard"
import DonationCardSkeleton from "@/components/DonationCardSkeleton"
import CategoryIcon from "@/components/CategoryIcon"
import BaseFreshnessBadge from "@/components/FreshnessBadge"
import CountUp from "@/components/motion/CountUp"
import { Stagger, StaggerItem } from "@/components/motion/Reveal"
import { useAvailableDonations } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { distanceKm as calcKm } from "@/lib/donations"
import { CATEGORY_LABELS } from "@/lib/mockData"

// Only render a freshness badge once an ML/rule result exists.
const FreshnessBadge = (props) =>
  props.label ? <BaseFreshnessBadge {...props} /> : null

const STATUS_COLOR = {
  safe: "#4F8A4B",
  consume_soon: "#C98A1E",
  unsafe: "#B3392F",
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const isDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches

// Smoothly fits the map to all markers. First fit is instant, later ones fly.
// Keyed on the point values so a realtime update with the same pins does not re-fly.
function FitBounds({ points }) {
  const map = useMap()
  const first = useRef(true)
  const key = points.map((p) => p.join(",")).join("|")

  useEffect(() => {
    if (!key) return
    const pts = key.split("|").map((s) => s.split(",").map(Number))
    const animate = !first.current && !prefersReducedMotion()
    first.current = false

    if (pts.length === 1) {
      map.flyTo(pts[0], 14, { animate, duration: 0.8 })
      return
    }

    map.flyToBounds(pts, { padding: [32, 32], animate, duration: 0.8 })
  }, [key, map])

  return null
}

// Flies to a marker when it is clicked.
function FlyToTarget({ target }) {
  const map = useMap()

  useEffect(() => {
    if (!target) return
    const zoom = Math.max(map.getZoom(), 14)
    if (prefersReducedMotion()) {
      map.setView([target.lat, target.lng], zoom)
    } else {
      map.flyTo([target.lat, target.lng], zoom, { duration: 0.8 })
    }
  }, [target, map])

  return null
}

function EmptyDonationsState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[#D8DDCC] bg-[#F7F5ED] px-5 py-9 text-center dark:border-[#34483A] dark:bg-[#202C24] sm:py-12">
      <img
        src="/images/characters/map.png"
        alt="Anna Daan map character"
        className="h-36 w-36 object-contain sm:h-44 sm:w-44"
        loading="lazy"
        draggable={false}
      />

      <div className="flex items-center gap-2">
        <HeartHandshake className="size-5 text-[#496D53] dark:text-[#A7C6A5]" />

        <p className="font-semibold">
          No donations available right now
        </p>
      </div>

      <p className="max-w-xs text-sm leading-6 text-muted-foreground">
        Check back later for new food listings. Every shared meal can make
        a difference in someone's day.
      </p>
    </div>
  )
}

export default function AvailableDonationsMap() {
  const { donations: live, loading, error } = useAvailableDonations()
  const origin = useUserLocation()

  // hoverId: card or marker currently hovered. selectedId: last clicked marker.
  const [hoverId, setHoverId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const cardRefs = useRef(new Map())

  // Scroll-wheel zoom only on desktop (prevents scroll-trap on phones).
  const [wheelZoom] = useState(() => isDesktop())

  const available = useMemo(
    () =>
      live
        .filter((d) => d.status === "available" && d.location)
        .map((d) => ({
          ...d,
          distanceKm: calcKm(origin, d.location),
        })),
    [live, origin]
  )

  const points = useMemo(
    () => available.map((d) => [d.location.lat, d.location.lng]),
    [available]
  )

  const center = points[0] ?? [19.3919, 72.8397]
  const highlightId = hoverId ?? selectedId

  function handleMarkerClick(d) {
    setSelectedId(d.id)
    setFlyTarget({ lat: d.location.lat, lng: d.location.lng })

    // On desktop the list sits beside the map, so bring the card into view.
    // On phones the list is below the map - scrolling would hide the map.
    if (isDesktop()) {
      cardRefs.current.get(d.id)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      })
    }
  }

  return (
    <div className="space-y-6 px-5 pt-8 pb-8 md:space-y-8 md:px-0 md:pt-10">

      <Stagger className="space-y-6 md:space-y-8">
        {/* Heading */}
        <StaggerItem>
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
        </StaggerItem>

        {/* Availability Banner */}
        <StaggerItem>
          <section className="relative overflow-hidden rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 dark:border-[#3C5742] dark:bg-[#293B2F] sm:p-5">
            <div className="absolute -right-8 -top-10 size-32 rounded-full bg-[#B6C5A4]/35 dark:bg-[#6D8B6A]/15" />

            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
                <HeartHandshake className="size-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-2xl font-extrabold text-[#315D45] dark:text-[#B7D9B3]">
                  {error ? "—" : <CountUp value={available.length} />}
                </p>

                <p className="text-sm text-[#617D62] dark:text-[#A6C0A3]">
                  {error ? "Live count unavailable" : "Food donations available"}
                </p>
              </div>

              <div className="hidden items-center gap-1.5 rounded-full bg-[#D1E2C9] px-3 py-2 text-xs font-semibold text-[#496D53] dark:bg-[#3A5742] dark:text-[#B1D1AA] sm:flex">
                <Sparkles className="size-3.5" />
                Share kindness
              </div>
            </div>
          </section>
        </StaggerItem>
      </Stagger>

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
              {error ? "List unavailable" : `${available.length} listings`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <DonationCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-status-soon/30 bg-status-soon-soft/50 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-status-soon" />
              <div>
                <p className="font-semibold text-foreground">Food listings couldn’t load</p>
                <p className="mt-1 leading-5 text-muted-foreground">The live donation list is temporarily unavailable. Please try again in a moment.</p>
              </div>
            </div>
          ) : available.length > 0 ? (
            <div className="space-y-3">
              {available.map((d, i) => (
                <div
                  key={d.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(d.id, el)
                    else cardRefs.current.delete(d.id)
                  }}
                  onMouseEnter={() => setHoverId(d.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(d.id)}
                  onBlur={() => setHoverId(null)}
                  className={`min-w-0 rounded-3xl transition-shadow duration-200 ${
                    highlightId === d.id ? "ring-2 ring-primary/40" : ""
                  }`}
                >
                  <DonationCard donation={d} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyDonationsState />
          )}
        </section>

        {/* Interactive Map */}
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
                scrollWheelZoom={wheelZoom}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds points={points} />
                <FlyToTarget target={flyTarget} />

                {available.map((d) => {
                  const active = highlightId === d.id
                  const pos = [d.location.lat, d.location.lng]

                  return [
                    // soft halo behind the active marker
                    active && (
                      <CircleMarker
                        key={`${d.id}-ring`}
                        center={pos}
                        radius={20}
                        interactive={false}
                        pathOptions={{
                          stroke: false,
                          fillColor:
                            STATUS_COLOR[d.freshnessLabel] ?? "#81927A",
                          fillOpacity: 0.28,
                        }}
                      />
                    ),
                    <CircleMarker
                      key={d.id}
                      center={pos}
                      radius={active ? 14 : 10}
                      pathOptions={{
                        color: "#fff",
                        weight: active ? 3 : 2,
                        fillColor:
                          STATUS_COLOR[d.freshnessLabel] ?? "#81927A",
                        fillOpacity: 0.95,
                      }}
                      eventHandlers={{
                        mouseover: () => setHoverId(d.id),
                        mouseout: () => setHoverId(null),
                        click: () => handleMarkerClick(d),
                        popupclose: () =>
                          setSelectedId((cur) => (cur === d.id ? null : cur)),
                      }}
                    >
                      <Popup autoPan={false}>
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
                            {d.donorName} · {d.quantity} {d.unit} ·{" "}
                            {d.distanceKm != null
                              ? `${d.distanceKm} km`
                              : "nearby"}
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
                    </CircleMarker>,
                  ]
                })}
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
