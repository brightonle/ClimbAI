from neo4j import GraphDatabase
from app.config import settings


class GraphService:
    def __init__(self):
        self.driver = None

    def connect(self):
        self.driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )

    def close(self):
        if self.driver:
            self.driver.close()

    def write_route(self, route_id: int, holds: list[dict]):
        """
        holds = list of {hold_id, x, y, hold_type, position} sorted by position.
        Creates Hold nodes (MERGE) and MOVE_TO relationships between consecutive holds.
        """
        if not self.driver or len(holds) < 2:
            return
        with self.driver.session() as session:
            for h in holds:
                session.run(
                    "MERGE (n:Hold {hold_id: $hold_id}) "
                    "SET n.x = $x, n.y = $y, n.hold_type = $hold_type",
                    hold_id=h["hold_id"], x=h["x"], y=h["y"], hold_type=h["hold_type"],
                )
            for i in range(len(holds) - 1):
                session.run(
                    "MATCH (a:Hold {hold_id: $from_id}), (b:Hold {hold_id: $to_id}) "
                    "CREATE (a)-[:MOVE_TO {route_id: $route_id, position: $pos}]->(b)",
                    from_id=holds[i]["hold_id"],
                    to_id=holds[i + 1]["hold_id"],
                    route_id=route_id,
                    pos=holds[i]["position"],
                )

    def find_similar_routes(self, route_id: int, min_shared: int = 3) -> list[int]:
        """Returns IDs of routes sharing >= min_shared holds with route_id."""
        if not self.driver:
            return []
        with self.driver.session() as session:
            result = session.run(
                "MATCH (a:Hold)-[r:MOVE_TO {route_id: $rid}]->(b:Hold) "
                "WITH collect(DISTINCT a.hold_id) + collect(DISTINCT b.hold_id) AS target_holds "
                "MATCH (h2:Hold)-[r2:MOVE_TO]->(n2:Hold) "
                "WHERE h2.hold_id IN target_holds AND r2.route_id <> $rid "
                "WITH r2.route_id AS other_id, count(DISTINCT h2.hold_id) AS shared "
                "WHERE shared >= $min_shared "
                "RETURN other_id ORDER BY shared DESC LIMIT 10",
                rid=route_id,
                min_shared=min_shared,
            )
            return [r["other_id"] for r in result]


graph_service = GraphService()
