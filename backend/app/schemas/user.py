from datetime import datetime
from pydantic import BaseModel, EmailStr


class ProfileBase(BaseModel):
    gender: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    wingspan_cm: float | None = None
    ape_index: float | None = None
    num_pull_ups: int | None = None
    num_chin_ups: int | None = None
    num_push_ups: int | None = None
    climbing_style: str | None = None
    fav_disciplines: list[str] | None = None
    fav_wall_types: list[str] | None = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime
    profile: ProfileOut | None = None

    model_config = {"from_attributes": True}
