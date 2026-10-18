"""Plain-language explanation templates (Step 15a).

Turns the rule layer's output (label, rule_ids, danger_zone_hours) plus the donation
inputs into short, deterministic sentences for the app:

    headline  short title ("Looks safe" / "Eat soon" / "Not safe")
    summary   one sentence: the verdict and the main reason
    reasons   a few short supporting facts
    advice    one practical instruction
    caveats   what is uncertain (missing temperature, unknown storage, near a limit)
    disclaimer fixed honesty line (rule-based estimate, not a lab test)

No generated text: every sentence comes from a fixed template, so it can be unit
tested and ported to JS (src/lib/freshnessExplain.js). Keep both in sync.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional, Tuple

from .fssai_rules import (
    CONSUME_SOON,
    COVERED_VALUES,
    DEFAULT_CONFIG,
    SAFE,
    STORAGE_VALUES,
    UNSAFE,
    FreshnessResult,
    RuleConfig,
    _danger_hours,
    _fmt_hours,
    _norm,
    assess_freshness,
)

DEG = "\u00b0C"
DISCLAIMER = "Rule-based estimate from food-safety timing guidelines, not a lab test."
HEADLINES = {SAFE: "Looks safe", CONSUME_SOON: "Eat soon", UNSAFE: "Not safe"}
PRIORITY = (
    "DANGER_ZONE_OVER_4H",
    "AGE_LIMIT",
    "DANGER_ZONE_OVER_2H",
    "UNCOVERED_ESCALATION",
    "WITHIN_LIMITS",
)
ZONE_BASES = ("zone", "zone_assumed", "warm_unverified")


def explain_result(
    result: FreshnessResult,
    storage_condition: str = "unknown",
    is_covered: str = "unknown",
    measured_temp_c: Optional[float] = None,
    food_category: Optional[str] = None,
    config: RuleConfig = DEFAULT_CONFIG,
) -> dict:
    cfg = config
    storage = _norm(storage_condition, STORAGE_VALUES)
    cover = _norm(is_covered, COVERED_VALUES)
    category = (food_category or "").strip().lower()
    t = measured_temp_c
    elapsed = result.time_elapsed_at_check
    danger = result.danger_zone_hours
    label = result.freshness_label
    ids = result.rule_ids
    _, basis = _danger_hours(elapsed, storage, t, cfg)
    primary = next((r for r in PRIORITY if r in ids), "WITHIN_LIMITS")
    left = max(0.0, cfg.use_immediately_after_h - danger)

    # ---- summary: verdict + main reason ----
    if primary == "DANGER_ZONE_OVER_4H":
        summary = (
            f"Not safe to share: about {_fmt_hours(danger)} in the 5-60{DEG} danger zone, "
            f"over the {cfg.discard_after_h:g} h limit."
        )
    elif primary == "AGE_LIMIT":
        summary = (
            f"Not safe to share: cooked {_fmt_hours(elapsed)} ago, "
            f"past the {cfg.max_donation_age_h:g} h limit for donated food."
        )
    elif primary == "DANGER_ZONE_OVER_2H":
        summary = (
            f"Eat soon: about {_fmt_hours(danger)} in the 5-60{DEG} danger zone, "
            f"past the {cfg.use_immediately_after_h:g} h point."
        )
    elif primary == "UNCOVERED_ESCALATION":
        summary = "Eat soon: it was left uncovered while in the danger zone, which raises contamination risk."
    elif basis in ZONE_BASES:
        summary = f"Safe for now: about {_fmt_hours(left)} left before it should be eaten or refrigerated."
    else:
        summary = "Safe: it was kept hot or cold enough that no time limit has been reached."

    # ---- reasons ----
    reasons = [f"Cooked {_fmt_hours(elapsed)} ago."]
    if basis == "hot":
        reasons.append(f"Held hot (measured {t:.0f}{DEG}), so the danger-zone clock did not run.")
    elif basis == "cold":
        reasons.append(
            f"Kept cold (measured {t:.0f}{DEG}); about {_fmt_hours(danger)} in the danger zone "
            "is assumed before chilling."
        )
    elif basis == "zone":
        reasons.append(f"Measured {t:.0f}{DEG}, inside the 5-60{DEG} danger zone.")
    elif basis == "cold_unmeasured":
        reasons.append(
            f"Refrigerated but not measured; about {_fmt_hours(danger)} in the danger zone "
            "is assumed before chilling."
        )
    elif basis == "warm_unverified":
        reasons.append(f"Kept warm, but 60{DEG} or above could not be verified, so it counts as danger-zone time.")
    else:
        reasons.append("Stored at room temperature or unknown conditions, so it counts as danger-zone time.")
    if "AGE_LIMIT" in ids and primary != "AGE_LIMIT":
        reasons.append(f"Also past the {cfg.max_donation_age_h:g} h limit for donated food.")
    if cover == "uncovered":
        reasons.append("It was uncovered, which raises contamination risk.")
    elif cover == "partial":
        reasons.append("It was only partly covered.")
    if basis == "zone" and t is not None and elapsed > cfg.cool_to_21_within_h and t > 21:
        reasons.append("Cooling is slower than the FSSAI guideline.")
    if category == "rice" and label != SAFE:
        reasons.append("Cooked rice can carry Bacillus cereus, whose toxin reheating does not destroy.")

    # ---- advice ----
    if label == UNSAFE:
        advice = "Do not eat or share this food. Discard it."
    elif label == CONSUME_SOON:
        advice = (
            "Cover it and eat it soon."
            if primary == "UNCOVERED_ESCALATION"
            else "Refrigerate it or eat it immediately."
        )
    elif basis in ZONE_BASES:
        advice = f"Eat it or refrigerate it within about {_fmt_hours(left)}."
    elif basis == "hot":
        advice = f"Keep it hot (60{DEG} or above) until it is eaten."
    else:
        advice = "Keep it cold until it is eaten."

    # ---- caveats ----
    caveats = []
    if t is None:
        caveats.append("No temperature was measured, so storage was taken as reported.")
    if storage in ("unknown", "changed"):
        caveats.append("Storage conditions were unknown or changed, so the cautious room-temperature rule was used.")
    if cover == "unknown":
        caveats.append("Covered status is unknown.")
    if any(
        abs(danger - limit) <= cfg.near_threshold_margin_h
        for limit in (cfg.use_immediately_after_h, cfg.discard_after_h)
    ):
        caveats.append("Close to a time limit, so treat it with extra caution.")

    return {
        "headline": HEADLINES[label],
        "summary": summary,
        "reasons": reasons,
        "advice": advice,
        "caveats": caveats,
        "disclaimer": DISCLAIMER,
    }


def explain_from_inputs(
    cooked_at: datetime,
    storage_condition: str = "unknown",
    is_covered: str = "unknown",
    measured_temp_c: Optional[float] = None,
    food_category: Optional[str] = None,
    checked_at: Optional[datetime] = None,
    config: RuleConfig = DEFAULT_CONFIG,
) -> Tuple[FreshnessResult, dict]:
    """Run the rule layer, then template its result. Returns (result, explanation)."""
    result = assess_freshness(
        cooked_at=cooked_at,
        storage_condition=storage_condition,
        is_covered=is_covered,
        measured_temp_c=measured_temp_c,
        food_category=food_category,
        checked_at=checked_at,
        config=config,
    )
    return result, explain_result(result, storage_condition, is_covered, measured_temp_c, food_category, config)
