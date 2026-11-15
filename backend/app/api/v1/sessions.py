"""Work Sessions & Shifts Router."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas.session import SessionStart, SessionEnd, SessionResponse
from backend.app.db.session import get_db
from backend.app.db.models import WorkSessionModel, WorkerModel, HydrationLogModel
from backend.app.services.prediction_service import PredictionService
from backend.app.schemas.hydration import HydrationCheckRequest

router = APIRouter(prefix="/sessions", tags=["Work Sessions & Shifts"])

@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(payload: SessionStart, db: Session = Depends(get_db)):
    """Starts a new occupational heat exposure shift."""
    worker = db.query(WorkerModel).filter(
        (WorkerModel.id == payload.worker_id) | (WorkerModel.external_id == payload.worker_id)
    ).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")

    session = WorkSessionModel(
        worker_id=worker.id,
        clothing_type=payload.clothing_type,
        clothing_clo=payload.clothing_clo,
        workload_intensity=payload.workload_intensity,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/{session_id}/end", response_model=SessionResponse)
def end_session(session_id: str, payload: SessionEnd, db: Session = Depends(get_db)):
    """Completes an active work session and logs final hydration loss if pre/post mass is provided."""
    session = db.query(WorkSessionModel).filter(WorkSessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    end_t = datetime.now(timezone.utc).replace(tzinfo=None)
    session.end_time = end_t
    session.status = "completed"

    if payload.pre_mass_kg and payload.post_mass_kg and session.start_time:
        start_t = session.start_time
        if start_t.tzinfo is not None:
            start_t = start_t.replace(tzinfo=None)

        duration_min = max(1.0, (end_t - start_t).total_seconds() / 60.0)
        hydro = PredictionService.calculate_hydration(
            HydrationCheckRequest(
                pre_mass_kg=payload.pre_mass_kg,
                post_mass_kg=payload.post_mass_kg,
                work_duration_min=duration_min,
            )
        )
        log = HydrationLogModel(
            session_id=session.id,
            pre_mass_kg=payload.pre_mass_kg,
            post_mass_kg=payload.post_mass_kg,
            mass_loss_pct=hydro["body_mass_loss_pct"],
            fluid_deficit_L=hydro["fluid_loss_liters"],
            loss_rate_L_hr=hydro["loss_rate_L_hr"],
            replacement_target_L=hydro["fluid_loss_liters"] * 1.5,
            status=hydro["hydration_status"],
        )
        db.add(log)

    db.commit()
    db.refresh(session)
    return session

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Fetches details for a specific work shift."""
    session = db.query(WorkSessionModel).filter(WorkSessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session
