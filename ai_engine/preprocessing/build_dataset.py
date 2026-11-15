"""Master Dataset Builder for ThermoSense AI.

Loads all raw datasets through their respective adapters, transforms them into
the canonical schema, executes the feature engineering pipeline, and saves
the unified cross-dataset feature matrix.
"""

import os
import sys
import time
import pandas as pd
import numpy as np

# Ensure root path is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_engine.preprocessing.adapters import (
    ProspieAdapter,
    EPAAdapter,
    FirefighterAdapter,
    HeatshieldAdapter,
    CoreAdapter,
)
from ai_engine.features.feature_pipeline import FeaturePipeline
from ai_engine.preprocessing.schema import validate_canonical_df

def build_all(output_dir: str = "ai_engine/data/processed"):
    """Executes the entire end-to-end data processing and feature engineering flow."""
    os.makedirs(output_dir, exist_ok=True)
    start_time = time.time()
    print("=" * 70)
    print("  THERMOSENSE AI — DATA PIPELINE & FEATURE ENGINEERING")
    print("=" * 70)

    adapters = [
        ("PROSPIE", ProspieAdapter(), "prospie_canonical.parquet"),
        ("EPA", EPAAdapter(), "epa_canonical.parquet"),
        ("FIREFIGHTER", FirefighterAdapter(), "firefighter_canonical.parquet"),
        ("HEATSHIELD", HeatshieldAdapter(), "heatshield_canonical.parquet"),
        ("CORE", CoreAdapter(), "core_canonical.parquet"),
    ]

    adapted_dfs = []

    for name, adapter, filename in adapters:
        print(f"\n[1/4] Running Adapter: {name}...")
        t0 = time.time()
        try:
            df = adapter.adapt()
            df = validate_canonical_df(df)
            save_path = os.path.join(output_dir, filename)
            df.to_parquet(save_path, index=False)
            adapted_dfs.append(df)
            print(f"      -> Success: {len(df):,} rows, {len(df.columns)} columns in {time.time()-t0:.2f}s")
            print(f"      -> Saved to {save_path}")
        except Exception as e:
            print(f"      -> ERROR adapting {name}: {e}")
            import traceback
            traceback.print_exc()

    print("\n[2/4] Merging Canonical Datasets...")
    df_unified = pd.concat(adapted_dfs, ignore_index=True)
    df_unified = validate_canonical_df(df_unified)
    unified_raw_path = os.path.join(output_dir, "canonical_unified_raw.parquet")
    df_unified.to_parquet(unified_raw_path, index=False)
    print(f"      -> Unified raw canonical shape: {df_unified.shape[0]:,} rows, {df_unified.shape[1]} cols")

    print("\n[3/4] Running Comprehensive Feature Engineering Pipeline...")
    t_feat = time.time()
    pipeline = FeaturePipeline()
    df_features = pipeline.transform(df_unified)
    print(f"      -> Feature engineering completed in {time.time()-t_feat:.2f}s")
    print(f"      -> Total features produced: {len(df_features.columns)}")

    print("\n[4/4] Saving Final Feature Matrix...")
    final_parquet = os.path.join(output_dir, "canonical_unified_features.parquet")
    final_csv = os.path.join(output_dir, "canonical_unified_features.csv")
    df_features.to_parquet(final_parquet, index=False)
    df_features.to_csv(final_csv, index=False)
    print(f"      -> Parquet: {final_parquet} ({os.path.getsize(final_parquet)/1024/1024:.2f} MB)")
    print(f"      -> CSV: {final_csv} ({os.path.getsize(final_csv)/1024/1024:.2f} MB)")

    print("\n" + "=" * 70)
    print("  AUDIT & SUMMARY REPORT")
    print("=" * 70)
    print(f"Total Rows: {len(df_features):,}")
    print(f"Total Columns: {len(df_features.columns)}")
    print(f"Unique Participants: {df_features['participant_id'].nunique()}")
    print(f"Unique Sessions: {df_features['session_id'].nunique()}")
    print("\nRow Distribution by Source Dataset:")
    print(df_features["source_dataset"].value_counts())
    print("\nRow Distribution by Provenance:")
    print(df_features["data_provenance"].value_counts())
    print("\nTarget Availability:")
    print(f" - Core Temp Target (Model A): {df_features['core_temp_target_C'].notna().sum():,} rows")
    print(f" - PWC Loss Target (Model B): {df_features['pwc_loss_pct'].notna().sum():,} rows")
    print(f" - Body Mass Change (Model C): {df_features['body_mass_change_pct'].notna().sum():,} rows")
    print(f"\nTotal Pipeline Execution Time: {time.time()-start_time:.2f} seconds")
    print("=" * 70)
    return df_features

if __name__ == "__main__":
    build_all()
