from datetime import datetime
from pydantic import BaseModel
from app.schemas.hold import HoldOut


class HoldInSequence(BaseModel):
    hold_id: int
    position_in_route: int
    foot_restriction: bool = False


class RouteCreate(BaseModel):
    name: str
    difficulty_grade: str | None = None
    wall_angle: float | None = None
    description: str | None = None
    wall_id: int | None = None
    holds: list[HoldInSequence]


class RouteHoldOut(BaseModel):
    id: int
    hold_id: int
    position_in_route: int
    foot_restriction: bool
    hold: HoldOut

    model_config = {"from_attributes": True}


class RouteOut(BaseModel):
    id: int
    user_id: int
    wall_id: int | None
    name: str
    difficulty_grade: str | None
    wall_angle: float | None
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RouteDetail(RouteOut):
    route_holds: list[RouteHoldOut]
