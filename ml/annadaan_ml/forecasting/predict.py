"""Multi-day forecasting by recursion: predict day t+1, feed it back as history, repeat."""
from __future__ import annotations

import numpy as np
import pandas as pd

from .features import build_features, feature_columns


def recursive_forecast(model, history: pd.DataFrame, horizon: int = 7, target: str = "donations") -> pd.DataFrame:
    """Forecast `horizon` days after the last date in `history` for every zone.

    Returns DataFrame[date, zone, donations_pred]. Errors compound with horizon, so
    day-7 numbers are less reliable than day-1 numbers.
    """
    zones = sorted(history["zone"].unique())
    cols = feature_columns(zones)
    last = history["date"].max()
    work = history.loc[history["date"] > last - pd.Timedelta(days=60), ["date", "zone", target]].copy()
    out = []
    for step in range(1, horizon + 1):
        d = last + pd.Timedelta(days=step)
        new = pd.DataFrame({"date": [d] * len(zones), "zone": zones, target: np.nan})
        feats = build_features(pd.concat([work, new], ignore_index=True), target, zones)
        row = feats[feats["date"] == d].sort_values("zone")
        pred = np.clip(model.predict(row[cols]), 0, None)
        filled = pd.DataFrame({"date": [d] * len(zones), "zone": row["zone"].to_numpy(), target: pred})
        work = pd.concat([work, filled], ignore_index=True)
        out.append(filled.rename(columns={target: f"{target}_pred"}))
    return pd.concat(out, ignore_index=True)
