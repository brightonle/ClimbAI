import math
from sqlalchemy.orm import Session
from app.models.hold import Hold


def find_nearest_hold(x: float, y: float, db: Session, board_type: str | None = "kilter") -> Hold | None:
    query = db.query(Hold)
    if board_type:
        query = query.filter(Hold.board_type == board_type)

    holds = query.all()
    if not holds:
        return None

    return min(holds, key=lambda h: math.sqrt((h.x - x) ** 2 + (h.y - y) ** 2))
