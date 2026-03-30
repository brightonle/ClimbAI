"""
Fetch complete Kilter Board 16×12 hold positions from the public Kilter App API.
Outputs backend/data/kilter_board_full.csv with native Kilter coordinates
(x: −24–168, y: 0–156) for all holds on the board.

Usage: python3 backend/scripts/fetch_kilter_holds.py
"""

import requests
import csv
import json
import os
import sys

SYNC_URL = "https://kilterboardapp.com/api/v1/sync?tables=holes,leds,products,product_sizes"
AUTH = ("kilterdashboard", "kilterdashboard")

# Product size ID 28 = Kilterboard_original_wide (16×12)
TARGET_SIZE_ID = 28

OUT_PATH = os.path.join(os.path.dirname(__file__), "../data/kilter_board_full.csv")


def fetch():
    print("Fetching Kilter Board data from API...")
    try:
        resp = requests.get(SYNC_URL, auth=AUTH, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"ERROR: Could not reach Kilter API: {e}")
        sys.exit(1)

    data = resp.json()

    tables = list(data.keys()) if isinstance(data, dict) else []
    print(f"Received tables: {tables}")

    # The API may return the data under different structures; handle both
    if "holes" in data:
        holes_raw = data["holes"]
    else:
        print("ERROR: 'holes' table not in response. Response keys:", tables)
        # Save raw response for debugging
        with open("/tmp/kilter_api_response.json", "w") as f:
            json.dump(data, f, indent=2)
        print("Raw response saved to /tmp/kilter_api_response.json")
        sys.exit(1)

    if "leds" in data:
        leds_raw = data["leds"]
    else:
        print("ERROR: 'leds' table not in response.")
        sys.exit(1)

    print(f"Total holes in API: {len(holes_raw)}")
    print(f"Total LEDs in API: {len(leds_raw)}")

    # Index holes by id
    holes = {}
    for h in holes_raw:
        holes[h["id"]] = h

    # Filter LEDs to only the 16×12 board
    board_leds = [l for l in leds_raw if l.get("product_size_id") == TARGET_SIZE_ID]
    print(f"LEDs for product_size_id={TARGET_SIZE_ID}: {len(board_leds)}")

    if not board_leds:
        # Try to see what product_size_ids exist
        sizes = sorted(set(l.get("product_size_id") for l in leds_raw))
        print(f"Available product_size_ids: {sizes}")
        # Try to find product_sizes table
        if "product_sizes" in data:
            for ps in data["product_sizes"]:
                print(f"  product_size id={ps.get('id')} name={ps.get('name')} or edge_left={ps.get('edge_left')}")
        sys.exit(1)

    # Write CSV
    seen_holes = set()
    rows = []
    for led in board_leds:
        hole_id = led.get("hole_id")
        if hole_id in seen_holes:
            continue
        seen_holes.add(hole_id)

        hole = holes.get(hole_id)
        if not hole:
            continue

        rows.append({
            "hold_id": hole_id,
            "x": hole["x"],
            "y": hole["y"],
            "hold_type": None,  # Kilter API doesn't provide hold type
        })

    # Sort by hold_id for deterministic output
    rows.sort(key=lambda r: r["hold_id"])

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["hold_id", "x", "y", "hold_type"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nWrote {len(rows)} holds to {OUT_PATH}")

    # Show coordinate ranges
    xs = [r["x"] for r in rows]
    ys = [r["y"] for r in rows]
    print(f"X range: {min(xs)} to {max(xs)}")
    print(f"Y range: {min(ys)} to {max(ys)}")


if __name__ == "__main__":
    fetch()
