"""
SupplyLens Nimbleway Web Intelligence Adapter
Provides high-fidelity B2B supplier candidate discovery and asynchronous crawl queueing.
"""

import time
import httpx
from typing import List, Dict, Any, Optional
import logging

from core.config import settings
from app.data.sources.base import DiscoveryProvider

logger = logging.getLogger(__name__)


class NimblewayProvider(DiscoveryProvider):
    """Provider for searching suppliers using NimbleWay Web Intelligence API."""

    def __init__(self):
        self.api_key = getattr(settings, "NIMBLEWAY_API_KEY", None) or "dbbe65832f894cf3be97a0f6ab0582f7db5cf07069a34d1294d1d39278d04d2b"
        self.search_url = "https://sdk.nimbleway.com/v2/search"
        self.crawl_url = "https://sdk.nimbleway.com/v2/crawl"

    async def search_suppliers(
        self,
        query: str,
        country: Optional[str] = None,
        max_results: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Executes search on Nimbleway API to discover real supplier candidates.
        """
        if not self.api_key:
            logger.warning("NIMBLEWAY_API_KEY is not configured.")
            return []

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        clean_q = query.lower().replace("verified", "").replace("suppliers", "").strip()
        search_query = f"{clean_q} manufacturer factory supplier company -site:wikipedia.org -site:reddit.com"
        if country and country.lower() != "all":
            search_query += f" {country}"

        payload = {
            "query": search_query,
        }

        start_ts = time.time()
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(self.search_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

                results = data.get("results", [])
                formatted_results = []

                for r in results[:max_results]:
                    url = r.get("url", "").strip()
                    if not url or not url.startswith("http"):
                        continue
                    formatted_results.append({
                        "url": url,
                        "title": r.get("title", "").strip(),
                        "snippet": r.get("description", "").strip(),
                        "domain": url.replace("https://", "").replace("http://", "").split("/")[0].replace("www.", ""),
                        "provider": "nimbleway",
                        "discovered_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    })

                logger.info(f"Nimbleway discovered {len(formatted_results)} results for '{query}' in {int((time.time() - start_ts) * 1000)}ms")
                return formatted_results

        except Exception as e:
            logger.error(f"Error in Nimbleway search_suppliers: {e}")
            return []

    async def queue_crawl_job(self, target_url: str) -> Optional[Dict[str, Any]]:
        """
        Submits an asynchronous crawl job to Nimbleway.
        """
        if not self.api_key or not target_url:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {"url": target_url}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(self.crawl_url, json=payload, headers=headers)
                if res.status_code in [200, 201]:
                    return res.json()
                logger.warning(f"Nimbleway crawl submission returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Failed to submit Nimbleway crawl: {e}")

        return None
