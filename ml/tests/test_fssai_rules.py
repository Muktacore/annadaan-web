from datetime import datetime, timedelta, timezone

import pytest

from annadaan_ml.fssai_rules import assess_freshness

NOW = datetime(2026, 10, 11, 12, 0, tzinfo=timezone.utc)


def run(hours=0.0, minutes=0.0, **kw):
    cooked = NOW - timedelta(hours=hours, minutes=minutes)
    return assess_freshness(cooked_at=cooked, checked_at=NOW, **kw)


def test_fresh_room_temp_is_safe():
    r = run(1, storage_condition="room_temp", is_covered="covered")
    assert r.freshness_label == "safe"
    assert r.confidence_score == pytest.approx(0.8)


def test_over_2h_is_consume_soon():
    assert run(3, storage_condition="room_temp", is_covered="covered").freshness_label == "consume_soon"


def test_over_4h_is_unsafe():
    assert run(5, storage_condition="room_temp", is_covered="covered").freshness_label == "unsafe"


def test_boundaries():
    kw = dict(storage_condition="room_temp", is_covered="covered")
    assert run(2, **kw).freshness_label == "safe"
    assert run(2, minutes=1, **kw).freshness_label == "consume_soon"
    assert run(4, **kw).freshness_label == "consume_soon"
    assert run(4, minutes=1, **kw).freshness_label == "unsafe"


def test_hot_held_food_is_not_in_danger_zone():
    r = run(5, storage_condition="kept_warm", is_covered="covered", measured_temp_c=65)
    assert r.freshness_label == "safe"
    assert r.danger_zone_hours == 0


def test_kept_warm_unverified_counts_as_danger_zone():
    r = run(3, storage_condition="kept_warm", is_covered="covered")
    assert r.freshness_label == "consume_soon"
    assert r.confidence_score == pytest.approx(0.65)


def test_measured_temp_overrides_storage_claim():
    r = run(5, storage_condition="room_temp", is_covered="covered", measured_temp_c=70)
    assert r.freshness_label == "safe"


def test_refrigerated_and_cold_is_safe():
    r = run(10, storage_condition="refrigerated", is_covered="covered", measured_temp_c=3)
    assert r.freshness_label == "safe"


def test_refrigerator_that_is_not_cold_breaks_the_chain():
    r = run(3, storage_condition="refrigerated", is_covered="covered", measured_temp_c=30)
    assert r.freshness_label == "consume_soon"


def test_age_limit_applies_even_when_cold():
    r = run(30, storage_condition="refrigerated", is_covered="covered", measured_temp_c=3)
    assert r.freshness_label == "unsafe"
    assert "AGE_LIMIT" in r.rule_ids


def test_uncovered_food_escalates():
    covered = run(1.5, storage_condition="room_temp", is_covered="covered")
    uncovered = run(1.5, storage_condition="room_temp", is_covered="uncovered")
    assert covered.freshness_label == "safe"
    assert uncovered.freshness_label == "consume_soon"


def test_unknown_values_do_not_crash_and_lower_confidence():
    known = run(3, storage_condition="room_temp", is_covered="covered")
    odd = run(3, storage_condition="fridge??", is_covered="maybe")
    assert odd.freshness_label == "consume_soon"
    assert odd.confidence_score < known.confidence_score


def test_near_threshold_lowers_confidence():
    far = run(1, storage_condition="room_temp", is_covered="covered")
    near = run(1.9, storage_condition="room_temp", is_covered="covered")
    assert near.confidence_score < far.confidence_score


def test_future_cooked_time_is_rejected():
    with pytest.raises(ValueError):
        assess_freshness(cooked_at=NOW + timedelta(hours=2), checked_at=NOW)


def test_naive_datetimes_are_treated_as_utc():
    naive_cooked = datetime(2026, 10, 11, 9, 0)
    r = assess_freshness(
        cooked_at=naive_cooked,
        checked_at=NOW,
        storage_condition="room_temp",
        is_covered="covered",
    )
    assert r.time_elapsed_at_check == 3.0
    assert r.freshness_label == "consume_soon"


def test_to_dict_matches_firestore_schema():
    d = run(3, storage_condition="room_temp", is_covered="covered").to_dict()
    assert set(d) == {
        "freshnessLabel",
        "freshnessSource",
        "confidenceScore",
        "explanation",
        "timeElapsedAtCheck",
    }
    assert d["freshnessSource"] == "rule_based"
    assert 0 <= d["confidenceScore"] <= 1
    assert d["timeElapsedAtCheck"] == 3.0
    assert d["explanation"] and all(isinstance(s, str) for s in d["explanation"])


def test_rice_gets_a_bacillus_note_when_not_safe():
    r = run(5, storage_condition="room_temp", is_covered="covered", food_category="rice")
    assert any("Bacillus" in line for line in r.explanation)
