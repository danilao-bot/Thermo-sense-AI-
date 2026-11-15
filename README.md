# THERMOSENSE

An occupational heat-health early warning platform designed for industrial and outdoor work environments. THERMOSENSE pairs physiological telemetry, ambient meteorological intelligence, and machine learning models to predict core body temperature, evaluate physical work capacity loss, track hydration balance, and escalate heat-stress incidents in real time.

---

## ⚡ Key Capabilities

### 1. Physiological Heat Strain Surveillance (Model A & D)
* **Real-Time Core Body Temperature:** Estimates deep core body temperature from non-invasive physiological inputs (heart rate, mean skin temperature, work duration, clothing insulation, and ambient heat).
* **Conformal Uncertainty Bounds:** Accompanies point estimates with rigorous confidence intervals (`[lower_bound, upper_bound]`) calibrated via non-parametric residuals to prevent false alarms and missed critical spikes.
* **Safety Thresholds & Escalation:** Automated classification into safety zones (`GREEN`, `AMBER`, `ORANGE`, `RED`, `EMERGENCY_PURPLE`) with explicit clinical action triggers according to ISO 7243 and OSHA guidelines.

### 2. Hardware Connectivity & Clinical Intake
* **Web Bluetooth API (BLE):** Native browser pairing with standard Bluetooth Low Energy Heart Rate monitors (e.g., Polar, Garmin, Apple Watch BLE broadcaster, Wahoo) via standard GATT Heart Rate Service (`0x180D`).
* **True Standby / Empty State:** Awaits physical sensor connection without hardcoded or fabricated readings. Displays clear disconnected states until telemetry is received.
* **Manual Clinical Entry:** Field medics and shift supervisors can directly input measured vitals (ear/forehead probe temperature, pulse oximeter BPM, shift duration).

### 3. Live Environmental Intelligence (Model B & Open-Meteo)
* **Real-Time GPS Synchronization:** Automatically queries worker site coordinates via browser geolocation (`navigator.geolocation`).
* **Open-Meteo Integration:** Streams live ambient temperature, relative humidity, 10m wind speed, direct solar radiation, and estimated Wet-Bulb Globe Temperature (WBGT).
* **Work Capacity Loss (PWC):** Predicts physical work capacity degradation and outputs prescribed ISO work-to-rest schedules.

### 4. Hydration & Fluid Deficit Monitoring (Model C)
* **Acro-Metabolic Fluid Loss:** Computes acute mass loss percentages, total fluid deficit (L), hourly sweat loss rates, and specific rehydration fluid schedules with electrolyte recommendations.

### 5. Supervisor Console & Incident Escalation
* **Active Incidents Drawer:** Live feed of active heat-strain warnings and emergency medical dispatch notices.
* **Incident Lifecycle:** Supervisor acknowledgment and single-click **"Clear All"** resolution backed by persistent audit logs.
* **Privacy Toggle:** Instant obfuscation of worker names and identifiable biometric data on public/field monitoring displays.

---

## 📁 System Architecture

```text
THERMOSENSE/
├── ai_engine/
│   ├── features/               # Canonical thermal feature extraction pipeline
│   ├── models/                 # Model A, B, C inference engines
│   ├── uncertainty/            # Model D conformal prediction interval engines
│   └── safety_rules.py         # ISO / OSHA occupational safety rule matrix
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI application entrypoint & middleware
│   │   ├── api/v1/             # Endpoints (telemetry, weather, hydration, workers, alerts)
│   │   ├── db/                 # SQLAlchemy ORM models, migrations, SQLite session
│   │   ├── middleware/         # Security headers, rate limiting (120 req/min), timeouts
│   │   ├── schemas/            # Pydantic v2 strict data transfer schemas
│   │   └── services/           # Open-Meteo weather client & AI prediction broker
│   └── requirements.txt        # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js 16 App Router (layout, page, icon.svg, favicon)
│   │   ├── components/         # TelemetryConsole, EnvironmentalView, HydrationStation, WorkerRoster, Header, AlertsDrawer
│   │   ├── lib/api.ts          # Type-safe API client
│   │   └── types/api.ts        # TypeScript data contracts
│   └── package.json            # Frontend dependencies
│
├── tests/                      # 45 production-readiness, security, and inference tests
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm
* Git

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Next.js Turbopack development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

Run the full automated test suite (45 tests covering inference, boundary checks, SQL injection resistance, XSS sanitization, rate limiting, and latency SLAs):

```bash
pytest -v
```

All test runs automatically isolate and clean up test fixtures so operational database records remain pristine.

---

## 🛡️ Security & Compliance Standards
* **Input Sanitization:** Parameterized SQLAlchemy ORM queries and strict Pydantic v2 boundary enforcement.
* **Security Headers:** Strict Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`.
* **Rate Limiting:** Sliding-window in-memory rate limiter (120 requests/minute per client IP).
* **Clinical Disclaimer:** Developed strictly for occupational heat-stress surveillance and worker safety; not a diagnostic medical device.
