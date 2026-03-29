from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attempt import Attempt
from app.models.route import Route
from app.models.user import User
from app.schemas.attempt import AttemptCreate, AttemptOut, AttemptStats
from app.services.auth import get_current_user
from app.services.analytics import get_attempt_stats

router = APIRouter()


@router.post("", response_model=AttemptOut, status_code=status.HTTP_201_CREATED)
def log_attempt(
    payload: AttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(Route).filter(Route.id == payload.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    attempt = Attempt(
        user_id=current_user.id,
        route_id=payload.route_id,
        success=payload.success,
        notes=payload.notes,
        duration_seconds=payload.duration_seconds,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("", response_model=list[AttemptOut])
def list_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Attempt)
        .filter(Attempt.user_id == current_user.id)
        .order_by(Attempt.attempted_at.desc())
        .all()
    )


@router.get("/stats", response_model=AttemptStats)
def attempt_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_attempt_stats(current_user.id, db)
