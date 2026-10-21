
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  UserRound,
  Mail,
  MapPin,
  Settings2,
  History,
  Pencil,
  Camera,
  HeartHandshake,
  Utensils,
  HandHeart,
  CircleHelp,
  LogOut,
  ChevronRight,
  Check,
  Leaf,
  Sparkles,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CountUp from "@/components/motion/CountUp"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal"
import { cn } from "@/lib/utils"
import { DUR, EASE_OUT, SPRING_SNAPPY } from "@/lib/motion"
import { useMyDonations } from "@/hooks/useMyDonations"
import { useAuth } from "@/context/AuthContext"
import { logOut } from "@/lib/auth"

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const { donations: myDonations } = useMyDonations(user?.uid)

  const [editing, setEditing] = useState(false)
  const [avatar, setAvatar] = useState(user?.photoURL || null)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [confirmLogout, setConfirmLogout] = useState(false)

  // The logout confirm step quietly resets after a few seconds.
  useEffect(() => {
    if (!confirmLogout) return
    const t = setTimeout(() => setConfirmLogout(false), 3500)
    return () => clearTimeout(t)
  }, [confirmLogout])

  const [profile, setProfile] = useState({
    name: user?.displayName || user?.email?.split("@")[0] || "",
    email: user?.email || "",
    location: "",
    bio: "A little kindness goes a long way.",
  })

  const [savedProfile, setSavedProfile] = useState(profile)

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const saveProfile = (e) => {
    e.preventDefault()
    setSavedProfile(profile)
    setEditing(false)
    toast.success("Profile updated")
  }

  const cancelEdit = () => {
    setProfile(savedProfile)
    setEditing(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      e.target.value = ""
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setAvatar(reader.result)
      setAvatarVersion((v) => v + 1)
      toast.success("Photo updated")
    }

    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true)
      return
    }
    try {
      await logOut()
    } catch (err) {
      console.error("Logout failed:", err)
    }
    navigate("/login")
  }

  const displayName = savedProfile.name.trim() || "Food Friend"

  const donationCount = myDonations.length
  const mealsShared = myDonations.reduce(
    (sum, d) => sum + (d.status === "claimed" ? Number(d.quantity) || 0 : 0),
    0
  )

  const settings = [
    {
      icon: Info,
      title: "About AnnaDaan",
      description: "Our story and values",
      to: "/about",
      color:
        "bg-[#F9E7C9] text-[#9A6B25] dark:bg-[#493A26] dark:text-[#E7C17C]",
    },
    {
      icon: CircleHelp,
      title: "Help & Support",
      description: "FAQs and contact",
      to: "/help",
      color:
        "bg-[#F3DFD7] text-[#A65F45] dark:bg-[#482F29] dark:text-[#E5A58A]",
    },
  ]

  return (
    <div className="px-5 pt-8 pb-8 text-foreground md:px-0 md:pt-10">

      <div className="mx-auto w-full max-w-6xl space-y-7">

        {/* Page Heading */}
        <Reveal as="header" className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A8065] dark:text-[#BBA58C]">
              Your little corner
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#344B36] dark:text-foreground sm:text-4xl">
              My Profile
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            aria-label="Edit profile"
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E5DFD0] bg-[#FFFDF8] text-[#526C53] shadow-sm transition hover:bg-[#E8EEDC] active:scale-95 dark:border-border dark:bg-card dark:text-[#B1D1AA] dark:hover:bg-accent"
          >
            <motion.span
              animate={{ rotate: editing ? 90 : 0 }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="flex"
            >
              <Settings2 size={21} />
            </motion.span>
          </button>
        </Reveal>

        {/* Profile Hero */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: EASE_OUT }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#526C53] via-[#49644D] to-[#354D3B] p-5 text-white shadow-xl shadow-[#526C53]/15 dark:from-[#2D4034] dark:via-[#263829] dark:to-[#1B2A20] dark:shadow-black/30 sm:p-8">

          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-24 size-64 rounded-full bg-[#D5A06C]/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

              {/* Avatar */}
              <div className="relative w-fit shrink-0">

                <motion.div
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-[88px] cursor-pointer items-center justify-center overflow-hidden rounded-[1.8rem] border-4 border-[#F5E8D6] bg-[#F5E8D6] shadow-lg dark:border-[#3C5742] dark:bg-[#D9D3C2] sm:size-28"
                >

                  {avatar ? (
                    <motion.img
                      key={avatarVersion}
                      src={avatar}
                      referrerPolicy="no-referrer"
                      alt="Your profile"
                      initial={avatarVersion ? { opacity: 0, scale: 0.88 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      className="size-full object-cover"
                    />
                  ) : (
                    <img
                      src="/images/annadaan-logo.png"
                      alt="AnnaDaan default profile"
                      className="size-full object-contain p-2 dark:mix-blend-multiply"
                    />
                  )}

                </motion.div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile picture"
                  className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border-4 border-[#526C53] bg-[#E8C96B] text-[#344B36] shadow-sm dark:border-[#2D4034] dark:bg-[#D9B955] transition hover:scale-105 active:scale-95"
                >
                  <Camera size={15} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Choose profile picture"
                />

              </div>

              <div className="min-w-0">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#F9E8C7] dark:bg-white/10">
                  <Sparkles size={12} />
                  COMMUNITY MEMBER
                </span>

                <h2 className="mt-3 break-words text-2xl font-bold sm:text-3xl">
                  Hello, {displayName}!
                </h2>

                <p className="mt-2 max-w-sm break-words text-sm leading-6 text-[#E9EBDD]/90">
                  {savedProfile.bio}
                </p>

                {savedProfile.location && (
                  <p className="mt-3 flex items-center gap-1.5 break-words text-sm text-[#E9EBDD]">
                    <MapPin size={15} className="shrink-0" />
                    {savedProfile.location}
                  </p>
                )}

              </div>
            </div>

            {/* Hero Message */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 dark:border-white/10 dark:bg-white/5 sm:max-w-[190px] sm:flex-col sm:items-start">

              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#D5A06C] text-[#513D29]">
                <HeartHandshake size={23} />
              </div>

              <div>
                <p className="text-lg font-semibold text-[#FFF7E9]">
                  Every meal matters.
                </p>

                <p className="mt-1 text-xs leading-5 text-[#E9EBDD]/80">
                  Thank you for being part of AnnaDaan.
                </p>
              </div>

            </div>

          </div>
        </motion.section>

        {/* Statistics */}
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5" delay={0.15}>

          {/* Donations */}
          <StaggerItem className="relative overflow-hidden rounded-3xl border border-[#D2DDC7] bg-[#E5EDDC] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-[0.985] dark:border-[#3C5742] dark:bg-[#293B2F] sm:p-6">

            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#526C53] text-white dark:bg-[#3A5742] dark:text-[#B1D1AA]">
              <HandHeart size={22} />
            </div>

            <p className="mt-5 text-3xl font-bold text-[#315D45] dark:text-[#B7D9B3]">
              <CountUp value={donationCount} />
            </p>

            <p className="mt-1 text-sm text-[#617D62] dark:text-[#A6C0A3]">
              Donations
            </p>

            <span className="absolute -bottom-5 -right-4 size-20 rounded-full bg-[#B6C5A4]/40 dark:bg-[#6D8B6A]/15" />
          </StaggerItem>

          {/* Meals Shared */}
          <StaggerItem className="relative overflow-hidden rounded-3xl border border-[#E5CCB8] bg-[#F3E3D5] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-[0.985] dark:border-[#614638] dark:bg-[#382C25] sm:p-6">

            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#C77D5B] text-white dark:bg-[#754B39] dark:text-[#F0C5A2]">
              <Utensils size={22} />
            </div>

            <p className="mt-5 text-3xl font-bold text-[#704A32] dark:text-[#F0C5A2]">
              <CountUp value={mealsShared} />
            </p>

            <p className="mt-1 text-sm text-[#87684F] dark:text-[#C9AD96]">
              Meals Shared
            </p>

            <span className="absolute -bottom-5 -right-4 size-20 rounded-full bg-[#E5B89D]/40 dark:bg-[#A66D50]/15" />
          </StaggerItem>

          {/* Journey */}
          <StaggerItem className="relative col-span-2 overflow-hidden rounded-3xl border border-[#E8D69D] bg-[#F3E7BD] p-4 shadow-sm transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-[0.985] dark:border-[#66542F] dark:bg-[#403720] sm:col-span-1 sm:p-6">

            <div className="relative z-10 max-w-[75%] sm:max-w-full">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#D5A344] text-white dark:bg-[#80652F] dark:text-[#F5D994]">
                <Sparkles size={22} />
              </div>

              <p className="mt-4 text-xl font-bold text-[#705622] dark:text-[#F1D99A] sm:text-2xl">
                Start your journey
              </p>

              <p className="mt-1 text-xs leading-5 text-[#8B702C] dark:text-[#D0B978]">
                Small acts create meaningful change.
              </p>
            </div>

          </StaggerItem>

        </Stagger>

        {/* Main Content */}
        <Reveal delay={0.25} className="grid min-w-0 gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Personal Information */}
          <section className="min-w-0 rounded-[1.8rem] border border-[#E9E3D6] bg-[#FFFDF8] p-5 shadow-sm dark:border-border dark:bg-card sm:p-7">

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A18B70] dark:text-[#BBA58C]">
                  Your details
                </p>

                <h3 className="mt-1 text-xl font-bold text-[#344B36] dark:text-foreground sm:text-2xl">
                  Personal Information
                </h3>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5EBD9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
                <UserRound size={21} />
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.form
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DUR.fast }}
                onSubmit={saveProfile}
                className="mt-6 space-y-5"
              >

                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="h-12 rounded-xl border-[#DDDCCF] bg-[#FAF9F4] dark:border-border dark:bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 rounded-xl border-[#DDDCCF] bg-[#FAF9F4] dark:border-border dark:bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-location">Location</Label>
                  <Input
                    id="profile-location"
                    value={profile.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Your city"
                    className="h-12 rounded-xl border-[#DDDCCF] bg-[#FAF9F4] dark:border-border dark:bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-bio">About Me</Label>
                  <textarea
                    id="profile-bio"
                    value={profile.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={3}
                    maxLength={160}
                    className="w-full resize-none rounded-xl border border-[#DDDCCF] bg-[#FAF9F4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#526C53] dark:border-border dark:bg-background"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    className="rounded-xl bg-[#526C53] text-white hover:bg-[#405841] dark:bg-[#6B9675] dark:text-[#142319] dark:hover:bg-[#82A98A]"
                  >
                    <Check size={17} />
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DUR.fast }}
                className="mt-6 space-y-5"
              >

                {[
                  {
                    icon: UserRound,
                    label: "Full Name",
                    value: savedProfile.name,
                    fallback: "Not added yet",
                    color: "bg-[#E5EBD9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]",
                  },
                  {
                    icon: Mail,
                    label: "Email Address",
                    value: savedProfile.email,
                    fallback: "Not added yet",
                    color: "bg-[#F5E2D4] text-[#A76748] dark:bg-[#482F29] dark:text-[#E5A58A]",
                  },
                  {
                    icon: MapPin,
                    label: "Location",
                    value: savedProfile.location,
                    fallback: "Not added yet",
                    color: "bg-[#F3E7BD] text-[#98762D] dark:bg-[#403720] dark:text-[#E8C96B]",
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.label} className="flex min-w-0 items-center gap-4">
                      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", item.color)}>
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="break-all font-medium">
                          {item.value || item.fallback}
                        </p>
                      </div>
                    </div>
                  )
                })}

                <div className="border-t border-[#EEE9DE] pt-5 dark:border-border">
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    className="w-full rounded-xl border-[#C9D5C2] bg-[#F4F6EE] text-[#526C53] hover:bg-[#E5EBD9] dark:border-[#3C5742] dark:bg-[#293B2F] dark:text-[#B1D1AA] dark:hover:bg-[#344A39]"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </Button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </section>

          {/* Preferences */}
          <section className="min-w-0 rounded-[1.8rem] border border-[#E9E3D6] bg-[#FFFDF8] p-5 shadow-sm dark:border-border dark:bg-card sm:p-7">

            <p className="text-xs font-semibold uppercase tracking-wider text-[#A18B70] dark:text-[#BBA58C]">
              Your account
            </p>

            <h3 className="mt-1 text-2xl font-bold text-[#344B36] dark:text-foreground">
              Preferences
            </h3>

            <div className="mt-6 space-y-2">
              <Link
              to="/history"
              className="flex min-w-0 items-center gap-3 rounded-2xl p-3 transition-all hover:bg-[#F7F5ED] active:scale-[0.98] dark:hover:bg-accent"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
                <History size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Donation history</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Food you've shared and received
                </p>
              </div>

              <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
            </Link>

            {settings.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="flex w-full min-w-0 items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-[#F7F5ED] active:scale-[0.98] dark:hover:bg-accent"
                  >
                    <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", item.color)}>
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-[#F4E8D4] p-4 dark:bg-[#403720]">
              <div className="flex items-center gap-2 text-[#8B702C] dark:text-[#E8C96B]">
                <HeartHandshake size={19} />
                <p className="text-sm font-semibold">
                  Thank you for sharing!
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#8A7651] dark:text-[#D0B978]">
                Your presence helps make AnnaDaan a more caring community.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className={cn(
                "mt-6 h-12 w-full rounded-xl font-semibold",
                confirmLogout
                  ? "border-[#A65F45] bg-[#A65F45] text-white hover:bg-[#8F4F38] dark:border-[#C77D5B] dark:bg-[#C77D5B] dark:text-[#2A1710] dark:hover:bg-[#D68B69]"
                  : "border-[#E7CFC1] bg-[#F9EEE8] text-[#A65F45] hover:bg-[#F3DFD7] dark:border-[#614638] dark:bg-[#382C25] dark:text-[#E5A58A] dark:hover:bg-[#493027]"
              )}
            >
              <LogOut size={17} />
              {confirmLogout ? "Tap again to log out" : "Log Out"}
            </Button>
          </section>
        </Reveal>

        {/* Footer */}
        <footer className="space-y-3 pb-4 text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-3">
            <Link to="/terms" className="font-medium transition-colors hover:text-foreground hover:underline">
              Terms &amp; Conditions
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy" className="font-medium transition-colors hover:text-foreground hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="flex items-center justify-center gap-2">
            <Leaf size={14} className="text-[#71866C] dark:text-[#A4C5A4]" />
            Made with care, for a community that shares.
          </p>
        </footer>

      </div>
    </div>
  )
}