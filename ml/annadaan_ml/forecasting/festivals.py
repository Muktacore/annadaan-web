"""Approximate festival calendar (Mumbai / Vasai-Virar region), used by the simulator and features.

Dates are approximate (lunar calendars shift); good enough for a simulation and for a
calendar feature. Replace with a verified list before using real data.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

FESTIVAL_DATES = pd.to_datetime(
    [
        # Holi
        "2023-03-08", "2024-03-25", "2025-03-14", "2026-03-04",
        # Eid al-Fitr
        "2023-04-22", "2024-04-11", "2025-03-31", "2026-03-20",
        # Ganesh Chaturthi
        "2023-09-19", "2024-09-07", "2025-08-27", "2026-09-14",
        # Dussehra
        "2023-10-24", "2024-10-12", "2025-10-02", "2026-10-20",
        # Diwali
        "2023-11-12", "2024-11-01", "2025-10-21", "2026-11-08",
    ]
)

_EPOCH = pd.Timestamp("1970-01-01")
_FEST_DAYS = np.array(sorted((FESTIVAL_DATES - _EPOCH).days), dtype=np.int64)


def festival_flags(dates, window: int = 1, cap: int = 14):
    """Return (is_festival, days_to_festival) arrays for the given dates.

    is_festival is True within +/- `window` days of a festival date.
    days_to_festival = days until the next festival (0 on the day), capped at `cap`.
    Both depend only on the calendar, so they are known in advance (no leakage).
    """
    d = np.asarray((pd.DatetimeIndex(dates) - _EPOCH).days, dtype=np.int64)
    diffs = _FEST_DAYS[None, :] - d[:, None]
    is_fest = (np.abs(diffs) <= window).any(axis=1)
    ahead = np.where(diffs >= 0, diffs, 10**6).min(axis=1)
    return is_fest, np.minimum(ahead, cap)
