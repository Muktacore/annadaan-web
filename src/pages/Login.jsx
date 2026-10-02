import { useNavigate } from "react-router-dom"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function AuthForm({ mode }) {
  const navigate = useNavigate()
  const submit = (e) => {
    e.preventDefault()
    // TODO Step 4: Firebase email/password auth
    navigate("/home")
  }
  return (
    <form onSubmit={submit} className="space-y-4 pt-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Your name" required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`email-${mode}`}>Email</Label>
        <Input id={`email-${mode}`} type="email" placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`pw-${mode}`}>Password</Label>
        <Input id={`pw-${mode}`} type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" size="lg" className="w-full">
        {mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh md:grid md:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-primary p-12 text-center text-primary-foreground md:flex">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-sage/30" />
        <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-clay/30" />
        <div className="relative">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-card/15">
            <Leaf className="size-10" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold">AnnaDaan</h2>
          <p className="mx-auto mt-3 max-w-sm opacity-90">
            Share a meal. Reduce waste. Feed a neighbour. Connecting people with surplus food to people who need it.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 md:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground md:hidden">
              <Leaf className="size-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold md:mt-0 md:text-3xl">Welcome to AnnaDaan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in or create an account to start sharing food.</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><AuthForm mode="login" /></TabsContent>
            <TabsContent value="signup"><AuthForm mode="signup" /></TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          {/* TODO Step 4: native Capacitor Google Sign-In plugin (NOT signInWithPopup) */}
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/home")}>
            <span className="flex size-5 items-center justify-center rounded-full bg-clay text-[11px] font-bold text-clay-foreground">G</span>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}