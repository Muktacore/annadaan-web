import { HeartHandshake, Info, Leaf, MapPin, ShieldCheck, Utensils, CircleHelp, Mail, FileText } from "lucide-react"
import { Stagger, StaggerItem } from "@/components/motion/Reveal"
import { InfoPage, InfoCard, RelatedLinks } from "@/components/InfoPage"
import { APP_NAME, APP_VERSION } from "@/lib/appInfo"

const steps = [
  { icon: Utensils, title: "Share", text: "Post surplus food with quantity, pickup spot and how long it stays fresh.", color: "bg-[#E5EDDC] text-[#526C53] border-[#D2DDC7] dark:bg-[#293B2F] dark:text-[#B1D1AA] dark:border-[#3C5742]" },
  { icon: MapPin, title: "Find", text: "Neighbours browse the map and request food that is close to them.", color: "bg-[#F3E3D5] text-[#A65F45] border-[#E5CCB8] dark:bg-[#382C25] dark:text-[#E5A58A] dark:border-[#614638]" },
  { icon: HeartHandshake, title: "Pick up", text: "Meet, collect the meal and mark it claimed. Nothing goes to waste.", color: "bg-[#F3E7BD] text-[#98762D] border-[#E8D69D] dark:bg-[#403720] dark:text-[#E8C96B] dark:border-[#66542F]" },
]

export default function About() {
  return (
    <InfoPage
      eyebrow="Our story"
      title={`About ${APP_NAME}`}
      intro="Share a meal. Reduce waste. Feed a neighbour."
      icon={Info}
    >
      <InfoCard>
        <div className="flex items-center gap-4">
          <img src="/images/annadaan-logo.png" alt="AnnaDaan logo" className="size-16 shrink-0 object-contain" />
          <div>
            <h2 className="text-xl font-bold text-[#344B36] dark:text-foreground">
              Food is for sharing
            </h2>
            <p className="text-xs text-muted-foreground">Version {APP_VERSION}</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted-foreground">
          <strong className="text-foreground">Anna</strong> means food and{" "}
          <strong className="text-foreground">Daan</strong> means the act of giving.
          {" "}{APP_NAME} connects people, homes, caterers and events that have
          surplus food with neighbours and community groups who can use it,
          quickly, while it is still fresh and safe to eat.
        </p>
      </InfoCard>

      <Stagger className="grid gap-3 sm:grid-cols-3 sm:gap-5" delay={0.12}>
        {steps.map(({ icon: Icon, title, text, color }, i) => (
          <StaggerItem
            key={title}
            className={`rounded-3xl border p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 ${color}`}
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10">
              <Icon size={22} />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider opacity-70">Step {i + 1}</p>
            <p className="text-xl font-bold">{title}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{text}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <InfoCard delay={0.18}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A18B70] dark:text-[#BBA58C]">
          What we care about
        </p>
        <h2 className="mt-1 text-xl font-bold text-[#344B36] dark:text-foreground">Our values</h2>

        <ul className="mt-5 space-y-4">
          {[
            { icon: ShieldCheck, t: "Safety first", d: "Every listing shows a freshness status guided by FSSAI food-safety rules, so people can decide with confidence." },
            { icon: Leaf, t: "Less waste", d: "Good food belongs on a plate, not in a bin." },
            { icon: HeartHandshake, t: "Dignity for all", d: "Giving and receiving are both treated with respect and kindness." },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E5EBD9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </InfoCard>

      <RelatedLinks
        links={[
          { to: "/help", label: "Help & FAQs", icon: CircleHelp, color: "bg-[#F3DFD7] text-[#A65F45] dark:bg-[#482F29] dark:text-[#E5A58A]" },
          { to: "/contact", label: "Contact us", icon: Mail, color: "bg-[#F9E7C9] text-[#9A6B25] dark:bg-[#493A26] dark:text-[#E7C17C]" },
          { to: "/terms", label: "Terms & Conditions", icon: FileText, color: "bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]" },
        ]}
      />
    </InfoPage>
  )
}
