import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark")
}

function StartupErrorScreen({ missingKeys = [], invalidConfig = false }) {
  const title = missingKeys.length
    ? "Anna Daan needs its Firebase settings"
    : "Anna Daan couldn’t connect"

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <section
        aria-labelledby="startup-error-title"
        className="w-full max-w-lg rounded-3xl border bg-card p-6 text-center shadow-lg sm:p-9"
        role="alert"
      >
        <img
          src="/images/annadaan-logo.png"
          alt=""
          className="mx-auto size-16 object-contain"
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Anna Daan
        </p>
        <h1
          id="startup-error-title"
          className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          {title}
        </h1>

        {missingKeys.length > 0 ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The Firebase web configuration is incomplete. Add the missing
              settings in Replit Secrets, then refresh this page.
            </p>
            <ul className="mt-4 space-y-1 text-left text-sm text-foreground">
              {missingKeys.map((key) => (
                <li key={key}>
                  <code className="rounded bg-muted px-2 py-1">{key}</code>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {invalidConfig
              ? "The Firebase web API key was rejected. Check the Firebase settings for this app in Replit Secrets, then try again."
              : "A required app service could not start. Check the Firebase and sign-in settings for this app, then try again."}
          </p>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try again
        </button>
      </section>
    </main>
  )
}

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Anna Daan could not find its app root.")
}

const root = createRoot(rootElement)
const requiredFirebaseKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
]
const missingFirebaseKeys = requiredFirebaseKeys.filter(
  (key) => !import.meta.env[key]
)

if (missingFirebaseKeys.length > 0) {
  root.render(<StartupErrorScreen missingKeys={missingFirebaseKeys} />)
} else {
  try {
    const [
      { HashRouter },
      { MotionConfig },
      { SocialLogin },
      { default: App },
      { AuthProvider },
      { Toaster },
    ] = await Promise.all([
      import("react-router-dom"),
      import("motion/react"),
      import("@capgo/capacitor-social-login"),
      import("./App.jsx"),
      import("@/context/AuthContext"),
      import("@/components/ui/sonner"),
    ])

    await SocialLogin.initialize({
      google: {
        webClientId: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID,
      },
    })

    root.render(
      <StrictMode>
        {/* Respect the operating-system reduced-motion setting across the app. */}
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <HashRouter>
              <App />
            </HashRouter>
            <Toaster />
          </AuthProvider>
        </MotionConfig>
      </StrictMode>
    )
  } catch (error) {
    console.error("Anna Daan startup failed:", error)
    root.render(
      <StartupErrorScreen
        invalidConfig={error?.code === "auth/invalid-api-key"}
      />
    )
  }
}
