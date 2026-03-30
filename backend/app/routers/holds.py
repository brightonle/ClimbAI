from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.hold import Hold
from app.models.route_hold import RouteHold
from app.models.route import Route as RouteModel
from app.schemas.hold import HoldOut, HoldNearestRequest
from app.services.holds import find_nearest_hold

router = APIRouter()


@router.get("/heatmap")
def get_heatmap(grade: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = (
        db.query(Hold.id, Hold.x, Hold.y, func.count(RouteHold.id).label("count"))
        .join(RouteHold, Hold.id == RouteHold.hold_id)
    )
    if grade:
        q = q.join(RouteModel, RouteModel.id == RouteHold.route_id).filter(
            RouteModel.difficulty_grade == grade
        )
    rows = q.group_by(Hold.id, Hold.x, Hold.y).all()
    if not rows:
        return []
    max_count = max(r.count for r in rows)
    return [
        {"hold_id": r.id, "x": r.x, "y": r.y, "count": r.count, "intensity": r.count / max_count}
        for r in rows
    ]


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
