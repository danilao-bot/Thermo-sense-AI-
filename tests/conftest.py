"""Test configuration and database cleanup fixture."""

import pytest
from backend.app.db.session import SessionLocal
from backend.app.db.models import WorkerModel, SafetyAlertModel

@pytest.fixture(scope="session", autouse=True)
def clean_test_artifacts():
    """Ensures test artifacts do not pollute the operational database."""
    yield
    try:
        db = SessionLocal()
        db.query(WorkerModel).filter(
            (WorkerModel.external_id.like("TEST_%")) |
            (WorkerModel.external_id.like("badge%")) |
            (WorkerModel.external_id.like("XSS_%")) |
            (WorkerModel.external_id.like("BADGE_%")) |
            (WorkerModel.external_id.like("ALERT_%"))
        ).delete(synchronize_session=False)
        db.query(SafetyAlertModel).filter(SafetyAlertModel.acknowledged == False).update({"acknowledged": True})
        db.commit()
        db.close()
    except Exception as e:
        print("Teardown cleanup error:", e)
