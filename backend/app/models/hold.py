from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Hold(Base):
    __tablename__ = "holds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wall_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("walls.id", ondelete="CASCADE"), nullable=True, index=True)
    board_type: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)  # 'kilter' for seeded holds

    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    depth: Mapped[str | None] = mapped_column(String(50), nullable=True)
    size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    hold_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    function: Mapped[str | None] = mapped_column(String(100), nullable=True)
    orientation: Mapped[str | None] = mapped_column(String(100), nullable=True)

    wall: Mapped["Wall | None"] = relationship("Wall", back_populates="holds")
    route_holds: Mapped[list["RouteHold"]] = relationship("RouteHold", back_populates="hold")
