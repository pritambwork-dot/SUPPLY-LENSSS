"""
SupplyLens Targeted Sourcing Query Generator
Uses Gemini AI and deterministic heuristics to generate targeted industrial discovery queries.
"""

from typing import List, Dict, Any, Optional
import json
from app.services.ai_service import ai_service


class SourcingQueryGenerator:
    @staticmethod
    def generate_discovery_queries(
        prompt: str,
        business_profile: Optional[Dict[str, Any]] = None,
        max_queries: int = 4,
    ) -> List[str]:
        """
        Generates targeted B2B supplier search queries tailored for industrial search engines.
        Filters out non-commercial and consumer consumer query patterns.
        """
        biz = business_profile or {}
        country = biz.get("country") or "India"
        industry = biz.get("sector") or "Manufacturing"

        # 1. Try Gemini Structured Extraction
        ai_prompt = f"""Generate up to {max_queries} targeted B2B manufacturer search queries for industrial sourcing.
User Request: "{prompt}"
Target Country: {country}
Industry: {industry}

Requirements:
- Target real factory, raw material, or OEM manufacturers.
- Avoid consumer retail or directory queries.
- Return ONLY a JSON list of strings, e.g. ["query 1", "query 2"].
"""
        try:
            res_text = ai_service.generate_text(ai_prompt, json_mode=True, timeout=5.0)
            if res_text:
                clean_json = res_text.strip().replace("```json", "").replace("```", "").strip()
                queries = json.loads(clean_json)
                if isinstance(queries, list) and len(queries) > 0:
                    return [f"{q} -site:wikipedia.org -site:reddit.com" for q in queries[:max_queries]]
        except Exception:
            pass

        # 2. Deterministic Fallback Queries
        clean_prompt = prompt.lower().replace("find", "").replace("search", "").replace("suppliers", "").strip()
        base_term = clean_prompt if len(clean_prompt) > 3 else "sustainable packaging materials"

        return [
            f"{base_term} manufacturers factory {country} -site:wikipedia.org",
            f"{base_term} raw material suppliers {country} B2B",
            f"{base_term} OEM contract manufacturing {country}",
            f"{base_term} wholesale industrial exporters {country}",
        ][:max_queries]
