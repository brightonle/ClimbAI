import math
from sqlalchemy.orm import Session

GRADE_ORDER = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12+']
MIN_TRAINING_ROUTES = 5


def grade_to_int(g: str) -> int | None:
    try:
        return GRADE_ORDER.index(g)
    except ValueError:
        return None


def int_to_grade(i: int) -> str:
    return GRADE_ORDER[max(0, min(int(i), len(GRADE_ORDER) - 1))]


def extract_features(holds: list[dict], wall_angle: float | None) -> list[float]:
    """
    holds = [{x, y, hold_type, foot_restriction}] sorted by position.
    Returns a fixed-length feature vector.
    """
    n = len(holds)
    if n == 0:
        return [0.0] * 14

    xs = [h['x'] for h in holds]
    ys = [h['y'] for h in holds]

    avg_y = sum(ys) / n
    min_y = min(ys)
    max_y = max(ys)
    vertical_span = max_y - min_y
    horizontal_span = max(xs) - min(xs)

    # Distances between consecutive holds
    dists = []
    for i in range(n - 1):
        dx = holds[i + 1]['x'] - holds[i]['x']
        dy = holds[i + 1]['y'] - holds[i]['y']
        dists.append(math.sqrt(dx * dx + dy * dy))
    avg_dist = sum(dists) / len(dists) if dists else 0.0
    max_dist = max(dists) if dists else 0.0

    num_foot = sum(1 for h in holds if h.get('foot_restriction'))

    # Hold type counts
    type_counts = {'jug': 0, 'crimp': 0, 'sloper': 0, 'pinch': 0}
    for h in holds:
        ht = (h.get('hold_type') or '').lower()
        if ht in type_counts:
            type_counts[ht] += 1

    angle = wall_angle if wall_angle is not None else 40.0

    return [
        float(n),
        float(num_foot),
        angle,
        avg_y,
        min_y,
        max_y,
        vertical_span,
        horizontal_span,
        avg_dist,
        max_dist,
        float(type_counts['jug']),
        float(type_counts['crimp']),
        float(type_counts['sloper']),
        float(type_counts['pinch']),
    ]


def predict_grade(hold_data: list[dict], wall_angle: float | None, db: Session) -> dict:
    """
    Trains a RandomForest on all graded routes in the DB, then predicts the grade
    for hold_data. Returns {"predicted_grade": "V4", "confidence": 0.8} or
    {"predicted_grade": None} if there is not enough training data.
    """
    from sklearn.ensemble import RandomForestClassifier
    from app.models.route import Route
    from app.models.route_hold import RouteHold
    from app.models.hold import Hold as HoldModel

    graded = db.query(Route).filter(Route.difficulty_grade.isnot(None)).all()
    labeled = [
        (r, grade_to_int(r.difficulty_grade))
        for r in graded
        if grade_to_int(r.difficulty_grade) is not None
    ]

    if len(labeled) < MIN_TRAINING_ROUTES:
        return {"predicted_grade": None}

    X, y = [], []
    for route, grade_int in labeled:
        rows = (
            db.query(RouteHold, HoldModel)
            .join(HoldModel, HoldModel.id == RouteHold.hold_id)
            .filter(RouteHold.route_id == route.id)
            .order_by(RouteHold.position_in_route)
            .all()
        )
        holds_for_route = [
            {
                "x": h.x,
                "y": h.y,
                "hold_type": h.hold_type,
                "foot_restriction": rh.foot_restriction,
            }
            for rh, h in rows
        ]
        X.append(extract_features(holds_for_route, route.wall_angle))
        y.append(grade_int)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)

    features = extract_features(hold_data, wall_angle)
    pred_int = clf.predict([features])[0]
    proba = clf.predict_proba([features])[0]
    confidence = float(proba.max())

    return {
        "predicted_grade": int_to_grade(pred_int),
        "confidence": round(confidence, 2),
    }
