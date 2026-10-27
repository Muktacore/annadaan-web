import { useId } from "react"
import "./bowl-steam.css"

// Decorative steam overlay. Place it inside a `relative` wrapper that
// tightly surrounds the food artwork (see Login.jsx).
// `color` defaults to the cream used on the green Login panel. Pass a darker
// tone when the steam sits on a light background (e.g. Splash).
export default function BowlSteam({ color = "#FFF9ED" }) {
  const gradId = `steam-${useId().replace(/:/g, "")}`

  return (
    <svg
      className="bowl-steam"
      viewBox="0 0 120 200"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Wisps fade in at the base and thin out toward the top */}
        <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="25%" stopColor={color} stopOpacity="0.9" />
          <stop offset="70%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        className="bowl-steam__wisp bowl-steam__wisp--a"
        stroke={`url(#${gradId})`}
        d="M 34 196 C 12 162, 56 142, 36 108 C 20 80, 52 62, 38 22"
      />
      <path
        className="bowl-steam__wisp bowl-steam__wisp--b"
        stroke={`url(#${gradId})`}
        d="M 62 198 C 84 164, 44 140, 66 106 C 84 76, 52 54, 68 14"
      />
      <path
        className="bowl-steam__wisp bowl-steam__wisp--c"
        stroke={`url(#${gradId})`}
        d="M 90 194 C 70 164, 108 144, 90 112 C 76 88, 104 66, 92 30"
      />
    </svg>
  )
}