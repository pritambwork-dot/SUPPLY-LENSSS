"""
SupplyLens Geographic & Map Intelligence Service
Computes country/regional clusters, marker groupings, and preview summaries for the map view.
"""

from typing import List, Dict, Any, Optional


class MapService:
    """Handles clustering, marker coordinates, and map view data."""

    @classmethod
    def get_map_clusters_and_markers(
        cls,
        suppliers: List[Dict[str, Any]],
        zoom_level: int = 4
    ) -> Dict[str, Any]:
        """
        Returns:
        1. Country-level cluster counts (e.g. India: 418, China: 392, Vietnam: 167)
        2. Individual supplier markers with compact preview details for click popups.
        """
        country_clusters: Dict[str, Dict[str, Any]] = {}
        markers: List[Dict[str, Any]] = []

        for s in suppliers:
            country = s.get("country", "Unknown")
            lat = float(s.get("lat", 20.0))
            lng = float(s.get("lng", 78.0))

            if country not in country_clusters:
                country_clusters[country] = {
                    "country": country,
                    "count": 0,
                    "center_lat": lat,
                    "center_lng": lng,
                    "supplier_ids": []
                }

            country_clusters[country]["count"] += 1
            country_clusters[country]["supplier_ids"].append(s.get("id"))

            # Build compact marker preview payload
            primary_product = s.get("products", [{}])[0] if s.get("products") else {}
            quoted_price = primary_product.get("quoted_price", 0.0)
            unit = primary_product.get("unit", "piece")
            curr = primary_product.get("currency", "INR")
            moq = primary_product.get("moq", 1000)

            markers.append({
                "id": s.get("id"),
                "name": s.get("name"),
                "verified": s.get("verification_status") == "Verified",
                "city": s.get("city"),
                "country": country,
                "lat": lat,
                "lng": lng,
                "rating": s.get("rating", 4.5),
                "review_count": s.get("review_count", 0),
                "starting_price": f"₹{quoted_price:,.2f} / {unit}" if curr == "INR" else f"${quoted_price:,.2f} / {unit}",
                "moq": f"{moq:,} {unit}s",
                "match_score": s.get("match_score", 90),
                "match_reason": s.get("match_reason", "Good fit for your budget and volume"),
            })

        # Calculate average centroid for each country cluster
        cluster_list = list(country_clusters.values())

        return {
            "zoom_level": zoom_level,
            "clusters": cluster_list,
            "markers": markers,
            "total_pins": len(markers),
        }
