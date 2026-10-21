"""Rule-based food safety layer (Step 8).

Standalone: no CNN, no network, no third-party packages. It turns cooked time,
storage condition, covered status and an optional measured temperature into the
locked Firestore freshness fields:

    freshnessLabel      "safe" | "consume_soon" | "unsafe"
    freshnessSource     "rule_based"
    confidenceScore     0-1 (rule certainty, NOT a calibrated probability)
    explanation         list of human-readable strings
    timeElapsedAtCheck  hours since cooked

Rules from the project spec (FSSAI-based): danger zone is 5-60 C; more than 2 h
in the zone means refrigerate or use immediately; more than 4 h cumulative
means discard; cooked food should cool from about 63 C to 21 C within 2 h, then
to 5 C within the next 4 h.

Project assumptions (not FSSAI figures, change them in RuleConfig if your
guide or professor says otherwise): max donation age, assumed time before
chilling for refrigerated food, and the uncovered-food escalation.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional

SAFE = "safe"
CONSUME_SOON = "consume_soon"
UNSAFE = "unsafe"
SOURCE = "rule_based"

STORAGE_VALUES = ("room_temp", "refrigerated", "kept_warm", "changed", "unknown")
COVERED_VALUES = ("covered", "uncovered", "partial", "unknown")

FUTURE_TOLERANCE_H = 5 / 60  # clock drift allowed before cooked_at counts as "in the future"


@dataclass(frozen=True)
class RuleConfig:
    # From the project spec (FSSAI)
    danger_low_c: float = 5.0
    danger_high_c: float = 60.0
    use_immediately_after_h: float = 2.0
    discard_after_h: float = 4.0
    cool_to_21_within_h: float = 2.0
    cool_to_5_within_h: float = 6.0  # 2 h + the next 4 h
    # Project assumptions
    max_donation_age_h: float = 24.0
    assumed_pre_refrigeration_h: float = 1.0
    uncovered_escalation_h: float = 1.0
    near_threshold_margin_h: float = 0.25


DEFAULT_CONFIG = RuleConfig()


@dataclass
class FreshnessResult:
    freshness_label: str
    confidence_score: float
    explanation: List[str]
    time_elapsed_at_check: float
    danger_zone_hours: float
    rule_ids: List[str]
    freshness_source: str = SOURCE

    def to_dict(self) -> dict:
        """Exactly the fields of the locked Firestore schema."""
        return {
            "freshnessLabel": self.freshness_label,
            "freshnessSource": self.freshness_source,
            "confidenceScore": self.confidence_score,
            "explanation": list(self.explanation),
            "timeElapsedAtCheck": self.time_elapsed_at_check,
        }


def _aware(dt: datetime) -> datetime:
    """Naive datetimes are treated as UTC."""
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _norm(value: Optional[str], allowed: tuple) -> str:
    v = (value or "").strip().lower()
    return v if v in allowed else "unknown"


def _fmt_hours(hours: float) -> str:
    mins = max(0, round(hours * 60))
    h, m = divmod(mins, 60)
    if h == 0:
        return f"{m} min"
    if m == 0:
        return f"{h} h"
    return f"{h} h {m} min"


def _danger_hours(elapsed: float, storage: str, temp: Optional[float], cfg: RuleConfig):
    """Return (hours counted in the danger zone, basis)."""
    if temp is not None:
        if temp >= cfg.danger_high_c:
            return 0.0, "hot"
        if temp <= cfg.danger_low_c:
            return min(elapsed, cfg.assumed_pre_refrigeration_h), "cold"
        return elapsed, "zone"
    if storage == "refrigerated":
        return min(elapsed, cfg.assumed_pre_refrigeration_h), "cold_unmeasured"
    if storage == "kept_warm":
        return elapsed, "warm_unverified"
    return elapsed, "zone_assumed"


def assess_freshness(
    cooked_at: datetime,
    storage_condition: str = "unknown",
    is_covered: str = "unknown",
    measured_temp_c: Optional[float] = None,
    food_category: Optional[str] = None,
    checked_at: Optional[datetime] = None,
    config: RuleConfig = DEFAULT_CONFIG,
) -> FreshnessResult:
    cfg = config
    checked = _aware(checked_at) if checked_at is not None else datetime.now(timezone.utc)
    cooked = _aware(cooked_at)

    elapsed = (checked - cooked).total_seconds() / 3600
    if elapsed < -FUTURE_TOLERANCE_H:
        raise ValueError("cooked_at is in the future")
    elapsed = max(0.0, elapsed)

    if measured_temp_c is not None and not (-40 <= measured_temp_c <= 200):
        raise ValueError("measured_temp_c must be between -40 and 200")

    storage = _norm(storage_condition, STORAGE_VALUES)
    cover = _norm(is_covered, COVERED_VALUES)
    category = (food_category or "").strip().lower()

    danger, basis = _danger_hours(elapsed, storage, measured_temp_c, cfg)

    # ---- label -------------------------------------------------------
    rule_ids: List[str] = []
    label = SAFE
    if danger > cfg.discard_after_h:
        label = UNSAFE
        rule_ids.append("DANGER_ZONE_OVER_4H")
    elif danger > cfg.use_immediately_after_h:
        label = CONSUME_SOON
        rule_ids.append("DANGER_ZONE_OVER_2H")
    if elapsed > cfg.max_donation_age_h:
        label = UNSAFE
        rule_ids.append("AGE_LIMIT")
    if label == SAFE and cover == "uncovered" and danger > cfg.uncovered_escalation_h:
        label = CONSUME_SOON
        rule_ids.append("UNCOVERED_ESCALATION")
    if not rule_ids:
        rule_ids.append("WITHIN_LIMITS")

    # ---- explanation -------------------------------------------------
    t = measured_temp_c
    lines: List[str] = [f"Cooked {_fmt_hours(elapsed)} ago."]

    if basis == "hot":
        lines.append(f"Measured {t:.0f} °C: held at or above 60 °C, outside the 5-60 °C danger zone.")
    elif basis == "cold":
        lines.append(
            f"Measured {t:.0f} °C: kept at or below 5 °C. The time before chilling is unknown, "
            f"so about {_fmt_hours(danger)} in the danger zone is assumed."
        )
    elif basis == "zone":
        lines.append(f"Measured {t:.0f} °C: inside the 5-60 °C danger zone for about {_fmt_hours(danger)}.")
    elif basis == "cold_unmeasured":
        lines.append(
            f"Refrigerated (temperature not measured): about {_fmt_hours(danger)} in the danger zone "
            "is assumed before chilling."
        )
    elif basis == "warm_unverified":
        lines.append(
            "Kept warm, but a temperature of 60 °C or above could not be verified, "
            f"so it counts as {_fmt_hours(danger)} in the 5-60 °C danger zone."
        )
    else:
        lines.append(
            f"Stored at room temperature or unknown conditions: counts as {_fmt_hours(danger)} "
            "in the 5-60 °C danger zone."
        )

    if "AGE_LIMIT" in rule_ids:
        lines.append(f"Older than the {cfg.max_donation_age_h:g} h limit for donated cooked food: discard it.")
    if "DANGER_ZONE_OVER_4H" in rule_ids:
        lines.append(f"More than {cfg.discard_after_h:g} h in the danger zone: discard it.")
    if "DANGER_ZONE_OVER_2H" in rule_ids:
        lines.append(
            f"More than {cfg.use_immediately_after_h:g} h in the danger zone: refrigerate it or eat it immediately."
        )
    if "UNCOVERED_ESCALATION" in rule_ids:
        lines.append("Uncovered food is exposed to contamination: eat it soon.")
    if "WITHIN_LIMITS" in rule_ids:
        if basis in ("zone", "zone_assumed", "warm_unverified"):
            left = cfg.use_immediately_after_h - danger
            lines.append(f"Within limits: about {_fmt_hours(left)} left before it should be eaten or refrigerated.")
        else:
            lines.append("Within limits: no danger-zone limit reached.")

    if t is not None and basis == "zone":
        if elapsed > cfg.cool_to_21_within_h and t > 21:
            lines.append("Cooling is slower than the FSSAI guideline (about 63 °C to 21 °C within 2 h).")
        if elapsed > cfg.cool_to_5_within_h and t > cfg.danger_low_c:
            lines.append("Cooling is slower than the FSSAI guideline (down to 5 °C within the next 4 h).")

    if cover == "uncovered":
        lines.append("The food was uncovered.")
    elif cover == "partial":
        lines.append("The food was only partly covered.")
    elif cover == "unknown":
        lines.append("Covered status is unknown.")

    if storage in ("changed", "unknown"):
        lines.append("Storage conditions were unknown or changed, so the conservative room-temperature rule was used.")
    if t is None:
        lines.append("No temperature reading: storage was taken as reported.")

    if category == "rice" and label != SAFE:
        lines.append("Cooked rice can carry Bacillus cereus, and its toxin is not destroyed by reheating.")

    # ---- confidence (rule certainty, not a calibrated probability) ----
    conf = 0.9
    if t is None:
        conf -= 0.1
    if storage in ("unknown", "changed"):
        conf -= 0.2
    if storage == "kept_warm" and t is None:
        conf -= 0.15
    if cover == "unknown":
        conf -= 0.05
    elif cover == "partial":
        conf -= 0.03
    near = any(
        abs(danger - limit) <= cfg.near_threshold_margin_h
        for limit in (cfg.use_immediately_after_h, cfg.discard_after_h)
    )
    if near:
        conf -= 0.1
        lines.append("Close to a time limit: treat with extra caution.")
    conf = round(max(0.3, min(0.95, conf)), 2)

    return FreshnessResult(
        freshness_label=label,
        confidence_score=conf,
        explanation=lines,
        time_elapsed_at_check=round(elapsed, 2),
        danger_zone_hours=round(danger, 2),
        rule_ids=rule_ids,
    )
