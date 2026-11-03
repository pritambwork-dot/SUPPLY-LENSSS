"""
SupplyLens Geocoding & Proximity Calculation Service
Provides geospatial coordinates, distance calculations, and proximity scoring.
"""

import os
import json
import math
import urllib.request
import urllib.parse
from typing import Tuple, Dict, Any, Optional

GEOAPIFY_API_KEY = os.environ.get("GEOAPIFY_API_KEY", "ffa02fdcc964436d9b4daa0f992effce")
_ROUTING_CACHE: Dict[Tuple[str, str], int] = {}
_GEOCODE_CACHE: Dict[str, Tuple[float, float]] = {}

# Known reference coordinates for major manufacturing and entrepreneur hubs
CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    # India
    "bhubaneswar": (20.2961, 85.8245),
    "cuttack": (20.4625, 85.8828),
    "kolkata": (22.5726, 88.3639),
    "pune": (18.5204, 73.8567),
    "mumbai": (19.0760, 72.8777),
    "surat": (21.1702, 72.8311),
    "vapi": (20.3714, 72.9106),
    "yamunanagar": (30.1290, 77.2674),
    "bengaluru": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "delhi": (28.6139, 77.2090),
    # International
    "hamburg": (53.5511, 9.9937),
    "munich": (48.1351, 11.5820),
    "dongguan": (23.0205, 113.7518),
    "shenzhen": (22.5431, 114.0579),
    "binh duong": (11.1666, 106.6333),
    "ho chi minh": (10.8231, 106.6297),
    "los angeles": (34.0522, -118.2437),
    "chicago": (41.8781, -87.6298),
}


class GeocodingService:
    """Calculates geographic distance and transit feasibility."""

    @classmethod
    def geocode_city_live(cls, city_name: str) -> Optional[Tuple[float, float]]:
        """Geocodes a city using Geoapify Geocoding API with fallback to known coordinates."""
        cleaned = city_name.lower().strip()
        if cleaned in CITY_COORDINATES:
            return CITY_COORDINATES[cleaned]
        if cleaned in _GEOCODE_CACHE:
            return _GEOCODE_CACHE[cleaned]

        if not GEOAPIFY_API_KEY:
            return None

        try:
            url = f"https://api.geoapify.com/v1/geocode/search?text={urllib.parse.quote(cleaned)}&apiKey={GEOAPIFY_API_KEY}&limit=1"
            req = urllib.request.Request(url, headers={"User-Agent": "SupplyLens/1.0"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                if features:
                    coords = features[0].get("geometry", {}).get("coordinates", [])
                    if len(coords) >= 2:
                        res = (float(coords[1]), float(coords[0]))
                        _GEOCODE_CACHE[cleaned] = res
                        return res
        except Exception:
            pass
        return None

    @classmethod
    def get_live_road_distance_km(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> Optional[int]:
        """Calculates exact driving road distance via Geoapify Routing API."""
        if not GEOAPIFY_API_KEY:
            return None

        try:
            url = f"https://api.geoapify.com/v1/routing?waypoints={lat1},{lon1}|{lat2},{lon2}&mode=drive&apiKey={GEOAPIFY_API_KEY}"
            req = urllib.request.Request(url, headers={"User-Agent": "SupplyLens/1.0"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                if features:
                    props = features[0].get("properties", {})
                    meters = props.get("distance", 0)
                    if meters > 0:
                        return int(meters / 1000)
        except Exception:
            pass
        return None

    @classmethod
    def calculate_distance_km(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> int:
        """Haversine great-circle distance in kilometers."""
        radius = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return int(radius * c)

    @classmethod
    def get_city_distance(cls, user_city: str, supplier_city: str, default_km: int = 1200) -> int:
        """Returns road/freight distance estimate between two cities (with Geoapify routing)."""
        u_key = user_city.lower().strip()
        s_key = supplier_city.lower().strip()
        cache_key = (u_key, s_key)
        if cache_key in _ROUTING_CACHE:
            return _ROUTING_CACHE[cache_key]

        c1 = cls.geocode_city_live(user_city)
        c2 = cls.geocode_city_live(supplier_city)
        if c1 and c2:
            # Try live Geoapify road routing if available
            live_dist = cls.get_live_road_distance_km(c1[0], c1[1], c2[0], c2[1])
            if live_dist is not None:
                _ROUTING_CACHE[cache_key] = live_dist
                return live_dist

            haversine = cls.calculate_distance_km(c1[0], c1[1], c2[0], c2[1])
            # Apply 1.25x road/transit route factor
            dist = int(haversine * 1.25)
            _ROUTING_CACHE[cache_key] = dist
            return dist
        return default_km

    @classmethod
    def estimate_transit_days(cls, distance_km: int, is_international: bool = False) -> int:
        """Estimates typical cargo transit days based on distance."""
        if is_international:
            return max(14, int(distance_km / 300))
        if distance_km < 100:
            return 1
        elif distance_km < 500:
            return 2
        elif distance_km < 1500:
            return 4
        else:
            return 6
