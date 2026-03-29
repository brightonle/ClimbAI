from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.hold import Hold
from app.schemas.hold import HoldOut, HoldNearestRequest
from app.services.holds import find_nearest_hold

router = APIRouter()


@router.get("", response_model=list[HoldOut])
def list_holds(
    board_type: str | None = Query(default=None),
    wall_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Hold)
    if board_type:
        query = query.filter(Hold.board_type == board_type)
    if wall_id:
        query = query.filter(Hold.wall_id == wall_id)
    return query.all()


@router.post("/nearest", response_model=HoldOut | None)
def nearest_hold(payload: HoldNearestRequest, db: Session = Depends(get_db)):
    return find_nearest_hold(payload.x, payload.y, db, payload.board_type)
