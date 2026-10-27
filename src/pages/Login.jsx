
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BowlSteam from "@/components/BowlSteam"
import FoodBoxCharacter from "@/components/FoodBoxCharacter"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { SPRING_SNAPPY } from "@/lib/motion"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  friendlyAuthError,
} from "@/lib/auth"

const spring = {
  type: "spring",
  stiffness: 120,
  damping: 18,
}

function ErrorMessage({ message }) {
  const reduceMotion = useReducedMotion()

  if (!message) return null

  return (
    <motion.p
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      // slides in, then gives one small "no" shake so the error is noticed
      animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 0] }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: 0.2, x: { duration: 0.35, delay: 0.1 } }}
      className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </motion.p>
  )
}

function AnimatedField({ children, delay = 0 }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.3,
        delay: reduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      className="space-y-2"
    >
      {children}
    </motion.div>
  )
}

// Mobile-only mascot: waves hello, and closes its eyes while you type a
// password (it is "not looking"). Cross-fades between the two poses.
function LoginMascot({ privacy }) {
  useEffect(() => {
    const img = new Image()
    img.src = "/images/characters/box_meditating.png"
  }, [])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={privacy ? "private" : "hello"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
        transition={{ duration: 0.2 }}
      >
        <FoodBoxCharacter type={privacy ? "meditating" : "waving"} className="w-28!" />
      </motion.div>
    </AnimatePresence>
  )
}

function AuthForm({ mode }) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const email = form.elements[`email-${mode}`].value.trim()
    const password = form.elements[`pw-${mode}`].value
    const name =
      mode === "signup" ? form.elements["name"].value.trim() : ""

    setBusy(true)
    setError("")

    try {
      if (mode === "signup") {
        await signUpWithEmail(name, email, password)
      } else {
        await signInWithEmail(email, password)
      }

      navigate("/home")
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      key={mode}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28 }}
    >
      <form onSubmit={submit} className="space-y-5 pt-6">
        <AnimatePresence mode="wait">
          {error && <ErrorMessage key="auth-error" message={error} />}
        </AnimatePresence>

        {mode === "signup" && (
          <AnimatedField delay={0.03}>
            <Label htmlFor="name" className="font-medium text-[#405441]">
              Full name
            </Label>

            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
              autoComplete="name"
              className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
            />
          </AnimatedField>
        )}

        <AnimatedField delay={0.06}>
          <Label
            htmlFor={`email-${mode}`}
            className="font-medium text-[#405441]"
          >
            Email
          </Label>

          <Input
            id={`email-${mode}`}
            name={`email-${mode}`}
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
          />
        </AnimatedField>

        <AnimatedField delay={0.1}>
          <Label
            htmlFor={`pw-${mode}`}
            className="font-medium text-[#405441]"
          >
            Password
          </Label>

          <div className="relative">
            <Input
              id={`pw-${mode}`}
              name={`pw-${mode}`}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className="h-13 rounded-xl border-[#D9DCCF] bg-[#FCFBF7] px-4 pr-12 text-[#344B36] placeholder:text-[#A1A294] focus-visible:ring-[#526C53]"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              aria-pressed={showPw}
              className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#8B977F] transition-colors hover:bg-[#E8E7DC] hover:text-[#405841] active:scale-90"
            >
              {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </AnimatedField>

        <motion.div
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.18 }}
          className="pt-1"
        >
          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className="h-13 w-full rounded-xl bg-[#526C53] text-base font-semibold text-white shadow-lg shadow-[#526C53]/15 transition-colors duration-300 hover:bg-[#405841] hover:shadow-xl"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={busy ? "busy" : mode}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {busy
                  ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Please wait…
                    </span>
                  )
                  : mode === "signup"
                    ? "Create account"
                    : "Log in"}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [googleBusy, setGoogleBusy] = useState(false)
  const [googleError, setGoogleError] = useState("")
  const [tab, setTab] = useState("login")
  const [privacy, setPrivacy] = useState(false) // true while a password field has focus

  const handleGoogle = async () => {
    setGoogleBusy(true)
    setGoogleError("")

    try {
      const cred = await signInWithGoogle()
      console.log("Signed in with Google:", cred.user.uid, cred.user.email)
      navigate("/home")
    } catch (err) {
      console.error("Google sign-in failed:", err)
      setGoogleError(friendlyAuthError(err))
    } finally {
      setGoogleBusy(false)
    }
  }

  const entrance = {
    hidden: { opacity: 0, y: 14 },
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

  const floatTransition = (duration, delay = 0) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration,
          delay,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }

  return (
    <main className="min-h-dvh bg-[#F5F1E7] md:grid md:grid-cols-[0.95fr_1.05fr]">
      {/* Desktop branding panel */}
      <section className="relative hidden min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#607A61] via-[#526C53] to-[#405841] px-10 py-12 text-center text-[#F8F5EB] md:flex">
        {/* Ambient background accents */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-[#A8B99A]/15 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={floatTransition(9)}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-16 size-80 rounded-full bg-[#B87858]/20 blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1.08, 1, 1.08], opacity: [0.65, 0.9, 0.65] }
          }
          transition={floatTransition(11, 1)}
        />

        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          {/* Logo */}
          <motion.div
            variants={entrance}
            initial="hidden"
            animate="visible"
            custom={0}
            whileHover={reduceMotion ? undefined : { y: -3, rotate: -2 }}
            transition={spring}
            className="flex size-24 items-center justify-center rounded-[2rem] bg-[#F5F1E7] shadow-xl shadow-black/10"
          >
            <img
              src="/images/annadaan-logo.png"
              alt="AnnaDaan leaf logo"
              className="size-[76px] object-contain"
            />
          </motion.div>

          <motion.h2
            variants={entrance}
            initial="hidden"
            animate="visible"
            custom={reduceMotion ? 0 : 0.1}
            className="mt-7 text-5xl font-bold tracking-tight text-[#FFF9ED]"
          >
            AnnaDaan
          </motion.h2>

          <motion.p
            variants={entrance}
            initial="hidden"
            animate="visible"
            custom={reduceMotion ? 0 : 0.2}
            className="mt-5 max-w-sm text-base leading-8 text-[#F5F1E7]/95"
          >
            Share a meal. Reduce waste. Feed a neighbour. Connecting people
            with surplus food to people who need it.
          </motion.p>

          {/* Food artwork — BowlSteam remains unchanged */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: [0, -5, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.5, delay: 0.3 },
                    y: {
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    },
                  }
            }
            className="relative mt-7 w-full max-w-[330px]"
          >
            <img
              src="/images/annadaan-food.png"
              alt="A bowl of food being shared"
              className="h-auto w-full object-contain drop-shadow-xl"
            />
            <BowlSteam />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              delay: reduceMotion ? 0 : 0.4,
            }}
            className="mt-5 h-px w-20 bg-[#D8DDCB]/60"
          />

          <motion.p
            variants={entrance}
            initial="hidden"
            animate="visible"
            custom={reduceMotion ? 0 : 0.45}
            className="mt-4 text-sm tracking-wide text-[#F5F1E7]/85"
          >
            Every meal shared makes a difference.
          </motion.p>
        </div>
      </section>

      {/* Authentication panel */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 md:px-12 lg:px-16 xl:px-20">
        {/* Mobile ambient accents */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-[#DDE4D4]/45 blur-3xl md:hidden"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -12, 0], y: [0, 12, 0], opacity: [0.7, 1, 0.7] }
          }
          transition={floatTransition(10)}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-[#EAD5C3]/40 blur-3xl md:hidden"
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 12, 0], y: [0, -10, 0], opacity: [0.7, 0.9, 0.7] }
          }
          transition={floatTransition(12, 1)}
        />

        <div
          className="relative z-10 mx-auto w-full max-w-md"
          onFocusCapture={(e) => setPrivacy(e.target.name?.startsWith("pw-") ?? false)}
          onBlurCapture={() => setPrivacy(false)}
        >
          {/* Mobile logo + mascot */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            className="mb-6 flex items-center justify-between md:hidden"
          >
            <div className="flex items-center gap-3">
              <motion.img
                src="/images/annadaan-logo.png"
                alt="AnnaDaan leaf logo"
                className="size-[60px] object-contain"
                whileTap={reduceMotion ? undefined : { scale: 0.9, rotate: -6 }}
                transition={spring}
              />

              <h2 className="text-3xl font-bold text-[#344B36]">AnnaDaan</h2>
            </div>

            <LoginMascot privacy={privacy} />
          </motion.div>

          {/* Welcome heading */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={entrance}
            custom={0.08}
            className="mb-8"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B977F]">
              Welcome
            </p>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#344B36] sm:text-4xl">
              Welcome to
              <br />
              AnnaDaan
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#77796C] sm:text-base">
              Log in or create an account to start sharing food.
            </p>
          </motion.div>

          {/* Login and signup tabs */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.4,
              delay: reduceMotion ? 0 : 0.12,
            }}
          >
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-[#E8E7DC] p-1">
                <TabsTrigger
                  value="login"
                  className="relative isolate rounded-lg font-semibold text-[#687365] transition-colors duration-200 data-[state=active]:bg-transparent data-[state=active]:text-[#405841]"
                >
                  {tab === "login" && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-[#FCFBF7] shadow-sm"
                      transition={SPRING_SNAPPY}
                    />
                  )}
                  Log in
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="relative isolate rounded-lg font-semibold text-[#687365] transition-colors duration-200 data-[state=active]:bg-transparent data-[state=active]:text-[#405841]"
                >
                  {tab === "signup" && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-[#FCFBF7] shadow-sm"
                      transition={SPRING_SNAPPY}
                    />
                  )}
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
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.2 }}
            className="my-7 flex items-center gap-4 text-xs font-medium tracking-wider text-[#99998B]"
          >
            <div className="h-px flex-1 bg-[#D9DCCF]" />
            OR
            <div className="h-px flex-1 bg-[#D9DCCF]" />
          </motion.div>

          {/* Google sign-in */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.24 }}
            className="space-y-3"
          >
            <AnimatePresence mode="wait">
              {googleError && (
                <ErrorMessage key="google-error" message={googleError} />
              )}
            </AnimatePresence>

            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.18 }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={googleBusy}
                className="h-13 w-full rounded-xl border-[#D9DCCF] bg-[#FCFBF7] font-medium text-[#405441] shadow-sm transition-colors duration-300 hover:bg-[#EDEFE5] hover:text-[#344B36]"
                onClick={handleGoogle}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-[#B87858] text-xs font-bold text-white">
                  G
                </span>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={googleBusy ? "google-busy" : "google-ready"}
                    initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                  >
                    {googleBusy ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      "Continue with Google"
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>

          {/* Legal + help links */}
          <motion.nav
            aria-label="Legal and help"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: 0.3 }}
            className="mt-8 space-y-3 text-center text-xs text-[#77796C]"
          >
            <p className="leading-5">
              By continuing you agree to our{" "}
              <Link to="/terms" className="font-semibold text-[#526C53] underline-offset-2 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-semibold text-[#526C53] underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="flex items-center justify-center gap-3">
              <Link to="/about" className="hover:text-[#405841] hover:underline">About</Link>
              <span aria-hidden="true">·</span>
              <Link to="/help" className="hover:text-[#405841] hover:underline">Help</Link>
              <span aria-hidden="true">·</span>
              <Link to="/contact" className="hover:text-[#405841] hover:underline">Contact</Link>
            </p>
          </motion.nav>
        </div>
      </section>
    </main>
  )
}
