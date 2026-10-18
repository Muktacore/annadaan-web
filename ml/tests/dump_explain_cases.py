"""Writes tests/fixtures/explain_cases.json: inputs plus the Python explanation for each case.
The JS port is checked against this file by tests/check_js_parity.mjs.
Run from the ml folder:  python tests\\dump_explain_cases.py
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from annadaan_ml.explain_templates import explain_from_inputs  # noqa: E402

NOW = datetime(2026, 10, 11, 12, 0, tzinfo=timezone.utc)

CASES = [
    ("fresh room covered", 1, "room_temp", "covered", None, None),
    ("over 2h room covered", 3, "room_temp", "covered", None, None),
    ("over 4h room covered", 5, "room_temp", "covered", None, None),
    ("hot held 65C", 5, "kept_warm", "covered", 65, None),
    ("cold 3C for 10h", 10, "refrigerated", "covered", 3, None),
    ("fridge not measured", 10, "refrigerated", "covered", None, None),
    ("uncovered 1.5h", 1.5, "room_temp", "uncovered", None, None),
    ("kept warm unverified", 3, "kept_warm", "covered", None, None),
    ("age limit when cold", 30, "refrigerated", "covered", 3, None),
    ("age limit and danger", 30, "room_temp", "covered", None, None),
    ("rice over 4h", 5, "room_temp", "covered", None, "rice"),
    ("unknown storage and cover", 3, "unknown", "unknown", None, None),
    ("near 2h limit", 1.9, "room_temp", "covered", None, None),
    ("partly covered", 1, "room_temp", "partial", None, None),
    ("measured 30C slow cooling", 3, "room_temp", "covered", 30, None),
    ("fridge not cold 30C", 3, "refrigerated", "covered", 30, None),
]

out = {"checked_at": NOW.isoformat(), "cases": []}
for name, hours, storage, cover, temp, cat in CASES:
    cooked = NOW - timedelta(hours=hours)
    result, e = explain_from_inputs(
        cooked_at=cooked, storage_condition=storage, is_covered=cover,
        measured_temp_c=temp, food_category=cat, checked_at=NOW,
    )
    out["cases"].append({
        "name": name, "hours_ago": hours, "storage_condition": storage, "is_covered": cover,
        "measured_temp_c": temp, "food_category": cat,
        "label": result.freshness_label, "expected": e,
    })

path = Path(__file__).resolve().parent / "fixtures" / "explain_cases.json"
path.parent.mkdir(exist_ok=True)
path.write_text(json.dumps(out, indent=2, ensure_ascii=True), encoding="utf-8")
print(f"wrote {len(out['cases'])} cases to {path}")
