"""Base Dataset Adapter for ThermoSense AI.

All dataset-specific adapters inherit from BaseAdapter to ensure uniform
loading, sanitization, canonical schema mapping, and validation.
"""

from abc import ABC, abstractmethod
from typing import Optional
import os
import pandas as pd
from ai_engine.preprocessing.schema import validate_canonical_df

class BaseAdapter(ABC):
    """Abstract Base Class for raw dataset adapters."""
    
    def __init__(self, raw_data_path: str, dataset_name: str):
        self.raw_data_path = raw_data_path
        self.dataset_name = dataset_name

    @abstractmethod
    def adapt(self) -> pd.DataFrame:
        """Parses the raw dataset and transforms it into the canonical schema.
        
        Returns:
            pd.DataFrame matching CANONICAL_COLUMNS.
        """
        pass

    def run(self, output_path: Optional[str] = None) -> pd.DataFrame:
        """Executes adaptation, validates canonical schema, and optionally persists output.
        
        Args:
            output_path: Optional path to save CSV or Parquet file.
            
        Returns:
            Validated canonical pd.DataFrame.
        """
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Raw dataset file not found: {self.raw_data_path}")
            
        df_canonical = self.adapt()
        df_validated = validate_canonical_df(df_canonical)
        
        if output_path:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            if output_path.endswith(".parquet"):
                df_validated.to_parquet(output_path, index=False)
            else:
                df_validated.to_csv(output_path, index=False)
                
        return df_validated
