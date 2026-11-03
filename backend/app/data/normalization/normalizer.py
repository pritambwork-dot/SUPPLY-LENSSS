"""
SupplyLens Deterministic Data Normalizer
Standardizes company names, URLs, phone numbers, country codes, currencies, and units.
"""

import re
from typing import Dict, Any, Optional
from urllib.parse import urlparse, urlunparse

COUNTRY_CANONICAL = {
    "india": ("India", "IN"),
    "bharat": ("India", "IN"),
    "hindustan": ("India", "IN"),
    "united states": ("United States", "US"),
    "usa": ("United States", "US"),
    "united states of america": ("United States", "US"),
    "united kingdom": ("United Kingdom", "GB"),
    "uk": ("United Kingdom", "GB"),
    "germany": ("Germany", "DE"),
    "vietnam": ("Vietnam", "VN"),
    "china": ("China", "CN"),
    "france": ("France", "FR"),
    "italy": ("Italy", "IT"),
    "japan": ("Japan", "JP"),
}


def normalize_company_name(name: Optional[str]) -> str:
    """Strips commercial entity suffixes and whitespace."""
    if not name:
        return ""
    clean = re.sub(
        r"(?i)\b(pvt\.?\s*ltd\.?|private\s*limited|ltd\.?|limited|inc\.?|corp\.?|corporation|llc|gmbh|co\.?)(?:\.|\b)",
        "",
        name
    )
    return " ".join(clean.split()).strip(" .,-")


def normalize_url(raw_url: Optional[str]) -> str:
    """Standardizes URLs by enforcing HTTPS, lowercasing domain, and stripping tracking tags."""
    if not raw_url:
        return ""
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        parsed = urlparse(url)
        # Lowercase hostname, strip trailing slash and tracking query params
        netloc = parsed.netloc.lower()
        path = parsed.path.rstrip("/")
        # Filter tracking params
        return f"https://{netloc}{path}"
    except Exception:
        return url


def normalize_phone(raw: str) -> str:
    """Standardizes phone numbers into numeric format with optional '+' prefix."""
    if not raw:
        return ""
    has_plus = raw.strip().startswith("+")
    cleaned = re.sub(r"[^\d]", "", raw)
    return f"+{cleaned}" if has_plus else cleaned


def normalize_country(country_str: Optional[str]) -> tuple[str, str]:
    """Returns (canonical_country_name, iso_country_code)."""
    if not country_str:
        return "India", "IN"
    c_lower = country_str.lower().strip()
    if c_lower in COUNTRY_CANONICAL:
        return COUNTRY_CANONICAL[c_lower]
    return country_str.strip().title(), "GL"


def normalize_unit(unit_str: Optional[str]) -> str:
    """Standardizes units of measurement."""
    if not unit_str:
        return "piece"
    u = unit_str.lower().strip()
    if u in ["pcs", "pc", "piece", "pieces", "units", "unit"]:
        return "piece"
    if u in ["kg", "kgs", "kilogram", "kilograms"]:
        return "kg"
    if u in ["ton", "tons", "tonne", "tonnes", "metric ton", "mt"]:
        return "ton"
    if u in ["meter", "meters", "m", "mtr"]:
        return "meter"
    return u


def normalize_supplier_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Standardizes all supplier attributes deterministically."""
    name = raw_data.get("name") or raw_data.get("company_name") or ""
    country_name, country_code = normalize_country(raw_data.get("country"))

    normalized = {
        "name": normalize_company_name(name),
        "legal_name": (raw_data.get("legal_name") or name).strip(),
        "description": (raw_data.get("description") or "").strip(),
        "website": normalize_url(raw_data.get("website") or raw_data.get("url") or raw_data.get("website_url")),
        "country": country_name,
        "country_code": country_code,
        "city": (raw_data.get("city") or "Industrial Zone").strip().title(),
        "address": (raw_data.get("address") or "").strip(),
        "supplier_type": raw_data.get("supplier_type") or "Manufacturer",
        "contacts": [],
        "categories": [c.strip() for c in raw_data.get("categories", []) if c],
        "products": [],
        "capabilities": [cap.strip() for cap in raw_data.get("capabilities", []) if cap],
        "certifications": [cert.strip() for cert in raw_data.get("certifications", []) if cert],
    }

    # Normalize contacts
    for c in raw_data.get("contacts", []):
        ctype = c.get("type", "phone")
        val = c.get("value", "")
        if ctype == "phone":
            val = normalize_phone(val)
        normalized["contacts"].append({
            "type": ctype,
            "value": val,
            "role": c.get("role", "general"),
            "source_url": c.get("source_url", normalized["website"]),
        })

    # Normalize products
    for p in raw_data.get("products", []):
        normalized["products"].append({
            "name": p.get("name", "Industrial Supply").strip(),
            "material": p.get("material", "Composite"),
            "specs": p.get("specs", ""),
            "quoted_price": float(p.get("estimated_price") or p.get("quoted_price") or 5.0),
            "currency": p.get("currency", "INR"),
            "moq": int(p.get("moq") or 1000),
            "unit": normalize_unit(p.get("unit")),
        })

    return normalized
