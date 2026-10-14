"""Model factories: RandomForest, XGBoost, and an OPTIONAL PyTorch LSTM (torch imported lazily)."""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from .festivals import festival_flags


def make_random_forest(seed: int = 42) -> RandomForestRegressor:
    return RandomForestRegressor(n_estimators=300, min_samples_leaf=3, n_jobs=-1, random_state=seed)


def make_xgboost(seed: int = 42):
    try:
        from xgboost import XGBRegressor
    except ImportError as exc:  # pragma: no cover
        raise ImportError("xgboost is not installed: pip install xgboost") from exc
    return XGBRegressor(
        n_estimators=400, learning_rate=0.05, max_depth=4, subsample=0.9,
        colsample_bytree=0.9, random_state=seed, n_jobs=1,
    )


def torch_available() -> bool:
    try:
        import torch  # noqa: F401
        return True
    except ImportError:
        return False


def fit_predict_lstm(df, train_end, eval_start, eval_end, window: int = 14, epochs: int = 60, seed: int = 42):
    """Train a small LSTM on dates <= train_end, then predict one day ahead for
    eval_start..eval_end using REAL past values (same protocol as RF/XGBoost).

    df: raw simulated frame (date, zone, donations). Returns DataFrame[date, zone, lstm_pred].
    Needs PyTorch; raises ImportError with a clear message otherwise.
    """
    try:
        import torch
        from torch import nn
    except ImportError as exc:
        raise ImportError("PyTorch is not installed, LSTM skipped (pip install torch)") from exc

    torch.manual_seed(seed)
    np.random.seed(seed)
    train_end, eval_start, eval_end = map(pd.Timestamp, (train_end, eval_start, eval_end))

    train_vals = df.loc[df["date"] <= train_end, "donations"].to_numpy(float)
    mu, sd = float(train_vals.mean()), float(train_vals.std() or 1.0)

    def zone_arrays(g):
        g = g.sort_values("date")
        is_fest, to_fest = festival_flags(g["date"])
        dow = g["date"].dt.dayofweek.to_numpy()
        cal = np.stack(
            [is_fest.astype(float), np.sin(2 * np.pi * dow / 7), np.cos(2 * np.pi * dow / 7), to_fest / 14.0], axis=1
        )
        y = (g["donations"].to_numpy(float) - mu) / sd
        steps = np.concatenate([y[:, None], cal], axis=1)  # (n, 5)
        return g["date"].to_numpy(), y, cal, steps

    def windows(dates, y, cal, steps, lo, hi):
        xs, cs, ys, ds = [], [], [], []
        for t in range(window, len(y)):
            if lo <= pd.Timestamp(dates[t]) <= hi:
                xs.append(steps[t - window:t])
                cs.append(cal[t])
                ys.append(y[t])
                ds.append(dates[t])
        return xs, cs, ys, ds

    per_zone = {z: zone_arrays(g) for z, g in df.groupby("zone")}
    Xtr, Ctr, Ytr = [], [], []
    for z, (dates, y, cal, steps) in per_zone.items():
        xs, cs, ys, _ = windows(dates, y, cal, steps, pd.Timestamp.min, train_end)
        Xtr += xs; Ctr += cs; Ytr += ys
    Xtr = torch.tensor(np.array(Xtr), dtype=torch.float32)
    Ctr = torch.tensor(np.array(Ctr), dtype=torch.float32)
    Ytr = torch.tensor(np.array(Ytr), dtype=torch.float32)

    class Net(nn.Module):
        def __init__(self, in_dim=5, cal_dim=4, hidden=32):
            super().__init__()
            self.lstm = nn.LSTM(in_dim, hidden, batch_first=True)
            self.head = nn.Sequential(nn.Linear(hidden + cal_dim, 32), nn.ReLU(), nn.Linear(32, 1))

        def forward(self, x, cal):
            out, _ = self.lstm(x)
            return self.head(torch.cat([out[:, -1], cal], dim=1)).squeeze(1)

    net = Net()
    opt = torch.optim.Adam(net.parameters(), lr=3e-3)
    loss_fn = nn.MSELoss()
    n = len(Ytr)
    for _ in range(epochs):
        perm = torch.randperm(n)
        for i in range(0, n, 64):
            idx = perm[i:i + 64]
            opt.zero_grad()
            loss = loss_fn(net(Xtr[idx], Ctr[idx]), Ytr[idx])
            loss.backward()
            opt.step()

    net.eval()
    rows = []
    with torch.no_grad():
        for z, (dates, y, cal, steps) in per_zone.items():
            xs, cs, _, ds = windows(dates, y, cal, steps, eval_start, eval_end)
            if not xs:
                continue
            pred = net(torch.tensor(np.array(xs), dtype=torch.float32), torch.tensor(np.array(cs), dtype=torch.float32))
            pred = np.clip(pred.numpy() * sd + mu, 0, None)
            rows.append(pd.DataFrame({"date": pd.to_datetime(ds), "zone": z, "lstm_pred": pred}))
    return pd.concat(rows, ignore_index=True)
