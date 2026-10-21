
import { motion, useReducedMotion } from "motion/react"

const CHARACTERS = {
  waving: {
    src: "/images/characters/box_waving.png",
    alt: "Anna Daan food box waving hello",
    animate: {
      y: [0, -4, 0],
      rotate: [0, 2, -2, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  celebrating: {
    src: "/images/characters/box_celebrating.png",
    alt: "Anna Daan food box celebrating a success",
    animate: {
      y: [0, -10, 0, -5, 0],
      rotate: [0, -4, 4, -2, 0],
      scale: [1, 1.04, 1],
    },
    transition: {
      duration: 2.2,
      repeat: Infinity,
      repeatDelay: 0.7,
      ease: "easeInOut",
    },
  },

  flying: {
    src: "/images/characters/box_flying.png",
    alt: "Anna Daan food box flying with excitement",
    animate: {
      y: [0, -7, 0],
      x: [0, 3, 0, -3, 0],
      rotate: [-2, 1, -2],
    },
    transition: {
      duration: 3.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  meditating: {
    src: "/images/characters/box_meditating.png",
    alt: "Anna Daan food box calmly meditating",
    animate: {
      y: [0, -2, 0],
      scale: [1, 1.015, 1],
    },
    transition: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  running: {
    src: "/images/characters/box_running.png",
    alt: "Anna Daan food box running energetically",
    animate: {
      x: [-3, 3, -3],
      y: [0, -4, 0, -2, 0],
      rotate: [-2, 2, -2],
    },
    transition: {
      duration: 0.85,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },

  squashed: {
    src: "/images/characters/box_squashed.png",
    alt: "Anna Daan food box resting",
    animate: {
      y: [0, -1, 0],
      rotate: [0, -0.5, 0.5, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export default function FoodBoxCharacter({
  type = "waving",
  className = "",
  imageClassName = "",
  reduceMotion: reduceMotionProp,
  decorative = false,
  static: isStatic = false,
}) {
  const systemReduceMotion = useReducedMotion()
  const reduceMotion = reduceMotionProp ?? systemReduceMotion
  const character = CHARACTERS[type] ?? CHARACTERS.waving

  const shouldAnimate = !isStatic && !reduceMotion

  return (
    <motion.div
      className={`food-box-character ${className}`}
      initial={false}
      animate={shouldAnimate ? character.animate : {}}
      transition={character.transition}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : character.alt}
    >
      <motion.img
        src={character.src}
        alt=""
        draggable={false}
        className={`food-box-character__image ${imageClassName}`}
        loading="lazy"
        animate={
          shouldAnimate && type === "celebrating"
            ? {
                filter: [
                  "brightness(1)",
                  "brightness(1.04)",
                  "brightness(1)",
                ],
              }
            : {}
        }
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  )
}
