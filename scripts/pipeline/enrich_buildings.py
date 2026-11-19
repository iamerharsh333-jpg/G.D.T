"""
Building Feature Enrichment Module
Extracts surveyed heights and floor counts, applies typology-aware algorithmic
height estimation where missing, and computes geometric centroids & footprint areas.
"""

import os
import json
import math
import re
from typing import Dict, Any, Tuple, Optional, List

_LANDUSE_ZONES: Optional[List[Tuple[List[List[float]], str]]] = None

def load_landuse_zones() -> List[Tuple[List[List[float]], str]]:
    global _LANDUSE_ZONES
    if _LANDUSE_ZONES is not None:
        return _LANDUSE_ZONES

    zones: List[Tuple[List[List[float]], str]] = []
    candidates = [
        "public/data/landuse.geojson",
        "data/processed/landuse.geojson",
        "data/raw/gurugram_infrastructure.geojson"
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for feat in data.get("features", []):
                    geom = feat.get("geometry", {})
                    props = feat.get("properties", {}) or {}
                    lutype = str(props.get("landuse") or props.get("sub_type") or "").lower()
                    if geom.get("type") == "Polygon" and geom.get("coordinates") and lutype:
                        zones.append((geom["coordinates"][0], lutype))
                if zones:
                    break
            except Exception:
                pass

    _LANDUSE_ZONES = zones
    return _LANDUSE_ZONES

def point_in_polygon(x: float, y: float, ring: List[List[float]]) -> bool:
    inside = False
    n = len(ring)
    for i in range(n):
        j = (i - 1) % n
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
    return inside

def calculate_polygon_area_and_centroid(coords: List[List[float]]) -> Tuple[float, Tuple[float, float]]:
    if not coords or len(coords) < 3:
        return 0.0, (77.089, 28.495)

    unique_pts = coords[:-1] if coords[0] == coords[-1] and len(coords) > 1 else coords
    if not unique_pts:
        unique_pts = coords

    centroid_lon = sum(p[0] for p in unique_pts) / len(unique_pts)
    centroid_lat = sum(p[1] for p in unique_pts) / len(unique_pts)

    avg_lat = centroid_lat
    lat_rad = math.radians(avg_lat)
    meters_per_deg_lat = 111132.0
    meters_per_deg_lon = 111412.0 * math.cos(lat_rad)

    pts = [(p[0] * meters_per_deg_lon, p[1] * meters_per_deg_lat) for p in coords]
    signed_area = 0.0
    n = len(pts)
    for i in range(n - 1):
        x0, y0 = pts[i]
        x1, y1 = pts[i + 1]
        signed_area += (x0 * y1 - x1 * y0)
    area = abs(signed_area) / 2.0

    return round(area, 1), (round(centroid_lon, 6), round(centroid_lat, 6))

def classify_building(
    props: Dict[str, Any],
    centroid: Optional[Tuple[float, float]] = None,
    footprint_area_sqm: float = 0.0
) -> Tuple[str, str]:
    """
    Returns (normalized_type, land_use)
    Utilizes explicit OSM tags, name keywords, and spatial land-use zoning.
    """
    raw_bld = str(props.get("building", "")).lower()
    amenity = str(props.get("amenity", "")).lower()
    shop = str(props.get("shop", "")).lower()
    office = str(props.get("office", "")).lower()
    landuse = str(props.get("landuse", "")).lower()
    name = str(props.get("name") or props.get("name:en") or "").lower()
    raw_tags = " ".join(str(v).lower() for v in props.values())

    # 1. Direct tag matches
    if raw_bld in ["office"] or office or "office" in props:
        return "Commercial Office", "Commercial"
    if raw_bld in ["commercial"] or landuse == "commercial":
        return "Commercial Facility", "Commercial"
    if raw_bld in ["retail", "supermarket"] or shop:
        return "Retail / Commercial", "Commercial"
    if raw_bld in ["apartments", "residential"] or landuse == "residential":
        return "Residential Multi-Storey", "Residential"
    if raw_bld in ["house", "bungalow"]:
        return "Residential Independent", "Residential"
    if raw_bld in ["industrial", "warehouse"]:
        return "Industrial / Logistics", "Industrial"
    if raw_bld in ["school", "kindergarten"] or amenity in ["school", "college", "university"]:
        return "Educational Institute", "Institutional"
    if raw_bld in ["hospital", "clinic"] or amenity in ["hospital", "clinic"]:
        return "Healthcare Facility", "Institutional"
    if raw_bld in ["train_station", "transportation"]:
        return "Transit Infrastructure", "Civic / Transit"
    if amenity in ["place_of_worship"]:
        return "Place of Worship", "Civic / Cultural"

    # 2. Name & Raw tag keywords
    if any(w in name or w in raw_tags for w in ["office", "tower", "cyber", "centre", "airtel", "infotech", "plaza", "corp", "dlf", "hub", "commercial"]):
        return "Commercial Facility", "Commercial"
    if any(w in name or w in raw_tags for w in ["apartment", "residency", "enclave", "society", "heights", "condominium"]):
        return "Residential Multi-Storey", "Residential"
    if any(w in name or w in raw_tags for w in ["villa", "bungalow", "house"]):
        return "Residential Independent", "Residential"
    if any(w in name or w in raw_tags for w in ["industr", "logistics", "warehouse", "plant", "factory", "motors"]):
        return "Industrial / Logistics", "Industrial"
    if any(w in name or w in raw_tags for w in ["hospital", "clinic", "health"]):
        return "Healthcare Facility", "Institutional"
    if any(w in name or w in raw_tags for w in ["school", "college", "academy", "institute", "vidya"]):
        return "Educational Institute", "Institutional"
    if any(w in name or w in raw_tags for w in ["mall", "market", "bazaar", "mart"]):
        return "Retail / Commercial", "Commercial"

    # 3. Spatial land-use zoning correlation
    if centroid:
        cx, cy = centroid
        zones = load_landuse_zones()
        for ring, lutype in zones:
            if point_in_polygon(cx, cy, ring):
                if "residential" in lutype:
                    sub_type = "Residential Multi-Storey" if footprint_area_sqm > 280 else "Residential Independent"
                    return sub_type, "Residential"
                elif "industrial" in lutype:
                    return "Industrial / Logistics", "Industrial"
                elif "commercial" in lutype:
                    return "Commercial Facility", "Commercial"
                elif "retail" in lutype:
                    return "Retail / Commercial", "Commercial"
                elif "education" in lutype:
                    return "Educational Institute", "Institutional"
                break

    return "General Urban Structure", "Mixed / General"

def parse_height_and_levels(props: Dict[str, Any], footprint_area_sqm: float, bld_type: str) -> Tuple[float, Optional[int], str]:
    # 1. Surveyed height attribute
    height_val = props.get("height")
    if height_val is not None:
        try:
            cleaned = re.sub(r"[^\d.]", "", str(height_val))
            if cleaned:
                h = float(cleaned)
                if 2 <= h <= 300:
                    levels = None
                    for lvl_key in ["building:levels", "levels", "floors"]:
                        if lvl_key in props:
                            try:
                                levels = int(float(props[lvl_key]))
                                break
                            except (ValueError, TypeError):
                                pass
                    return round(h, 1), levels, "source-provided"
        except (ValueError, TypeError):
            pass

    # 2. Surveyed floor levels attribute
    levels_val = None
    for lvl_key in ["building:levels", "levels", "floors"]:
        if lvl_key in props:
            levels_val = props[lvl_key]
            break

    if levels_val is not None:
        try:
            cleaned_lvl = re.sub(r"[^\d.]", "", str(levels_val))
            if cleaned_lvl:
                lvls = int(float(cleaned_lvl))
                if 0 <= lvls <= 80:
                    story_h = 3.6 if any(t in bld_type.lower() for t in ["commercial", "office", "retail", "industrial"]) else 3.1
                    h = round(lvls * story_h, 1) if lvls > 0 else 3.5
                    return h, lvls, "levels-derived"
        except (ValueError, TypeError):
            pass

    # 3. Typology-aware footprint area algorithmic estimation with realistic height variation
    if "Commercial" in bld_type or "Office" in bld_type:
        scale = math.sqrt(max(100.0, footprint_area_sqm))
        est_h = min(72.0, max(18.0, 12.0 + scale * 0.55))
    elif "Residential Multi-Storey" in bld_type:
        scale = math.sqrt(max(100.0, footprint_area_sqm))
        est_h = min(54.0, max(14.0, 10.0 + scale * 0.45))
    elif "Industrial" in bld_type:
        scale = math.sqrt(max(100.0, footprint_area_sqm))
        est_h = min(22.0, max(8.5, 6.0 + scale * 0.22))
    elif "Retail" in bld_type:
        est_h = 12.5 if footprint_area_sqm > 500 else 8.5
    elif "Residential Independent" in bld_type:
        est_h = 10.5 if footprint_area_sqm > 220 else 7.5
    else:
        scale = math.sqrt(max(60.0, footprint_area_sqm))
        est_h = min(26.0, max(8.0, 5.5 + scale * 0.32))

    # Leave floor count as None when estimated, so missing values are NOT invented!
    return round(est_h, 1), None, "estimated"

def enrich_building_feature(feat: Dict[str, Any], valid_geom: Dict[str, Any]) -> Dict[str, Any]:
    props = feat.get("properties", {}) or {}
    osm_id = props.get("@id") or props.get("id") or str(feat.get("id", ""))

    gtype = valid_geom["type"]
    footprint_coords: List[List[float]] = []
    if gtype == "Polygon" and valid_geom["coordinates"]:
        footprint_coords = valid_geom["coordinates"][0]
    elif gtype == "MultiPolygon" and valid_geom["coordinates"] and valid_geom["coordinates"][0]:
        footprint_coords = valid_geom["coordinates"][0][0]

    area_sqm, centroid = calculate_polygon_area_and_centroid(footprint_coords)
    bld_type, land_use = classify_building(props, centroid, area_sqm)
    height, levels, height_source = parse_height_and_levels(props, area_sqm, bld_type)

    raw_name = props.get("name") or props.get("name:en")
    is_named = bool(raw_name)

    norm_props = {
        "id": osm_id,
        "osm_id": osm_id,
        "name": raw_name if is_named else f"OSM Building {osm_id.split('/')[-1]}",
        "has_source_name": is_named,
        "building_type": bld_type,
        "osm_building_tag": props.get("building"),
        "height": height,
        "height_source": height_source,
        "levels": levels,
        "has_source_levels": levels is not None,
        "footprint_area_sqm": area_sqm,
        "centroid": centroid,
        "landuse": land_use,
        "address": props.get("addr:street") or props.get("addr:place") or "DLF Cyber City / Udyog Vihar",
        "postcode": props.get("addr:postcode"),
        "data_source": "OpenStreetMap Contributors (ODbL)",
        "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
    }

    return {
        "type": "Feature",
        "id": osm_id,
        "geometry": valid_geom,
        "properties": norm_props
    }

