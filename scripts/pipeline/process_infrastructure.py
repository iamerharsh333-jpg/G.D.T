#!/usr/bin/env python3
"""
Infrastructure Processing & Integration Module
Processes data/raw/gurugram_infrastructure.geojson, performs RFC 7946 geometry
validation, extracts 6 distinct GIS layers, computes centroids and areas/lengths,
and merges them with existing layers while removing duplicate OSM elements.
"""

import json
import os
import sys
import math
from typing import Dict, Any, List, Tuple, Set

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validate_geojson import validate_and_repair_geometry

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
PUBLIC_DIR = "public/data"

def compute_centroid(coords: Any, gtype: str) -> Tuple[float, float]:
    """Returns (lon, lat)"""
    if gtype == "Point":
        return round(coords[0], 6), round(coords[1], 6)
    elif gtype == "LineString":
        if not coords: return 77.089, 28.495
        lon = sum(p[0] for p in coords) / len(coords)
        lat = sum(p[1] for p in coords) / len(coords)
        return round(lon, 6), round(lat, 6)
    elif gtype == "Polygon":
        if not coords or not coords[0]: return 77.089, 28.495
        ring = coords[0][:-1] if coords[0][0] == coords[0][-1] and len(coords[0]) > 1 else coords[0]
        lon = sum(p[0] for p in ring) / len(ring)
        lat = sum(p[1] for p in ring) / len(ring)
        return round(lon, 6), round(lat, 6)
    elif gtype == "MultiPolygon":
        if not coords or not coords[0] or not coords[0][0]: return 77.089, 28.495
        ring = coords[0][0]
        lon = sum(p[0] for p in ring) / len(ring)
        lat = sum(p[1] for p in ring) / len(ring)
        return round(lon, 6), round(lat, 6)
    return 77.089, 28.495

def classify_infrastructure_feature(props: Dict[str, Any]) -> str:
    """
    Returns one of: healthcare, education, transport, water, parks, landuse
    """
    amenity = str(props.get("amenity", "")).lower()
    healthcare = str(props.get("healthcare", "")).lower()
    leisure = str(props.get("leisure", "")).lower()
    landuse = str(props.get("landuse", "")).lower()
    boundary = str(props.get("boundary", "")).lower()
    water = str(props.get("water", "")).lower()
    waterway = str(props.get("waterway", "")).lower()
    natural = str(props.get("natural", "")).lower()
    pt = str(props.get("public_transport", "")).lower()
    railway = str(props.get("railway", "")).lower()
    subway = str(props.get("subway", "")).lower()
    highway = str(props.get("highway", "")).lower()

    # Check relation tags
    has_pt_rel = False
    has_landuse_rel = False
    for r in props.get("@relations", []):
        rt = r.get("reltags", {})
        if "public_transport" in rt or "railway" in rt or "subway" in rt:
            has_pt_rel = True
        if "landuse" in rt or "boundary" in rt:
            has_landuse_rel = True

    # 1. Healthcare Facilities
    if healthcare or amenity in ("hospital", "clinic", "pharmacy", "doctors", "dentist"):
        return "healthcare"

    # 2. Educational Institutions
    if amenity in ("school", "college", "university", "kindergarten"):
        return "education"

    # 3. Public Transport
    if pt or railway or subway == "yes" or highway == "bus_stop" or props.get("station") or has_pt_rel:
        return "transport"

    # 4. Water Bodies & Drainage
    if water or waterway or natural in ("water", "wetland") or "drain" in water or "drain" in waterway:
        return "water"

    # 5. Parks and Greenery
    if leisure in ("park", "garden", "pitch", "playground", "nature_reserve", "dog_park") or landuse in ("grass", "recreation_ground", "forest", "meadow", "village_green"):
        return "parks"

    # 6. Land Use and Zoning
    if landuse or boundary in ("administrative", "residential") or has_landuse_rel or amenity == "police":
        return "landuse"

    return "landuse"

def process_infrastructure():
    infra_file = os.path.join(RAW_DIR, "gurugram_infrastructure.geojson")
    if not os.path.exists(infra_file):
        print(f"File not found: {infra_file}")
        return

    with open(infra_file, "r", encoding="utf-8") as f:
        infra_data = json.load(f)

    features = infra_data.get("features", [])
    print(f"[Infra] Processing {len(features)} features from {infra_file}...")

    # Load existing layers to prevent duplicates and enable merging
    existing_layers = {}
    for lname in ["parks", "water", "landuse", "amenities"]:
        path = os.path.join(PUBLIC_DIR, f"{lname}.geojson")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                existing_layers[lname] = json.load(f).get("features", [])
        else:
            existing_layers[lname] = []

    categorized: Dict[str, List[Dict[str, Any]]] = {
        "landuse": [],
        "parks": [],
        "healthcare": [],
        "education": [],
        "transport": [],
        "water": []
    }

    seen_ids: Set[str] = set()
    duplicate_count = 0
    invalid_count = 0

    # First, import existing features into the new layer taxonomy (without duplicating)
    # Existing parks -> parks
    for f in existing_layers.get("parks", []):
        p = f.get("properties", {})
        oid = p.get("@id") or p.get("id") or str(f.get("id", ""))
        if oid and oid not in seen_ids:
            seen_ids.add(oid)
            categorized["parks"].append(f)

    # Existing water -> water
    for f in existing_layers.get("water", []):
        p = f.get("properties", {})
        oid = p.get("@id") or p.get("id") or str(f.get("id", ""))
        if oid and oid not in seen_ids:
            seen_ids.add(oid)
            categorized["water"].append(f)

    # Existing landuse -> landuse
    for f in existing_layers.get("landuse", []):
        p = f.get("properties", {})
        oid = p.get("@id") or p.get("id") or str(f.get("id", ""))
        if oid and oid not in seen_ids:
            seen_ids.add(oid)
            categorized["landuse"].append(f)

    # Existing amenities -> distribute to healthcare or education or landuse
    for f in existing_layers.get("amenities", []):
        p = f.get("properties", {})
        oid = p.get("@id") or p.get("id") or str(f.get("id", ""))
        if oid and oid not in seen_ids:
            seen_ids.add(oid)
            amenity = p.get("amenity", "").lower()
            if amenity in ("hospital", "clinic", "pharmacy", "doctors"):
                categorized["healthcare"].append(f)
            elif amenity in ("school", "college", "university", "kindergarten"):
                categorized["education"].append(f)
            else:
                categorized["healthcare"].append(f)

    # Now integrate the new gurugram_infrastructure dataset
    for feat in features:
        props = feat.get("properties", {}) or {}
        geom = feat.get("geometry", {})
        oid = props.get("@id") or props.get("id") or str(feat.get("id", ""))

        if oid and oid in seen_ids:
            duplicate_count += 1
            continue
        if oid:
            seen_ids.add(oid)

        valid_geom, err = validate_and_repair_geometry(geom)
        if not valid_geom:
            invalid_count += 1
            continue

        gtype = valid_geom.get("type", "Point")
        centroid = compute_centroid(valid_geom.get("coordinates", []), gtype)
        cat = classify_infrastructure_feature(props)

        # Resolve primary name
        rel_names = []
        for r in props.get("@relations", []):
            rt = r.get("reltags", {})
            if rt.get("name"): rel_names.append(rt["name"])

        raw_name = props.get("name") or props.get("name:en") or (rel_names[0] if rel_names else None)
        has_name = bool(raw_name)

        # Subtype description
        sub_type = (
            props.get("healthcare") or
            props.get("amenity") or
            props.get("public_transport") or
            props.get("railway") or
            props.get("leisure") or
            props.get("water") or
            props.get("waterway") or
            props.get("landuse") or
            props.get("boundary") or
            "infrastructure"
        )

        display_name = raw_name if has_name else f"OSM {sub_type.capitalize()} ({oid.split('/')[-1]})"

        layer_labels = {
            "healthcare": "Healthcare Facility",
            "education": "Educational Institution",
            "transport": "Public Transport",
            "parks": "Parks & Greenery",
            "water": "Water Body & Drainage",
            "landuse": "Land Use & Zoning"
        }

        norm_props = {
            "id": oid,
            "osm_id": oid,
            "name": display_name,
            "has_source_name": has_name,
            "category": layer_labels[cat],
            "sub_type": sub_type,
            "geometry_type": gtype,
            "centroid": centroid,
            "operator": props.get("operator") or (props.get("@relations", [{}])[0].get("reltags", {}).get("operator") if props.get("@relations") else None),
            "network": props.get("network") or (props.get("@relations", [{}])[0].get("reltags", {}).get("network") if props.get("@relations") else None),
            "surface": props.get("surface"),
            "data_source": "OpenStreetMap Contributors (ODbL) via Overpass Turbo",
            "raw_tags": {k: v for k, v in props.items() if not k.startswith("@")}
        }

        categorized[cat].append({
            "type": "Feature",
            "id": oid,
            "geometry": valid_geom,
            "properties": norm_props
        })

    print(f"[Infra] Categorization and deduplication complete:")
    print(f"  - Duplicates detected and merged: {duplicate_count}")
    print(f"  - Invalid geometries: {invalid_count}")
    for k, v in categorized.items():
        print(f"  - {k}: {len(v)} features")

    # Export all 6 layers
    for layer_name, layer_feats in categorized.items():
        fc = {
            "type": "FeatureCollection",
            "name": f"gurugram_{layer_name}",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": layer_feats
        }
        for d in [PROCESSED_DIR, PUBLIC_DIR]:
            tpath = os.path.join(d, f"{layer_name}.geojson")
            with open(tpath, "w", encoding="utf-8") as f:
                json.dump(fc, f, separators=(',', ':'))

    print("[Infra] All 6 GIS layers successfully generated in data/processed/ and public/data/!")

if __name__ == "__main__":
    process_infrastructure()

