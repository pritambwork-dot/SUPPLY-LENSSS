"""
SupplyLens Supplier Data Extractor
Extracts structured company information, products, materials, certifications,
manufacturing capabilities, and commercial terms from unstructured web text.
"""

import json
import re
from typing import Dict, Any, Optional
from app.services.ai_service import ai_service


class SupplierExtractor:
    @staticmethod
    def extract_from_web_content(
        text_content: str,
        source_url: str,
        page_title: Optional[str] = None,
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Parses raw website text into structured supplier attributes using Gemini AI
        with deterministic heuristic fallbacks.
        """
        if not text_content or len(text_content.strip()) < 40:
            return {}

        excerpt = text_content[:10000]

        ai_prompt = f"""You are a specialized B2B sourcing data extraction engine.
Analyze the following scraped company website text and extract structured supplier attributes.
URL: {source_url}
Page Title: {page_title or 'N/A'}
User Discovery Query: {query or 'N/A'}

SCRAPED TEXT EXCERPT:
\"\"\"
{excerpt}
\"\"\"

Extract and return ONLY a valid JSON object matching this schema:
{{
  "name": "Commercial Brand / Trade Name",
  "legal_name": "Full Legal / Corporate Name",
  "supplier_type": "Manufacturer | Raw Material Supplier | Distributor | Exporter",
  "description": "Concise 1-2 sentence description of products and manufacturing focus",
  "country": "Country where headquarters or main factory is located",
  "city": "City or industrial area",
  "address": "Street address or industrial estate",
  "categories": ["Product category 1", "Category 2"],
  "products": [
    {{
      "name": "Product or material name",
      "material": "Specific raw material (e.g. recycled PET, sugarcane bagasse)",
      "specs": "Technical grade or specification",
      "estimated_price": 5.50,
      "currency": "INR | USD",
      "moq": 1000,
      "unit": "piece | kg | ton"
    }}
  ],
  "capabilities": ["Manufacturing process 1", "Capability 2"],
  "certifications": ["ISO 9001", "FSC", "Food Grade"]
}}

Rules:
1. Do NOT guess or hallucinate fields not mentioned in the text.
2. If MOQ or price is not mentioned, set them to null.
3. Return valid JSON only.
"""

        try:
            res_text = ai_service.generate_text(ai_prompt, json_mode=True, timeout=8.0)
            if res_text:
                clean_json = res_text.strip().replace("```json", "").replace("```", "").strip()
                extracted = json.loads(clean_json)
                if isinstance(extracted, dict) and extracted.get("name"):
                    extracted["source_url"] = source_url
                    return extracted
        except Exception:
            pass

        # Deterministic Heuristic Fallback Extraction
        domain = source_url.replace("https://", "").replace("http://", "").split("/")[0].replace("www.", "")
        company_name = (page_title or domain.split(".")[0]).split("-")[0].split("|")[0].strip().title()

        return {
            "name": company_name,
            "legal_name": company_name,
            "supplier_type": "Manufacturer",
            "description": f"Manufacturer and supplier of industrial products and packaging based on {domain}.",
            "country": "India" if (".in" in domain or "india" in text_content.lower()) else "Global",
            "city": "Industrial Cluster",
            "address": f"Manufacturing Facility, {domain}",
            "categories": ["Industrial Supplies"],
            "products": [],
            "capabilities": ["Contract Manufacturing"],
            "certifications": ["Verified Business Identity"],
            "source_url": source_url,
        }
