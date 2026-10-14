import { useId, useRef } from "react"
import { useCharacterRig } from "./useCharacterRig"
import { C } from "./characterPalette"

const { OUT, SKIN, SKIN_SHADE, HAIR, HAIR_HI, SAGE, CREAM, CREAM_DK, LEAF } = C

const EYES = [80, 120]
const EYE_Y = 96

/* ───────────────────────── expressions ───────────────────────── */
const EXPR = {
  relaxed: { mouth: "smile", lid: 0.03, brows: ["", ""] },
  neutral: { mouth: "smile", lid: 0.03, brows: ["", ""] },
  happy: {
    mouth: "open",
    lid: 0.26,
    brows: ["translateY(-2.5px)", "translateY(-2.5px)"],
  },
  encouraging: {
    mouth: "wide",
    lid: 0.08,
    brows: ["translateY(-1.5px)", "translateY(-1.5px)"],
  },
  attentive: {
    mouth: "soft",
    lid: 0,
    brows: ["translateY(-2px)", "translateY(-2px)"],
  },
  curious: {
    mouth: "curious",
    lid: 0,
    brows: ["", "translateY(-3px) rotate(-6deg)"],
  },
  concerned: {
    mouth: "concerned",
    lid: 0.1,
    brows: ["translateY(-1px) rotate(-13deg)", "translateY(-1px) rotate(13deg)"],
  },
}

const MOUTHS = {
  smile: { d: "M90 123 Q100 130 110 123", stroke: true },
  soft: { d: "M92 124.5 Q100 128 108 124.5", stroke: true },
  wide: { d: "M87 121.5 Q100 134 113 121.5", stroke: true },
  curious: { d: "M91 125 Q100 129 110 121", stroke: true },
  concerned: { d: "M92 128 Q100 121.5 108 128", stroke: true },
}

/* ───────────────────────── hair per role ───────────────────────── */
const HAIR_SHAPES = {
  login: {
    back: "M47 104 C41 56 69 33 100 33 C131 33 159 56 153 104 L152 128 Q151 137 141 137 L134 137 L134 96 L66 96 L66 137 L59 137 Q49 137 48 128 Z",
    front:
      "M55 94 C51 56 76 37 102 37 C131 37 150 58 145 98 C141 80 133 68 121 62 C106 72 84 70 55 94Z",
  },
  food: {
    front:
      "M54 92 C49 52 74 35 100 35 C128 35 151 52 146 92 C143 80 139 70 132 66 C127 72 120 66 114 69 C108 74 100 66 93 70 C86 74 80 66 73 70 C66 72 60 80 54 92Z",
  },
  discovery: {
    back: "M132 50 C168 40 188 88 170 134 C163 114 156 98 146 84 Z",
    front:
      "M54 94 C49 54 74 35 100 35 C128 35 152 52 146 94 C142 76 130 62 106 56 C86 64 64 70 54 94Z",
  },
  status: {
    front:
      "M54 92 C49 52 76 33 104 34 C130 35 151 52 146 92 C144 76 138 64 124 58 C106 64 82 60 68 68 C60 74 56 82 54 92Z",
  },
  details: {
    back: "M46 106 C42 54 70 33 100 33 C130 33 158 54 154 106 L156 150 Q156 158 147 158 L134 158 L134 100 L66 100 L66 158 L53 158 Q44 158 44 150Z",
    front:
      "M55 98 C50 56 76 37 100 37 C124 37 150 56 145 98 C141 76 126 60 100 56 C74 60 59 76 55 98Z",
  },
  profile: {
    back: "M50 100 C46 56 72 34 100 34 C128 34 154 56 150 100 L148 118 L52 118Z",
    front:
      "M55 96 C50 56 76 37 100 37 C124 37 150 56 145 96 C142 74 128 60 100 57 C72 60 58 74 55 96Z",
  },
  empty: {
    front:
      "M54 92 C50 52 74 36 100 36 C128 36 150 52 146 92 C143 74 134 64 116 62 C100 66 76 62 64 70 C58 76 55 84 54 92Z",
  },
}

/* ───────────────────────── small drawing helpers ───────────────────────── */
const stroke = (w = 2.2) => ({ stroke: OUT, strokeWidth: w, strokeLinejoin: "round", strokeLinecap: "round" })

function Limb({ d, color = SAGE }) {
  return (
    <>
      <path d={d} fill="none" stroke={OUT} strokeWidth="23" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="18.6" strokeLinecap="round" />
    </>
  )
}

function Hand({ x, y, flip = false, r = 8.6 }) {
  const f = flip ? -1 : 1
  return (
    <g>
      <ellipse cx={x + f * 6.6} cy={y - 3.5} rx="3.6" ry="6" transform={`rotate(${f * 24} ${x + f * 6.6} ${y - 3.5})`} fill={SKIN} {...stroke(1.8)} />
      <circle cx={x} cy={y} r={r} fill={SKIN} {...stroke(2)} />
    </g>
  )
}

const TORSO = "M38 242 C38 196 52 164 86 154 Q100 161 114 154 C148 164 162 196 162 242Z"

/* ───────────────────────── props ───────────────────────── */
function FoodBox({ empty }) {
  return (
    <g>
      {/* items (behind the front of the box) */}
      {!empty && (
        <g>
          <path d="M120 188 L136 176 L142 182 L128 196Z" fill="#E2873A" {...stroke(1.8)} />
          <path d="M136 176 C134 168 142 166 142 172 M136 176 C140 170 148 172 142 182" fill="none" stroke="#5E8A4E" strokeWidth="3" strokeLinecap="round" />
          <rect x="92" y="170" width="32" height="24" rx="12" fill="#E0B070" {...stroke(2)} />
          <path d="M101 173 L99 183 M110 172 L108 183 M118 173 L116 183" stroke={OUT} strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
          <circle cx="74" cy="182" r="12" fill="#D4574C" {...stroke(2)} />
          <path d="M74 171 C74 166 78 163 82 164 C81 169 78 171 74 171Z" fill="#5E8A4E" {...stroke(1.6)} />
          <path d="M66 178 Q68 174 72 173" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
        </g>
      )}
      {/* open flaps */}
      <path d="M46 194 L33 181 L60 176 L66 194Z" fill={C.CARD_LT} {...stroke(2)} />
      <path d="M154 194 L167 181 L140 176 L134 194Z" fill={C.CARD_LT} {...stroke(2)} />
      {/* front */}
      <rect x="46" y="192" width="108" height="56" rx="4" fill={C.CARD} {...stroke(2.2)} />
      {empty && <path d="M50 195 H150 V201 H50Z" fill={C.CARD_DK} opacity=".55" />}
      <rect x="90" y="192" width="20" height="26" fill={C.CARD_LT} stroke={OUT} strokeWidth="1.8" />
      <path d="M62 224 H80 M120 224 H138" stroke={C.CARD_DK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  )
}

function Clipboard({ checks = 3 }) {
  return (
    <g>
      <rect x="68" y="172" width="64" height="74" rx="8" fill="#8E6244" {...stroke(2.2)} />
      <rect x="75" y="182" width="50" height="60" rx="3.5" fill="#FBF8EE" {...stroke(1.6)} />
      <rect x="88" y="165" width="24" height="13" rx="4.5" fill="#BDB7A6" {...stroke(2)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {i < checks ? (
            <path d={`M81 ${197 + i * 15} l4.2 4.4 l7.6 -9`} fill="none" stroke={LEAF} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <rect x="81" y={193 + i * 15} width="10" height="9" rx="2.5" fill="none" stroke="#C9C1AB" strokeWidth="1.8" />
          )}
          <path d={`M98 ${197 + i * 15} H118`} stroke="#D3CBB6" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

function MapProp() {
  return (
    <g>
      <path d="M58 188 L86 183 L88 244 L56 244Z" fill={CREAM} {...stroke(2)} />
      <path d="M86 183 L114 190 L116 244 L88 244Z" fill={CREAM_DK} {...stroke(2)} />
      <path d="M114 190 L142 185 L144 244 L116 244Z" fill={CREAM} {...stroke(2)} />
      <path d="M62 214 Q76 206 88 214 M92 226 Q104 232 114 224 M120 204 Q132 210 140 202" fill="none" stroke="#CFC7B0" strokeWidth="2" strokeLinecap="round" />
      <path d="M101 229 C91 217 90 210 94 205 C98 200 104 200 108 205 C112 210 111 217 101 229Z" fill={LEAF} {...stroke(2)} />
      <circle cx="101" cy="211" r="3.3" fill={CREAM} />
    </g>
  )
}

function Package() {
  return (
    <g>
      <rect x="62" y="196" width="76" height="52" rx="5" fill={C.CARD} {...stroke(2.2)} />
      <rect x="62" y="196" width="76" height="11" rx="4" fill={C.CARD_DK} {...stroke(2)} />
      <path d="M100 236 C85 232 85 217 100 212 C115 217 115 232 100 236Z" fill={LEAF} {...stroke(2)} />
      <path d="M100 234 V220" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  )
}

/* ───────────────────────── bodies ───────────────────────── */
const SHOULDER_L = "58 170"
const SHOULDER_R = "142 170"

function Body({ role, prop, wave, pose }) {
  const peek = pose === "peek"
  const neck = (
    <path d="M89 128 L89 156 Q100 164 111 156 L111 128Z" fill={SKIN_SHADE} {...stroke(2)} />
  )
  const torso = <path d={TORSO} fill={SAGE} {...stroke(2.4)} />

  if (peek) {
    return (
      <>
        {neck}
        {torso}
        <path d="M87 156 Q100 168 113 156" fill="none" stroke={CREAM} strokeWidth="3.4" strokeLinecap="round" />
      </>
    )
  }

  const heldArms = (lx, ly, rx, ry, rest = true) => (
    <>
      <Limb d={`M${SHOULDER_L} Q40 ${(ly + 170) / 2 + 2} ${lx} ${ly}`} />
      <Hand x={lx} y={ly} flip />
      {rest && (
        <>
          <Limb d={`M${SHOULDER_R} Q160 ${(ry + 170) / 2 + 2} ${rx} ${ry}`} />
          <Hand x={rx} y={ry} />
        </>
      )}
    </>
  )

  switch (role) {
    case "food": {
      return (
        <>
          {neck}
          {torso}
          {/* cream apron */}
          <path d="M72 172 L128 172 L134 244 L66 244Z" fill={CREAM} {...stroke(2)} />
          <path d="M85 158 L74 173 M115 158 L126 173" stroke={OUT} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M87 156 Q100 168 113 156" fill="none" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
          <FoodBox />
          {/* left hand always rests on the box */}
          <Limb d={`M${SHOULDER_L} Q38 196 46 211`} />
          <Hand x={46} y={211} flip />
          {/* right hand: rests on the box, swaps for a raised wave arm on demand */}
          <g key={`r${wave}`} className={wave > 0 ? "char-wave-swap-out" : undefined}>
            <Limb d={`M${SHOULDER_R} Q162 196 154 211`} />
            <Hand x={154} y={211} />
          </g>
          {wave > 0 && (
            <g key={`w${wave}`} className="char-wave-swap-in">
              <g className="char-wave-swing" style={{ transformOrigin: "144px 172px" }}>
                <Limb d={`M${SHOULDER_R} Q176 168 174 140`} />
                <Hand x={174} y={132} r={9.4} />
              </g>
            </g>
          )}
        </>
      )
    }
    case "discovery":
      return (
        <>
          {neck}
          {torso}
          <path d="M87 156 Q100 168 113 156" fill="none" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
          <MapProp />
          {heldArms(56, 206, 144, 204)}
        </>
      )
    case "status":
      return (
        <>
          {neck}
          {torso}
          <path d="M84 154 Q100 170 116 154 L118 160 Q100 180 82 160Z" fill={CREAM} {...stroke(2)} />
          <g className="char-clip-adjust">
            <Clipboard checks={3} />
            {heldArms(70, 212, 130, 212)}
          </g>
        </>
      )
    case "details":
      return (
        <>
          {neck}
          {torso}
          <path d="M88 157 Q100 166 112 157" fill="none" stroke={CREAM} strokeWidth="3.6" strokeLinecap="round" />
          <Package />
          {heldArms(62, 216, 138, 216)}
        </>
      )
    case "profile":
      return (
        <>
          {neck}
          {torso}
          <path d="M86 155 L100 172 L114 155 L110 154 L100 164 L90 154Z" fill={CREAM} {...stroke(1.8)} />
          <Limb d="M58 170 Q40 202 50 234" />
          <Hand x={50} y={236} flip />
          <g key={`p${wave}`} className={wave > 0 ? "char-wave-swing" : undefined} style={{ transformOrigin: "144px 172px" }}>
            <Limb d="M142 170 Q176 170 174 140" />
            <Hand x={174} y={132} r={9.4} />
          </g>
        </>
      )
    default: {
      // 'empty' companion – prop adapts to context
      return (
        <>
          {neck}
          {torso}
          <path d="M87 156 Q100 168 113 156" fill="none" stroke={CREAM} strokeWidth="3.2" strokeLinecap="round" />
          {prop === "clipboard" ? <Clipboard checks={0} /> : prop === "package" ? <Package /> : <FoodBox empty />}
          {prop === "clipboard"
            ? heldArms(70, 214, 130, 214)
            : prop === "package"
              ? heldArms(62, 218, 138, 218)
              : heldArms(46, 211, 154, 211)}
        </>
      )
    }
  }
}

/* ───────────────────────── the character ───────────────────────── */
export default function Character({
  role = "empty",
  expression = "relaxed",
  gaze = null,
  cursor = false,
  tilt = 0,
  nod = 0,
  wave = 0,
  prop = "box",
  pose = "full",
  className,
  style,
  ...svgProps
}) {
  const rootRef = useRef(null)
  const uid = useId().replace(/:/g, "")
  const ex = EXPR[expression] ?? EXPR.relaxed
  useCharacterRig(rootRef, { cursor, gaze, baseLid: ex.lid, tilt, nod })

  const hair = HAIR_SHAPES[role] ?? HAIR_SHAPES.empty
  const mouthKey = ex.mouth

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 200 240"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ pointerEvents: "none", overflow: "visible", ...style }}
      {...svgProps}
    >
      <defs>
        {EYES.map((x, i) => (
          <clipPath id={`${uid}e${i}`} key={x}>
            <ellipse cx={x} cy={EYE_Y} rx="9.5" ry="10.5" />
          </clipPath>
        ))}
      </defs>

      <Body role={role} prop={prop} wave={wave} pose={pose} />

      <g data-rig="head">
        {hair.back && (
          <g>
            <path d={hair.back} fill={HAIR} {...stroke(2.2)} />
            {role === "profile" && <circle cx="148" cy="124" r="15" fill={HAIR} {...stroke(2.2)} />}
          </g>
        )}
        {role === "profile" && !hair.back && null}

        {/* ears + head */}
        <ellipse cx="55.5" cy="99" rx="6.2" ry="9" fill={SKIN} {...stroke(2)} />
        <ellipse cx="144.5" cy="99" rx="6.2" ry="9" fill={SKIN} {...stroke(2)} />
        <path
          d="M56 90 C56 58 76 44 100 44 C124 44 144 58 144 90 C144 118 124 142 100 142 C76 142 56 118 56 90Z"
          fill={SKIN}
          {...stroke(2.4)}
        />
        <ellipse cx="70" cy="113" rx="8" ry="5" fill="#E0846A" opacity=".32" />
        <ellipse cx="130" cy="113" rx="8" ry="5" fill="#E0846A" opacity=".32" />

        {/* eyes */}
        {EYES.map((x, i) => {
          const side = i === 0 ? "l" : "r"
          return (
            <g key={x}>
              <ellipse cx={x} cy={EYE_Y} rx="9.5" ry="10.5" fill="#FFFDF7" />
              <g clipPath={`url(#${uid}e${i})`}>
                <g data-rig={`pupil-${side}`}>
                  <circle cx={x} cy={EYE_Y} r="6.7" fill="#5A3926" />
                  <circle cx={x} cy={EYE_Y} r="3.4" fill="#1D110B" />
                  <circle cx={x + 2.4} cy={EYE_Y - 3} r="1.7" fill="#fff" />
                </g>
                <rect
                  data-rig={`lid-${side}`}
                  x={x - 11}
                  y={EYE_Y - 11.5}
                  width="22"
                  height="23.5"
                  fill={SKIN}
                  stroke={OUT}
                  strokeWidth="1.8"
                  style={{ transform: "scaleY(0)", transformBox: "fill-box", transformOrigin: "top" }}
                />
              </g>
              <ellipse cx={x} cy={EYE_Y} rx="9.5" ry="10.5" fill="none" stroke={OUT} strokeWidth="1.5" />
              <path d={`M${x - 10.5} ${EYE_Y - 3.5} Q${x} ${EYE_Y - 14} ${x + 10.5} ${EYE_Y - 3.5}`} fill="none" stroke={OUT} strokeWidth="2.4" strokeLinecap="round" />
            </g>
          )
        })}

        {/* brows */}
        {[0, 1].map((i) => (
          <g key={i} className="char-brow" style={{ transform: ex.brows[i] || "none" }}>
            <path
              d={`M${EYES[i] - 10} 84 Q${EYES[i]} 78.5 ${EYES[i] + 10} 83`}
              fill="none"
              stroke={HAIR}
              strokeWidth="3.6"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* nose */}
        <path d="M97 106 Q100 111.5 104.5 108" fill="none" stroke={SKIN_SHADE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

        {/* mouths – cross-faded so expressions change smoothly */}
        {Object.entries(MOUTHS).map(([k, m]) => (
          <path
            key={k}
            className="char-mouth"
            d={m.d}
            fill="none"
            stroke="#7A3B2C"
            strokeWidth="2.8"
            strokeLinecap="round"
            style={{ opacity: mouthKey === k ? 1 : 0 }}
          />
        ))}
        <g className="char-mouth" style={{ opacity: mouthKey === "open" ? 1 : 0 }}>
          <path d="M85 119.5 Q100 123.5 115 119.5 Q112 138 100 138 Q88 138 85 119.5Z" fill="#8A3328" {...stroke(2)} />
          <path d="M88 121 Q100 125 112 121 L111 125 Q100 129 89 125Z" fill="#fff" />
          <path d="M92 133 Q100 128 108 133 Q104 137 100 137 Q96 137 92 133Z" fill="#D9746A" />
        </g>

        {/* hair (front) */}
        <path d={hair.front} fill={HAIR} {...stroke(2.2)} />
        <path d="M72 50 Q86 42 100 43" fill="none" stroke={HAIR_HI} strokeWidth="3.2" strokeLinecap="round" opacity=".75" />
        {role === "discovery" && <ellipse cx="146" cy="66" rx="5.2" ry="6.4" fill={LEAF} {...stroke(1.8)} />}
        {role === "details" && <path d="M100 38 V56" stroke={HAIR_HI} strokeWidth="2" strokeLinecap="round" opacity=".8" />}
      </g>
    </svg>
  )
}
