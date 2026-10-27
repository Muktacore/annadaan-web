import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, CircleHelp, Mail, Info, ShieldCheck } from "lucide-react"
import { InfoPage, InfoCard, RelatedLinks, EmailButton } from "@/components/InfoPage"
import { cn } from "@/lib/utils"
import { DUR, EASE_OUT } from "@/lib/motion"
import { SUPPORT_EMAIL } from "@/lib/appInfo"

const FAQS = [
  { group: "Getting started", items: [
    { q: "How do I create an account?", a: "Open the app, choose Sign up, and register with your name, email and a password, or tap Continue with Google." },
    { q: "I forgot my password. What now?", a: `Email ${SUPPORT_EMAIL} from the address you signed up with and we will help you regain access. If you signed in with Google, use Continue with Google again.` },
  ]},
  { group: "Donating food", items: [
    { q: "How do I donate food?", a: "Tap the Donate button, add what you are sharing, the quantity, when it was prepared and where it can be picked up. You can add a photo if you like, then post it." },
    { q: "What food can I donate?", a: "Only food that is clean, properly stored and safe to eat. Please do not share food that is spoiled, past its expiry, partly eaten, or whose ingredients you are unsure about." },
    { q: "What does the freshness badge mean?", a: "It is a guide based on food-safety rules for the type of food and the time since it was prepared. It helps, but it is not a guarantee. Always use your own judgement." },
    { q: "Can I cancel or edit a donation?", a: "You can manage your posts from Donation history. If something is wrong with a listing, contact us and we will help." },
  ]},
  { group: "Receiving food", items: [
    { q: "How do I request food?", a: "Open the Map or Home page, choose a donation and tap to request it. Track the status under My requests." },
    { q: "How do pickups work?", a: "Pickup is arranged directly with the donor at the location shown. Meet in a public, well-lit place where possible and collect the food on time." },
    { q: "Is the food checked by AnnaDaan?", a: "No. Donations are shared by community members and we do not inspect, cook or store food. Please check the food yourself before eating it." },
  ]},
  { group: "Account & privacy", items: [
    { q: "Why does the app ask for my location?", a: "To show donations near you on the map. You can refuse permission and still browse, and you can change this in your device settings." },
    { q: "How do I delete my account?", a: `Email ${SUPPORT_EMAIL} with the subject “Delete my account” from your registered address. See our Privacy Policy for what we remove.` },
    { q: "How do I report a problem or a user?", a: "Use the Contact page and include the donation or person involved. We review every report." },
  ]},
]

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[#EEE9DE] last:border-0 dark:border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:text-primary"
      >
        <span className="flex-1 text-sm font-semibold">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: DUR.base, ease: EASE_OUT }}>
          <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-8 text-sm leading-6 text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Help() {
  const [group, setGroup] = useState(FAQS[0].group)
  const active = FAQS.find((g) => g.group === group)

  return (
    <InfoPage
      eyebrow="We're here to help"
      title="Help & Support"
      intro="Quick answers to common questions. Can't find yours? Write to us."
      icon={CircleHelp}
    >
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0 [scrollbar-width:none]">
        {FAQS.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setGroup(g.group)}
            className={cn(
              "relative isolate shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              group === g.group
                ? "border-transparent text-primary-foreground"
                : "border-[#E5DFD0] bg-[#FFFDF8] text-muted-foreground hover:bg-accent dark:border-border dark:bg-card"
            )}
          >
            {group === g.group && (
              <motion.span layoutId="help-pill" className="absolute inset-0 -z-10 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 32 }} />
            )}
            {g.group}
          </button>
        ))}
      </div>

      <InfoCard className="py-1 sm:py-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={group} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: DUR.fast }}>
            {active.items.map((f) => <Faq key={f.q} {...f} />)}
          </motion.div>
        </AnimatePresence>
      </InfoCard>

      <InfoCard delay={0.16} className="bg-[#F4E8D4] dark:bg-[#403720]">
        <div className="flex items-center gap-2 text-[#8B702C] dark:text-[#E8C96B]">
          <Mail size={19} />
          <p className="text-sm font-semibold">Still need a hand?</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#8A7651] dark:text-[#D0B978]">
          Our team usually replies within 2 working days.
        </p>
        <EmailButton subject="AnnaDaan help request" label="Email support" className="mt-4 w-full sm:w-auto" />
      </InfoCard>

      <RelatedLinks
        links={[
          { to: "/about", label: "About AnnaDaan", icon: Info, color: "bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]" },
          { to: "/privacy", label: "Privacy Policy", icon: ShieldCheck, color: "bg-[#F9E7C9] text-[#9A6B25] dark:bg-[#493A26] dark:text-[#E7C17C]" },
        ]}
      />
    </InfoPage>
  )
}
