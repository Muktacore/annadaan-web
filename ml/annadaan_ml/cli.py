"""Quick demo: python -m annadaan_ml.cli --cooked-hours-ago 3 --storage room_temp --covered covered"""
import argparse
import json
import sys
from datetime import datetime, timedelta, timezone

from annadaan_ml.fssai_rules import assess_freshness


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="AnnaDaan rule-based freshness check")
    p.add_argument("--cooked-hours-ago", type=float, required=True)
    p.add_argument("--storage", default="unknown",
                   help="room_temp | refrigerated | kept_warm | changed | unknown")
    p.add_argument("--covered", default="unknown",
                   help="covered | uncovered | partial | unknown")
    p.add_argument("--temp", type=float, default=None, help="measured temperature in C")
    p.add_argument("--category", default=None, help="rice | dal_gravy | roti_bread")
    a = p.parse_args(argv)

    now = datetime.now(timezone.utc)
    result = assess_freshness(
        cooked_at=now - timedelta(hours=a.cooked_hours_ago),
        storage_condition=a.storage,
        is_covered=a.covered,
        measured_temp_c=a.temp,
        food_category=a.category,
        checked_at=now,
    )
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(result.to_dict(), indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
