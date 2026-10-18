from datetime import datetime, timedelta, timezone

from annadaan_ml.explain_templates import DISCLAIMER, explain_from_inputs

NOW = datetime(2026, 10, 11, 12, 0, tzinfo=timezone.utc)


def ex(hours=0.0, minutes=0.0, **kw):
    cooked = NOW - timedelta(hours=hours, minutes=minutes)
    return explain_from_inputs(cooked_at=cooked, checked_at=NOW, **kw)[1]


def test_structure_is_complete_and_strings():
    e = ex(3, storage_condition="room_temp", is_covered="covered")
    assert set(e) == {"headline", "summary", "reasons", "advice", "caveats", "disclaimer"}
    assert e["disclaimer"] == DISCLAIMER
    assert all(isinstance(s, str) and s for s in [e["headline"], e["summary"], e["advice"], *e["reasons"], *e["caveats"]])


def test_headlines_follow_label():
    kw = dict(storage_condition="room_temp", is_covered="covered")
    assert ex(1, **kw)["headline"] == "Looks safe"
    assert ex(3, **kw)["headline"] == "Eat soon"
    assert ex(5, **kw)["headline"] == "Not safe"


def test_over_4h_summary_and_advice():
    e = ex(5, storage_condition="room_temp", is_covered="covered")
    assert "over the 4 h limit" in e["summary"]
    assert "Discard" in e["advice"]


def test_over_2h_advice():
    e = ex(3, storage_condition="room_temp", is_covered="covered")
    assert "past the 2 h point" in e["summary"]
    assert e["advice"] == "Refrigerate it or eat it immediately."


def test_age_limit_primary_when_cold():
    e = ex(30, storage_condition="refrigerated", is_covered="covered", measured_temp_c=3)
    assert "24 h limit" in e["summary"]
    assert e["headline"] == "Not safe"


def test_age_and_danger_both_mention_age_as_extra_reason():
    e = ex(30, storage_condition="room_temp", is_covered="covered")
    assert "over the 4 h limit" in e["summary"]
    assert any("Also past the 24 h limit" in r for r in e["reasons"])


def test_uncovered_escalation_wording():
    e = ex(1.5, storage_condition="room_temp", is_covered="uncovered")
    assert e["headline"] == "Eat soon"
    assert e["advice"] == "Cover it and eat it soon."
    assert any("uncovered" in r for r in e["reasons"])


def test_safe_in_zone_gives_time_left():
    e = ex(1, storage_condition="room_temp", is_covered="covered")
    assert e["summary"].startswith("Safe for now: about 1 h left")
    assert e["advice"] == "Eat it or refrigerate it within about 1 h."


def test_safe_hot_and_cold_advice():
    hot = ex(5, storage_condition="kept_warm", is_covered="covered", measured_temp_c=65)
    cold = ex(10, storage_condition="refrigerated", is_covered="covered", measured_temp_c=3)
    assert hot["advice"].startswith("Keep it hot")
    assert cold["advice"] == "Keep it cold until it is eaten."


def test_caveats_reflect_missing_information():
    e = ex(1, storage_condition="unknown", is_covered="unknown")
    text = " ".join(e["caveats"])
    assert "No temperature was measured" in text
    assert "unknown or changed" in text
    assert "Covered status is unknown" in text


def test_near_limit_caveat():
    e = ex(1.9, storage_condition="room_temp", is_covered="covered")
    assert any("Close to a time limit" in c for c in e["caveats"])


def test_rice_note_only_when_not_safe():
    bad = ex(5, storage_condition="room_temp", is_covered="covered", food_category="rice")
    ok = ex(1, storage_condition="room_temp", is_covered="covered", food_category="rice")
    assert any("Bacillus" in r for r in bad["reasons"])
    assert not any("Bacillus" in r for r in ok["reasons"])
