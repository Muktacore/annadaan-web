import { Link } from "react-router-dom"
import { Leaf, Mail, Copy, ChevronRight } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import PageHeader from "@/components/PageHeader"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { SUPPORT_EMAIL, composeEmail, copyEmail } from "@/lib/appInfo"

// Shared shell for About / Help / Terms / Privacy / Contact so every
// info page has the same heading, card surface and footer as Profile.
export function InfoPage({ eyebrow, title, intro, icon: Icon, children, wide = false }) {
  return (
    <div className="pb-8 text-foreground">
      <div className="md:hidden">
        <PageHeader title={title} />
      </div>

      <div
        className={cn(
          "mx-auto w-full space-y-6 px-5 pt-4 md:px-0 md:pt-10",
          wide ? "max-w-6xl" : "max-w-3xl"
        )}
      >
        <Reveal as="header" className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A8065] dark:text-[#BBA58C]">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#344B36] dark:text-foreground sm:text-4xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {intro}
              </p>
            )}
          </div>

          {Icon && (
            <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-[#E5DFD0] bg-[#FFFDF8] text-[#526C53] shadow-sm dark:border-border dark:bg-card dark:text-[#B1D1AA] sm:flex">
              <Icon size={22} />
            </div>
          )}
        </Reveal>

        {children}

        <footer className="flex items-center justify-center gap-2 pt-2 text-center text-xs text-muted-foreground">
          <Leaf size={14} className="text-[#71866C] dark:text-[#A4C5A4]" />
          Made with care, for a community that shares.
        </footer>
      </div>
    </div>
  )
}

export function InfoCard({ children, className, delay = 0.08 }) {
  return (
    <Reveal delay={delay}>
      <section
        className={cn(
          "min-w-0 rounded-[1.8rem] border border-[#E9E3D6] bg-[#FFFDF8] p-5 shadow-sm dark:border-border dark:bg-card sm:p-7",
          className
        )}
      >
        {children}
      </section>
    </Reveal>
  )
}

// Numbered section used by Terms + Privacy.
export function LegalSection({ n, title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-3 text-base font-bold text-[#344B36] dark:text-foreground">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E5EBD9] text-xs font-bold text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]">
          {n}
        </span>
        {title}
      </h2>
      <div className="space-y-2 pl-10 text-sm leading-6 text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  )
}

export function LegalBody({ children }) {
  return <div className="space-y-6">{children}</div>
}

// Cross-links between the info pages.
export function RelatedLinks({ links }) {
  return (
    <InfoCard delay={0.2} className="p-3 sm:p-4">
      {links.map(({ to, label, icon: Icon, color }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-2xl p-3 transition-all hover:bg-[#F7F5ED] active:scale-[0.98] dark:hover:bg-accent"
        >
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", color)}>
            <Icon size={19} />
          </div>
          <span className="flex-1 text-sm font-semibold">{label}</span>
          <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
        </Link>
      ))}
    </InfoCard>
  )
}

export function EmailButton({ subject, label = "Email us", className }) {
  const handleCopy = async () => {
    const ok = await copyEmail()
    if (ok) toast.success("Email address copied")
    else toast.error(`Please copy: ${SUPPORT_EMAIL}`)
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => composeEmail({ subject })}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#526C53] px-5 text-sm font-semibold text-white shadow-lg shadow-[#526C53]/15 transition hover:bg-[#405841] active:scale-[0.98] sm:flex-none dark:bg-[#6B9675] dark:text-[#142319] dark:hover:bg-[#82A98A]"
      >
        <Mail size={17} />
        {label}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#C9D5C2] bg-[#F4F6EE] px-4 text-sm font-semibold text-[#526C53] transition hover:bg-[#E5EBD9] active:scale-[0.98] dark:border-[#3C5742] dark:bg-[#293B2F] dark:text-[#B1D1AA] dark:hover:bg-[#344A39]"
      >
        <Copy size={16} />
        Copy address
      </button>

      <p className="w-full text-xs text-[#8A7651] dark:text-[#D0B978]">{SUPPORT_EMAIL}</p>
    </div>
  )
}
