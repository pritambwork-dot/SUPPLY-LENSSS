"""
SupplyLens Provider Routing & Cost Optimizer
Directs search, crawl, extraction, and intelligence tasks to the appropriate provider.
Enforces budget limits, tracks provider latency, and prevents duplicate API expenditures.
"""

import time
import uuid
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.database import SearchProviderEvent

logger = logging.getLogger(__name__)


class ProviderRouter:
    @staticmethod
    def log_provider_event(
        db: Optional[Session],
        provider: str,
        endpoint: str,
        request_type: str,
        status_code: int = 200,
        latency_ms: int = 0,
        estimated_cost_usd: float = 0.0,
        is_success: bool = True,
        error_message: Optional[str] = None,
        job_id: Optional[str] = None,
    ) -> None:
        """Records provider observability telemetry in search_provider_events."""
        if not db:
            return
        try:
            event = SearchProviderEvent(
                id=f"prov-{uuid.uuid4().hex[:12]}",
                job_id=job_id,
                provider=provider,
                endpoint=endpoint,
                request_type=request_type,
                status_code=status_code,
                latency_ms=latency_ms,
                estimated_cost_usd=estimated_cost_usd,
                is_success=is_success,
                error_message=error_message,
            )
            db.add(event)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to log provider event: {e}")
            if db:
                db.rollback()

    @staticmethod
    def select_discovery_provider(task: str) -> str:
        """
        Selects the most cost-effective and appropriate provider for a given task.
        """
        routing_table = {
            "candidate_search": "nimbleway_search",
            "page_crawl": "apify_crawler",
            "page_map": "nimbleway_crawl",
            "contact_extraction": "apify_extractor",
            "address_geocoding": "geoapify",
            "dossier_synthesis": "deepseek",
            "requirement_intent": "gemini",
        }
        return routing_table.get(task, "direct_http")
