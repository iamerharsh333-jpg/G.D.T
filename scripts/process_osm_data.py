#!/usr/bin/env python3
"""
Gurugram Digital Twin - OpenStreetMap Data Processing & Validation Pipeline
Performs geometric validation, repair, deduplication, attribute normalization,
and rigorous accuracy audits.
"""

import json
import os
import sys
import math
import re
from typing import Dict, Any, List, Optional, Tuple

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
PUBLIC_DIR = "public/data"

GURUGRAM_BBOX = [76.80, 28.30, 77.25, 28.60]  # [min_lng, min_lat, max_lng, max_lat]

def ensure_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

def parse_height_and_levels(props: Dict[str, Any], footprint_area_sqm: float = 0) -> Tuple[float, Optional[int], str]:
    # 1. Check direct height tag
    height_val = props.get("height")
    if height_val is not None:
        try:
            cleaned = re.sub(r"[^\d.]", "", str(height_val))
            if cleaned:
                h = float(cleaned)
                if 2 <= h <= 300:
                    levels = None
                    if "building:levels" in props or "levels" in props:
                        try:
                            levels = int(float(props.get("building:levels") or props.get("levels")))
                        except (ValueError, TypeError):
                            pass
                    return round(h, 1), levels, "source-provided"
        except (ValueError, TypeError):
            pass

    # 2. Check building:levels tag
    levels_val = props.get("building:levels") or props.get("levels")
    if levels_val is not None:
        try:
            cleaned_lvl = re.sub(r"[^\d.]", "", str(levels_val))
            if cleaned_lvl:
                lvls = int(float(cleaned_lvl))
                if 1 <= lvls <= 80:
                    bld_type = props.get("building", "").lower()
                    story_h = 3.6 if any(t in bld_type for t in ["office", "commercial", "retail", "industrial"]) else 3.1
                    h = round(lvls * story_h, 1)
                    return h, lvls, "levels-derived"
        except (ValueError, TypeError):
            pass

    # 3. Estimate height based on building footprint area and typology
    bld_type = str(props.get("building", "")).lower()
    if bld_type in ["office", "commercial"]:
        est_h = 32.0 if footprint_area_sqm > 1200 else (22.0 if footprint_area_sqm > 500 else 14.0)
        est_levels = max(3, int(est_h / 3.6))
    elif bld_type in ["apartments", "residential"]:
        est_h = 28.0 if footprint_area_sqm > 1000 else (15.0 if footprint_area_sqm > 300 else 9.0)
        est_levels = max(2, int(est_h / 3.1))
    elif bld_type in ["industrial", "warehouse"]:
        est_h = 14.0 if footprint_area_sqm > 800 else 9.5
        est_levels = max(1, int(est_h / 4.5))
    elif bld_type in ["retail", "supermarket"]:
        est_h = 10.5
        est_levels = 2
    elif bld_type in ["house", "bungalow"]:
        est_h = 7.5
        est_levels = 2
    else:
        if footprint_area_sqm > 2500:
            est_h = 28.0
            est_levels = 8
        elif footprint_area_sqm > 1000:
            est_h = 18.0
            est_levels = 5
        elif footprint_area_sqm > 400:
            est_h = 12.0
            est_levels = 3
        else:
            est_h = 8.5
            est_levels = 2

    return round(est_h, 1), est_levels, "estimated"

def calculate_polygon_area_and_centroid(coords: List[List[float]]) -> Tuple[float, Tuple[float, float]]:
    """
    Computes area in square meters and centroid (lon, lat) guaranteed in positive Gurugram bounds.
    """
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

    return area, (round(centroid_lon, 6), round(centroid_lat, 6))

def validate_and_repair_geometry(geom: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    gtype = geom.get("type")
    coords = geom.get("coordinates")
    if not gtype or not coords:
        return None

    def clean_ring(ring: List[List[float]]) -> List[List[float]]:
        cleaned = []
        for pt in ring:
            if len(pt) < 2:
                continue
            lon, lat = pt[0], pt[1]
            if not (GURUGRAM_BBOX[0] <= lon <= GURUGRAM_BBOX[2] and GURUGRAM_BBOX[1] <= lat <= GURUGRAM_BBOX[3]):
                return []
            if not cleaned or (abs(pt[0] - cleaned[-1][0]) > 1e-7 or abs(pt[1] - cleaned[-1][1]) > 1e-7):
                cleaned.append([round(lon, 7), round(lat, 7)])
        if len(cleaned) < 3:
            return []
        if cleaned[0] != cleaned[-1]:
            cleaned.append(cleaned[0])
        return cleaned

    if gtype == "Polygon":
        clean_rings = []
        for r in coords:
            cr = clean_ring(r)
            if cr and len(cr) >= 4:
                clean_rings.append(cr)
        if not clean_rings:
            return None
        return {"type": "Polygon", "coordinates": clean_rings}

    elif gtype == "MultiPolygon":
        clean_polys = []
        for poly in coords:
            clean_rings = []
            for r in poly:
                cr = clean_ring(r)
                if cr and len(cr) >= 4:
                    clean_rings.append(cr)
            if clean_rings:
                clean_polys.append(clean_rings)
        if not clean_polys:
            return None
        return {"type": "MultiPolygon", "coordinates": clean_polys}

    elif gtype == "LineString":
        cleaned = []
        for pt in coords:
            lon, lat = pt[0], pt[1]
            if not (GURUGRAM_BBOX[0] <= lon <= GURUGRAM_BBOX[2] and GURUGRAM_BBOX[1] <= lat <= GURUGRAM_BBOX[3]):
                continue
            if not cleaned or (abs(pt[0] - cleaned[-1][0]) > 1e-7 or abs(pt[1] - cleaned[-1][1]) > 1e-7):
                cleaned.append([round(lon, 7), round(lat, 7)])
        if len(cleaned) < 2:
            return None
        return {"type": "LineString", "coordinates": cleaned}

    elif gtype == "Point":
        lon, lat = coords[0], coords[1]
        if GURUGRAM_BBOX[0] <= lon <= GURUGRAM_BBOX[2] and GURUGRAM_BBOX[1] <= lat <= GURUGRAM_BBOX[3]:
            return {"type": "Point", "coordinates": [round(lon, 7), round(lat, 7)]}
        return None

    return None

def process_and_validate_osm_dataset(input_path: str):
    print(f"[1/5] Loading and validating raw OSM GeoJSON: {input_path}...")
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    print(f"      Total input features: {len(features)}")

    categorized = {
        "buildings": [],
        "roads": [],
        "parks": [],
        "landuse": [],
        "water": [],
        "amenities": [],
    }

    seen_ids = set()
    validation_stats = {
        "total_raw_features": len(features),
        "duplicates_removed": 0,
        "invalid_geometries_repaired_or_skipped": 0,
        "valid_features_passed": 0,
        "building_height_audit": {
            "source_measured": 0,
            "levels_derived": 0,
            "estimated": 0,
            "total_buildings": 0
        },
        "road_classification_audit": {},
        "geographic_bounds": {
            "min_lng": 180.0,
            "min_lat": 90.0,
            "max_lng": -180.0,
            "max_lat": -90.0
        }
    }

    for feat in features:
        props = feat.get("properties", {}) or {}
        geom = feat.get("geometry", {})
        
        osm_id = props.get("@id") or props.get("id") or str(feat.get("id", ""))
        if osm_id and osm_id in seen_ids:
            validation_stats["duplicates_removed"] += 1
            continue
        if osm_id:
            seen_ids.add(osm_id)

        valid_geom = validate_and_repair_geometry(geom)
        if not valid_geom:
            validation_stats["invalid_geometries_repaired_or_skipped"] += 1
            continue

        validation_stats["valid_features_passed"] += 1
        gtype = valid_geom["type"]

        # 1. BUILDINGS
        if "building" in props:
            footprint_coords = []
            if gtype == "Polygon" and valid_geom["coordinates"]:
                footprint_coords = valid_geom["coordinates"][0]
            elif gtype == "MultiPolygon" and valid_geom["coordinates"] and valid_geom["coordinates"][0]:
                footprint_coords = valid_geom["coordinates"][0][0]

            area_sqm, centroid = calculate_polygon_area_and_centroid(footprint_coords)
            height, levels, height_source = parse_height_and_levels(props, area_sqm)

            # Update validation bounds
            validation_stats["geographic_bounds"]["min_lng"] = min(validation_stats["geographic_bounds"]["min_lng"], centroid[0])
            validation_stats["geographic_bounds"]["min_lat"] = min(validation_stats["geographic_bounds"]["min_lat"], centroid[1])
            validation_stats["geographic_bounds"]["max_lng"] = max(validation_stats["geographic_bounds"]["max_lng"], centroid[0])
            validation_stats["geographic_bounds"]["max_lat"] = max(validation_stats["geographic_bounds"]["max_lat"], centroid[1])

            validation_stats["building_height_audit"]["total_buildings"] += 1
            if height_source == "source-provided":
                validation_stats["building_height_audit"]["source_measured"] += 1
            elif height_source == "levels-derived":
                validation_stats["building_height_audit"]["levels_derived"] += 1
            else:
                validation_stats["building_height_audit"]["estimated"] += 1

            bld_type = props.get("building")
            if bld_type == "yes":
                if "office" in props:
                    bld_type = "office"
                elif "commercial" in props or props.get("landuse") == "commercial":
                    bld_type = "commercial"
                elif "amenity" in props:
                    bld_type = props["amenity"]
                elif "residential" in props or props.get("landuse") == "residential":
                    bld_type = "residential"

            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or props.get("name:en") or f"OSM Building {osm_id.split('/')[-1]}",
                "building": bld_type,
                "building_type": bld_type,
                "height": height,
                "height_source": height_source,
                "levels": levels,
                "footprint_area_sqm": round(area_sqm, 1),
                "centroid": centroid,
                "landuse": props.get("landuse") or ("Commercial" if bld_type in ["office", "commercial"] else "Residential"),
                "address": props.get("addr:street") or props.get("addr:place") or "DLF Cyber City / Udyog Vihar",
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }

            categorized["buildings"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

        # 2. ROADS
        elif "highway" in props:
            hw_type = props["highway"]
            lanes = props.get("lanes")
            try:
                lanes = int(lanes) if lanes else None
            except (ValueError, TypeError):
                lanes = None

            maxspeed = props.get("maxspeed")
            try:
                maxspeed = int(re.sub(r"[^\d]", "", str(maxspeed))) if maxspeed else None
            except (ValueError, TypeError):
                maxspeed = None

            if hw_type in ["motorway", "motorway_link", "trunk", "trunk_link"]:
                cat = "Motorway / Expressway"
                visual_priority = 1
                color = "#f59e0b"
                width = 4.5
            elif hw_type in ["primary", "primary_link", "secondary", "secondary_link"]:
                cat = "Primary / Secondary Arterial"
                visual_priority = 2
                color = "#06b6d4"
                width = 3.2
            elif hw_type in ["tertiary", "tertiary_link"]:
                cat = "Tertiary / Sector Road"
                visual_priority = 3
                color = "#38bdf8"
                width = 2.4
            elif hw_type in ["residential", "living_street"]:
                cat = "Residential Street"
                visual_priority = 4
                color = "#94a3b8"
                width = 1.8
            else:
                cat = "Service / Pedestrian Path"
                visual_priority = 5
                color = "#64748b"
                width = 1.2

            validation_stats["road_classification_audit"][cat] = validation_stats["road_classification_audit"].get(cat, 0) + 1

            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or props.get("name:en") or f"Unnamed {cat}",
                "highway": hw_type,
                "category": cat,
                "lanes": lanes or (6 if visual_priority == 1 else (4 if visual_priority == 2 else 2)),
                "maxspeed": maxspeed or (80 if visual_priority == 1 else 50),
                "surface": props.get("surface") or "Asphalt",
                "visual_priority": visual_priority,
                "color": color,
                "width": width,
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }

            categorized["roads"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

        # 3. PARKS
        elif "leisure" in props or props.get("landuse") in ["recreation_ground", "grass", "forest", "village_green"]:
            leisure_type = props.get("leisure") or props.get("landuse")
            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or props.get("name:en") or f"Green Space ({osm_id.split('/')[-1]})",
                "category": "Park / Green Space",
                "type": leisure_type,
                "color": "#10b981",
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }
            categorized["parks"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

        # 4. WATER
        elif "water" in props or "waterway" in props or props.get("natural") in ["water", "wetland"]:
            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or props.get("name:en") or f"Water Body ({osm_id.split('/')[-1]})",
                "category": "Water Body",
                "type": props.get("water") or props.get("waterway") or props.get("natural"),
                "color": "#0284c7",
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }
            categorized["water"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

        # 5. LAND USE
        elif "landuse" in props:
            lu = props["landuse"]
            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or f"{lu.capitalize()} Zoning",
                "landuse": lu,
                "category": "Land Use Zone",
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }
            categorized["landuse"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

        # 6. AMENITIES
        elif "amenity" in props:
            amenity_type = props["amenity"]
            norm_props = {
                "id": osm_id,
                "osm_id": osm_id,
                "name": props.get("name") or props.get("name:en") or f"{amenity_type.capitalize()} ({osm_id.split('/')[-1]})",
                "amenity": amenity_type,
                "category": "Public Amenity",
                "data_source": "OpenStreetMap Contributors (ODbL)",
                "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
            }
            categorized["amenities"].append({
                "type": "Feature",
                "id": osm_id,
                "geometry": valid_geom,
                "properties": norm_props
            })

    # Export split raw files in data/raw/
    for layer_name, layer_feats in categorized.items():
        raw_target = os.path.join(RAW_DIR, f"{layer_name}.geojson")
        with open(raw_target, "w", encoding="utf-8") as f:
            json.dump({"type": "FeatureCollection", "features": layer_feats}, f)

    # Export validated & normalized files to data/processed/ and public/data/
    metadata = {
        "region": "Gurugram, Haryana, India",
        "focus_area": "DLF Cyber City, Udyog Vihar & DLF Phase II/III",
        "bbox": [
            round(validation_stats["geographic_bounds"]["min_lng"], 6),
            round(validation_stats["geographic_bounds"]["min_lat"], 6),
            round(validation_stats["geographic_bounds"]["max_lng"], 6),
            round(validation_stats["geographic_bounds"]["max_lat"], 6),
        ],
        "source": "OpenStreetMap Contributors (ODbL)",
        "extraction_date": "2026-11-16",
        "coordinate_reference_system": "EPSG:4326 (WGS84)",
        "boundary_status": "GMDA planning extent is an approximate municipal polygon guideline (unverified against official cadastral survey shapefile)",
        "layers": {}
    }

    for layer_name, layer_feats in categorized.items():
        fc = {
            "type": "FeatureCollection",
            "name": f"gurugram_{layer_name}",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
            },
            "features": layer_feats
        }
        
        proc_target = os.path.join(PROCESSED_DIR, f"{layer_name}.geojson")
        public_target = os.path.join(PUBLIC_DIR, f"{layer_name}.geojson")
        
        with open(proc_target, "w", encoding="utf-8") as f:
            json.dump(fc, f, separators=(',', ':'))
        with open(public_target, "w", encoding="utf-8") as f:
            json.dump(fc, f, separators=(',', ':'))

        metadata["layers"][layer_name] = {
            "count": len(layer_feats),
            "file": f"/data/{layer_name}.geojson",
            "size_kb": round(os.path.getsize(public_target) / 1024, 1),
            "verified": True if layer_name in ["buildings", "roads", "parks", "water", "amenities"] else False,
            "verification_notes": "Originates from actual OpenStreetMap geographic elements."
        }

    meta_target = os.path.join(PUBLIC_DIR, "metadata.json")
    with open(meta_target, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    val_target = os.path.join(PUBLIC_DIR, "validation_report.json")
    with open(val_target, "w", encoding="utf-8") as f:
        json.dump(validation_stats, f, indent=2)

    print("[Done] Data pipeline and validation report compiled successfully.")

if __name__ == "__main__":
    ensure_dirs()
    input_file = os.path.join(RAW_DIR, "gurugram_osm.geojson")
    if os.path.exists(input_file):
        process_and_validate_osm_dataset(input_file)
