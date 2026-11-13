# ThermoSense AI 🌡️🤖

ThermoSense AI is an intelligent thermal sensing, analysis, and predictive modeling platform designed to process thermal/temperature sensor data, extract physical and statistical features, estimate uncertainties, and provide real-time inferences and recommendations.

---

## 📁 Project Structure

```text
thermosense-ai/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entrypoint (FastAPI)
│   │   ├── api/                  # API endpoints and routes
│   │   ├── schemas/              # Pydantic data schemas
│   │   └── services/             # Core business logic & inference integration
│   │
│   └── requirements.txt         # Backend Python dependencies
│
├── ai_engine/
│   ├── data/
│   │   ├── raw/                 # Raw sensory & thermal datasets
│   │   ├── processed/           # Cleaned and normalized datasets
│   │   └── external/            # Third-party benchmark datasets
│   │
│   ├── preprocessing/           # Data cleaning and signal filtering pipelines
│   ├── features/                # Domain-specific & thermal feature extraction
│   ├── models/                  # Machine learning and deep learning models
│   ├── uncertainty/             # Uncertainty estimation (Bayesian, conformal, etc.)
│   ├── evaluation/              # Model evaluation metrics & validation routines
│   └── experiments/             # Experiment tracking and analysis notebooks/scripts
│
├── frontend/                    # Web-based UI & dashboard
│
├── docs/
│   ├── architecture/            # System design & architecture specifications
│   ├── research/                # Thermal AI literature and references
│   └── validation/              # Clinical / industrial validation reports
│
├── tests/                       # Unit and integration test suites
├── .gitignore                   # Standard git ignore definitions
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the API server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The interactive API docs will be available at `http://127.0.0.1:8000/docs`.

---

## 🧪 Testing

Run test suites from the root directory:
```bash
pytest
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
