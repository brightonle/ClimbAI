"""Reseed Kilter Board holds with complete 16×12 dataset in native Kilter coordinates

Replaces the 476-hold partial dataset (custom coord system) with 641 holds
covering the full 16×12 board in native Kilter coordinates (x: −24–168, y: 0–156).
Data sourced from the Kilter Board Android app SQLite database via boardlib.

Revision ID: 003
Revises: 002
Create Date: 2026-03-29
"""
import os
import csv
from pathlib import Path
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None

CSV_PATH = Path(__file__).parent.parent.parent / "data" / "kilter_board_full.csv"


def upgrade() -> None:
    conn = op.get_bind()

    # Remove existing partial dataset
    conn.execute(sa.text("DELETE FROM holds WHERE board_type = 'kilter'"))

    if not CSV_PATH.exists():
        print(f"WARNING: kilter_board_full.csv not found at {CSV_PATH}. Skipping reseed.")
        return

    holds = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            holds.append({
                "board_type": "kilter",
                "wall_id": None,
                "x": float(row["x"]),
                "y": float(row["y"]),
                "hold_type": row.get("hold_type") or None,
                "function": None,
                "depth": None,
                "orientation": None,
                "size": None,
            })

    if holds:
        conn.execute(
            sa.text(
                "INSERT INTO holds (board_type, wall_id, x, y, hold_type, function, depth, orientation, size) "
                "VALUES (:board_type, :wall_id, :x, :y, :hold_type, :function, :depth, :orientation, :size)"
            ),
            holds,
        )
        print(f"Reseeded {len(holds)} Kilter Board holds (full 16×12 dataset).")


def downgrade() -> None:
    # Re-apply migration 002 data (fall back to old partial dataset)
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM holds WHERE board_type = 'kilter'"))

    old_csv = Path(__file__).parent.parent.parent / "data" / "kilter_board.csv"
    if not old_csv.exists():
        return

    holds = []
    with open(old_csv, newline="", encoding="utf-8") as f:
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
