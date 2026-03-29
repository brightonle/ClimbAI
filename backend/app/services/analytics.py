from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.attempt import Attempt
from app.models.route import Route
from app.schemas.attempt import AttemptStats, GradeStat, WeeklyStat, TopRoute


def get_attempt_stats(user_id: int, db: Session) -> AttemptStats:
    # Grade pyramid: attempts and sends grouped by difficulty_grade
    grade_rows = (
        db.query(
            Route.difficulty_grade,
            func.count(Attempt.id).label("attempts"),
            func.sum(case((Attempt.success == True, 1), else_=0)).label("sends"),
        )
        .join(Attempt, Attempt.route_id == Route.id)
        .filter(Attempt.user_id == user_id, Route.difficulty_grade.isnot(None))
        .group_by(Route.difficulty_grade)
        .all()
    )

    grade_pyramid = [
        GradeStat(grade=r.difficulty_grade, attempts=r.attempts, sends=int(r.sends or 0))
        for r in grade_rows
    ]

    # Weekly success rate
    weekly_rows = (
        db.query(
            func.to_char(func.date_trunc("week", Attempt.attempted_at), "IYYY-IW").label("week"),
            func.count(Attempt.id).label("attempts"),
            func.sum(case((Attempt.success == True, 1), else_=0)).label("sends"),
        )
        .filter(Attempt.user_id == user_id)
        .group_by("week")
        .order_by("week")
        .all()
    )

    success_rate_over_time = [
        WeeklyStat(
            week=r.week,
            rate=round(int(r.sends or 0) / r.attempts, 2) if r.attempts else 0.0,
            attempts=r.attempts,
        )
        for r in weekly_rows
    ]

    # Top routes by attempt count
    top_rows = (
        db.query(
            Route.id,
            Route.name,
            func.count(Attempt.id).label("attempts"),
            func.sum(case((Attempt.success == True, 1), else_=0)).label("sends"),
        )
        .join(Attempt, Attempt.route_id == Route.id)
        .filter(Attempt.user_id == user_id)
        .group_by(Route.id, Route.name)
        .order_by(func.count(Attempt.id).desc())
        .limit(10)
        .all()
    )

    top_routes = [
        TopRoute(route_id=r.id, route_name=r.name, attempts=r.attempts, sends=int(r.sends or 0))
        for r in top_rows
    ]

    total_attempts = db.query(func.count(Attempt.id)).filter(Attempt.user_id == user_id).scalar() or 0
    total_sends = db.query(func.sum(case((Attempt.success == True, 1), else_=0))).filter(Attempt.user_id == user_id).scalar() or 0

    return AttemptStats(
        grade_pyramid=grade_pyramid,
        success_rate_over_time=success_rate_over_time,
        top_routes=top_routes,
        total_attempts=total_attempts,
        total_sends=int(total_sends),
    )
