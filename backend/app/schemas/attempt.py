from datetime import datetime
from pydantic import BaseModel


class AttemptCreate(BaseModel):
    route_id: int
    success: bool
    notes: str | None = None
    duration_seconds: int | None = None


class AttemptOut(BaseModel):
    id: int
    user_id: int
    route_id: int
    success: bool
    notes: str | None
    duration_seconds: int | None
    attempted_at: datetime

    model_config = {"from_attributes": True}


class GradeStat(BaseModel):
    grade: str
    attempts: int
    sends: int


class WeeklyStat(BaseModel):
    week: str
    rate: float
    attempts: int


class TopRoute(BaseModel):
    route_id: int
    route_name: str
    attempts: int
    sends: int


class AttemptStats(BaseModel):
    grade_pyramid: list[GradeStat]
    success_rate_over_time: list[WeeklyStat]
    top_routes: list[TopRoute]
    total_attempts: int
    total_sends: int
