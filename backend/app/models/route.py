from datetime import datetime
from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wall_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("walls.id", ondelete="SET NULL"), nullable=True, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty_grade: Mapped[str | None] = mapped_column(String(20), nullable=True)
    wall_angle: Mapped[float | None] = mapped_column(Float, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="routes")
    wall: Mapped["Wall | None"] = relationship("Wall", back_populates="routes")
    route_holds: Mapped[list["RouteHold"]] = relationship(
        "RouteHold", back_populates="route", order_by="RouteHold.position_in_route", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["Attempt"]] = relationship("Attempt", back_populates="route")
