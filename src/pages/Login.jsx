
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

function AuthForm({ mode }) {
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    // TODO Step 4: Firebase email/password auth
    navigate("/home")
  }

  return (
    <form onSubmit={submit} className="space-y-5 pt-6">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium text-[#405441]">
            Full name
          </Label>
          <Input
            id="name"
            placeholder="Your name"
            required
            className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`email-${mode}`} className="font-medium text-[#405441]">
          Email
        </Label>
        <Input
          id={`email-${mode}`}
          type="email"
          placeholder="you@example.com"
          required
          className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`pw-${mode}`} className="font-medium text-[#405441]">
          Password
        </Label>
        <Input
          id={`pw-${mode}`}
          type="password"
          placeholder="••••••••"
          required
          className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-3 h-13 w-full rounded-xl bg-[#526C53] text-base font-semibold text-white shadow-lg shadow-[#526C53]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#405841] hover:shadow-xl"
      >
        {mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()

  return (
    <main className="min-h-dvh bg-[#F5F1E7] md:grid md:grid-cols-[0.95fr_1.05fr]">

      {/* Left branding panel */}
      <section className="relative hidden min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#607A61] via-[#526C53] to-[#405841] px-10 py-12 text-center text-[#F8F5EB] md:flex">

        {/* Background botanical accents */}
        <div className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-[#A8B99A]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 size-80 rounded-full bg-[#B87858]/20 blur-3xl" />

        <div className="relative z-10 flex w-full max-w-md flex-col items-center">

          {/* Original colored logo */}
          <div className="flex size-24 items-center justify-center rounded-[2rem] bg-[#F5F1E7] shadow-xl shadow-black/10">
            <img
              src="/images/annadaan%20logo.png"
              alt="AnnaDaan leaf logo"
              className="size-[76px] object-contain"
            />
          </div>

          <h2 className="mt-7 font-serif text-5xl font-bold tracking-tight text-[#FFF9ED]">
            AnnaDaan
          </h2>

          <p className="mt-5 max-w-sm text-base leading-8 text-[#F5F1E7]/95">
            Share a meal. Reduce waste. Feed a neighbour. Connecting people with surplus food to people who need it.
          </p>

          {/* Food artwork */}
          <div className="mt-7 w-full max-w-[330px]">
            <img
              src="/images/annadaan-food.png"
              alt="A bowl of food being shared"
              className="h-auto w-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="mt-5 h-px w-20 bg-[#D8DDCB]/60" />

          <p className="mt-4 text-sm tracking-wide text-[#F5F1E7]/85">
            Every meal shared makes a difference.
          </p>
        </div>
      </section>

      {/* Right authentication panel */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 md:px-12 lg:px-16 xl:px-20">

        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-[#DDE4D4]/45 blur-3xl md:hidden" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-[#EAD5C3]/40 blur-3xl md:hidden" />

        <div className="relative z-10 mx-auto w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center md:hidden">
            <img
              src="/images/annadaan%20logo.png"
              alt="AnnaDaan leaf logo"
              className="size-[76px] object-contain"
            />

            <h2 className="mt-2 font-serif text-3xl font-bold text-[#344B36]">
              AnnaDaan
            </h2>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B977F]">
              Welcome
            </p>

            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#344B36] sm:text-4xl">
              Welcome to
              <br />
              AnnaDaan
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#77796C] sm:text-base">
              Log in or create an account to start sharing food.
            </p>
          </div>

          {/* Login and Signup */}
          <Tabs defaultValue="login" className="w-full">

            <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-[#E8E7DC] p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg font-semibold text-[#687365] transition-all data-[state=active]:bg-[#FCFBF7] data-[state=active]:text-[#405841] data-[state=active]:shadow-sm"
              >
                Log in
              </TabsTrigger>

              <TabsTrigger
                value="signup"
                className="rounded-lg font-semibold text-[#687365] transition-all data-[state=active]:bg-[#FCFBF7] data-[state=active]:text-[#405841] data-[state=active]:shadow-sm"
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <AuthForm mode="login" />
            </TabsContent>

            <TabsContent value="signup">
              <AuthForm mode="signup" />
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4 text-xs font-medium tracking-wider text-[#99998B]">
            <div className="h-px flex-1 bg-[#D9DCCF]" />
            OR
            <div className="h-px flex-1 bg-[#D9DCCF]" />
          </div>

          {/* Google button */}
          <Button
            variant="outline"
            size="lg"
            className="h-13 w-full rounded-xl border-[#D9DCCF] bg-[#FCFBF7] font-medium text-[#405441] shadow-sm transition-all hover:bg-[#EDEFE5] hover:text-[#344B36]"
            onClick={() => navigate("/home")}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#B87858] text-xs font-bold text-white">
              G
            </span>
            Continue with Google
          </Button>

        </div>
      </section>
    </main>
  )
}