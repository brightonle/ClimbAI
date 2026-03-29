"""Seed Kilter Board holds from kilter_board.csv

Revision ID: 002
Revises: 001
Create Date: 2026-03-29
"""
import os
import csv
from pathlib import Path
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None

CSV_PATH = Path(__file__).parent.parent.parent / "data" / "kilter_board.csv"


def upgrade() -> None:
    if not CSV_PATH.exists():
        print(f"WARNING: kilter_board.csv not found at {CSV_PATH}. Skipping seed.")
        return

    conn = op.get_bind()
    holds = []

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            holds.append({
                "board_type": "kilter",
                "wall_id": None,
                "x": float(row["x_coordinate"]),
                "y": float(row["y_coordinate"]),
                "hold_type": row.get("type") or None,
                "function": row.get("function") or None,
                "depth": str(row["depth"]) if row.get("depth") not in (None, "") else None,
                "orientation": str(row["orientation"]) if row.get("orientation") not in (None, "") else None,
                "size": str(row["size"]) if row.get("size") not in (None, "") else None,
            })

    if holds:
        conn.execute(
            sa.text(
                "INSERT INTO holds (board_type, wall_id, x, y, hold_type, function, depth, orientation, size) "
                "VALUES (:board_type, :wall_id, :x, :y, :hold_type, :function, :depth, :orientation, :size)"
            ),
            holds,
        )
        print(f"Seeded {len(holds)} Kilter Board holds.")


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM holds WHERE board_type = 'kilter'"))
