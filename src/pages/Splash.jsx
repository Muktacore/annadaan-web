
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Splash() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#F5F1E7] px-5 py-8 text-center">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full bg-[#DDE4D4]/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-[#EAD5C3]/50 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">

        {/* AnnaDaan Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <img
            src="/images/annadaan%20logo.png"
            alt="AnnaDaan leaf logo"
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />

          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-[#344B36] sm:text-5xl md:text-6xl">
            AnnaDaan
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-[#77796C] sm:text-base">
            Share a meal. Reduce waste. Feed a neighbour.
          </p>
        </motion.div>

        {/* Food Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="my-3 flex w-full justify-center sm:my-5"
        >
          <img
            src="/images/annadaan-food.png"
            alt="A bowl of food being shared"
            className="h-auto w-full max-w-[350px] object-contain sm:max-w-[410px]"
          />
        </motion.div>

        {/* Get Started */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="w-full max-w-xs"
        >
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="h-14 w-full rounded-full bg-[#526C53] text-base font-semibold text-white shadow-lg shadow-[#526C53]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#405841] hover:shadow-xl"
          >
            <HeartHandshake className="mr-2 size-5" />
            Get Started
          </Button>
        </motion.div>

      </div>
    </main>
  )
}