"""Write ml/tests/fixtures/urgency_cases.json for the JS parity check.

Run from the ml folder:  python tests\\dump_urgency_cases.py
Then from the repo root: node ml\\tests\\check_urgency_parity.mjs
"""
import itertools
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from annadaan_ml.urgency import urgency_for_request, urgency_score

NOW = datetime(2026, 10, 28, 12, 0, tzinfo=timezone.utc)
cases = []

times = [None, 0, 0.25, 1, 1.5, 2, 3]
dists = [None, 0, 0.05, 0.25, 0.15, 2.5, 9.99, 10, 25]
people = [None, 1, 2, 5, 9, 10, 15, 0, -2, 3.7]
for t, d, p in itertools.product(times, dists, people):
    r = urgency_score(t, d, p).to_dict()
    cases.append({"kind": "score", "input": {"timeLeftH": t, "distanceKm": d, "peopleToFeed": p}, "expected": r})

for ago, storage, cover, temp, dist, ppl in itertools.product(
    [0.2, 1, 1.9, 2.1, 3.5, 5, 30, -3],
    ["room_temp", "refrigerated", "kept_warm", "unknown"],
    ["covered", "uncovered"],
    [None, 3, 40, 70],
    [None, 1.2],
    [1, 4],
):
    cooked = NOW - timedelta(hours=ago)
    r = urgency_for_request(cooked, storage, cover, temp, "rice", dist, ppl, NOW).to_dict()
    cases.append({
        "kind": "pipeline",
        "input": {
            "cookedAt": cooked.isoformat(), "checkedAt": NOW.isoformat(),
            "storageCondition": storage, "isCovered": cover, "measuredTempC": temp,
            "foodCategory": "rice", "distanceKm": dist, "peopleToFeed": ppl,
        },
        "expected": r,
    })

out = Path(__file__).parent / "fixtures" / "urgency_cases.json"
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(cases, indent=1), encoding="utf-8")
print(f"wrote {len(cases)} cases to {out}")
