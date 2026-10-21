import { useEffect, useState } from "react"
import { Toaster as Sonner } from "sonner"

// The app toggles a `.dark` class on <html> by hand (see ThemeToggle),
// so we watch that class instead of using next-themes.
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])
  return dark
}

/**
 * Themed toast host. Mounted ONCE in main.jsx.
 * Use anywhere:  import { toast } from "sonner";  toast.success("Request sent")
 */
export function Toaster(props) {
  const dark = useIsDark()
  return (
    <Sonner
      theme={dark ? "dark" : "light"}
      position="top-center"
      offset="calc(env(safe-area-inset-top, 0px) + 12px)"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "1rem",
      }}
      toastOptions={{ classNames: { toast: "font-sans shadow-lg" } }}
      {...props}
    />
  )
}
