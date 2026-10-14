import { useEffect, useRef } from "react"

// Imperative animation rig for a Character SVG.
// All per-frame work (gaze, blink, head tilt, nod) is written straight to SVG
// attributes, so cursor tracking never triggers a React re-render.

const MAX_X = 2.8 // max pupil travel (SVG units) – keeps the iris inside the eye
const MAX_Y = 3.2
const EYE_Y_RATIO = 96 / 240 // eye line inside the 200x240 character viewBox
const rand = (a, b) => a + Math.random() * (b - a)

export function useCharacterRig(
  rootRef,
  { cursor = false, gaze = null, baseLid = 0, tilt = 0, nod = 0 }
) {
  const opt = useRef({ cursor, gaze, baseLid, tilt, nod })
  const api = useRef(null)

  // Keep the latest options available to the animation loop.
  useEffect(() => {
    opt.current = { cursor, gaze, baseLid, tilt, nod }
    api.current?.onOptions()
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const q = (n) => root.querySelector(`[data-rig="${n}"]`)
    const head = q("head")
    const pupilL = q("pupil-l")
    const pupilR = q("pupil-r")
    const lidL = q("lid-l")
    const lidR = q("lid-r")
    if (!head || !pupilL || !pupilR || !lidL || !lidR) return undefined

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = mq.matches
    let visible = true
    let raf = null
    let last = 0

    // animation state
    let gx = 0
    let gy = 0
    let lid = opt.current.baseLid
    let tiltNow = 0
    let nyNow = 0
    let blinkStart = null
    let nextBlink = performance.now() + rand(1400, 3200)
    let drift = { x: 0, y: 0 }
    let nextDrift = performance.now() + rand(1500, 3500)
    let idleTilt = 0
    let nextTilt = performance.now() + rand(4000, 8000)
    let pulse = null // {start, amp}
    let nodStart = null
    let sign = 1
    let seenTilt = opt.current.tilt
    let seenNod = opt.current.nod
    const ptr = { x: 0, y: 0, t: -1e9 }

    const painted = {}
    const set = (el, key, attr, value) => {
      if (painted[key] === value) return
      painted[key] = value
      el.setAttribute(attr, value)
    }
    const paint = () => {
      const px = (gx * MAX_X).toFixed(2)
      const py = (gy * MAX_Y).toFixed(2)
      set(pupilL, "pl", "transform", `translate(${px} ${py})`)
      set(pupilR, "pr", "transform", `translate(${px} ${py})`)
      const l = Math.max(0, Math.min(1, lid)).toFixed(3)
      lidL.style.transform = `scaleY(${l})`
      lidR.style.transform = `scaleY(${l})`
      set(
        head,
        "head",
        "transform",
        `translate(0 ${nyNow.toFixed(2)}) rotate(${tiltNow.toFixed(2)} 100 150)`
      )
    }

    const staticPose = () => {
      const g = opt.current.gaze
      gx = g ? g.x : 0
      gy = g ? g.y : 0
      lid = opt.current.baseLid
      tiltNow = 0
      nyNow = 0
      paint()
    }

    const onPointer = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return
      ptr.x = e.clientX
      ptr.y = e.clientY
      ptr.t = performance.now()
    }

    const tick = (t) => {
      raf = null
      if (reduced || !visible || document.hidden) return
      const dt = Math.min(64, t - (last || t))
      last = t
      const o = opt.current

      // --- blink (varied intervals, occasional double blink)
      if (t >= nextBlink) {
        blinkStart = t
        nextBlink = t + (Math.random() < 0.16 ? 330 : rand(2600, 6800))
      }
      let blink = 0
      if (blinkStart !== null) {
        const p = (t - blinkStart) / 160
        if (p >= 1) blinkStart = null
        else blink = p < 0.42 ? p / 0.42 : 1 - (p - 0.42) / 0.58
      }
      lid += (o.baseLid - lid) * 0.12
      const lidOut = Math.max(lid, blink)

      // --- gaze target: explicit target > cursor (desktop) > idle drift
      let tx
      let ty
      if (o.gaze) {
        tx = o.gaze.x
        ty = o.gaze.y
      } else if (o.cursor && t - ptr.t < 5000) {
        const r = root.getBoundingClientRect()
        const dx = ptr.x - (r.left + r.width / 2)
        const dy = ptr.y - (r.top + r.height * EYE_Y_RATIO)
        const dist = Math.hypot(dx, dy) || 1
        const strength = Math.min(1, dist / 170)
        tx = (dx / dist) * strength
        ty = (dy / dist) * strength
      } else {
        if (t >= nextDrift) {
          drift = { x: rand(-0.5, 0.5), y: rand(-0.28, 0.3) }
          nextDrift = t + rand(1800, 4800)
        }
        tx = drift.x
        ty = drift.y
      }
      const k = 1 - Math.exp(-dt / 120)
      gx += (tx - gx) * k
      gy += (ty - gy) * k
      const m = Math.hypot(gx, gy)
      if (m > 1) {
        gx /= m
        gy /= m
      }

      // --- head tilt (tiny idle tilts + triggered pulses)
      if (t >= nextTilt) {
        if (idleTilt !== 0) {
          idleTilt = 0
          nextTilt = t + rand(4500, 9000)
        } else {
          idleTilt = rand(-1.5, 1.5)
          nextTilt = t + rand(1600, 2800)
        }
      }
      let tiltTarget = idleTilt
      if (pulse) {
        const p = (t - pulse.start) / 1100
        if (p >= 1) pulse = null
        else tiltTarget = pulse.amp * Math.sin(Math.PI * p)
      }
      tiltNow += (tiltTarget - tiltNow) * (1 - Math.exp(-dt / 140))

      // --- nod
      let nyTarget = 0
      if (nodStart !== null) {
        const p = (t - nodStart) / 560
        if (p >= 1) nodStart = null
        else nyTarget = 3.2 * Math.sin(Math.PI * p)
      }
      nyNow += (nyTarget - nyNow) * 0.4

      const old = lid
      lid = lidOut > old ? lidOut : lid
      paint()
      lid = old
      raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (raf !== null || reduced || !visible || document.hidden) return
      last = 0
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf)
      raf = null
    }

    api.current = {
      onOptions: () => {
        const o = opt.current
        if (o.tilt !== seenTilt) {
          seenTilt = o.tilt
          sign = -sign
          pulse = { start: performance.now(), amp: 3.4 * sign }
        }
        if (o.nod !== seenNod) {
          seenNod = o.nod
          nodStart = performance.now()
        }
        if (reduced) staticPose()
        else start()
      },
    }

    const onMq = () => {
      reduced = mq.matches
      if (reduced) {
        stop()
        staticPose()
      } else start()
    }
    mq.addEventListener("change", onMq)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVis)

    let io = null
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      })
      io.observe(root)
    }
    if (opt.current.cursor) window.addEventListener("pointermove", onPointer, { passive: true })

    if (reduced) staticPose()
    else {
      paint()
      start()
    }

    return () => {
      stop()
      io?.disconnect()
      mq.removeEventListener("change", onMq)
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("pointermove", onPointer)
      api.current = null
    }
  }, [rootRef, cursor])
}
