import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import Character from "./Character"
import { C } from "./characterPalette"
import { LoginCompanionContext, useLoginCompanion } from "./loginCompanionContext"

const { OUT, SKIN, SAGE } = C

/* ───────────── shared state (visual only – never touches auth logic) ───────────── */
export function LoginCompanionProvider({ children }) {
  const [focus, setFocusState] = useState(null) // 'email' | 'password' | 'name' | null
  const [typing, setTyping] = useState(false)
  const [phase, setPhaseState] = useState("idle") // idle | submitting | success | error
  const [pulse, setPulse] = useState(0)
  const typingTimer = useRef(null)

  const setFocus = useCallback((next) => {
    setFocusState((cur) => {
      const value = typeof next === "function" ? next(cur) : next
      if (value && value !== cur) setPulse((p) => p + 1)
      return value
    })
  }, [])

  const markTyping = useCallback(() => {
    setTyping(true)
    // an error face must not outlive the moment the person starts correcting it
    setPhaseState((p) => (p === "error" ? "idle" : p))
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTyping(false), 1300)
  }, [])

  const setPhase = useCallback((p) => setPhaseState(p), [])

  // Error expression eases back to idle on its own.
  useEffect(() => {
    if (phase !== "error") return undefined
    const t = setTimeout(() => setPhaseState("idle"), 5000)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => () => clearTimeout(typingTimer.current), [])

  const value = useMemo(
    () => ({ focus, typing, phase, pulse, setFocus, markTyping, setPhase }),
    [focus, typing, phase, pulse, setFocus, markTyping, setPhase]
  )
  return <LoginCompanionContext.Provider value={value}>{children}</LoginCompanionContext.Provider>
}

function useLoginFace(layout) {
  const { focus, typing, phase, pulse } = useLoginCompanion()

  let expression = "relaxed"
  if (phase === "success") expression = "happy"
  else if (phase === "submitting") expression = "encouraging"
  else if (phase === "error") expression = "concerned"
  else if (typing) expression = "attentive"

  let gaze = null
  if (phase === "success" || phase === "error") gaze = { x: 0, y: 0.15 }
  else if (phase === "submitting") gaze = layout === "wall" ? { x: 0.75, y: 0.2 } : { x: 0, y: -0.45 }
  else if (focus) {
    const field = focus === "password" ? "password" : "email"
    const nudge = typing ? 0.14 : 0
    if (layout === "wall") gaze = field === "email" ? { x: 0.9, y: -0.4 + nudge } : { x: 0.9, y: 0.05 + nudge }
    else gaze = field === "email" ? { x: 0, y: -0.9 + nudge } : { x: 0.05, y: -0.55 + nudge }
  }
  return { expression, gaze, pulse }
}

/* ───────────── desktop: peeking out from behind the edge of the login panel ───────────── */
// The scene's right edge sits exactly on the seam between the green panel and the cream login
// panel. Everything right of SEAM (in character coordinates) is clipped, so the login panel itself
// is the "wall"; the hands grip its edge and the fingers fall onto the panel.
const SEAM = 132

function SeamHand({ y, sleeve = false }) {
  return (
    <g transform={`translate(${SEAM} ${y}) scale(1.3)`}>
      {sleeve && <rect x="-15" y="12" width="17" height="24" rx="8" fill={SAGE} stroke={OUT} strokeWidth="2.2" />}
      <rect x="-11" y="0" width="15" height="21" rx="7.5" fill={SKIN} stroke={OUT} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="-3" y={1.5 + i * 6.4} width="21" height="6" rx="3" fill={SKIN} stroke={OUT} strokeWidth="1.5" />
      ))}
    </g>
  )
}

export function SeamPeekScene({ className }) {
  const { expression, gaze, pulse } = useLoginFace("wall")
  const id = useId().replace(/:/g, "")
  return (
    <svg
      viewBox="40 22 92 178"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <defs>
        <clipPath id={`seam-clip-${id}`}>
          <rect x="0" y="0" width={SEAM} height="400" />
        </clipPath>
        <linearGradient id={`seam-fade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`seam-mask-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240">
          <rect x="0" y="0" width="200" height="205" fill={`url(#seam-fade-${id})`} />
        </mask>
      </defs>

      <g mask={`url(#seam-mask-${id})`}>
        <g clipPath={`url(#seam-clip-${id})`}>
          <g className="char-peek-seam">
            <Character
              role="login"
              pose="peek"
              expression={expression}
              gaze={gaze}
              tilt={pulse}
              cursor
              x="0"
              y="0"
              width="200"
              height="240"
            />
          </g>
        </g>
      </g>

      <g className="char-fade-in" style={{ animationDelay: "1.1s" }}>
        <SeamHand y={62} />
        <SeamHand y={132} sleeve />
      </g>
    </svg>
  )
}

/* ───────────── mobile: peeking over the top edge of the primary button ───────────── */
// The scene's bottom edge sits exactly on the button's top edge. Everything below CUT is clipped,
// and the fingers hang down over the button.
const CUT = 134

function LedgeHand({ cx }) {
  return (
    <g transform={`translate(${cx} ${CUT})`}>
      <rect x="-14" y="-17" width="28" height="19" rx="9" fill={SKIN} stroke={OUT} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-13 + i * 6.9} y="-5" width="6.2" height="20" rx="3.1" fill={SKIN} stroke={OUT} strokeWidth="1.6" />
      ))}
    </g>
  )
}

export function LedgePeekScene({ className }) {
  const { expression, gaze, pulse } = useLoginFace("ledge")
  const id = useId().replace(/:/g, "")
  return (
    <svg
      viewBox={`8 26 184 ${CUT - 26}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <defs>
        <clipPath id={`ledge-clip-${id}`}>
          <rect x="0" y="0" width="200" height={CUT} />
        </clipPath>
      </defs>

      <g clipPath={`url(#ledge-clip-${id})`}>
        <g className="char-rise-button">
          <Character
            role="login"
            pose="peek"
            expression={expression}
            gaze={gaze}
            tilt={pulse}
            x="0"
            y="0"
            width="200"
            height="240"
          />
        </g>
      </g>

      <g className="char-fade-in" style={{ animationDelay: "0.9s" }}>
        <LedgeHand cx={34} />
        <LedgeHand cx={166} />
      </g>
    </svg>
  )
}
