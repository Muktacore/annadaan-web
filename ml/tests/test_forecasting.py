import numpy as np
import pandas as pd
import pytest

from annadaan_ml.forecasting.evaluate import all_metrics, baseline_predictions, chronological_split, smape
from annadaan_ml.forecasting.explain import shap_importance, shap_top_contributions
from annadaan_ml.forecasting.features import build_features, feature_columns
from annadaan_ml.forecasting.festivals import festival_flags
from annadaan_ml.forecasting.models import make_random_forest, make_xgboost
from annadaan_ml.forecasting.predict import recursive_forecast
from annadaan_ml.forecasting.simulate import simulate_donations

pytest.importorskip("sklearn")


@pytest.fixture(scope="module")
def raw():
    return simulate_donations(days=400, seed=7)


@pytest.fixture(scope="module")
def feat(raw):
    return build_features(raw)


def test_simulation_is_seeded_and_valid(raw):
    again = simulate_donations(days=400, seed=7)
    pd.testing.assert_frame_equal(raw, again)
    assert len(raw) == 400 * 3
    assert (raw["donations"] >= 0).all()
    assert raw["donations"].dtype.kind == "i"
    assert not simulate_donations(days=400, seed=8)["donations"].equals(raw["donations"])


def test_weekend_and_festival_effects_exist():
    big = simulate_donations(days=1096, seed=1)
    dow = big["date"].dt.dayofweek
    assert big[dow >= 5]["donations"].mean() > big[dow < 5]["donations"].mean()


def test_festival_flags():
    is_f, to_f = festival_flags(pd.to_datetime(["2024-11-01", "2024-11-02", "2024-06-01"]))
    assert list(is_f) == [True, True, False]
    assert to_f[0] == 0 and to_f[2] <= 14


def test_features_are_past_only(raw):
    base = build_features(raw)
    # Change the target on one day: that day's own features must not change.
    tweaked = raw.copy()
    day = pd.Timestamp("2023-09-10")
    tweaked.loc[tweaked["date"] == day, "donations"] += 500
    new = build_features(tweaked)
    cols = feature_columns(sorted(raw["zone"].unique()))
    a = base[base["date"] <= day].reset_index(drop=True)[cols]
    b = new[new["date"] <= day].reset_index(drop=True)[cols]
    pd.testing.assert_frame_equal(a, b)
    # ... but the next day's lag_1 must see it.
    nxt = new[new["date"] == day + pd.Timedelta(days=1)]["lag_1"].to_numpy()
    old = base[base["date"] == day + pd.Timedelta(days=1)]["lag_1"].to_numpy()
    assert (nxt - old == 500).all()


def test_split_is_chronological_without_overlap(feat):
    train, val, test = chronological_split(feat)
    assert train["date"].max() < val["date"].min()
    assert val["date"].max() < test["date"].min()
    assert len(train) + len(val) + len(test) == len(feat)


def test_metrics():
    assert all_metrics([10, 20], [10, 20]) == {"mae": 0.0, "rmse": 0.0, "smape": 0.0}
    assert all_metrics([10, 20], [12, 18])["mae"] == 2.0
    assert smape([0], [0]) == 0.0


def test_baselines_use_lags(feat):
    b = baseline_predictions(feat)
    assert np.array_equal(b["naive_yesterday"], feat["lag_1"].to_numpy())
    assert np.array_equal(b["naive_last_week"], feat["lag_7"].to_numpy())


def test_models_beat_train_mean_and_explain(feat):
    zones = sorted(feat["zone"].unique())
    cols = feature_columns(zones)
    train, _, test = chronological_split(feat)
    mean_mae = np.abs(test["donations"] - train["donations"].mean()).mean()
    for make in (make_random_forest, make_xgboost):
        model = make(0)
        model.fit(train[cols], train["donations"])
        pred = model.predict(test[cols])
        assert np.abs(test["donations"] - pred).mean() < mean_mae
    pytest.importorskip("shap")
    imp = shap_importance(model, test[cols], max_rows=50)
    assert set(imp["feature"]) == set(cols)
    assert (imp["mean_abs_shap"] >= 0).all()
    top = shap_top_contributions(model, test[cols].iloc[[0]], k=3)
    assert len(top) == 3 and {"feature", "value", "shap"} <= set(top[0])


def test_recursive_forecast_shape(raw, feat):
    cols = feature_columns(sorted(raw["zone"].unique()))
    model = make_random_forest(0).fit(feat[cols], feat["donations"])
    fc = recursive_forecast(model, raw, horizon=7)
    assert len(fc) == 7 * 3
    assert fc["date"].min() == raw["date"].max() + pd.Timedelta(days=1)
    assert (fc["donations_pred"] >= 0).all()


def test_lstm_optional():
    pytest.importorskip("torch")
    from annadaan_ml.forecasting.models import fit_predict_lstm

    raw = simulate_donations(days=200, seed=3)
    out = fit_predict_lstm(raw, "2023-05-01", "2023-05-02", "2023-06-30", epochs=2)
    assert {"date", "zone", "lstm_pred"} <= set(out.columns)
    assert len(out) > 0 and (out["lstm_pred"] >= 0).all()
