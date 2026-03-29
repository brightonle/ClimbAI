from pydantic import BaseModel


class HoldOut(BaseModel):
    id: int
    wall_id: int | None
    board_type: str | None
    x: float
    y: float
    depth: str | None
    size: str | None
    hold_type: str | None
    function: str | None
    orientation: str | None

    model_config = {"from_attributes": True}


class HoldNearestRequest(BaseModel):
    x: float
    y: float
    board_type: str | None = "kilter"
