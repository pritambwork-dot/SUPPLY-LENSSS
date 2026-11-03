"""
SupplyLens Apify Web Extraction Adapter
Executes controlled website crawling with SSRF protection and Actor dataset retrieval.
"""

import re
import time
import datetime
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import ipaddress
import httpx
from apify_client import ApifyClientAsync

from core.config import settings
from app.data.sources.base import ExtractionProvider

logger = logging.getLogger(__name__)

# SSRF Blocked IP ranges (Private, loopback, link-local, cloud metadata)
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.169.254/32"), # AWS/GCP metadata
]


class ApifyProvider(ExtractionProvider):
    """Provider for extracting supplier web data using Apify and controlled HTTP."""

    def __init__(self):
        self.api_key = getattr(settings, "APIFY_API_KEY", None) or os.getenv("APIFY_API_KEY") or os.getenv("APIFY_API_TOKEN")
        if self.api_key:
            self.client = ApifyClientAsync(self.api_key)
        else:
            self.client = None

    @staticmethod
    def is_safe_url(url: str) -> bool:
        """Enforces SSRF prevention: blocks internal IPs, metadata endpoints, and non-http schemes."""
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ["http", "https"]:
                return False
            hostname = parsed.hostname or ""
            if hostname.lower() in ["localhost", "127.0.0.1", "0.0.0.0", "instance-data", "metadata.google.internal"]:
                return False
            try:
                ip = ipaddress.ip_address(hostname)
                for net in BLOCKED_IP_NETWORKS:
                    if ip in net:
                        return False
            except ValueError:
                # Hostname is a domain name, not raw IP
                pass
            return True
        except Exception:
            return False

    async def extract_supplier_data(self, url: str) -> Dict[str, Any]:
        """
        Extracts structured supplier data from an approved URL.
        Executes fast direct HTTP first (300ms); falls back to Apify Actor if blocked.
        """
        if not self.is_safe_url(url):
            logger.warning(f"Blocked potentially unsafe or internal URL: {url}")
            return {}

        # 1. Fast Direct HTTP Fetch
        try:
            async with httpx.AsyncClient(timeout=8.0, follow_redirects=True, verify=False) as http_client:
                resp = await http_client.get(
                    url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    }
                )
                if resp.status_code == 200 and len(resp.text) > 200:
                    title_m = re.search(r'<title[^>]*>(.*?)</title>', resp.text, re.IGNORECASE | re.DOTALL)
                    page_title = title_m.group(1).strip() if title_m else url

                    # Clean scripts, styles, and tags
                    clean_text = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', resp.text, flags=re.IGNORECASE)
                    clean_text = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', clean_text, flags=re.IGNORECASE)
                    clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
                    clean_text = ' '.join(clean_text.split())[:20000]

                    return {
                        "url": url,
                        "text": clean_text,
                        "title": page_title,
                        "provider": "direct_http",
                        "status_code": 200,
                        "extracted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    }
        except Exception as direct_e:
            logger.debug(f"Direct fetch failed for {url}: {direct_e}. Escalating to Apify Actor.")

        # 2. Apify Actor Crawler (Headless Chromium)
        if self.client:
            try:
                run_input = {
                    "startUrls": [{"url": url}],
                    "useApifyProxy": False,
                    "maxCrawlPages": 1,
                    "maxCrawlDepth": 0,
                }
                run = await self.client.actor("apify/website-content-crawler").call(
                    run_input=run_input,
                    wait_duration=datetime.timedelta(seconds=20)
                )

                dataset_id = getattr(run, "default_dataset_id", None)
                if dataset_id:
                    dataset_items = await self.client.dataset(dataset_id).list_items()
                    if dataset_items.items:
                        item = dataset_items.items[0]
                        return {
                            "url": url,
                            "text": item.get("text", "")[:20000],
                            "title": item.get("metadata", {}).get("title", url),
                            "description": item.get("metadata", {}).get("description", ""),
                            "provider": "apify",
                            "status_code": 200,
                            "extracted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        }
            except Exception as e:
                logger.warning(f"Apify actor call failed for {url}: {e}")

        return {}
