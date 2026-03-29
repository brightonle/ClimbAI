"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("gender", sa.String(50), nullable=True),
        sa.Column("height_cm", sa.Float(), nullable=True),
        sa.Column("weight_kg", sa.Float(), nullable=True),
        sa.Column("wingspan_cm", sa.Float(), nullable=True),
        sa.Column("ape_index", sa.Float(), nullable=True),
        sa.Column("num_pull_ups", sa.Integer(), nullable=True),
        sa.Column("num_chin_ups", sa.Integer(), nullable=True),
        sa.Column("num_push_ups", sa.Integer(), nullable=True),
        sa.Column("climbing_style", sa.String(100), nullable=True),
        sa.Column("fav_disciplines", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("fav_wall_types", postgresql.ARRAY(sa.String()), nullable=True),
    )

    op.create_table(
        "walls",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_path", sa.String(500), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "holds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("wall_id", sa.Integer(), sa.ForeignKey("walls.id", ondelete="CASCADE"), nullable=True),
        sa.Column("board_type", sa.String(50), nullable=True),
        sa.Column("x", sa.Float(), nullable=False),
        sa.Column("y", sa.Float(), nullable=False),
        sa.Column("depth", sa.String(50), nullable=True),
        sa.Column("size", sa.String(50), nullable=True),
        sa.Column("hold_type", sa.String(100), nullable=True),
        sa.Column("function", sa.String(100), nullable=True),
        sa.Column("orientation", sa.String(100), nullable=True),
    )
    op.create_index("ix_holds_wall_id", "holds", ["wall_id"])
    op.create_index("ix_holds_board_type", "holds", ["board_type"])

    op.create_table(
        "routes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("wall_id", sa.Integer(), sa.ForeignKey("walls.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("difficulty_grade", sa.String(20), nullable=True),
        sa.Column("wall_angle", sa.Float(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_routes_user_id", "routes", ["user_id"])
    op.create_index("ix_routes_wall_id", "routes", ["wall_id"])

    op.create_table(
        "route_holds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("route_id", sa.Integer(), sa.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hold_id", sa.Integer(), sa.ForeignKey("holds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position_in_route", sa.Integer(), nullable=False),
        sa.Column("foot_restriction", sa.Boolean(), nullable=False, server_default="false"),
        sa.UniqueConstraint("route_id", "position_in_route", name="uq_route_position"),
    )
    op.create_index("ix_route_holds_route_id", "route_holds", ["route_id"])
    op.create_index("ix_route_holds_hold_id", "route_holds", ["hold_id"])

    op.create_table(
        "attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("route_id", sa.Integer(), sa.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("attempted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_attempts_user_id", "attempts", ["user_id"])
    op.create_index("ix_attempts_route_id", "attempts", ["route_id"])


def downgrade() -> None:
    op.drop_table("attempts")
    op.drop_table("route_holds")
    op.drop_table("routes")
    op.drop_table("holds")
    op.drop_table("walls")
    op.drop_table("profiles")
    op.drop_table("users")
