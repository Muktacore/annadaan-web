# AnnaDaan ML

Everything machine-learning lives here, next to the app so the schema stays in sync.

## Layout

- `annadaan_ml/` Python package. `fssai_rules.py` is the rule-based safety layer (Step 8).
- `tests/` pytest tests.
- Later: `notebooks/` (Colab/Kaggle exports), `data/` and `models/` (both gitignored, never commit images or weights).

## Setup (PowerShell)

    cd ml
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python -m pytest -q

If activation is blocked: `Set-ExecutionPolicy -Scope Process Bypass`, then activate again.

## Demo

    python -m annadaan_ml.cli --cooked-hours-ago 3 --storage room_temp --covered covered --category rice
    python -m annadaan_ml.cli --cooked-hours-ago 5 --storage kept_warm --temp 65

## Contract (matches the locked Firestore schema)

Input: cooked_at, storage_condition (room_temp | refrigerated | kept_warm | changed | unknown),
is_covered (covered | uncovered | partial | unknown), optional measured_temp_c, optional food_category.

Output (`result.to_dict()`): freshnessLabel (safe | consume_soon | unsafe), freshnessSource ("rule_based"),
confidenceScore (0-1), explanation (list of strings), timeElapsedAtCheck (hours).
`result.rule_ids` and `result.danger_zone_hours` are extra fields for the explanation-templating layer (Step 15a).

## Where the numbers come from

| Rule | Source |
| --- | --- |
| Danger zone 5-60 C | Project spec (FSSAI) |
| More than 2 h in the zone: refrigerate or eat immediately (consume_soon) | Project spec (FSSAI) |
| More than 4 h cumulative: discard (unsafe) | Project spec (FSSAI) |
| Cool 63 C to 21 C in 2 h, then to 5 C in the next 4 h | Project spec (FSSAI), reported in explanations only |
| 24 h maximum age of donated cooked food | Project assumption |
| 1 h assumed in the zone before refrigeration (when not measured) | Project assumption |
| Uncovered food becomes consume_soon after 1 h in the zone | Project assumption |

All assumptions are fields of `RuleConfig`. Confirm or replace them with your guide or the FSSAI document before the final report.

## Limitations (for the write-up)

- `confidenceScore` is how certain the rules are given the inputs (it drops when inputs are unverified or close to a limit). It is not a calibrated probability.
- Time in the danger zone is inferred from the reported storage condition unless a temperature is measured.
- The rules ignore ingredients beyond the three categories, and can only be as accurate as the cooked time the donor enters.
