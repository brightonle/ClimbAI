from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.route import Route
from app.models.route_hold import RouteHold
from app.models.hold import Hold
from app.models.user import User
from app.schemas.route import RouteCreate, RouteOut, RouteDetail
from app.services.auth import get_current_user

router = APIRouter()


@router.post("", response_model=RouteDetail, status_code=status.HTTP_201_CREATED)
def create_route(
    payload: RouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate all hold IDs exist
    hold_ids = [h.hold_id for h in payload.holds]
    found = db.query(Hold.id).filter(Hold.id.in_(hold_ids)).all()
    if len(found) != len(set(hold_ids)):
        raise HTTPException(status_code=400, detail="One or more hold IDs are invalid")

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
    return _load_route_detail(route.id, db)


@router.get("", response_model=list[RouteOut])
def list_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Route).filter(Route.user_id == current_user.id).order_by(Route.created_at.desc()).all()


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
