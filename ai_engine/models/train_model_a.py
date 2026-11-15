"""Model A: Physiological Heat-Strain Core Temperature Estimator.

Trains a gradient-boosted regressor (XGBoost) to predict core body temperature (°C)
from non-invasive wearable telemetry (heart rate, skin temperature, breathing rate,
motion/activity), ambient environmental context, and personal physiology.

Evaluated using strict participant-disjoint GroupKFold cross-validation
to prevent data leakage and guarantee real-world generalization to unseen workers.
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from scipy.stats import pearsonr
import xgboost as xgb

# Ensure root path is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

MODEL_A_FEATURE_COLS = [
    # Demographics & Fitness
    "age_yrs",
    "sex",
    "body_mass_kg",
    "height_cm",
    "bmi_kg_m2",
    "body_fat_pct",
    "vo2peak_ml_kg_min",
    "acclimation_status",
    "training_status",
    "fitness_factor",
    "BMI_risk_factor",

    # Wearable Physiological Signals (Real-time telemetry)
    "heart_rate_bpm",
    "breathing_rate_bpm",
    "skin_temp_mean_C",
    "skin_temp_chest_C",
    "skin_temp_abdomen_C",
    "skin_temp_calf_C",
    "spo2_pct",
    "steps_per_min",
    "hrv_rmssd_ms",

    # Temporal & Rolling Windows of Wearables
    "heart_rate_bpm_rolling_mean_5m",
    "heart_rate_bpm_rolling_mean_10m",
    "heart_rate_bpm_rolling_mean_15m",
    "heart_rate_bpm_rolling_mean_30m",
    "heart_rate_bpm_rolling_std_5m",
    "heart_rate_bpm_rolling_std_15m",
    "heart_rate_bpm_rolling_max_15m",
    "heart_rate_bpm_rate_of_change",
    "heart_rate_bpm_acceleration",
    "heart_rate_bpm_deviation_from_baseline",

    "skin_temp_mean_C_rolling_mean_5m",
    "skin_temp_mean_C_rolling_mean_15m",
    "skin_temp_mean_C_rate_of_change",
    "skin_temp_mean_C_deviation_from_baseline",

    "breathing_rate_bpm_rolling_mean_15m",
    "breathing_rate_bpm_rate_of_change",

    # Cardiac Normalization
    "HR_pct_of_max",
    "HR_reserve_used_pct",
    "HR_efficiency_ratio",
    "cumulative_cardiac_strain_min",

    # Environmental & Microclimate Context
    "air_temp_C",
    "relative_humidity_pct",
    "wind_speed_m_s",
    "solar_radiation_W_m2",
    "clothing_clo",
    "under_clothing_temp_C",
    "under_clothing_rh_pct",
    "heat_index_C",
    "vapor_pressure_hpa",
    "WBGT_estimated_C",
    "evaporative_cooling_potential",
    "solar_clothing_interaction",
    "thermal_load_index",
    "env_risk_category",

    # Workload Context
    "activity_code",
    "work_duration_min",
    "rpe",
]

def train_and_evaluate_model_a(
    data_path: str = "ai_engine/data/processed/canonical_unified_features.parquet",
    output_dir: str = "ai_engine/models/artifacts",
    n_splits: int = 5,
):
    """Trains and validates Model A with participant-disjoint GroupKFold."""
    os.makedirs(output_dir, exist_ok=True)
    print("=" * 70)
    print("  TRAINING MODEL A: PHYSIOLOGICAL CORE TEMPERATURE ESTIMATOR")
    print("=" * 70)

    if not os.path.exists(data_path):
        # Fallback to CSV if parquet not yet generated
        csv_path = data_path.replace(".parquet", ".csv")
        if os.path.exists(csv_path):
            data_path = csv_path
        else:
            raise FileNotFoundError(f"Feature dataset not found at {data_path}")

    print(f"Loading data from {data_path}...")
    df = pd.read_parquet(data_path) if data_path.endswith(".parquet") else pd.read_csv(data_path)

    # Filter to observations with valid measured or reference core temperature
    # Focus primarily on PROSPIE (gold-standard rectal) and Firefighter (pill)
    mask_valid = (
        df["core_temp_target_C"].notna()
        & (df["core_temp_target_C"] >= 35.5)
        & (df["core_temp_target_C"] <= 41.0)
        & (df["source_dataset"].isin(["PROSPIE", "FIREFIGHTER"]))
    )
    df_train = df[mask_valid].copy().reset_index(drop=True)
    print(f"Total training cohort rows: {len(df_train):,} across {df_train['participant_id'].nunique()} participants")
    print(f"Core Temp target range: {df_train['core_temp_target_C'].min():.2f}°C – {df_train['core_temp_target_C'].max():.2f}°C (Mean: {df_train['core_temp_target_C'].mean():.2f}°C)")

    # Select available feature columns
    feat_cols = [c for c in MODEL_A_FEATURE_COLS if c in df_train.columns]
    X = df_train[feat_cols]
    y = df_train["core_temp_target_C"].values
    groups = df_train["participant_id"].values

    print(f"Features used ({len(feat_cols)}): {feat_cols[:8]} ...")

    # Participant-Disjoint Cross Validation (GroupKFold)
    gkf = GroupKFold(n_splits=n_splits)

    fold_maes = []
    fold_rmses = []
    fold_r2s = []
    fold_pearsons = []

    oof_preds = np.zeros(len(df_train))
    feature_importances = np.zeros(len(feat_cols))

    print(f"\nRunning {n_splits}-Fold Participant-Disjoint Cross-Validation:")

    for fold, (train_idx, val_idx) in enumerate(gkf.split(X, y, groups=groups)):
        X_train, y_train = X.iloc[train_idx], y[train_idx]
        X_val, y_val = X.iloc[val_idx], y[val_idx]
        val_participants = np.unique(groups[val_idx])

        # XGBoost Regressor tuned for physiological time-series
        model = xgb.XGBRegressor(
            n_estimators=300,
            learning_rate=0.03,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            reg_alpha=0.1,
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
        r, _ = pearsonr(y_val, preds)

        fold_maes.append(mae)
        fold_rmses.append(rmse)
        fold_r2s.append(r2)
        fold_pearsons.append(r)

        print(f"  Fold {fold+1}: MAE = {mae:.3f}°C | RMSE = {rmse:.3f}°C | R² = {r2:.3f} | Pearson r = {r:.3f} (Held-out subjects: {len(val_participants)})")

    # Overall Out-of-Fold Evaluation
    overall_mae = mean_absolute_error(y, oof_preds)
    overall_rmse = np.sqrt(mean_squared_error(y, oof_preds))
    overall_r2 = r2_score(y, oof_preds)
    overall_r, _ = pearsonr(y, oof_preds)

    print("\n" + "=" * 50)
    print("  MODEL A OUT-OF-FOLD GENERALIZATION PERFORMANCE")
    print("=" * 50)
    print(f"Overall MAE:       {overall_mae:.3f} °C")
    print(f"Overall RMSE:      {overall_rmse:.3f} °C")
    print(f"Overall R²:        {overall_r2:.3f}")
    print(f"Overall Pearson r: {overall_r:.3f}")
    print(f"% predictions within ±0.3°C: {(np.abs(y - oof_preds) <= 0.3).mean()*100:.1f}%")
    print(f"% predictions within ±0.5°C: {(np.abs(y - oof_preds) <= 0.5).mean()*100:.1f}%")

    # Train final production model on all valid data
    print("\nTraining final production model on full training cohort...")
    final_model = xgb.XGBRegressor(
        n_estimators=350,
        learning_rate=0.03,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
    )
    final_model.fit(X, y)

    # Save model and feature names
    model_save_path = os.path.join(output_dir, "model_a_core_temp.json")
    meta_save_path = os.path.join(output_dir, "model_a_metadata.json")
    final_model.save_model(model_save_path)

    top_features = sorted(zip(feat_cols, feature_importances), key=lambda x: x[1], reverse=True)

    metadata = {
        "model_name": "Model A — Physiological Core Temperature Regressor",
        "algorithm": "XGBoost Regressor",
        "target": "core_temp_C",
        "n_training_samples": len(df_train),
        "n_participants": int(df_train["participant_id"].nunique()),
        "validation_strategy": "Participant-Disjoint GroupKFold (5-fold)",
        "metrics": {
            "overall_mae_C": float(overall_mae),
            "overall_rmse_C": float(overall_rmse),
            "overall_r2": float(overall_r2),
            "overall_pearson_r": float(overall_r),
            "pct_within_0_3C": float((np.abs(y - oof_preds) <= 0.3).mean() * 100.0),
            "pct_within_0_5C": float((np.abs(y - oof_preds) <= 0.5).mean() * 100.0),
        },
        "top_features": [{"feature": f, "importance": float(imp)} for f, imp in top_features[:15]],
        "feature_list": feat_cols,
    }

    with open(meta_save_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved to: {model_save_path}")
    print(f"Metadata saved to: {meta_save_path}")
    print("\nTop 10 Most Predictive Features:")
    for f, imp in top_features[:10]:
        print(f"  - {f:40s}: {imp:.4f}")

    return final_model, metadata

if __name__ == "__main__":
    train_and_evaluate_model_a()
