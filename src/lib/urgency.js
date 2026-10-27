// JS port of ml/annadaan_ml/urgency.py (Step 17). Keep logic identical.
//
// A transparent, hand-weighted heuristic -- NOT a learned model. The weights are
// project assumptions to confirm with the project guide. It ranks competing
// requests so a donor can see who needs the food most:
//   need      people the request will feed (self-reported, not verified)
//   time      how little time is left before the food must be eaten/refrigerated
//   distance  how close the recipient is
// A missing signal is left out and the remaining weights are renormalised.
// Quantity is not a signal: it belongs to the donation, so it cannot separate
// two requests for the same donation.

import { assessFreshness, DEFAULT_CONFIG } from "./freshnessRules.js"

export const URGENCY_CONFIG = Object.freeze({
  weightNeed: 40,
  weightTime: 35,
  weightDistance: 25,
  maxPeople: 10,
  farKm: 10,
  highFrom: 67,
  mediumFrom: 34,
})

const halfUp = (x) => Math.floor(x + 0.5)
const clamp01 = (x) => Math.max(0, Math.min(1, x))

function fmtHours(hours) {
  const mins = Math.max(0, halfUp(hours * 60))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

const num = (x) => {
  if (x === null || x === undefined || x === "") return null
  const v = Number(x)
  return Number.isFinite(v) ? v : null
}

// Hours left before the food must be eaten or refrigerated (0 once it must be eaten soon).
export function timeLeftHours(freshnessLabel, dangerZoneHours, rules = DEFAULT_CONFIG) {
  if (freshnessLabel === "consume_soon" || freshnessLabel === "unsafe") return 0
  return Math.max(0, rules.useImmediatelyAfterH - dangerZoneHours)
}

export function urgencyScore({
  timeLeftH = null,
  distanceKm = null,
  peopleToFeed = null,
  config = URGENCY_CONFIG,
  rules = DEFAULT_CONFIG,
} = {}) {
  const cfg = config
  const limitH = rules.useImmediatelyAfterH
  const parts = [] // [weight, signal 0-1]
  const reasons = []

  const people = num(peopleToFeed)
  if (people !== null) {
    const p = Math.min(Math.max(Math.trunc(people), 1), cfg.maxPeople)
    parts.push([cfg.weightNeed, (p - 1) / (cfg.maxPeople - 1)])
    if (p >= cfg.maxPeople) reasons.push(`Feeding ${cfg.maxPeople} or more people.`)
    else if (p === 1) reasons.push("Feeding 1 person.")
    else reasons.push(`Feeding ${p} people.`)
  }

  let left = num(timeLeftH)
  if (left !== null) {
    left = Math.max(0, left)
    parts.push([cfg.weightTime, 1 - clamp01(left / limitH)])
    if (left <= 0) reasons.push(`Past the ${limitH} h danger-zone limit: needs eating soon.`)
    else if (left <= 1) reasons.push(`About ${fmtHours(left)} left before it should be eaten or refrigerated.`)
    else reasons.push("Plenty of time left on the freshness clock.")
  }

  let km = num(distanceKm)
  if (km !== null) {
    km = Math.max(0, km)
    parts.push([cfg.weightDistance, 1 - clamp01(km / cfg.farKm)])
    reasons.push(`${(halfUp(km * 10) / 10).toFixed(1)} km away.`)
  }

  if (parts.length === 0) {
    return { urgencyScore: 0, urgencyBand: "standard", urgencyReasons: ["Not enough information to rank this request."] }
  }

  const totalW = parts.reduce((s, [w]) => s + w, 0)
  const score = halfUp((100 * parts.reduce((s, [w, x]) => s + w * x, 0)) / totalW)
  const band = score >= cfg.highFrom ? "high" : score >= cfg.mediumFrom ? "medium" : "standard"
  return { urgencyScore: score, urgencyBand: band, urgencyReasons: reasons }
}

// Full pipeline: run the FSSAI rule layer on the donation, then score the request.
// If the donation data cannot be read, the time signal is simply left out.
export function urgencyForRequest({ donation, distanceKm = null, peopleToFeed = null, now = null }) {
  let timeLeftH = null
  try {
    const cookedAt = donation.cookedAt?.toDate?.() ?? donation.cookedAt
    const fr = assessFreshness({
      cookedAt,
      storageCondition: donation.storageCondition,
      isCovered: donation.isCovered,
      measuredTempC: donation.measuredTempC ?? null,
      foodCategory: donation.foodCategory,
      checkedAt: now,
    })
    timeLeftH = timeLeftHours(fr.freshnessLabel, fr.dangerZoneHours)
  } catch {
    timeLeftH = null
  }
  return urgencyScore({ timeLeftH, distanceKm, peopleToFeed })
}
