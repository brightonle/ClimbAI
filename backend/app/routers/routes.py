from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.route import Route
from app.models.route_hold import RouteHold
from app.models.hold import Hold
from app.models.user import User
from app.schemas.route import RouteCreate, RouteOut, RouteDetail
from app.services.auth import get_current_user
from app.services.graph import graph_service

router = APIRouter()


class PredictRequest(BaseModel):
    hold_ids: list[int]
    wall_angle: float | None = None


@router.post("/predict")
def predict_difficulty(
    payload: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.difficulty_predictor import predict_grade

    hold_objs = db.query(Hold).filter(Hold.id.in_(payload.hold_ids)).all()
    hold_map = {h.id: h for h in hold_objs}
    hold_data = [
        {
            "x": hold_map[hid].x,
            "y": hold_map[hid].y,
            "hold_type": hold_map[hid].hold_type,
            "foot_restriction": False,
        }
        for hid in payload.hold_ids
        if hid in hold_map
    ]
    return predict_grade(hold_data, payload.wall_angle, db)


@router.post("", response_model=RouteDetail, status_code=status.HTTP_201_CREATED)
def create_route(
    payload: RouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate all hold IDs exist and fetch full objects for Neo4j
    hold_ids = [h.hold_id for h in payload.holds]
    hold_objects = db.query(Hold).filter(Hold.id.in_(set(hold_ids))).all()
    if len(hold_objects) != len(set(hold_ids)):
        raise HTTPException(status_code=400, detail="One or more hold IDs are invalid")
    hold_map = {h.id: h for h in hold_objects}

    route = Route(
        user_id=current_user.id,
        wall_id=payload.wall_id,
        name=payload.name,
        difficulty_grade=payload.difficulty_grade,
        wall_angle=payload.wall_angle,
        description=payload.description,
    )
    db.add(route)
    db.flush()

    for h in payload.holds:
        rh = RouteHold(
            route_id=route.id,
            hold_id=h.hold_id,
            position_in_route=h.position_in_route,
            foot_restriction=h.foot_restriction,
        )
        db.add(rh)

    db.commit()
    db.refresh(route)

    try:
        holds_for_graph = [
            {
                "hold_id": h.hold_id,
                "x": hold_map[h.hold_id].x,
                "y": hold_map[h.hold_id].y,
                "hold_type": hold_map[h.hold_id].hold_type or "unknown",
                "position": h.position_in_route,
            }
            for h in sorted(payload.holds, key=lambda x: x.position_in_route)
        ]
        graph_service.write_route(route.id, holds_for_graph)
    except Exception:
        pass  # never fail the request if Neo4j is down

    return _load_route_detail(route.id, db)


@router.get("", response_model=list[RouteOut])
def list_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Route).filter(Route.user_id == current_user.id).order_by(Route.created_at.desc()).all()


@router.get("/{route_id}/similar", response_model=list[RouteOut])
def get_similar_routes(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    try:
        similar_ids = graph_service.find_similar_routes(route_id)
    except Exception:
        return []
    if not similar_ids:
        return []
    return db.query(Route).filter(Route.id.in_(similar_ids)).all()


@router.get("/{route_id}", response_model=RouteDetail)
def get_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(Route).filter(Route.id == route_id, Route.user_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return _load_route_detail(route_id, db)


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(Route).filter(Route.id == route_id, Route.user_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()


def _load_route_detail(route_id: int, db: Session) -> Route:
    return (
        db.query(Route)
        .options(joinedload(Route.route_holds).joinedload(RouteHold.hold))
        .filter(Route.id == route_id)
        .one()
    )
