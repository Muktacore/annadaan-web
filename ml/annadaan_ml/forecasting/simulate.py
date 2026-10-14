"""Seeded SIMULATED donation data (one row per day per zone).

This is synthetic. It encodes assumptions (weekend uplift, festival spikes, monsoon dip,
heat dip, upward trend, Poisson noise) so the forecasting pipeline can be tested end to end.
It says nothing about real donation behaviour.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .festivals import festival_flags

DEFAULT_ZONES = ("Vasai", "Virar", "Nalasopara")
ZONE_BASE = {"Vasai": 22.0, "Virar": 16.0, "Nalasopara": 12.0}  # mean donations/day at start


def simulate_donations(start: str = "2023-01-01", days: int = 1096, zones=DEFAULT_ZONES, seed: int = 42) -> pd.DataFrame:
    """Columns: date, zone, donations (count), meals (total quantity), rain_mm, temp_c."""
    rng = np.random.default_rng(seed)
    dates = pd.date_range(start, periods=days, freq="D")
    is_fest, _ = festival_flags(dates)
    dow = dates.dayofweek.to_numpy()
    doy = dates.dayofyear.to_numpy()
    month = dates.month.to_numpy()
    t = np.arange(days)

    temp = 28 + 6 * np.sin(2 * np.pi * (doy - 100) / 365.25) + rng.normal(0, 1.5, days)
    monsoon = np.isin(month, [6, 7, 8, 9])

    frames = []
    for zone in zones:
        base = ZONE_BASE.get(zone, 14.0)
        rain = np.where(monsoon, rng.gamma(2.0, 12.0, days), rng.gamma(0.3, 3.0, days))
        weekend = np.where(dow >= 5, 1.25, 1.0)
        festival = np.where(is_fest, 1.6, 1.0)
        trend = 1.0 + 0.35 * t / days
        rain_eff = np.exp(-0.004 * rain)  # 100 mm of rain -> about -33%
        heat_eff = np.where(temp > 34, 0.9, 1.0)
        lam = base * weekend * festival * trend * rain_eff * heat_eff
        counts = rng.poisson(lam)
        meals = np.array([rng.lognormal(3.0, 0.5, c).sum() for c in counts]).round().astype(int)
        frames.append(
            pd.DataFrame(
                {
                    "date": dates,
                    "zone": zone,
                    "donations": counts.astype(int),
                    "meals": meals,
                    "rain_mm": rain.round(1),
                    "temp_c": temp.round(1),
                }
            )
        )
    return pd.concat(frames, ignore_index=True).sort_values(["date", "zone"]).reset_index(drop=True)
