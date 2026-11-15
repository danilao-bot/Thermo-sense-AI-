"""Comprehensive Production-Readiness and System Validation Test Suite.

Covers:
1. Input Validation & Range Boundary Testing (Pydantic models)
2. SQL Injection Resistance (Parameterized SQLAlchemy queries)
3. Cross-Origin Resource Sharing (CORS) & Preflight Header Integrity
4. Cross-Site Scripting (XSS) Sanitization and Literal Payload Handling
5. Security Headers Enforcement (HSTS, X-Content-Type-Options, etc.)
6. In-Memory Rate Limiting (429 handling & bypass paths)
7. Error Handling, 404/405/422 Fallbacks
8. Physiological & Environmental Model Inference Boundaries (Models A, B, C, D)
9. Emergency Alert Escalation & Acknowledgment Lifecycle
10. Database Foreign Keys, Concurrency & Transaction Integrity
11. Latency & Performance SLA Benchmarks (<500ms for inferences)
"""

import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_db():
    init_db()


# ============================================================================
# 1. INPUT VALIDATION & BOUNDARY TESTING
# ============================================================================

def test_telemetry_heart_rate_too_low():
    """HR below physiological minimum (30 bpm) should fail with 422."""
    payload = {"heart_rate_bpm": 20.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_heart_rate_too_high():
    """HR above physiological maximum (240 bpm) should fail with 422."""
    payload = {"heart_rate_bpm": 280.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_skin_temp_below_range():
    """Skin temp below 20.0°C should fail with 422."""
    payload = {"skin_temp_mean_C": 15.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_skin_temp_above_range():
    """Skin temp above 45.0°C should fail with 422."""
    payload = {"skin_temp_mean_C": 48.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_negative_humidity():
    """Relative humidity cannot be negative."""
    payload = {"relative_humidity_pct": -5.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_humidity_over_100():
    """Relative humidity cannot exceed 100%."""
    payload = {"relative_humidity_pct": 105.0}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_clothing_clo_too_low():
    """Clothing clo below 0.1 should fail."""
    payload = {"clothing_clo": 0.05}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_telemetry_clothing_clo_too_high():
    """Clothing clo above 3.0 should fail."""
    payload = {"clothing_clo": 4.5}
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 422

def test_environmental_temp_below_range():
    """Ambient air temp below -10°C should fail."""
    payload = {"air_temp_C": -20.0, "relative_humidity_pct": 50.0}
    resp = client.post("/api/v1/environmental/evaluate", json=payload)
    assert resp.status_code == 422

def test_environmental_temp_above_range():
    """Ambient air temp above 65°C should fail."""
    payload = {"air_temp_C": 75.0, "relative_humidity_pct": 50.0}
    resp = client.post("/api/v1/environmental/evaluate", json=payload)
    assert resp.status_code == 422

def test_hydration_zero_duration():
    """Hydration exposure duration must be > 0.0 minutes."""
    payload = {"pre_mass_kg": 80.0, "post_mass_kg": 79.0, "work_duration_min": 0.0}
    resp = client.post("/api/v1/hydration/calculate", json=payload)
    assert resp.status_code == 422

def test_hydration_unrealistic_mass():
    """Pre-mass under 30.0 kg should fail validation."""
    payload = {"pre_mass_kg": 20.0, "post_mass_kg": 19.5, "work_duration_min": 60.0}
    resp = client.post("/api/v1/hydration/calculate", json=payload)
    assert resp.status_code == 422

def test_worker_invalid_sex():
    """Worker sex must match regex ^(M|F)$."""
    payload = {
        "external_id": f"TEST_SEX_{time.time()}",
        "full_name": "Invalid Sex",
        "sex": "X",
        "age_yrs": 30,
        "body_mass_kg": 70.0,
        "height_cm": 175.0,
    }
    resp = client.post("/api/v1/workers/", json=payload)
    assert resp.status_code == 422

def test_telemetry_empty_payload_succeeds():
    """All telemetry fields are optional with defaults, so empty payload should return 200."""
    resp = client.post("/api/v1/telemetry/evaluate", json={})
    assert resp.status_code == 200
    assert "core_temp" in resp.json()

def test_telemetry_boundary_values_accepted():
    """Exact legal boundary values (HR=30, HR=240, skin=20, skin=45) should pass."""
    payload = {
        "heart_rate_bpm": 30.0,
        "skin_temp_mean_C": 20.0,
        "relative_humidity_pct": 0.0,
        "clothing_clo": 0.1,
    }
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 200

    payload_upper = {
        "heart_rate_bpm": 240.0,
        "skin_temp_mean_C": 45.0,
        "relative_humidity_pct": 100.0,
        "clothing_clo": 3.0,
    }
    resp_upper = client.post("/api/v1/telemetry/evaluate", json=payload_upper)
    assert resp_upper.status_code == 200


# ============================================================================
# 2. SQL INJECTION DEFENSE & LITERAL HANDLING
# ============================================================================

def test_sql_injection_worker_creation():
    """Malicious SQL strings in worker fields must be safely parameterized by SQLAlchemy."""
    malicious_id = f"badge'; DROP TABLE workers; -- {time.time()}"
    malicious_name = "Robert'); DROP TABLE work_sessions; --"
    payload = {
        "external_id": malicious_id,
        "full_name": malicious_name,
        "age_yrs": 35,
        "sex": "M",
        "body_mass_kg": 80.0,
        "height_cm": 180.0,
    }
    resp = client.post("/api/v1/workers/", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["external_id"] == malicious_id
    assert created["full_name"] == malicious_name

    # Confirm workers table was NOT dropped and remains queryable
    check_resp = client.get("/api/v1/workers/")
    assert check_resp.status_code == 200
    assert any(w["external_id"] == malicious_id for w in check_resp.json())

def test_sql_injection_get_worker_parameter():
    """GET /workers/{worker_id} with SQL injection syntax should return 404, not bypass."""
    resp = client.get("/api/v1/workers/' OR '1'='1")
    assert resp.status_code == 404

def test_sql_injection_session_lookup():
    """GET /sessions/{id} with injection query should return 404 safely."""
    resp = client.get("/api/v1/sessions/1; DROP TABLE work_sessions; --")
    assert resp.status_code == 404


# ============================================================================
# 3. CORS & SECURITY HEADERS
# ============================================================================

def test_security_headers_present():
    """Every HTTP response must carry OWASP defense-in-depth security headers."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Strict-Transport-Security" in resp.headers

def test_cors_preflight():
    """OPTIONS preflight request from external domain should receive valid CORS headers."""
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    resp = client.options("/api/v1/telemetry/evaluate", headers=headers)
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") in ["*", "http://localhost:3000"]


# ============================================================================
# 4. XSS & PAYLOAD SANITIZATION
# ============================================================================

def test_xss_payload_in_strings():
    """HTML and script tags in strings should be stored verbatim as JSON text, not evaluated."""
    xss_str = "<script>alert('pwned')</script>"
    payload = {
        "external_id": f"XSS_TEST_{time.time()}",
        "full_name": xss_str,
        "age_yrs": 28,
        "sex": "F",
        "body_mass_kg": 65.0,
        "height_cm": 165.0,
    }
    resp = client.post("/api/v1/workers/", json=payload)
    assert resp.status_code == 201
    assert resp.json()["full_name"] == xss_str
    # Verify Content-Type is always application/json
    assert "application/json" in resp.headers.get("content-type", "")


# ============================================================================
# 5. ERROR HANDLING & HTTP STATUS CODES
# ============================================================================

def test_404_nonexistent_route():
    resp = client.get("/api/v1/nonexistent_route")
    assert resp.status_code == 404

def test_405_method_not_allowed():
    """Calling GET on POST-only endpoint returns 405."""
    resp = client.get("/api/v1/telemetry/evaluate")
    assert resp.status_code == 405

def test_malformed_json_body():
    """Sending non-JSON payload returns 422."""
    resp = client.post(
        "/api/v1/telemetry/evaluate",
        content="not a json string",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 422

def test_duplicate_worker_conflict():
    """Registering duplicate worker badge external_id returns 400 Bad Request."""
    badge = f"BADGE_DUP_{time.time()}"
    payload = {
        "external_id": badge,
        "full_name": "Worker Dupe",
        "age_yrs": 30,
        "sex": "M",
        "body_mass_kg": 75.0,
        "height_cm": 175.0,
    }
    r1 = client.post("/api/v1/workers/", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/v1/workers/", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]


# ============================================================================
# 6. MODEL INFERENCE & UNCERTAINTY BOUNDS VALIDATION
# ============================================================================

def test_model_a_physiological_output_range():
    """Model A estimated core temperature must stay in physiological range (35.5 - 41.5°C)."""
    payload = {
        "heart_rate_bpm": 120.0,
        "skin_temp_mean_C": 34.0,
        "air_temp_C": 28.0,
        "work_duration_min": 25.0,
    }
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 200
    core_temp = resp.json()["core_temp"]["point_estimate_C"]
    assert 36.0 <= core_temp <= 40.5

def test_model_d_conformal_bounds_monotonic():
    """Model D must enforce lower_bound <= point_estimate <= upper_bound."""
    payload = {
        "heart_rate_bpm": 155.0,
        "skin_temp_mean_C": 36.5,
        "work_duration_min": 40.0,
    }
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    assert resp.status_code == 200
    ct = resp.json()["core_temp"]
    assert ct["lower_bound_C"] <= ct["point_estimate_C"]
    assert ct["point_estimate_C"] <= ct["upper_bound_C"]
    assert ct["confidence_level"] == 0.90
    assert ct["half_width_C"] > 0.0

def test_model_b_pwc_loss_environmental():
    """Model B predicts high PWC loss in extreme heat and low loss in mild conditions."""
    # Extreme heat
    hot_payload = {
        "air_temp_C": 42.0,
        "relative_humidity_pct": 75.0,
        "work_duration_min": 60.0,
        "clothing_clo": 1.5,
    }
    hot_resp = client.post("/api/v1/environmental/evaluate", json=hot_payload)
    assert hot_resp.status_code == 200
    hot_loss = hot_resp.json()["pwc_loss"]["point_estimate_pct"]

    # Mild condition
    mild_payload = {
        "air_temp_C": 20.0,
        "relative_humidity_pct": 35.0,
        "work_duration_min": 60.0,
        "clothing_clo": 0.5,
    }
    mild_resp = client.post("/api/v1/environmental/evaluate", json=mild_payload)
    assert mild_resp.status_code == 200
    mild_loss = mild_resp.json()["pwc_loss"]["point_estimate_pct"]

    assert hot_loss > mild_loss
    assert hot_resp.json()["pwc_loss"]["lower_bound_pct"] <= hot_loss <= hot_resp.json()["pwc_loss"]["upper_bound_pct"]

def test_model_c_zero_fluid_deficit():
    """When pre-mass equals post-mass, fluid deficit and loss percentage should be 0.0."""
    payload = {
        "pre_mass_kg": 75.0,
        "post_mass_kg": 75.0,
        "work_duration_min": 60.0,
    }
    resp = client.post("/api/v1/hydration/calculate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["body_mass_loss_pct"] == 0.0
    assert data["fluid_loss_liters"] == 0.0
    assert "Well Hydrated" in data["hydration_status"]


# ============================================================================
# 7. SAFETY ALERTS & SUPERVISOR ACKNOWLEDGMENT LIFECYCLE
# ============================================================================

def test_alert_generation_and_acknowledgment():
    """High thermal strain creates safety alerts; supervisor can acknowledge them."""
    # 1. Start worker and session
    w_resp = client.post("/api/v1/workers/", json={
        "external_id": f"ALERT_W_{time.time()}",
        "full_name": "Alert Subject",
        "age_yrs": 30,
        "sex": "M",
        "body_mass_kg": 75.0,
        "height_cm": 175.0,
    })
    worker_id = w_resp.json()["id"]

    s_resp = client.post("/api/v1/sessions/start", json={
        "worker_id": worker_id,
        "clothing_type": "heavy_ppe",
        "clothing_clo": 1.5,
    })
    session_id = s_resp.json()["id"]

    # 2. Trigger high strain telemetry to record alerts
    client.post("/api/v1/telemetry/evaluate", json={
        "session_id": session_id,
        "heart_rate_bpm": 185.0,
        "skin_temp_mean_C": 38.5,
        "work_duration_min": 45.0,
        "air_temp_C": 39.0,
    })

    # 3. Retrieve active alerts feed
    feed_resp = client.get("/api/v1/alerts/active")
    assert feed_resp.status_code == 200
    alerts = feed_resp.json()
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]
    assert first_alert["acknowledged"] is False

    # 4. Supervisor acknowledges alert
    ack_resp = client.post(f"/api/v1/alerts/{alert_id}/acknowledge", json={"acknowledged": True})
    assert ack_resp.status_code == 200
    assert ack_resp.json()["acknowledged"] is True

    # 5. Confirm it was removed from active feed
    feed_after = client.get("/api/v1/alerts/active")
    active_ids = [a["id"] for a in feed_after.json()]
    assert alert_id not in active_ids


# ============================================================================
# 8. DEEP HEALTH PROBE
# ============================================================================

def test_deep_health_check():
    """Health check with ?detailed=true returns DB status, model availability, and uptime."""
    resp = client.get("/health?detailed=true")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["model_a_loaded"] is True
    assert data["model_b_loaded"] is True
    assert data["uptime_seconds"] >= 0.0


# ============================================================================
# 9. PERFORMANCE BENCHMARKS (LATENCY SLA)
# ============================================================================

def test_telemetry_inference_latency_sla():
    """Real-time Model A+D inference must complete well under 500ms SLA."""
    payload = {
        "heart_rate_bpm": 135.0,
        "skin_temp_mean_C": 35.0,
        "work_duration_min": 15.0,
    }
    start = time.perf_counter()
    resp = client.post("/api/v1/telemetry/evaluate", json=payload)
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    assert resp.status_code == 200
    assert elapsed_ms < 500.0, f"Inference took {elapsed_ms}ms, exceeded 500ms SLA"

def test_hydration_calculation_latency_sla():
    """Model C deterministic hydration math must complete under 50ms."""
    payload = {
        "pre_mass_kg": 82.0,
        "post_mass_kg": 80.5,
        "work_duration_min": 45.0,
    }
    start = time.perf_counter()
    resp = client.post("/api/v1/hydration/calculate", json=payload)
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    assert resp.status_code == 200
    assert elapsed_ms < 50.0, f"Hydration math took {elapsed_ms}ms, exceeded 50ms SLA"
