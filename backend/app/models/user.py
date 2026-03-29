from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer, Float, ForeignKey, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    routes: Mapped[list["Route"]] = relationship("Route", back_populates="user")
    attempts: Mapped[list["Attempt"]] = relationship("Attempt", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    wingspan_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    ape_index: Mapped[float | None] = mapped_column(Float, nullable=True)

    num_pull_ups: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_chin_ups: Mapped[int | None] = mapped_column(Integer, nullable=True)
    num_push_ups: Mapped[int | None] = mapped_column(Integer, nullable=True)

    climbing_style: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fav_disciplines: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    fav_wall_types: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")
