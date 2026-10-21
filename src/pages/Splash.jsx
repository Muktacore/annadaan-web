import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import BowlSteam from "@/components/BowlSteam"
import { SPRING_SNAPPY } from "@/lib/motion"

export default function Splash() {
  const navigate = useNavigate()

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#F5F1E7] px-5 py-8 text-center">

      {/* Background decorations — a slow drift so the page feels alive, not busy */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full bg-[#DDE4D4]/60 blur-3xl"
        animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-[#EAD5C3]/50 blur-3xl"
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">

        {/* AnnaDaan Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <motion.img
            src="/images/annadaan-logo.png"
            alt="AnnaDaan leaf logo"
            className="h-20 w-20 cursor-pointer object-contain sm:h-24 sm:w-24"
            whileHover={{ y: -3, rotate: -4 }}
            whileTap={{ scale: 0.92, rotate: 6 }}
            transition={SPRING_SNAPPY}
          />

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#344B36] sm:text-5xl md:text-6xl">
            AnnaDaan
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-[#77796C] sm:text-base">
            Share a meal. Reduce waste. Feed a neighbour.
          </p>
        </motion.div>

        {/* Food Illustration — enters, then floats gently with steam */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15 }}
          className="my-3 flex w-full justify-center sm:my-5"
        >
          <motion.div
            className="relative w-full max-w-[350px] sm:max-w-[410px]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          >
            <img
              src="/images/annadaan-food.png"
              alt="A bowl of food being shared"
              className="h-auto w-full object-contain"
            />
            <BowlSteam color="#A8B398" />
          </motion.div>
        </motion.div>

        {/* Get Started */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="w-full max-w-xs"
        >
          <motion.div whileTap={{ scale: 0.97 }} transition={SPRING_SNAPPY}>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="relative h-14 w-full overflow-hidden rounded-full bg-[#526C53] text-base font-semibold text-white shadow-lg shadow-[#526C53]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#405841] hover:shadow-xl"
            >
              {/* a soft light sweep every few seconds invites the tap */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                initial={{ x: "-150%" }}
                animate={{ x: "500%" }}
                transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut", delay: 1.6 }}
              />
              <HeartHandshake className="mr-2 size-5" />
              Get Started
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </main>
  )
}
