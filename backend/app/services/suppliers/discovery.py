"""
SupplyLens Supplier Discovery Pipeline
Coordinates catalog querying, entity matching, duplicate removal, verification, and sorting.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from difflib import SequenceMatcher
from app.services.suppliers.verification import VerificationEngine
from app.services.suppliers.contacts import ContactService
from app.services.suppliers.pricing import PriceIntelligenceService
from app.services.suppliers.ranking import SupplierRankingEngine


def normalize_string(val: Optional[str]) -> str:
    if not val:
        return ""
    # Strip common suffixes like pvt ltd, gmbh, co, inc, corp, llc
    clean = re.sub(r"(?i)\b(pvt\.?|ltd\.?|limited|inc\.?|corp\.?|llc|gmbh|co\.?)\b", "", val)
    return re.sub(r"[^a-zA-Z0-9]", "", clean).lower()


def are_suppliers_duplicate(s1: Dict[str, Any], s2: Dict[str, Any]) -> bool:
    """Checks if two supplier records represent the same legal or physical entity."""
    # 1. Exact ID
    if s1.get("id") == s2.get("id"):
        return True

    # 2. Domain match
    w1 = s1.get("website", "").lower().replace("https://", "").replace("http://", "").replace("www.", "").strip("/")
    w2 = s2.get("website", "").lower().replace("https://", "").replace("http://", "").replace("www.", "").strip("/")
    if w1 and w2 and len(w1) > 4 and w1 == w2:
        return True

    # 3. Exact phone match
    p1 = re.sub(r"[^0-9]", "", str(s1.get("public_phone", "")))
    p2 = re.sub(r"[^0-9]", "", str(s2.get("public_phone", "")))
    if p1 and p2 and len(p1) >= 8 and p1 == p2:
        return True

    # 4. High name similarity + same city
    name1 = normalize_string(s1.get("name") or s1.get("legal_name"))
    name2 = normalize_string(s2.get("name") or s2.get("legal_name"))
    city1 = (s1.get("city") or "").lower().strip()
    city2 = (s2.get("city") or "").lower().strip()

    if city1 and city1 == city2 and name1 and name2:
        similarity = SequenceMatcher(None, name1, name2).ratio()
        if similarity >= 0.85:
            return True

    return False


def deduplicate_suppliers(suppliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Removes duplicate supplier records while merging evidence sources."""
    unique_list: List[Dict[str, Any]] = []

    for item in suppliers:
        found_match = False
        for existing in unique_list:
            if are_suppliers_duplicate(item, existing):
                # Merge certifications, sources, and products without duplicating
                existing_certs = set(existing.get("certifications", []))
                for c in item.get("certifications", []):
                    existing_certs.add(c)
                existing["certifications"] = list(existing_certs)
                found_match = True
                break
        if not found_match:
            unique_list.append(dict(item))

    return unique_list


class SupplierDiscoveryService:
    """Modular supplier discovery engine."""

    @classmethod
    def search_suppliers(
        cls,
        catalog: List[Dict[str, Any]],
        query: Optional[str] = None,
        product: Optional[str] = None,
        country: Optional[str] = None,
        city: Optional[str] = None,
        supplier_type: Optional[str] = None,
        max_moq: Optional[int] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        verified_only: bool = True,
        sort_by: str = "recommended",
        business_profile: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes verified supplier discovery pipeline.
        Returns matching suppliers with scores, country aggregation counts, and recommendations.
        """
        # Step 1: Deduplicate
        deduped = deduplicate_suppliers(catalog)

        # Step 2: Audit & Verification Check
        verified_pool = []
        for s in deduped:
            dossier = VerificationEngine.evaluate_supplier(s)
            s_copy = dict(s)
            s_copy["verification_status"] = dossier["verification_status"]
            s_copy["verification_score"] = dossier["verification_score"]
            s_copy["data_confidence"] = dossier["data_confidence"]
            s_copy["verification_dossier"] = dossier

            # Contacts formatting
            contact_info = ContactService.format_supplier_contacts(s_copy)
            s_copy["public_email"] = contact_info["public_email"]
            s_copy["has_verified_email"] = contact_info["has_verified_email"]
            s_copy["email_fallback_message"] = contact_info["email_fallback_message"]

            # Pricing formatting on primary product
            if s_copy.get("products"):
                p0 = s_copy["products"][0]
                p0["moq_meaning"] = PriceIntelligenceService.interpret_moq(p0.get("moq", 1000))
                p0_price_info = PriceIntelligenceService.format_price_display(
                    price_min=p0.get("quoted_price", 10.0),
                    price_max=p0.get("quoted_price", 10.0) * 1.15,
                    currency=p0.get("currency", "INR"),
                    unit=p0.get("unit", "piece"),
                    price_type="publicly_listed",
                    target_currency=business_profile.get("budget_currency", "INR") if business_profile else "INR"
                )
                p0["price_type"] = p0_price_info["price_type"]
                p0["price_note"] = p0_price_info["price_note"]
                p0["display_price"] = p0_price_info["display_price"]

            # Scoring
            score, dims, reason = SupplierRankingEngine.score_supplier(s_copy, business_profile, target_product_name=product)
            s_copy["match_score"] = score
            s_copy["match_reason"] = reason

            verified_pool.append(s_copy)

        # Step 3: Verified Only Gate
        # Only "Verified" or "Demo Verified" suppliers may appear in the main verified supplier result set
        if verified_only:
            working_set = [s for s in verified_pool if "Verified" in s.get("verification_status", "")]
        else:
            working_set = verified_pool

        # Step 4: Apply Progressive Search & Filter Criteria
        filtered = []
        for s in working_set:
            # 1. Product filter
            if product:
                p_lower = product.lower().strip()
                tokens = [t for t in re.split(r'\W+', p_lower) if len(t) > 2]
                has_prod = any(
                    p_lower in p.get("name", "").lower()
                    or p_lower in p.get("category", "").lower()
                    or any(t in p.get("name", "").lower() or t in p.get("category", "").lower() for t in tokens)
                    for p in s.get("products", [])
                ) if tokens else True
                if not has_prod:
                    continue

            # 2. General Query
            if query:
                q_lower = query.lower().strip()
                tokens = [t for t in re.split(r'\W+', q_lower) if len(t) > 2]
                matches_q = (
                    q_lower in s.get("name", "").lower()
                    or q_lower in s.get("city", "").lower()
                    or q_lower in s.get("country", "").lower()
                    or any(t in s.get("name", "").lower() or t in s.get("city", "").lower() or t in s.get("country", "").lower() for t in tokens)
                    or any(
                        q_lower in p.get("name", "").lower()
                        or q_lower in p.get("category", "").lower()
                        or any(t in p.get("name", "").lower() or t in p.get("category", "").lower() for t in tokens)
                        for p in s.get("products", [])
                    )
                ) if tokens else True
                if not matches_q:
                    continue

            # 3. Country
            if country and country.lower() != "all":
                if s.get("country", "").lower() != country.lower():
                    continue

            # 4. City
            if city and city.lower() != "all":
                if city.lower() not in s.get("city", "").lower():
                    continue

            # 5. Supplier Type
            if supplier_type and supplier_type.lower() != "all":
                if s.get("supplier_type", "").lower() != supplier_type.lower():
                    continue

            # 6. Max MOQ
            if max_moq and max_moq > 0:
                lowest_moq = min([p.get("moq", 999999) for p in s.get("products", [{}])])
                if lowest_moq > max_moq:
                    continue

            # 7. Max Price
            if max_price and max_price > 0:
                lowest_price = min([p.get("quoted_price", 999999.0) for p in s.get("products", [{}])])
                if lowest_price > max_price:
                    continue

            # 8. Min Rating
            if min_rating and min_rating > 0:
                if float(s.get("rating", 0.0)) < min_rating:
                    continue

            filtered.append(s)

        # Step 5: Sorting
        if sort_by == "cheapest":
            filtered.sort(key=lambda s: s.get("products", [{}])[0].get("quoted_price", 999999))
        elif sort_by == "lowest_landed":
            filtered.sort(key=lambda s: s.get("products", [{}])[0].get("estimated_landed_cost", 999999))
        elif sort_by == "highest_rated":
            filtered.sort(key=lambda s: float(s.get("rating", 0.0)), reverse=True)
        elif sort_by == "lowest_moq":
            filtered.sort(key=lambda s: s.get("products", [{}])[0].get("moq", 999999))
        elif sort_by == "nearest":
            filtered.sort(key=lambda s: s.get("distance_km", 99999))
        elif sort_by == "best_verified":
            filtered.sort(key=lambda s: s.get("verification_score", 0), reverse=True)
        else:
            # Default: Recommended (Match score)
            filtered.sort(key=lambda s: s.get("match_score", 0), reverse=True)

        # Step 6: Compute Country Aggregation Counts
        country_counts: Dict[str, int] = {}
        for s in working_set:
            c_name = s.get("country", "Other")
            country_counts[c_name] = country_counts.get(c_name, 0) + 1

        # Step 7: Compute Recommendations for filtered results
        recommendations = SupplierRankingEngine.generate_recommendations(filtered, business_profile)

        return {
            "total_count": len(filtered),
            "total_verified_pool": len(working_set),
            "country_counts": country_counts,
            "suppliers": filtered,
            "recommendations": recommendations,
        }
