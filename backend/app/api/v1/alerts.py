"""Safety Alerts & Incidents Router."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.schemas.alert import SafetyAlertResponse, AlertAcknowledgeRequest
from backend.app.db.session import get_db
from backend.app.db.models import SafetyAlertModel

router = APIRouter(prefix="/alerts", tags=["Safety Alerts & Incident Feed"])

@router.get("/active", response_model=List[SafetyAlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    """Retrieves unacknowledged safety alerts for supervisor dashboard feeds."""
    return db.query(SafetyAlertModel).filter(SafetyAlertModel.acknowledged == False).order_by(
        SafetyAlertModel.timestamp.desc()
    ).limit(50).all()

@router.post("/clear-all")
def clear_all_alerts(db: Session = Depends(get_db)):
    """Marks all unacknowledged alerts as acknowledged or cleared."""
    db.query(SafetyAlertModel).filter(SafetyAlertModel.acknowledged == False).update({"acknowledged": True})
    db.commit()
    return {"message": "All alerts cleared successfully", "status": "ok"}

@router.post("/{alert_id}/acknowledge", response_model=SafetyAlertResponse)
def acknowledge_alert(alert_id: str, payload: AlertAcknowledgeRequest, db: Session = Depends(get_db)):
    """Marks a safety alert as seen/acknowledged by a supervisor."""
    alert = db.query(SafetyAlertModel).filter(SafetyAlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.acknowledged = payload.acknowledged
    db.commit()
    db.refresh(alert)
    return alert
