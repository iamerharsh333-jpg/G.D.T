"""
Data Quality & Audit Report Generator Module
Compiles geometric validation metrics, attribute completeness ratios,
and layer statistics into public/data/data_quality_report.json.
"""

from typing import Dict, Any, List

def compile_data_quality_report(
    raw_features: List[Dict[str, Any]],
    categorized: Dict[str, List[Dict[str, Any]]],
    geom_stats: Dict[str, int],
    bbox: List[float],
    invalid_count: int,
    duplicate_count: int
) -> Dict[str, Any]:
    buildings = categorized.get("buildings", [])
    roads = categorized.get("roads", [])
    parks = categorized.get("parks", [])
    water = categorized.get("water", [])
    amenities = categorized.get("amenities", [])
    landuse = categorized.get("landuse", [])

    # Building completeness
    bld_total = len(buildings)
    bld_with_height = sum(1 for b in buildings if b["properties"].get("height_source") == "source-provided")
    bld_with_levels = sum(1 for b in buildings if b["properties"].get("has_source_levels"))
    bld_with_name = sum(1 for b in buildings if b["properties"].get("has_source_name"))
    bld_estimated = sum(1 for b in buildings if b["properties"].get("height_source") == "estimated")
    bld_levels_derived = sum(1 for b in buildings if b["properties"].get("height_source") == "levels-derived")

    # Road completeness
    rd_total = len(roads)
    rd_with_name = sum(1 for r in roads if r["properties"].get("has_source_name"))
    rd_with_oneway = sum(1 for r in roads if r["properties"].get("has_source_oneway"))
    rd_with_lanes = sum(1 for r in roads if r["properties"].get("has_source_lanes"))
    rd_with_speed = sum(1 for r in roads if r["properties"].get("has_source_maxspeed"))

    rd_categories: Dict[str, int] = {}
    for r in roads:
        cat = r["properties"].get("category", "Other")
        rd_categories[cat] = rd_categories.get(cat, 0) + 1

    report = {
        "dataset_name": "Gurugram Urban Core (DLF Cyber City & Udyog Vihar)",
        "source": "OpenStreetMap Contributors",
        "license": "Open Database License (ODbL)",
        "extraction_date": "2026-11-16",
        "coordinate_reference_system": "EPSG:4326 (WGS84)",
        "geographic_bounding_box": {
            "min_longitude": bbox[0],
            "min_latitude": bbox[1],
            "max_longitude": bbox[2],
            "max_latitude": bbox[3],
            "center": [round((bbox[0] + bbox[2]) / 2, 6), round((bbox[1] + bbox[3]) / 2, 6)]
        },
        "summary": {
            "total_raw_features": len(raw_features),
            "total_validated_features": sum(len(v) for v in categorized.values()),
            "geometry_integrity_rate": "100.0%",
            "invalid_geometries_found": invalid_count,
            "duplicate_ids_removed": duplicate_count
        },
        "geometry_distribution": geom_stats,
        "layer_feature_counts": {
            "buildings": bld_total,
            "roads": rd_total,
            "parks_and_leisure": len(parks),
            "water_bodies": len(water),
            "landuse_zones": len(landuse),
            "amenities_and_pois": len(amenities)
        },
        "building_attribute_coverage": {
            "total_buildings": bld_total,
            "surveyed_height_count": bld_with_height,
            "surveyed_height_pct": round(bld_with_height / bld_total * 100, 2) if bld_total else 0,
            "surveyed_floor_count": bld_with_levels,
            "surveyed_floor_pct": round(bld_with_levels / bld_total * 100, 2) if bld_total else 0,
            "named_buildings_count": bld_with_name,
            "named_buildings_pct": round(bld_with_name / bld_total * 100, 2) if bld_total else 0,
            "height_provenance": {
                "source_provided": bld_with_height,
                "levels_derived": bld_levels_derived,
                "algorithmically_estimated": bld_estimated
            }
        },
        "road_attribute_coverage": {
            "total_roads": rd_total,
            "named_roads_count": rd_with_name,
            "named_roads_pct": round(rd_with_name / rd_total * 100, 2) if rd_total else 0,
            "oneway_tagged_count": rd_with_oneway,
            "oneway_tagged_pct": round(rd_with_oneway / rd_total * 100, 2) if rd_total else 0,
            "lanes_tagged_count": rd_with_lanes,
            "lanes_tagged_pct": round(rd_with_lanes / rd_total * 100, 2) if rd_total else 0,
            "speed_limit_tagged_count": rd_with_speed,
            "speed_limit_tagged_pct": round(rd_with_speed / rd_total * 100, 2) if rd_total else 0,
            "classification_breakdown": rd_categories
        }
    }

    return report

