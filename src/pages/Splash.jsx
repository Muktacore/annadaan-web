import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Leaf, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 text-center">
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-sage/20 md:size-96" />
      <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-clay/15 md:size-80" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative flex flex-col items-center"
      >
        <div className="flex size-24 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-lg md:size-28">
          <Leaf className="size-12 md:size-14" />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-primary md:text-6xl">AnnaDaan</h1>
        <p className="mt-3 max-w-xs text-muted-foreground md:max-w-md md:text-lg">
          Share a meal. Reduce waste. Feed a neighbour.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative mt-12 w-full max-w-xs"
      >
        <Button size="lg" className="w-full" onClick={() => navigate("/login")}>
          <HeartHandshake /> Get Started
        </Button>
      </motion.div>
    </div>
  )
}