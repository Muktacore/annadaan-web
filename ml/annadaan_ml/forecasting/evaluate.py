"""Chronological split, metrics and naive baselines."""
from __future__ import annotations

import numpy as np
import pandas as pd


def mae(y, p) -> float:
    return float(np.mean(np.abs(np.asarray(y, float) - np.asarray(p, float))))


def rmse(y, p) -> float:
    return float(np.sqrt(np.mean((np.asarray(y, float) - np.asarray(p, float)) ** 2)))


def smape(y, p) -> float:
    y = np.asarray(y, float)
    p = np.asarray(p, float)
    denom = np.abs(y) + np.abs(p)
    ratio = np.where(denom == 0, 0.0, 2 * np.abs(y - p) / np.where(denom == 0, 1, denom))
    return float(100 * np.mean(ratio))


def all_metrics(y, p) -> dict:
    return {"mae": round(mae(y, p), 3), "rmse": round(rmse(y, p), 3), "smape": round(smape(y, p), 2)}


def chronological_split(feat: pd.DataFrame, train_frac: float = 0.70, val_frac: float = 0.15):
    """Split by DATE (never shuffled): train < val < test, no overlap."""
    dates = np.sort(feat["date"].unique())
    n = len(dates)
    i_val = int(n * train_frac)
    i_test = int(n * (train_frac + val_frac))
    train = feat[feat["date"].isin(dates[:i_val])]
    val = feat[feat["date"].isin(dates[i_val:i_test])]
    test = feat[feat["date"].isin(dates[i_test:])]
    return train, val, test


def baseline_predictions(df: pd.DataFrame) -> dict:
    """Naive baselines any model must beat: yesterday, and same weekday last week."""
    return {"naive_yesterday": df["lag_1"].to_numpy(), "naive_last_week": df["lag_7"].to_numpy()}
