# Forecasting engine (Step 14)

Predicts next-day and 7-day donation counts per zone. **All data is simulated**: this validates
the architecture (features, split, baselines, models, explainability), not real-world accuracy.

Run (from `ml/`, venv active):

    pip install -r requirements-forecast.txt
    python -m pytest -q
    python -m annadaan_ml.forecasting.run_forecast

Outputs go to `ml/reports/` (JSON report + PNG plots). LSTM runs only if PyTorch is installed.
Model selection uses the validation split; the test split is reported once.
Weather is not a feature (future weather is unknown); features are strictly past-only.
