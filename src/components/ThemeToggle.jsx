import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"

// Sun ↔ Moon swap: the old icon spins out, the new one spins in.
function SwapIcon({ dark, className }) {
  const Icon = dark ? Sun : Moon
  return (
    <span className="relative inline-flex size-5 items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          initial={{ rotate: -80, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 80, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="inline-flex"
        >
          <Icon className={className ?? "size-5"} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function ThemeToggle({ variant = "icon", className }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setDark(next)
  }

  if (variant === "row") {
    return (
      <button onClick={toggle} className={className}>
        <SwapIcon dark={dark} />
        {dark ? "Light mode" : "Dark mode"}
      </button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className={className}>
      <SwapIcon dark={dark} />
    </Button>
  )
}
