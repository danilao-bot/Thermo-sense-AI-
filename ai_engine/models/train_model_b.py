"""Model B: Environmental Heat-Risk & Physical Work Capacity Loss Estimator.

Trains a gradient-boosted regressor (XGBoost) to predict Physical Work Capacity loss (PWC loss %)
from environmental metrics (air temp, humidity, solar, wind, clo), work exposure duration,
and worker characteristics (fitness, acclimation, age).

Evaluated using 5-Fold cross-validation to assess predictive precision.
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

# Ensure root path is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

MODEL_B_FEATURE_COLS = [
    # Environmental Metrics
    "air_temp_C",
    "relative_humidity_pct",
    "wind_speed_m_s",
    "solar_radiation_W_m2",
    "clothing_clo",
    "heat_index_C",
    "vapor_pressure_hpa",
    "WBGT_estimated_C",
    "evaporative_cooling_potential",
    "solar_clothing_interaction",
    "thermal_load_index",
    "env_risk_category",

    # Exposure & Workload Context
    "work_duration_min",

    # Worker Demographics & Physiological Resilience
    "age_yrs",
    "sex",
    "body_mass_kg",
    "vo2peak_ml_kg_min",
    "fitness_factor",
    "acclimation_status",
    "training_status",
]

def train_and_evaluate_model_b(
    data_path: str = "ai_engine/data/processed/canonical_unified_features.parquet",
    output_dir: str = "ai_engine/models/artifacts",
    n_splits: int = 5,
):
    """Trains and validates Model B for Physical Work Capacity loss."""
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 70)
    print("  TRAINING MODEL B: ENVIRONMENTAL HEAT-RISK & PWC LOSS ESTIMATOR")
    print("=" * 70)

    if not os.path.exists(data_path):
        csv_path = data_path.replace(".parquet", ".csv")
        if os.path.exists(csv_path):
            data_path = csv_path
        else:
            raise FileNotFoundError(f"Feature dataset not found at {data_path}")

    print(f"Loading data from {data_path}...")
    df = pd.read_parquet(data_path) if data_path.endswith(".parquet") else pd.read_csv(data_path)

    # Filter to HEATSHIELD observations with valid PWC loss target
    mask_valid = (
        df["pwc_loss_pct"].notna()
        & (df["source_dataset"] == "HEATSHIELD")
    )
    df_train = df[mask_valid].copy().reset_index(drop=True)
    print(f"Total training cohort rows: {len(df_train):,} across {df_train['participant_id'].nunique()} participants")
    print(f"PWC loss target range: {df_train['pwc_loss_pct'].min():.1f}% – {df_train['pwc_loss_pct'].max():.1f}% (Mean: {df_train['pwc_loss_pct'].mean():.1f}%)")

    feat_cols = [c for c in MODEL_B_FEATURE_COLS if c in df_train.columns]
    X = df_train[feat_cols]
    y = df_train["pwc_loss_pct"].values

    print(f"Features used ({len(feat_cols)}): {feat_cols}")

    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)

    fold_maes = []
    fold_rmses = []
    fold_r2s = []
    oof_preds = np.zeros(len(df_train))
    feature_importances = np.zeros(len(feat_cols))

    print(f"\nRunning {n_splits}-Fold Cross-Validation:")

    for fold, (train_idx, val_idx) in enumerate(kf.split(X, y)):
        X_train, y_train = X.iloc[train_idx], y[train_idx]
        X_val, y_val = X.iloc[val_idx], y[val_idx]

        model = xgb.XGBRegressor(
            n_estimators=250,
            learning_rate=0.04,
            max_depth=5,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_alpha=0.05,
            reg_lambda=1.0,
            random_state=42 + fold,
            n_jobs=-1,
        )

        model.fit(
            X_train,
            y_train,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )

        preds = model.predict(X_val)
        oof_preds[val_idx] = preds
        feature_importances += model.feature_importances_ / n_splits

        mae = mean_absolute_error(y_val, preds)
        rmse = np.sqrt(mean_squared_error(y_val, preds))
        r2 = r2_score(y_val, preds)

        fold_maes.append(mae)
        fold_rmses.append(rmse)
        fold_r2s.append(r2)

        print(f"  Fold {fold+1}: MAE = {mae:.2f}% | RMSE = {rmse:.2f}% | R² = {r2:.3f}")

    overall_mae = mean_absolute_error(y, oof_preds)
    overall_rmse = np.sqrt(mean_squared_error(y, oof_preds))
    overall_r2 = r2_score(y, oof_preds)

    print("\n" + "=" * 50)
    print("  MODEL B OUT-OF-FOLD PERFORMANCE SUMMARY")
    print("=" * 50)
    print(f"Overall MAE:  {overall_mae:.2f} %")
    print(f"Overall RMSE: {overall_rmse:.2f} %")
    print(f"Overall R²:   {overall_r2:.3f}")

    # Final training
    print("\nTraining final production Model B...")
    final_model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.04,
        max_depth=5,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.05,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
    )
    final_model.fit(X, y)

    model_save_path = os.path.join(output_dir, "model_b_pwc_loss.json")
    meta_save_path = os.path.join(output_dir, "model_b_metadata.json")
    final_model.save_model(model_save_path)

    top_features = sorted(zip(feat_cols, feature_importances), key=lambda x: x[1], reverse=True)

    metadata = {
        "model_name": "Model B — Environmental Heat Risk & PWC Loss Regressor",
        "algorithm": "XGBoost Regressor",
        "target": "pwc_loss_pct",
        "n_training_samples": len(df_train),
        "validation_strategy": f"{n_splits}-Fold Cross-Validation",
        "metrics": {
            "overall_mae_pct": float(overall_mae),
            "overall_rmse_pct": float(overall_rmse),
            "overall_r2": float(overall_r2),
        },
        "top_features": [{"feature": f, "importance": float(imp)} for f, imp in top_features[:10]],
        "feature_list": feat_cols,
    }

    with open(meta_save_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to: {model_save_path}")
    print(f"Metadata saved to: {meta_save_path}")
    print("\nTop Predictors of Physical Work Capacity Loss:")
    for f, imp in top_features[:8]:
        print(f"  - {f:35s}: {imp:.4f}")

    return final_model, metadata

if __name__ == "__main__":
    train_and_evaluate_model_b()
