"""Pydantic schemas for Safety Alerts."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SafetyAlertResponse(BaseModel):
    id: str
    session_id: str
    timestamp: datetime
    alert_type: str
    severity: str
    title: str
    message: str
    action_required: Optional[str]
    acknowledged: bool

    model_config = ConfigDict(from_attributes=True)

class AlertAcknowledgeRequest(BaseModel):
    acknowledged: bool = True
