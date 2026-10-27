"""Tests for the request urgency heuristic (Step 17)."""
from datetime import datetime, timedelta, timezone

import pytest

from annadaan_ml.urgency import (
    DEFAULT_URGENCY,
    time_left_hours,
    urgency_for_request,
    urgency_score,
)

NOW = datetime(2026, 10, 28, 12, 0, tzinfo=timezone.utc)


def cooked(hours_ago):
    return NOW - timedelta(hours=hours_ago)


def test_all_signals_maxed_gives_100():
    r = urgency_score(time_left_h=0, distance_km=0, people_to_feed=10)
    assert r.score == 100 and r.band == "high"


def test_all_signals_minimal_gives_0():
    r = urgency_score(time_left_h=2, distance_km=10, people_to_feed=1)
    assert r.score == 0 and r.band == "standard"


def test_no_information_is_zero_with_message():
    r = urgency_score()
    assert r.score == 0 and r.reasons == ["Not enough information to rank this request."]


def test_missing_signals_are_renormalised_not_penalised():
    assert urgency_score(people_to_feed=10).score == 100
    assert urgency_score(distance_km=0).score == 100
    assert urgency_score(time_left_h=0).score == 100


def test_more_people_never_lowers_score():
    scores = [urgency_score(1.0, 3.0, p).score for p in range(1, 12)]
    assert scores == sorted(scores)
    assert scores[-1] > scores[0]


def test_closer_never_lowers_score():
    scores = [urgency_score(1.0, km, 4).score for km in (12, 8, 4, 1, 0)]
    assert scores == sorted(scores)


def test_less_time_left_never_lowers_score():
    scores = [urgency_score(h, 3.0, 4).score for h in (2.5, 2, 1, 0.5, 0)]
    assert scores == sorted(scores)


def test_needier_request_ranks_above_less_needy_one_for_the_same_donation():
    same_food_time = 1.2
    needy = urgency_score(same_food_time, 3.0, 6)
    other = urgency_score(same_food_time, 0.5, 1)
    assert needy.score > other.score


def test_people_are_capped_and_floored():
    assert urgency_score(people_to_feed=500).score == urgency_score(people_to_feed=10).score
    assert urgency_score(people_to_feed=0).score == urgency_score(people_to_feed=1).score
    assert urgency_score(people_to_feed=-3).score == urgency_score(people_to_feed=1).score


def test_bad_numbers_are_ignored():
    r = urgency_score(time_left_h=float("nan"), distance_km=None, people_to_feed="abc")
    assert r.score == 0 and r.reasons[0].startswith("Not enough")


def test_bands():
    assert urgency_score(0, 0, 10).band == "high"
    assert urgency_score(1.0, 5.0, 5).band == "medium"
    assert urgency_score(2.0, 9.0, 1).band == "standard"


def test_reasons_are_plain_language():
    r = urgency_score(0.5, 1.24, 6)
    assert r.reasons == [
        "Feeding 6 people.",
        "About 30 min left before it should be eaten or refrigerated.",
        "1.2 km away.",
    ]


def test_time_left_hours_rules():
    assert time_left_hours("consume_soon", 0.5) == 0
    assert time_left_hours("unsafe", 0.0) == 0
    assert time_left_hours("safe", 0.5) == 1.5
    assert time_left_hours("safe", 5.0) == 0


def test_to_dict_has_firestore_field_names():
    d = urgency_score(1, 2, 3).to_dict()
    assert set(d) == {"urgencyScore", "urgencyBand", "urgencyReasons"}
    assert isinstance(d["urgencyScore"], int)


def test_pipeline_fresh_room_temp_vs_old_room_temp():
    fresh = urgency_for_request(cooked(0.2), "room_temp", "covered", None, "rice", 2.0, 3, NOW)
    older = urgency_for_request(cooked(1.8), "room_temp", "covered", None, "rice", 2.0, 3, NOW)
    assert older.score > fresh.score


def test_pipeline_held_hot_food_is_not_time_pressured():
    hot = urgency_for_request(cooked(1.8), "kept_warm", "covered", 70.0, "rice", 2.0, 3, NOW)
    assert hot.reasons[1] == "Plenty of time left on the freshness clock."


def test_pipeline_future_cooked_time_drops_the_time_signal():
    r = urgency_for_request(cooked(-3), "room_temp", "covered", None, "rice", 2.0, 3, NOW)
    assert len(r.reasons) == 2  # people + distance only


def test_weights_are_documented_assumptions():
    c = DEFAULT_URGENCY
    assert (c.weight_need, c.weight_time, c.weight_distance) == (40.0, 35.0, 25.0)
