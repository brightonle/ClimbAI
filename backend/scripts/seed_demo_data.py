"""
Populate a user's account with realistic demo climbing data.

Usage (via Docker):
    docker compose exec backend python scripts/seed_demo_data.py <username>

Usage (local venv, from backend/ dir):
    DATABASE_URL=postgresql://climbai:climbai_dev@localhost:5432/climbai \
        python scripts/seed_demo_data.py <username>
"""

import os
import random
import sys
from datetime import datetime, timedelta, timezone

# Allow `app.*` imports when run from repo root or backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.models.route import Route
from app.models.route_hold import RouteHold
from app.models.attempt import Attempt
from app.models.hold import Hold

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://climbai:climbai_dev@db:5432/climbai"
)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# ---------------------------------------------------------------------------
# Route definitions: (name, grade, num_holds, wall_angle, description)
# ---------------------------------------------------------------------------
ROUTE_DEFS = [
    ("Warm-Up Traverse",   "V0", 5,  20, "Easy traversing movement to get the body warmed up."),
    ("Easy Arête",         "V1", 5,  25, "Balance and footwork on a featured arête."),
    ("Green Slab",         "V2", 6,  10, "Delicate slab with small crimps and precise footwork."),
    ("The Crimp Line",     "V2", 6,  35, "Sequential crimpy moves on a moderate overhang."),
    ("Orange Overhang",    "V3", 7,  40, "Sustained overhang with good holds but pumpy."),
    ("Power Endurance",    "V4", 7,  45, "Long boulder with continuous movement."),
    ("The Compression",    "V5", 7,  50, "Body tension compression problem."),
    ("Dynamic Dyno",       "V6", 8,  55, "Big dynamic move to a sloper finish."),
    ("Pinch Problem",      "V7", 8,  55, "Powerful pinch-to-crimp sequence."),
    ("Project",            "V8", 8,  60, "Hard project — rare sends only."),
]

# Success probability per grade (0.0–1.0)
SUCCESS_RATE = {
    "V0": 0.90, "V1": 0.85, "V2": 0.72, "V3": 0.62,
    "V4": 0.50, "V5": 0.38, "V6": 0.28, "V7": 0.18, "V8": 0.10,
}

# Attempts per week per route (weighted by grade difficulty)
WEEKLY_ATTEMPTS = {
    "V0": (3, 5), "V1": (2, 4), "V2": (2, 4), "V3": (2, 3),
    "V4": (1, 3), "V5": (1, 3), "V6": (1, 2), "V7": (1, 2), "V8": (0, 2),
}

NUM_WEEKS = 10
random.seed(42)


def grade_to_num(g: str) -> int:
    try:
        return int(g.replace("V", "").replace("+", ""))
    except ValueError:
        return 0


def main():
    if len(sys.argv) < 2:
        print("Usage: python seed_demo_data.py <username>")
        sys.exit(1)

    username = sys.argv[1]

    with Session() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Error: user '{username}' not found.")
            sys.exit(1)

        # Fetch kilter holds
        holds = db.query(Hold).filter(Hold.board_type == "kilter").all()
        if not holds:
            print("Error: no kilter holds found in DB. Run migrations first.")
            sys.exit(1)

        print(f"Seeding data for user '{username}' (id={user.id})")
        print(f"  Found {len(holds)} kilter holds")

        total_routes = 0
        total_attempts = 0

        for name, grade, num_holds, angle, desc in ROUTE_DEFS:
            # Sample holds for this route
            sampled = random.sample(holds, min(num_holds, len(holds)))

            route = Route(
                user_id=user.id,
                name=name,
                difficulty_grade=grade,
                wall_angle=float(angle),
                description=desc,
            )
            db.add(route)
            db.flush()  # get route.id

            for pos, hold in enumerate(sampled, start=1):
                rh = RouteHold(
                    route_id=route.id,
                    hold_id=hold.id,
                    position_in_route=pos,
                    foot_restriction=False,
                )
                db.add(rh)

            total_routes += 1

            # Generate attempts spread over last NUM_WEEKS weeks
            success_prob = SUCCESS_RATE.get(grade, 0.5)
            min_att, max_att = WEEKLY_ATTEMPTS.get(grade, (1, 2))
            now = datetime.now(timezone.utc)

            for week_offset in range(NUM_WEEKS, 0, -1):
                week_start = now - timedelta(weeks=week_offset)
                n = random.randint(min_att, max_att)
                for _ in range(n):
                    offset_hours = random.randint(0, 6 * 24)  # spread within 6 days
                    ts = week_start + timedelta(hours=offset_hours)
                    attempt = Attempt(
                        user_id=user.id,
                        route_id=route.id,
                        success=random.random() < success_prob,
                        attempted_at=ts,
                        duration_seconds=random.randint(10, 120),
                    )
                    db.add(attempt)
                    total_attempts += 1

        db.commit()

    print(f"\nDone! Inserted {total_routes} routes and {total_attempts} attempts.")
    print("Refresh your dashboard to see the analytics.")


if __name__ == "__main__":
    main()
