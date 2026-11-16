"""
Road Network Processing & Classification Module
Classifies OSM highway vectors, extracts names, one-way directional status,
speed limits, and lane counts while preserving missing attributes.
"""

import math
import re
from typing import Dict, Any, List

def calculate_linestring_length_km(coords: List[List[float]]) -> float:
    if not coords or len(coords) < 2:
        return 0.0

    length_m = 0.0
    for i in range(len(coords) - 1):
        lon1, lat1 = coords[i]
        lon2, lat2 = coords[i + 1]
        lat_rad = math.radians((lat1 + lat2) / 2.0)
        dx = (lon2 - lon1) * 111412.0 * math.cos(lat_rad)
        dy = (lat2 - lat1) * 111132.0
        length_m += math.sqrt(dx * dx + dy * dy)

    return round(length_m / 1000.0, 3)

def classify_highway(hw_type: str) -> Dict[str, Any]:
    hw = str(hw_type).lower()
    if hw in ["motorway", "motorway_link", "trunk", "trunk_link"]:
        return {
            "category": "Motorway / Expressway",
            "visual_priority": 1,
            "default_lanes": 6,
            "default_speed": 80,
            "color": "#f59e0b",
            "width": 4.5
        }
    elif hw in ["primary", "primary_link", "secondary", "secondary_link"]:
        return {
            "category": "Primary / Secondary Arterial",
            "visual_priority": 2,
            "default_lanes": 4,
            "default_speed": 50,
            "color": "#06b6d4",
            "width": 3.2
        }
    elif hw in ["tertiary", "tertiary_link"]:
        return {
            "category": "Tertiary / Sector Road",
            "visual_priority": 3,
            "default_lanes": 2,
            "default_speed": 40,
            "color": "#38bdf8",
            "width": 2.4
        }
    elif hw in ["residential", "living_street"]:
        return {
            "category": "Residential Street",
            "visual_priority": 4,
            "default_lanes": 2,
            "default_speed": 30,
            "color": "#94a3b8",
            "width": 1.8
        }
    else:
        return {
            "category": "Service / Pedestrian Path",
            "visual_priority": 5,
            "default_lanes": 1,
            "default_speed": 20,
            "color": "#64748b",
            "width": 1.2
        }

def process_road_feature(feat: Dict[str, Any], valid_geom: Dict[str, Any]) -> Dict[str, Any]:
    props = feat.get("properties", {}) or {}
    osm_id = props.get("@id") or props.get("id") or str(feat.get("id", ""))
    hw_type = props.get("highway", "road")

    classification = classify_highway(hw_type)

    # 1. Names
    raw_name = props.get("name") or props.get("name:en")
    is_named = bool(raw_name)

    # 2. One-Way information
    oneway_val = props.get("oneway")
    is_oneway = None
    if oneway_val is not None:
        oneway_str = str(oneway_val).lower().strip()
        if oneway_str in ["yes", "1", "true"]:
            is_oneway = "Forward (One-Way)"
        elif oneway_str in ["-1", "reverse"]:
            is_oneway = "Reverse (One-Way)"
        elif oneway_str in ["no", "0", "false"]:
            is_oneway = "Two-Way (Bidirectional)"

    # 3. Lanes
    lanes_val = props.get("lanes")
    lanes = None
    if lanes_val is not None:
        try:
            lanes = int(re.sub(r"[^\d]", "", str(lanes_val)))
        except (ValueError, TypeError):
            lanes = None

    # 4. Max Speed
    speed_val = props.get("maxspeed")
    maxspeed = None
    if speed_val is not None:
        try:
            maxspeed = int(re.sub(r"[^\d]", "", str(speed_val)))
        except (ValueError, TypeError):
            maxspeed = None

    coords = valid_geom.get("coordinates", [])
    length_km = calculate_linestring_length_km(coords if valid_geom["type"] == "LineString" else (coords[0] if coords else []))

    norm_props = {
        "id": osm_id,
        "osm_id": osm_id,
        "name": raw_name if is_named else f"Unnamed {classification['category']}",
        "has_source_name": is_named,
        "highway": hw_type,
        "category": classification["category"],
        "visual_priority": classification["visual_priority"],
        "color": classification["color"],
        "width": classification["width"],
        "oneway": is_oneway,
        "has_source_oneway": is_oneway is not None,
        "lanes": lanes,
        "has_source_lanes": lanes is not None,
        "maxspeed": maxspeed,
        "has_source_maxspeed": maxspeed is not None,
        "surface": props.get("surface"),
        "bridge": props.get("bridge"),
        "layer": props.get("layer"),
        "length_km": length_km,
        "vertex_count": len(coords) if valid_geom["type"] == "LineString" else sum(len(c) for c in coords),
        "data_source": "OpenStreetMap Contributors (ODbL)",
        "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
    }

    return {
        "type": "Feature",
        "id": osm_id,
        "geometry": valid_geom,
        "properties": norm_props
    }

