"""
Building Feature Enrichment Module
Extracts surveyed heights and floor counts, applies typology-aware algorithmic
height estimation where missing, and computes geometric centroids & footprint areas.
"""

import math
import re
from typing import Dict, Any, Tuple, Optional, List

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

def classify_building(props: Dict[str, Any]) -> Tuple[str, str]:
    """
    Returns (normalized_type, land_use)
    """
    raw_bld = str(props.get("building", "")).lower()
    amenity = str(props.get("amenity", "")).lower()
    shop = str(props.get("shop", "")).lower()
    office = str(props.get("office", "")).lower()
    landuse = str(props.get("landuse", "")).lower()

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
                if 1 <= lvls <= 80:
                    story_h = 3.6 if any(t in bld_type.lower() for t in ["commercial", "office", "retail", "industrial"]) else 3.1
                    h = round(lvls * story_h, 1)
                    return h, lvls, "levels-derived"
        except (ValueError, TypeError):
            pass

    # 3. Typology-aware footprint area algorithmic estimation
    if "Commercial" in bld_type or "Office" in bld_type:
        est_h = 36.0 if footprint_area_sqm > 1500 else (24.0 if footprint_area_sqm > 600 else 14.0)
    elif "Residential Multi-Storey" in bld_type:
        est_h = 30.0 if footprint_area_sqm > 1000 else (18.0 if footprint_area_sqm > 350 else 10.0)
    elif "Industrial" in bld_type:
        est_h = 14.0 if footprint_area_sqm > 800 else 9.0
    elif "Retail" in bld_type:
        est_h = 10.5
    elif "Residential Independent" in bld_type:
        est_h = 7.5
    else:
        if footprint_area_sqm > 2500:
            est_h = 28.0
        elif footprint_area_sqm > 1000:
            est_h = 18.0
        elif footprint_area_sqm > 400:
            est_h = 12.0
        else:
            est_h = 8.5

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
    bld_type, land_use = classify_building(props)
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

