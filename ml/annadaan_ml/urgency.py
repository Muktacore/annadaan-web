"""Request urgency / priority scoring (Step 17).

A transparent, hand-weighted heuristic. It is NOT a learned model and the
weights below are project assumptions (confirm them with the project guide).

It ranks competing requests for food so that the donor can see who is most in
need first. Three signals, each scaled to 0-1:

    need      how many people the request will feed (self-reported by the
              recipient, capped at max_people, NOT verified)
    time      how little time is left before the food must be eaten or
              refrigerated (from the FSSAI rule layer, 2 h danger-zone limit)
    distance  how close the recipient is (closer = pickup can happen sooner)

score = 100 * sum(weight * signal) / sum(weight of the signals that are known)

A missing signal is left out and the remaining weights are renormalised, so
unknown data never lowers a score. Quantity is deliberately not a signal: it is
a property of the donation, so it cannot tell two requests for the same
donation apart.

Keep identical to src/lib/urgency.js (parity-tested).
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

from .fssai_rules import CONSUME_SOON, DEFAULT_CONFIG, UNSAFE, assess_freshness


@dataclass(frozen=True)
class UrgencyConfig:
    # Project assumptions (weights must sum to 100 in spirit; they are renormalised anyway)
    weight_need: float = 40.0
    weight_time: float = 35.0
    weight_distance: float = 25.0
    max_people: int = 10
    far_km: float = 10.0  # at or beyond this distance the distance signal is 0
    high_from: int = 67
    medium_from: int = 34


DEFAULT_URGENCY = UrgencyConfig()


@dataclass
class UrgencyResult:
    score: int
    band: str  # "high" | "medium" | "standard"
    reasons: List[str]

    def to_dict(self) -> dict:
        return {
            "urgencyScore": self.score,
            "urgencyBand": self.band,
            "urgencyReasons": list(self.reasons),
        }


def _half_up(x: float) -> int:
    return int(math.floor(x + 0.5))


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def _fmt_hours(hours: float) -> str:
    mins = max(0, _half_up(hours * 60))
    h, m = divmod(mins, 60)
    if h == 0:
        return f"{m} min"
    if m == 0:
        return f"{h} h"
    return f"{h} h {m} min"


def _num(x) -> Optional[float]:
    if x is None:
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return v if math.isfinite(v) else None


def time_left_hours(freshness_label: str, danger_zone_hours: float, rules=DEFAULT_CONFIG) -> float:
    """Hours left before the food must be eaten or refrigerated (0 once it must be eaten soon)."""
    if freshness_label in (CONSUME_SOON, UNSAFE):
        return 0.0
    return max(0.0, rules.use_immediately_after_h - danger_zone_hours)


def urgency_score(
    time_left_h: Optional[float] = None,
    distance_km: Optional[float] = None,
    people_to_feed: Optional[float] = None,
    config: UrgencyConfig = DEFAULT_URGENCY,
    rules=DEFAULT_CONFIG,
) -> UrgencyResult:
    cfg = config
    limit_h = rules.use_immediately_after_h

    parts = []  # (weight, signal 0-1)
    reasons: List[str] = []

    people = _num(people_to_feed)
    if people is not None:
        p = int(min(max(math.trunc(people), 1), cfg.max_people))
        parts.append((cfg.weight_need, (p - 1) / (cfg.max_people - 1)))
        if p >= cfg.max_people:
            reasons.append(f"Feeding {cfg.max_people} or more people.")
        elif p == 1:
            reasons.append("Feeding 1 person.")
        else:
            reasons.append(f"Feeding {p} people.")

    left = _num(time_left_h)
    if left is not None:
        left = max(0.0, left)
        parts.append((cfg.weight_time, 1.0 - _clamp01(left / limit_h)))
        if left <= 0:
            reasons.append(f"Past the {limit_h:g} h danger-zone limit: needs eating soon.")
        elif left <= 1:
            reasons.append(f"About {_fmt_hours(left)} left before it should be eaten or refrigerated.")
        else:
            reasons.append("Plenty of time left on the freshness clock.")

    km = _num(distance_km)
    if km is not None:
        km = max(0.0, km)
        parts.append((cfg.weight_distance, 1.0 - _clamp01(km / cfg.far_km)))
        shown = _half_up(km * 10) / 10
        reasons.append(f"{shown:.1f} km away.")

    if not parts:
        return UrgencyResult(0, "standard", ["Not enough information to rank this request."])

    total_w = sum(w for w, _ in parts)
    score = _half_up(100 * sum(w * s for w, s in parts) / total_w)
    band = "high" if score >= cfg.high_from else "medium" if score >= cfg.medium_from else "standard"
    return UrgencyResult(score, band, reasons)


def urgency_for_request(
    cooked_at: datetime,
    storage_condition: str = "unknown",
    is_covered: str = "unknown",
    measured_temp_c: Optional[float] = None,
    food_category: Optional[str] = None,
    distance_km: Optional[float] = None,
    people_to_feed: Optional[float] = None,
    checked_at: Optional[datetime] = None,
    config: UrgencyConfig = DEFAULT_URGENCY,
    rules=DEFAULT_CONFIG,
) -> UrgencyResult:
    """Full pipeline: run the FSSAI rule layer on the donation, then score the request."""
    try:
        fr = assess_freshness(
            cooked_at, storage_condition, is_covered, measured_temp_c, food_category,
            checked_at=checked_at, config=rules,
        )
        left: Optional[float] = time_left_hours(fr.freshness_label, fr.danger_zone_hours, rules)
    except ValueError:
        left = None  # unreadable donation data: leave the time signal out
    return urgency_score(left, distance_km, people_to_feed, config, rules)
