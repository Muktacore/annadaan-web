// Plain-language explanation templates (Step 15a). JS port of
// ml/annadaan_ml/explain_templates.py: keep wording and logic identical.
// Every sentence is a fixed template (no generated text), so it is testable.
import { assessFreshness, DEFAULT_CONFIG, dangerHours, fmtHours } from "./freshnessRules.js"

const DEG = "\u00b0C"
export const DISCLAIMER = "Rule-based estimate from food-safety timing guidelines, not a lab test."
const HEADLINES = { safe: "Looks safe", consume_soon: "Eat soon", unsafe: "Not safe" }
const PRIORITY = ["DANGER_ZONE_OVER_4H", "AGE_LIMIT", "DANGER_ZONE_OVER_2H", "UNCOVERED_ESCALATION", "WITHIN_LIMITS"]
const ZONE_BASES = ["zone", "zone_assumed", "warm_unverified"]
const STORAGE_VALUES = ["room_temp", "refrigerated", "kept_warm", "changed", "unknown"]
const COVERED_VALUES = ["covered", "uncovered", "partial", "unknown"]

const norm = (value, allowed) => {
  const v = String(value ?? "").trim().toLowerCase()
  return allowed.includes(v) ? v : "unknown"
}

// result: the object returned by assessFreshness. inputs: the same donation inputs.
export function explainResult(
  result,
  { storageCondition = "unknown", isCovered = "unknown", measuredTempC = null, foodCategory = null } = {},
  cfg = DEFAULT_CONFIG
) {
  const storage = norm(storageCondition, STORAGE_VALUES)
  const cover = norm(isCovered, COVERED_VALUES)
  const category = String(foodCategory ?? "").trim().toLowerCase()
  const t =
    measuredTempC === null || measuredTempC === undefined || Number.isNaN(Number(measuredTempC))
      ? null
      : Number(measuredTempC)
  const elapsed = result.timeElapsedAtCheck
  const danger = result.dangerZoneHours
  const label = result.freshnessLabel
  const ids = result.ruleIds
  const [, basis] = dangerHours(elapsed, storage, t, cfg)
  const primary = PRIORITY.find((r) => ids.includes(r)) ?? "WITHIN_LIMITS"
  const left = Math.max(0, cfg.useImmediatelyAfterH - danger)

  // ---- summary ----
  let summary
  if (primary === "DANGER_ZONE_OVER_4H") {
    summary = `Not safe to share: about ${fmtHours(danger)} in the 5-60${DEG} danger zone, over the ${cfg.discardAfterH} h limit.`
  } else if (primary === "AGE_LIMIT") {
    summary = `Not safe to share: cooked ${fmtHours(elapsed)} ago, past the ${cfg.maxDonationAgeH} h limit for donated food.`
  } else if (primary === "DANGER_ZONE_OVER_2H") {
    summary = `Eat soon: about ${fmtHours(danger)} in the 5-60${DEG} danger zone, past the ${cfg.useImmediatelyAfterH} h point.`
  } else if (primary === "UNCOVERED_ESCALATION") {
    summary = "Eat soon: it was left uncovered while in the danger zone, which raises contamination risk."
  } else if (ZONE_BASES.includes(basis)) {
    summary = `Safe for now: about ${fmtHours(left)} left before it should be eaten or refrigerated.`
  } else {
    summary = "Safe: it was kept hot or cold enough that no time limit has been reached."
  }

  // ---- reasons ----
  const reasons = [`Cooked ${fmtHours(elapsed)} ago.`]
  if (basis === "hot") {
    reasons.push(`Held hot (measured ${t.toFixed(0)}${DEG}), so the danger-zone clock did not run.`)
  } else if (basis === "cold") {
    reasons.push(
      `Kept cold (measured ${t.toFixed(0)}${DEG}); about ${fmtHours(danger)} in the danger zone is assumed before chilling.`
    )
  } else if (basis === "zone") {
    reasons.push(`Measured ${t.toFixed(0)}${DEG}, inside the 5-60${DEG} danger zone.`)
  } else if (basis === "cold_unmeasured") {
    reasons.push(
      `Refrigerated but not measured; about ${fmtHours(danger)} in the danger zone is assumed before chilling.`
    )
  } else if (basis === "warm_unverified") {
    reasons.push(`Kept warm, but 60${DEG} or above could not be verified, so it counts as danger-zone time.`)
  } else {
    reasons.push("Stored at room temperature or unknown conditions, so it counts as danger-zone time.")
  }
  if (ids.includes("AGE_LIMIT") && primary !== "AGE_LIMIT") {
    reasons.push(`Also past the ${cfg.maxDonationAgeH} h limit for donated food.`)
  }
  if (cover === "uncovered") reasons.push("It was uncovered, which raises contamination risk.")
  else if (cover === "partial") reasons.push("It was only partly covered.")
  if (basis === "zone" && t !== null && elapsed > cfg.coolTo21WithinH && t > 21) {
    reasons.push("Cooling is slower than the FSSAI guideline.")
  }
  if (category === "rice" && label !== "safe") {
    reasons.push("Cooked rice can carry Bacillus cereus, whose toxin reheating does not destroy.")
  }

  // ---- advice ----
  let advice
  if (label === "unsafe") {
    advice = "Do not eat or share this food. Discard it."
  } else if (label === "consume_soon") {
    advice = primary === "UNCOVERED_ESCALATION" ? "Cover it and eat it soon." : "Refrigerate it or eat it immediately."
  } else if (ZONE_BASES.includes(basis)) {
    advice = `Eat it or refrigerate it within about ${fmtHours(left)}.`
  } else if (basis === "hot") {
    advice = `Keep it hot (60${DEG} or above) until it is eaten.`
  } else {
    advice = "Keep it cold until it is eaten."
  }

  // ---- caveats ----
  const caveats = []
  if (t === null) caveats.push("No temperature was measured, so storage was taken as reported.")
  if (storage === "unknown" || storage === "changed") {
    caveats.push("Storage conditions were unknown or changed, so the cautious room-temperature rule was used.")
  }
  if (cover === "unknown") caveats.push("Covered status is unknown.")
  if ([cfg.useImmediatelyAfterH, cfg.discardAfterH].some((limit) => Math.abs(danger - limit) <= cfg.nearThresholdMarginH)) {
    caveats.push("Close to a time limit, so treat it with extra caution.")
  }

  return { headline: HEADLINES[label], summary, reasons, advice, caveats, disclaimer: DISCLAIMER }
}

const toDate = (v) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : null)

// For the UI: explain a donation document. Returns null when the donation was not
// rule-checked (cnn/hybrid) or its data is unusable, so the caller can fall back to
// the stored explanation[] lines.
export function explainDonation(donation, checkedAt = null) {
  if (!donation || donation.freshnessSource !== "rule_based") return null
  const cooked = toDate(donation.cookedAt)
  if (!cooked) return null
  const inputs = {
    storageCondition: donation.storageCondition,
    isCovered: donation.isCovered,
    measuredTempC: donation.measuredTempC ?? null,
    foodCategory: donation.foodCategory,
  }
  try {
    const result = assessFreshness({ cookedAt: cooked, ...inputs, checkedAt })
    return explainResult(result, inputs)
  } catch {
    return null
  }
}
