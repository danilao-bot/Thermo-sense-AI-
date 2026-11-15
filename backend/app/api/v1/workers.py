"""Worker Profiles Management Router."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.schemas.worker import WorkerCreate, WorkerResponse
from backend.app.db.session import get_db
from backend.app.db.models import WorkerModel

router = APIRouter(prefix="/workers", tags=["Worker Profiles"])

@router.post("/", response_model=WorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(payload: WorkerCreate, db: Session = Depends(get_db)):
    """Registers a new worker profile."""
    existing = db.query(WorkerModel).filter(WorkerModel.external_id == payload.external_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Worker with external_id {payload.external_id} already exists.")

    h_m = payload.height_cm / 100.0
    bmi = payload.body_mass_kg / (h_m * h_m) if h_m > 0 else None

    worker = WorkerModel(
        external_id=payload.external_id,
        full_name=payload.full_name,
        age_yrs=payload.age_yrs,
        sex=payload.sex,
        body_mass_kg=payload.body_mass_kg,
        height_cm=payload.height_cm,
        bmi=round(bmi, 1) if bmi else None,
        body_fat_pct=payload.body_fat_pct,
        vo2peak_ml_kg_min=payload.vo2peak_ml_kg_min,
        acclimation_status=payload.acclimation_status,
    )
    db.add(worker)
    db.commit()
    db.refresh(worker)
    return worker

@router.get("/", response_model=List[WorkerResponse])
def list_workers(db: Session = Depends(get_db)):
    """Lists all registered workers."""
    return db.query(WorkerModel).all()

@router.get("/{worker_id}", response_model=WorkerResponse)
def get_worker(worker_id: str, db: Session = Depends(get_db)):
    """Fetches a specific worker by ID or external_id."""
    worker = db.query(WorkerModel).filter(
        (WorkerModel.id == worker_id) | (WorkerModel.external_id == worker_id)
    ).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    return worker
