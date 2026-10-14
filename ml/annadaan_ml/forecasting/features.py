"""Feature engineering. Every lag/rolling feature is built from shift(1), i.e. strictly past data.

Weather is deliberately NOT a feature: future weather is unknown at prediction time, so
using same-day weather would leak. The monsoon effect is learned through `month`.
"""
from __future__ import annotations

import pandas as pd

from .festivals import festival_flags

CALENDAR_COLS = ["dow", "month", "is_weekend", "is_festival", "days_to_festival"]
LAG_COLS = ["lag_1", "lag_7", "lag_14", "roll_mean_7", "roll_mean_28", "roll_std_7"]


def feature_columns(zones) -> list[str]:
    return CALENDAR_COLS + LAG_COLS + [f"zone_{z}" for z in sorted(zones)]


def build_features(df: pd.DataFrame, target: str = "donations", zones=None) -> pd.DataFrame:
    """Add feature columns. Rows whose features are NaN (warm-up) are dropped.

    Rows with a NaN target are KEPT (needed for recursive forecasting of future days).
    """
    zones = sorted(zones) if zones is not None else sorted(df["zone"].unique())
    parts = []
    for zone, g in df.groupby("zone", sort=False):
        g = g.sort_values("date").copy()
        past = g[target].shift(1)
        g["dow"] = g["date"].dt.dayofweek
        g["month"] = g["date"].dt.month
        g["is_weekend"] = (g["dow"] >= 5).astype(int)
        is_fest, to_fest = festival_flags(g["date"])
        g["is_festival"] = is_fest.astype(int)
        g["days_to_festival"] = to_fest
        g["lag_1"] = past
        g["lag_7"] = g[target].shift(7)
        g["lag_14"] = g[target].shift(14)
        g["roll_mean_7"] = past.rolling(7).mean()
        g["roll_mean_28"] = past.rolling(28).mean()
        g["roll_std_7"] = past.rolling(7).std()
        for z in zones:
            g[f"zone_{z}"] = int(z == zone)
        parts.append(g)
    out = pd.concat(parts).sort_values(["date", "zone"]).reset_index(drop=True)
    return out.dropna(subset=feature_columns(zones)).reset_index(drop=True)
