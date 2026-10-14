"""Explainability for tree models: SHAP (TreeExplainer) and optional LIME.

SHAP/LIME are for these tabular forecasters. Grad-CAM is for the image CNN only.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def shap_values(model, X: pd.DataFrame, max_rows: int = 500) -> np.ndarray:
    import shap
    explainer = shap.TreeExplainer(model)
    return np.asarray(explainer.shap_values(X.iloc[:max_rows]))


def shap_importance(model, X: pd.DataFrame, max_rows: int = 500) -> pd.DataFrame:
    """Global importance: mean |SHAP| per feature, sorted descending."""
    sv = shap_values(model, X, max_rows)
    imp = pd.DataFrame({"feature": list(X.columns), "mean_abs_shap": np.abs(sv).mean(axis=0)})
    return imp.sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)


def shap_top_contributions(model, x_row: pd.DataFrame, k: int = 4) -> list[dict]:
    """Local explanation for ONE row (DataFrame with 1 row): top-k features by |SHAP|.
    Positive shap pushes the forecast up, negative pushes it down (units: donations)."""
    sv = shap_values(model, x_row, max_rows=1)[0]
    order = np.argsort(-np.abs(sv))[:k]
    return [
        {"feature": x_row.columns[i], "value": float(x_row.iloc[0, i]), "shap": round(float(sv[i]), 3)}
        for i in order
    ]


def lime_explain(model, X_train: pd.DataFrame, x_row: pd.DataFrame, num_features: int = 6):
    """Optional LIME tabular explanation. Returns [(rule, weight), ...] or None if lime is missing."""
    try:
        from lime.lime_tabular import LimeTabularExplainer
    except ImportError:
        return None
    exp = LimeTabularExplainer(X_train.to_numpy(), feature_names=list(X_train.columns), mode="regression")
    return exp.explain_instance(x_row.to_numpy()[0], model.predict, num_features=num_features).as_list()


def plot_shap_bar(imp: pd.DataFrame, path, title: str = "Mean |SHAP| per feature") -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    top = imp.head(12).iloc[::-1]
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.barh(top["feature"], top["mean_abs_shap"], color="#586C5A")
    ax.set_xlabel("mean |SHAP| (donations/day)")
    ax.set_title(title)
    fig.tight_layout()
    fig.savefig(path, dpi=120)
    plt.close(fig)
