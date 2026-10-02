import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle({ variant = "icon", className }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setDark(next)
  }

  const Icon = dark ? Sun : Moon

  if (variant === "row") {
    return (
      <button onClick={toggle} className={className}>
        <Icon className="size-5" />
        {dark ? "Light mode" : "Dark mode"}
      </button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className={className}>
      <Icon />
    </Button>
  )
}