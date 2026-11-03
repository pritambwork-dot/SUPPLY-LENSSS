"""
SupplyLens Entity Resolution & Deduplication Engine
Classifies matches across domains, corporate names, and phone numbers:
- STRONG_MATCH: High confidence (>=0.88), safe to link and enrich existing entity.
- POSSIBLE_MATCH: Moderate confidence (0.65-0.87), requires human/auditor review.
- WEAK_MATCH: Ambiguous signal, do not merge.
- NO_MATCH: Unique new canonical entity.
"""

from typing import Dict, List, Any, Optional
from difflib import SequenceMatcher
from urllib.parse import urlparse


def extract_domain(url: str) -> str:
    """Extracts root domain for exact comparison."""
    if not url:
        return ""
    try:
        if not url.startswith("http"):
            url = "https://" + url
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower().replace("www.", "").strip()
        return host
    except Exception:
        return ""


class EntityResolver:
    @staticmethod
    def resolve_entity(
        candidate: Dict[str, Any],
        existing_suppliers: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Compares candidate against existing catalog.
        Returns structured classification dictionary.
        """
        cand_domain = extract_domain(candidate.get("website") or candidate.get("website_url", ""))
        cand_name = (candidate.get("name") or "").lower().strip()
        cand_phones = [
            c.get("value", "").replace("+", "").replace("-", "")
            for c in candidate.get("contacts", [])
            if c.get("type") == "phone" and len(c.get("value", "")) >= 8
        ]

        best_match_id = None
        best_confidence = 0.0
        best_reason = ""
        match_type = "NO_MATCH"

        for existing in existing_suppliers:
            ex_id = existing.get("id")
            ex_domain = extract_domain(existing.get("website") or existing.get("website_url", ""))
            ex_name = (existing.get("name") or "").lower().strip()
            ex_phones = [
                c.get("value", "").replace("+", "").replace("-", "")
                for c in existing.get("contacts", [])
                if c.get("type") == "phone" and len(c.get("value", "")) >= 8
            ]

            # 1. Exact Domain Match (STRONG_MATCH)
            if cand_domain and ex_domain and cand_domain == ex_domain and len(cand_domain) > 4:
                return {
                    "match_type": "STRONG_MATCH",
                    "matched_id": ex_id,
                    "confidence": 0.98,
                    "reason": f"Exact root domain match: {cand_domain}",
                }

            # 2. Exact Phone Match (STRONG_MATCH)
            for cp in cand_phones:
                if cp in ex_phones:
                    return {
                        "match_type": "STRONG_MATCH",
                        "matched_id": ex_id,
                        "confidence": 0.94,
                        "reason": f"Exact verified telephone match: {cp}",
                    }

            # 3. High Name Similarity
            if cand_name and ex_name:
                sim = SequenceMatcher(None, cand_name, ex_name).ratio()
                if sim >= 0.88:
                    match_type = "STRONG_MATCH"
                    best_match_id = ex_id
                    best_confidence = sim
                    best_reason = f"High corporate name similarity ({int(sim*100)}%)"
                    break
                elif sim >= 0.68 and sim > best_confidence:
                    match_type = "POSSIBLE_MATCH"
                    best_match_id = ex_id
                    best_confidence = sim
                    best_reason = f"Possible name similarity ({int(sim*100)}%)"

        return {
            "match_type": match_type,
            "matched_id": best_match_id if match_type in ["STRONG_MATCH", "POSSIBLE_MATCH"] else None,
            "confidence": best_confidence,
            "reason": best_reason or "No matching corporate signals found",
        }
