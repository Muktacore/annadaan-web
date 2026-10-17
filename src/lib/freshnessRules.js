// JS port of ml/annadaan_ml/fssai_rules.py. Keep thresholds and logic identical.
// Rules (project spec, FSSAI): danger zone 5-60 C; more than 2 h in the zone =
// refrigerate or eat immediately; more than 4 h = discard.
// Project assumptions (NOT FSSAI figures): 24 h max donation age, 1 h assumed in
// the zone before refrigeration, uncovered food escalates after 1 h in the zone.

export const DEFAULT_CONFIG = Object.freeze({
  dangerLowC: 5,
  dangerHighC: 60,
  useImmediatelyAfterH: 2,
  discardAfterH: 4,
  coolTo21WithinH: 2,
  coolTo5WithinH: 6,
  maxDonationAgeH: 24,
  assumedPreRefrigerationH: 1,
  uncoveredEscalationH: 1,
  nearThresholdMarginH: 0.25,
})

const SAFE = "safe"
const CONSUME_SOON = "consume_soon"
const UNSAFE = "unsafe"
const STORAGE_VALUES = ["room_temp", "refrigerated", "kept_warm", "changed", "unknown"]
const COVERED_VALUES = ["covered", "uncovered", "partial", "unknown"]
const FUTURE_TOLERANCE_H = 5 / 60

const norm = (value, allowed) => {
  const v = String(value ?? "").trim().toLowerCase()
  return allowed.includes(v) ? v : "unknown"
}

const r2 = (x) => Math.round(x * 100) / 100

export function fmtHours(hours) {
  const mins = Math.max(0, Math.round(hours * 60))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export function dangerHours(elapsed, storage, temp, cfg) {
  if (temp !== null) {
    if (temp >= cfg.dangerHighC) return [0, "hot"]
    if (temp <= cfg.dangerLowC) return [Math.min(elapsed, cfg.assumedPreRefrigerationH), "cold"]
    return [elapsed, "zone"]
  }
  if (storage === "refrigerated") return [Math.min(elapsed, cfg.assumedPreRefrigerationH), "cold_unmeasured"]
  if (storage === "kept_warm") return [elapsed, "warm_unverified"]
  return [elapsed, "zone_assumed"]
}

// Returns the locked schema fields plus dangerZoneHours and ruleIds (extras).
// Throws if cookedAt is in the future or the temperature is out of range.
export function assessFreshness({
  cookedAt,
  storageCondition = "unknown",
  isCovered = "unknown",
  measuredTempC = null,
  foodCategory = null,
  checkedAt = null,
  config = DEFAULT_CONFIG,
}) {
  const cfg = config
  const checked = checkedAt ? new Date(checkedAt) : new Date()
  const cooked = new Date(cookedAt)
  if (Number.isNaN(cooked.getTime())) throw new Error("cookedAt is not a valid date")

  let elapsed = (checked.getTime() - cooked.getTime()) / 3600000
  if (elapsed < -FUTURE_TOLERANCE_H) throw new Error("cookedAt is in the future")
  elapsed = Math.max(0, elapsed)

  const t =
    measuredTempC === null || measuredTempC === undefined || Number.isNaN(Number(measuredTempC))
      ? null
      : Number(measuredTempC)
  if (t !== null && (t < -40 || t > 200)) throw new Error("measuredTempC must be between -40 and 200")

  const storage = norm(storageCondition, STORAGE_VALUES)
  const cover = norm(isCovered, COVERED_VALUES)
  const category = String(foodCategory ?? "").trim().toLowerCase()

  const [danger, basis] = dangerHours(elapsed, storage, t, cfg)

  // ---- label ----
  const ruleIds = []
  let label = SAFE
  if (danger > cfg.discardAfterH) {
    label = UNSAFE
    ruleIds.push("DANGER_ZONE_OVER_4H")
  } else if (danger > cfg.useImmediatelyAfterH) {
    label = CONSUME_SOON
    ruleIds.push("DANGER_ZONE_OVER_2H")
  }
  if (elapsed > cfg.maxDonationAgeH) {
    label = UNSAFE
    ruleIds.push("AGE_LIMIT")
  }
  if (label === SAFE && cover === "uncovered" && danger > cfg.uncoveredEscalationH) {
    label = CONSUME_SOON
    ruleIds.push("UNCOVERED_ESCALATION")
  }
  if (ruleIds.length === 0) ruleIds.push("WITHIN_LIMITS")

  // ---- explanation ----
  const lines = [`Cooked ${fmtHours(elapsed)} ago.`]

  if (basis === "hot") {
    lines.push(`Measured ${t.toFixed(0)} °C: held at or above 60 °C, outside the 5-60 °C danger zone.`)
  } else if (basis === "cold") {
    lines.push(
      `Measured ${t.toFixed(0)} °C: kept at or below 5 °C. The time before chilling is unknown, ` +
        `so about ${fmtHours(danger)} in the danger zone is assumed.`
    )
  } else if (basis === "zone") {
    lines.push(`Measured ${t.toFixed(0)} °C: inside the 5-60 °C danger zone for about ${fmtHours(danger)}.`)
  } else if (basis === "cold_unmeasured") {
    lines.push(
      `Refrigerated (temperature not measured): about ${fmtHours(danger)} in the danger zone ` +
        "is assumed before chilling."
    )
  } else if (basis === "warm_unverified") {
    lines.push(
      "Kept warm, but a temperature of 60 °C or above could not be verified, " +
        `so it counts as ${fmtHours(danger)} in the 5-60 °C danger zone.`
    )
  } else {
    lines.push(
      `Stored at room temperature or unknown conditions: counts as ${fmtHours(danger)} in the 5-60 °C danger zone.`
    )
  }

  if (ruleIds.includes("AGE_LIMIT")) {
    lines.push(`Older than the ${cfg.maxDonationAgeH} h limit for donated cooked food: discard it.`)
  }
  if (ruleIds.includes("DANGER_ZONE_OVER_4H")) {
    lines.push(`More than ${cfg.discardAfterH} h in the danger zone: discard it.`)
  }
  if (ruleIds.includes("DANGER_ZONE_OVER_2H")) {
    lines.push(`More than ${cfg.useImmediatelyAfterH} h in the danger zone: refrigerate it or eat it immediately.`)
  }
  if (ruleIds.includes("UNCOVERED_ESCALATION")) {
    lines.push("Uncovered food is exposed to contamination: eat it soon.")
  }
  if (ruleIds.includes("WITHIN_LIMITS")) {
    if (["zone", "zone_assumed", "warm_unverified"].includes(basis)) {
      lines.push(
        `Within limits: about ${fmtHours(cfg.useImmediatelyAfterH - danger)} left before it should be eaten or refrigerated.`
      )
    } else {
      lines.push("Within limits: no danger-zone limit reached.")
    }
  }

  if (t !== null && basis === "zone") {
    if (elapsed > cfg.coolTo21WithinH && t > 21) {
      lines.push("Cooling is slower than the FSSAI guideline (about 63 °C to 21 °C within 2 h).")
    }
    if (elapsed > cfg.coolTo5WithinH && t > cfg.dangerLowC) {
      lines.push("Cooling is slower than the FSSAI guideline (down to 5 °C within the next 4 h).")
    }
  }

  if (cover === "uncovered") lines.push("The food was uncovered.")
  else if (cover === "partial") lines.push("The food was only partly covered.")
  else if (cover === "unknown") lines.push("Covered status is unknown.")

  if (storage === "changed" || storage === "unknown") {
    lines.push("Storage conditions were unknown or changed, so the conservative room-temperature rule was used.")
  }
  if (t === null) lines.push("No temperature reading: storage was taken as reported.")

  if (category === "rice" && label !== SAFE) {
    lines.push("Cooked rice can carry Bacillus cereus, and its toxin is not destroyed by reheating.")
  }

  // ---- confidence (rule certainty, not a calibrated probability) ----
  let conf = 0.9
  if (t === null) conf -= 0.1
  if (storage === "unknown" || storage === "changed") conf -= 0.2
  if (storage === "kept_warm" && t === null) conf -= 0.15
  if (cover === "unknown") conf -= 0.05
  else if (cover === "partial") conf -= 0.03
  const near = [cfg.useImmediatelyAfterH, cfg.discardAfterH].some(
    (limit) => Math.abs(danger - limit) <= cfg.nearThresholdMarginH
  )
  if (near) {
    conf -= 0.1
    lines.push("Close to a time limit: treat with extra caution.")
  }
  conf = r2(Math.max(0.3, Math.min(0.95, conf)))

  return {
    freshnessLabel: label,
    freshnessSource: "rule_based",
    confidenceScore: conf,
    explanation: lines,
    timeElapsedAtCheck: r2(elapsed),
    dangerZoneHours: r2(danger),
    ruleIds,
  }
}
