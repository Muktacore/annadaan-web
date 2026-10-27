import { useState } from "react"
import { Mail, MessageSquareText, Send, Info, CircleHelp } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { InfoPage, InfoCard, RelatedLinks } from "@/components/InfoPage"
import { useAuth } from "@/context/AuthContext"
import { SUPPORT_EMAIL, composeEmail } from "@/lib/appInfo"

const field = "h-12 rounded-xl border-[#DDDCCF] bg-[#FAF9F4] dark:border-border dark:bg-background"

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    subject: "",
    message: "",
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // No backend needed: opens the user's own mail app, pre-filled.
  const submit = (e) => {
    e.preventDefault()
    const body = `${form.message}\n\n— ${form.name} (${form.email})`
    composeEmail({ subject: form.subject || "AnnaDaan enquiry", body })
    toast.success("Opening your email…")
  }

  return (
    <InfoPage
      eyebrow="Say hello"
      title="Contact Us"
      intro="Questions, feedback or a problem to report? We'd love to hear from you."
      icon={MessageSquareText}
    >
      <InfoCard>
        <button type="button" onClick={() => composeEmail({ subject: "AnnaDaan enquiry" })} className="flex w-full items-center gap-4 rounded-2xl p-1 text-left transition hover:bg-[#F7F5ED] dark:hover:bg-accent">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F5E2D4] text-[#A76748] dark:bg-[#482F29] dark:text-[#E5A58A]">
            <Mail size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="break-all font-semibold">{SUPPORT_EMAIL}</p>
          </div>
        </button>
      </InfoCard>

      <InfoCard delay={0.14}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A18B70] dark:text-[#BBA58C]">
          Send a message
        </p>
        <h2 className="mt-1 text-xl font-bold text-[#344B36] dark:text-foreground">Write to us</h2>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="c-name">Your name</Label>
            <Input id="c-name" required value={form.name} onChange={set("name")} placeholder="Your name" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Your email</Label>
            <Input id="c-email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-subject">Subject</Label>
            <Input id="c-subject" required value={form.subject} onChange={set("subject")} placeholder="How can we help?" className={field} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-message">Message</Label>
            <textarea
              id="c-message"
              required
              rows={5}
              value={form.message}
              onChange={set("message")}
              className="w-full resize-none rounded-xl border border-[#DDDCCF] bg-[#FAF9F4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#526C53] dark:border-border dark:bg-background"
            />
          </div>

          <Button type="submit" className="h-12 w-full rounded-xl bg-[#526C53] text-base font-semibold text-white hover:bg-[#405841] dark:bg-[#6B9675] dark:text-[#142319] dark:hover:bg-[#82A98A]">
            <Send size={17} />
            Send message
          </Button>
        </form>
      </InfoCard>

      <RelatedLinks
        links={[
          { to: "/help", label: "Browse Help & FAQs", icon: CircleHelp, color: "bg-[#F3DFD7] text-[#A65F45] dark:bg-[#482F29] dark:text-[#E5A58A]" },
          { to: "/about", label: "About AnnaDaan", icon: Info, color: "bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]" },
        ]}
      />
    </InfoPage>
  )
}
