import { Link } from "react-router-dom"
import PageTransition from "@/components/PageTransition"
import ThemeToggle from "@/components/ThemeToggle"

export default function PublicInfoShell() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
          <Link to="/login" className="flex items-center gap-2.5">
            <img
              src="/images/annadaan-logo.png"
              alt="AnnaDaan logo"
              className="size-9 object-contain"
            />
            <span className="text-lg font-extrabold tracking-tight text-primary">
              AnnaDaan
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl md:px-8">
        <PageTransition />
      </main>
    </div>
  )
}
