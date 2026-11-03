"""
SupplyLens Master Supplier Discovery & Web Intelligence Orchestrator
Coordinates asynchronous multi-agent web discovery, extraction, normalization,
deduplication, field-level evidence logging, deterministic verification, and canonical ingestion.
"""

import time
import uuid
import datetime
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.database import BackgroundJob, SupplierCandidate, RawSupplierRecord
from app.data.sources.nimbleway import NimblewayProvider
from app.data.sources.apify import ApifyProvider
from app.services.discovery.query_generator import SourcingQueryGenerator
from app.services.discovery.provider_router import ProviderRouter
from app.services.extraction.supplier_extractor import SupplierExtractor
from app.services.extraction.contact_extractor import ContactExtractor
from app.data.normalization import normalizer
from app.data.entity_resolution.resolver import EntityResolver
from app.services.suppliers.canonical_ingestion import CanonicalIngestionService
from app.data.seed_data import SUPPLIERS_SEED

logger = logging.getLogger(__name__)


class DiscoveryOrchestrator:
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.nimble = NimblewayProvider()
        self.apify = ApifyProvider()

    def create_discovery_job(
        self,
        query: str,
        user_id: Optional[str] = None,
        business_id: Optional[str] = None,
    ) -> BackgroundJob:
        """Initializes a new background discovery job record."""
        job_id = f"job-{uuid.uuid4().hex[:12]}"
        job = BackgroundJob(
            id=job_id,
            job_type="supplier_discovery",
            user_id=user_id,
            business_id=business_id,
            status="queued",
            provider="nimbleway",
            progress_percent=5,
            current_step="Understanding requirements & initializing search intent...",
            query_text=query,
        )
        if self.db:
            try:
                self.db.add(job)
                self.db.commit()
            except Exception as e:
                logger.warning(f"Could not persist background job: {e}")
                if self.db:
                    self.db.rollback()
        return job

    def update_job_progress(
        self,
        job_id: str,
        status: str,
        progress_percent: int,
        current_step: str,
        result_count: int = 0,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Updates job progress and observability step."""
        if not self.db:
            return
        try:
            job = self.db.query(BackgroundJob).filter(BackgroundJob.id == job_id).first()
            if job:
                job.status = status
                job.progress_percent = progress_percent
                job.current_step = current_step
                job.result_count = result_count
                if error_message:
                    job.error_message = error_message
                if metadata:
                    meta = dict(job.metadata_json or {})
                    meta.update(metadata)
                    job.metadata_json = meta
                if status == "completed":
                    job.completed_at = datetime.datetime.utcnow()
                job.updated_at = datetime.datetime.utcnow()
                self.db.commit()
        except Exception as e:
            logger.warning(f"Failed to update job {job_id}: {e}")
            if self.db:
                self.db.rollback()

    async def execute_discovery_pipeline(
        self,
        query: str,
        job_id: str,
        business_profile: Optional[Dict[str, Any]] = None,
        max_candidates: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Executes end-to-end multi-agent supplier discovery pipeline:
        1. Query Generation
        2. Nimbleway Search
        3. URL Filtering & Staging
        4. Apify / Controlled Extraction
        5. Contact & Capability Extraction
        6. Normalization
        7. Entity Resolution
        8. Canonical Ingestion & Verification
        """
        start_ts = time.time()
        ingested_suppliers: List[Dict[str, Any]] = []

        try:
            # Step 1: Search Intent & Targeted Queries
            self.update_job_progress(job_id, "searching", 20, "Generating targeted industrial search queries...")
            queries = SourcingQueryGenerator.generate_discovery_queries(query, business_profile, max_queries=2)
            primary_query = queries[0] if queries else query

            # Step 2: Nimbleway Web Discovery
            self.update_job_progress(job_id, "searching", 35, f"Discovering real supplier websites via Nimbleway for '{primary_query}'...")
            search_start = time.time()
            candidates = await self.nimble.search_suppliers(primary_query, max_results=max_candidates * 2)
            ProviderRouter.log_provider_event(
                self.db, "nimbleway", "https://sdk.nimbleway.com/v2/search", "search",
                status_code=200 if candidates else 500,
                latency_ms=int((time.time() - search_start) * 1000),
                estimated_cost_usd=0.005,
                job_id=job_id,
            )

            if not candidates:
                logger.warning(f"No external candidates returned from Nimbleway for '{query}'.")
                self.update_job_progress(job_id, "completed", 100, "Discovery complete (0 new candidates found).", 0)
                return []

            # Step 3: Staging Candidates
            staged_candidates = []
            for c in candidates:
                url = c.get("url")
                if not url or not ApifyProvider.is_safe_url(url):
                    continue
                cand_id = f"cnd-{uuid.uuid4().hex[:10]}"
                if self.db:
                    try:
                        self.db.add(SupplierCandidate(
                            id=cand_id,
                            job_id=job_id,
                            query=query,
                            company_name=c.get("title"),
                            website_url=url,
                            domain=c.get("domain"),
                            snippet=c.get("snippet"),
                            discovered_via="nimbleway",
                            processing_status="staged",
                        ))
                    except Exception:
                        pass
                staged_candidates.append({**c, "id": cand_id})
                if len(staged_candidates) >= max_candidates:
                    break

            if self.db:
                try:
                    self.db.commit()
                except Exception:
                    self.db.rollback()

            # Step 4: Controlled Extraction & Crawling
            self.update_job_progress(job_id, "extracting", 50, f"Extracting company and catalog data from {len(staged_candidates)} supplier sites...")
            
            for idx, cand in enumerate(staged_candidates):
                url = cand.get("url")
                logger.info(f"Extracting candidate [{idx+1}/{len(staged_candidates)}]: {url}")
                extract_start = time.time()
                raw_data = await self.apify.extract_supplier_data(url)
                ProviderRouter.log_provider_event(
                    self.db, "apify", url, "extract",
                    status_code=raw_data.get("status_code", 200),
                    latency_ms=int((time.time() - extract_start) * 1000),
                    estimated_cost_usd=0.008,
                    job_id=job_id,
                )

                text_content = raw_data.get("text") or f"{cand.get('title')} {cand.get('snippet')}"

                # Persist raw payload
                if self.db:
                    try:
                        self.db.add(RawSupplierRecord(
                            id=f"raw-{uuid.uuid4().hex[:10]}",
                            candidate_id=cand.get("id"),
                            source_url=url,
                            provider=raw_data.get("provider", "direct_http"),
                            text_content=text_content[:15000],
                        ))
                        self.db.commit()
                    except Exception:
                        self.db.rollback()

                # Step 5: Structured Entity & Contact Extraction
                self.update_job_progress(job_id, "extracting", 65 + (idx * 5), f"Extracting verified contacts and technical specs for {cand.get('title')}...")
                extracted = SupplierExtractor.extract_from_web_content(
                    text_content, url, page_title=cand.get("title"), query=query
                )
                contacts = ContactExtractor.extract_public_business_contacts(
                    text_content, url, company_domain=cand.get("domain")
                )
                extracted["contacts"] = contacts

                # Step 6: Normalization
                self.update_job_progress(job_id, "normalizing", 80, "Normalizing company, location, and currency data...")
                normalized = normalizer.normalize_supplier_data(extracted)

                # Step 7: Entity Resolution (Deduplication)
                self.update_job_progress(job_id, "resolving_duplicates", 88, "Resolving duplicates against canonical supplier catalog...")
                resolution = EntityResolver.resolve_entity(normalized, SUPPLIERS_SEED)

                if resolution["match_type"] == "STRONG_MATCH" and resolution.get("matched_id"):
                    logger.info(f"Matched existing canonical supplier ID: {resolution['matched_id']}. Skipping duplicate creation.")
                    continue

                # Step 8: Verification & Ingestion
                self.update_job_progress(job_id, "verifying", 92, f"Applying deterministic 10-dimension verification for {normalized['name']}...")
                ingested = CanonicalIngestionService.ingest_candidate(
                    self.db,
                    normalized,
                    source_url=url,
                    provider="nimbleway",
                    candidate_id=cand.get("id"),
                )
                ingested_suppliers.append(ingested)

            # Step 9: Finalize Job
            total_duration_ms = int((time.time() - start_ts) * 1000)
            ingested_ids = [s.get("id") for s in ingested_suppliers if s.get("id")]
            self.update_job_progress(
                job_id,
                "completed",
                100,
                f"Discovery completed successfully in {total_duration_ms}ms.",
                result_count=len(ingested_suppliers),
                metadata={"ingested_supplier_ids": ingested_ids, "duration_ms": total_duration_ms},
            )
            logger.info(f"Discovery job {job_id} complete. Ingested {len(ingested_suppliers)} new verified suppliers.")
            return ingested_suppliers

        except Exception as e:
            logger.error(f"Discovery pipeline failed for job {job_id}: {e}")
            self.update_job_progress(job_id, "failed", 100, "Discovery job encountered an error.", error_message=str(e))
            return []
