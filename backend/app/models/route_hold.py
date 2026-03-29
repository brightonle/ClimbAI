from sqlalchemy import Integer, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RouteHold(Base):
    __tablename__ = "route_holds"
    __table_args__ = (UniqueConstraint("route_id", "position_in_route", name="uq_route_position"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    hold_id: Mapped[int] = mapped_column(Integer, ForeignKey("holds.id", ondelete="CASCADE"), nullable=False, index=True)
    position_in_route: Mapped[int] = mapped_column(Integer, nullable=False)
    foot_restriction: Mapped[bool] = mapped_column(Boolean, default=False)

    route: Mapped["Route"] = relationship("Route", back_populates="route_holds")
    hold: Mapped["Hold"] = relationship("Hold", back_populates="route_holds")
