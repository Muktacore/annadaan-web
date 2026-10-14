"""Run the full forecasting experiment on SIMULATED data.

    python -m annadaan_ml.forecasting.run_forecast [--seed 42] [--days 1096] [--out reports] [--no-plots] [--skip-lstm]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .evaluate import all_metrics, baseline_predictions, chronological_split
from .explain import plot_shap_bar, shap_importance
from .features import build_features, feature_columns
from .models import fit_predict_lstm, make_random_forest, make_xgboost, torch_available
from .predict import recursive_forecast
from .simulate import simulate_donations

DISCLAIMER = (
    "SIMULATED data. Architecture validated on synthetic donations; "
    "these numbers are NOT real-world accuracy (no real donation history exists yet)."
)


def run(seed: int = 42, days: int = 1096, out_dir: str = "reports", plots: bool = True, use_lstm: bool = True) -> dict:
    raw = simulate_donations(days=days, seed=seed)
    zones = sorted(raw["zone"].unique())
    cols = feature_columns(zones)
    feat = build_features(raw, "donations", zones)
    train, val, test = chronological_split(feat)

    results: dict = {}
    for split_name, part in (("val", val), ("test", test)):
        for name, pred in baseline_predictions(part).items():
            results.setdefault(name, {})[split_name] = all_metrics(part["donations"], pred)

    models = {"random_forest": make_random_forest(seed), "xgboost": make_xgboost(seed)}
    preds_test = {}
    for name, model in models.items():
        model.fit(train[cols], train["donations"])
        for split_name, part in (("val", val), ("test", test)):
            p = np.clip(model.predict(part[cols]), 0, None)
            results.setdefault(name, {})[split_name] = all_metrics(part["donations"], p)
            if split_name == "test":
                preds_test[name] = p

    lstm_note = "skipped (--skip-lstm)"
    if use_lstm:
        if torch_available():
            train_end = train["date"].max()
            lp = fit_predict_lstm(raw, train_end, val["date"].min(), test["date"].max(), seed=seed)
            for split_name, part in (("val", val), ("test", test)):
                m = part.merge(lp, on=["date", "zone"], how="left")
                results.setdefault("lstm", {})[split_name] = all_metrics(m["donations"], m["lstm_pred"])
                if split_name == "test":
                    preds_test["lstm"] = m["lstm_pred"].to_numpy()
            lstm_note = "trained"
        else:
            lstm_note = "skipped: PyTorch not installed (pip install torch to enable)"

    ml_names = [n for n in ("random_forest", "xgboost") if n in results]
    best = min(ml_names, key=lambda n: results[n]["val"]["mae"])  # chosen on VALIDATION only
    best_naive = min(("naive_yesterday", "naive_last_week"), key=lambda n: results[n]["val"]["mae"])
    ml_mae, naive_mae = results[best]["test"]["mae"], results[best_naive]["test"]["mae"]
    gain = 100 * (naive_mae - ml_mae) / naive_mae
    verdict = (
        f"{best} beats {best_naive} on test MAE by {gain:.1f}%"
        if gain > 0
        else f"{best} does NOT beat {best_naive} on test MAE ({gain:.1f}%); naive baseline is stronger"
    )

    shap_top = {}
    imps = {}
    for name in ml_names:
        imps[name] = shap_importance(models[name], test[cols])
        shap_top[name] = [
            {"feature": r.feature, "mean_abs_shap": round(float(r.mean_abs_shap), 3)}
            for r in imps[name].head(6).itertuples()
        ]

    meals_per_donation = float(train["meals"].sum() / train["donations"].sum())
    fc = recursive_forecast(models[best], raw, horizon=7)
    fc["meals_pred"] = fc["donations_pred"] * meals_per_donation
    forecast_7d = {
        z: [
            {"date": str(r.date.date()), "donations": round(float(r.donations_pred), 1), "meals": round(float(r.meals_pred))}
            for r in g.itertuples()
        ]
        for z, g in fc.groupby("zone")
    }

    report = {
        "disclaimer": DISCLAIMER,
        "seed": seed,
        "rows_raw": int(len(raw)),
        "rows_features": int(len(feat)),
        "split": {
            "train": [str(train["date"].min().date()), str(train["date"].max().date())],
            "val": [str(val["date"].min().date()), str(val["date"].max().date())],
            "test": [str(test["date"].min().date()), str(test["date"].max().date())],
        },
        "metrics": results,
        "best_ml_model_by_val_mae": best,
        "verdict": verdict,
        "lstm": lstm_note,
        "shap_top_features": shap_top,
        "meals_per_donation": round(meals_per_donation, 2),
        "forecast_7day": forecast_7d,
    }

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "forecast_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    if plots:
        _plots(out, test, preds_test, best, imps)
    return report


def _plots(out: Path, test: pd.DataFrame, preds_test: dict, best: str, imps: dict) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    zone = sorted(test["zone"].unique())[0]
    mask = (test["zone"] == zone).to_numpy()
    sub = test[mask].iloc[-60:]
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.plot(sub["date"], sub["donations"], color="#2B2A24", label="actual (simulated)")
    ax.plot(sub["date"], preds_test[best][mask][-60:], color="#586C5A", label=best)
    ax.plot(sub["date"], sub["lag_7"], color="#B87858", alpha=0.7, label="naive last week")
    ax.set_title(f"Test period, zone {zone} (simulated data)")
    ax.legend()
    fig.autofmt_xdate()
    fig.tight_layout()
    fig.savefig(out / "forecast_test.png", dpi=120)
    plt.close(fig)
    for name, imp in imps.items():
        plot_shap_bar(imp, out / f"shap_{name}.png", f"{name}: mean |SHAP| (simulated data)")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--days", type=int, default=1096)
    ap.add_argument("--out", default="reports")
    ap.add_argument("--no-plots", action="store_true")
    ap.add_argument("--skip-lstm", action="store_true")
    a = ap.parse_args()
    r = run(a.seed, a.days, a.out, not a.no_plots, not a.skip_lstm)

    print(r["disclaimer"])
    print(f"split: train {r['split']['train']}  val {r['split']['val']}  test {r['split']['test']}")
    print(f"\n{'model':<18}{'val MAE':>9}{'test MAE':>10}{'test RMSE':>11}{'test sMAPE%':>13}")
    for name, m in r["metrics"].items():
        print(f"{name:<18}{m['val']['mae']:>9}{m['test']['mae']:>10}{m['test']['rmse']:>11}{m['test']['smape']:>13}")
    print(f"\nLSTM: {r['lstm']}")
    print(f"VERDICT: {r['verdict']}")
    for name, rows in r["shap_top_features"].items():
        print(f"\nSHAP top features ({name}):")
        for row in rows:
            print(f"  {row['feature']:<18}{row['mean_abs_shap']}")
    print(f"\n7-day forecast ({r['best_ml_model_by_val_mae']}, ~{r['meals_per_donation']} meals/donation):")
    for zone, rows in r["forecast_7day"].items():
        print(f"  {zone}: " + ", ".join(f"{x['date'][5:]}={x['donations']}" for x in rows))
    print(f"\nReport written to {Path(a.out) / 'forecast_report.json'}")


if __name__ == "__main__":
    main()
