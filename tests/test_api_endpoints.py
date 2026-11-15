"""Integration tests for ThermoSense AI FastAPI Endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"

def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

def test_telemetry_evaluate_endpoint():
    payload = {
        "heart_rate_bpm": 140.0,
        "skin_temp_mean_C": 35.5,
        "air_temp_C": 34.0,
        "relative_humidity_pct": 55.0,
        "work_duration_min": 30.0,
        "clothing_clo": 1.2,
    }
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "core_temp" in data
    assert "point_estimate_C" in data["core_temp"]
    assert 36.0 <= data["core_temp"]["point_estimate_C"] <= 41.0
    assert data["safety_status"] in ["GREEN", "AMBER", "ORANGE", "RED", "EMERGENCY_PURPLE"]
    assert "heat_strain_details" in data
    assert "heat_stroke_details" in data

def test_environmental_evaluate_endpoint():
    payload = {
        "air_temp_C": 38.0,
        "relative_humidity_pct": 65.0,
        "wind_speed_m_s": 0.3,
        "solar_radiation_W_m2": 500.0,
        "clothing_clo": 1.2,
        "work_duration_min": 60.0,
    }
    resp = client.post("/api/v1/environmental/evaluate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "pwc_loss" in data
    assert 0.0 <= data["pwc_loss"]["point_estimate_pct"] <= 100.0
    assert data["environmental_risk_level"] in ["Low Risk", "Moderate Risk", "High Risk", "Extreme Risk"]

def test_hydration_calculate_endpoint():
    payload = {
        "pre_mass_kg": 80.0,
        "post_mass_kg": 78.0,
        "work_duration_min": 60.0,
    }
    resp = client.post("/api/v1/hydration/calculate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["body_mass_loss_pct"] == 2.5
    assert data["fluid_loss_liters"] == 2.0
    assert "Moderate Dehydration" in data["hydration_status"]

def test_workers_and_sessions_flow():
    # 1. Register a worker
    worker_payload = {
        "external_id": f"TEST_W_{id(object())}",
        "full_name": "Test Worker Alpha",
        "age_yrs": 34,
        "sex": "M",
        "body_mass_kg": 78.0,
        "height_cm": 180.0,
        "acclimation_status": 1,
    }
    r_w = client.post("/api/v1/workers/", json=worker_payload)
    assert r_w.status_code == 201
    worker_id = r_w.json()["id"]

    # 2. Start a work session
    sess_payload = {
        "worker_id": worker_id,
        "clothing_type": "heavy_ppe",
        "clothing_clo": 1.4,
        "workload_intensity": "heavy",
        "location_name": "Site Beta Test",
    }
    r_s = client.post("/api/v1/sessions/start", json=sess_payload)
    assert r_s.status_code == 201
    session_id = r_s.json()["id"]

    # 3. Stream a telemetry reading with session_id
    telemetry_payload = {
        "session_id": session_id,
        "heart_rate_bpm": 150.0,
        "skin_temp_mean_C": 36.0,
        "work_duration_min": 20.0,
    }
    r_t = client.post("/api/v1/telemetry/evaluate", json=telemetry_payload)
    assert r_t.status_code == 200

    # 4. End the session with mass loss
    end_payload = {
        "pre_mass_kg": 78.0,
        "post_mass_kg": 77.1,
    }
    r_e = client.post(f"/api/v1/sessions/{session_id}/end", json=end_payload)
    assert r_e.status_code == 200
    assert r_e.json()["status"] == "completed"
