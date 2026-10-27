import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Utensils, Leaf, Users, Plus, ArrowRight, AlertCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import DonationCard from "@/components/DonationCard"
import CountUp from "@/components/motion/CountUp"
import DonationCardSkeleton from "@/components/DonationCardSkeleton"
import ThemeToggle from "@/components/ThemeToggle"
import { useAvailableDonations } from "@/hooks/useDonations"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useCommunityStats } from "@/hooks/useCommunityStats"
import { distanceKm as calcKm } from "@/lib/donations"
import { useAuth } from "@/context/AuthContext"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"

function EmptyDonations({ reduceMotion, onDonate }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="empty-donations"
    >
    <FoodBoxCharacter
      type="meditating"
      reduceMotion={reduceMotion}
    />

      <div className="max-w-md">
        <p className="text-lg font-bold text-foreground">
          Every little share matters
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No available donations nearby just yet. You could be the first to
          share a meal with someone in your community.
        </p>

        <Button
          className="mt-4 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
          onClick={onDonate}
        >
          <Plus className="mr-1 size-4" />
          Share a meal
        </Button>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()

  const firstName = (
    user?.displayName || user?.email?.split("@")[0] || "Friend"
  ).split(" ")[0]

  const { donations, loading, error } = useAvailableDonations()
  const origin = useUserLocation()
  const { stats: community } = useCommunityStats()

  // Real numbers from Firestore donations.
  const STATS = [
    { icon: Utensils, value: community.mealsShared, suffix: "", label: "Meals shared" },
    { icon: Leaf, value: community.listingsLive, suffix: "", label: "Listings live" },
    { icon: Users, value: community.activeDonors, suffix: "", label: "Active donors" },
  ]

  // The banner mascot cheers when you hover / press the banner.
  const [cheer, setCheer] = useState(false)
  useEffect(() => {
    // warm the cache so the swap to the celebrating pose never flickers
    const img = new Image()
    img.src = "/images/characters/box_celebrating.png"
  }, [])

  const withDistance = donations.map((d) => ({
    ...d,
    distanceKm: calcKm(origin, d.location),
  }))

  const nearby = withDistance
    .filter((d) => d.status === "available")
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const enter = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  return (
    <div className="home-dashboard space-y-6 px-5 pt-8 pb-6 md:space-y-8 md:px-0 md:pt-10">
      {/* Welcome */}
      <motion.div
        variants={enter}
        initial="hidden"
        animate="visible"
        custom={0}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">Namaste,</p>

          <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight md:text-4xl">
            {firstName}{" "}
          </h1>
        </div>

        <ThemeToggle className="md:hidden" />
      </motion.div>

      {/* Statistics and donor banner */}
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:gap-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {STATS.map(({ icon: Icon, value, suffix, label }, index) => (
            <motion.div
              key={label}
              variants={enter}
              initial="hidden"
              animate="visible"
              custom={0.08 + index * 0.1}
              whileHover={
                reduceMotion ? undefined : { y: -5, scale: 1.015 }
              }
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="stat-card flex flex-col items-center justify-center rounded-3xl border bg-card p-3 text-center md:p-5"
            >
              <div>
                <Icon className="size-5 text-primary md:size-7" />
              </div>

              <p className="mt-2 text-lg font-extrabold md:text-2xl">
                <CountUp value={value} suffix={suffix} />
              </p>

              <p className="text-[11px] leading-tight text-muted-foreground md:text-sm">
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Donor banner */}
        <motion.div
          variants={enter}
          initial="hidden"
          animate="visible"
          custom={0.2}
          onPointerEnter={() => setCheer(true)}
          onPointerLeave={() => setCheer(false)}
          className="donor-banner relative isolate overflow-hidden rounded-3xl bg-clay p-5 text-clay-foreground md:p-8"
        >
          <div className="relative z-10 max-w-[75%] sm:max-w-[78%]">
            <h2 className="text-lg font-extrabold md:text-2xl">
              Become a donor
            </h2>

            <p className="mt-1 text-sm leading-6 opacity-95 md:text-base">
              Every plate you share keeps good food out of the bin and feeds
              someone nearby.
            </p>

            <motion.div
              whileHover={reduceMotion ? undefined : { x: 3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className="mt-4 inline-block"
            >
              <Button
                className="bg-card text-foreground shadow-sm transition-colors hover:bg-card/90"
                onClick={() => navigate("/donate")}
              >
                <Plus className="mr-1 size-4" />
                Donate food
              </Button>
            </motion.div>
          </div>

          {/* New food-box character */}
         <div className="donor-banner__mascot">
            <FoodBoxCharacter
              type={cheer ? "celebrating" : "flying"}
              reduceMotion={reduceMotion}
              static
              decorative
           />
         </div>
        </motion.div>
      </div>

      {/* Nearby donations */}
      <motion.section
        variants={enter}
        initial="hidden"
        animate="visible"
        custom={0.25}
        className="space-y-3 md:space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold md:text-xl">
            Nearby donations
          </h2>

          <Link
            to="/map"
            className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            View map
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }, (_, i) => <DonationCardSkeleton key={i} />)}

          {!loading && error && (
            <div role="alert" className="col-span-full flex items-start gap-3 rounded-2xl border border-status-soon/30 bg-status-soon-soft/50 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-status-soon" />
              <div>
                <p className="font-semibold text-foreground">Nearby food couldn’t load</p>
                <p className="mt-1 text-muted-foreground">Your live donation list is temporarily unavailable. Please try again in a moment.</p>
              </div>
            </div>
          )}

          {!loading && !error && nearby.length === 0 && (
            <div className="col-span-full">
              <EmptyDonations
                reduceMotion={reduceMotion}
                onDonate={() => navigate("/donate")}
              />
            </div>
          )}

          {/* DonationCard animates itself (staggered by index) */}
          {nearby.map((d, i) => (
            <DonationCard key={d.id} donation={d} index={i} />
          ))}
        </div>
      </motion.section>
    </div>
  )
}