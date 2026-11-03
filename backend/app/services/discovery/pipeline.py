import logging
from typing import List, Dict, Any, Optional

from app.data.sources.base import DiscoveryProvider, ExtractionProvider
from app.data.normalization import normalizer
from app.data.entity_resolution import resolver

logger = logging.getLogger(__name__)

class DiscoveryPipeline:
    """Orchestrator that brings data ingestion together."""
    
    def __init__(self, discovery_provider: DiscoveryProvider, extraction_provider: ExtractionProvider):
        self.discovery = discovery_provider
        self.extraction = extraction_provider
        self.normalizer = normalizer
        self.resolver = resolver
        
    async def run_discovery(self, query: str, existing_suppliers: Optional[List[Dict]] = None) -> List[Dict]:
        """
        Run the discovery pipeline to find and extract supplier data.
        
        Steps:
        1. Search using the discovery provider (e.g., NimbleWay)
        2. For each URL, extract data using the extraction provider (e.g., Apify)
        3. Normalize the extracted data
        4. Resolve against existing entities
        5. Return standardized candidates
        """
        if existing_suppliers is None:
            existing_suppliers = []
            
        logger.info(f"Starting discovery pipeline for query: {query}")
        
        # 1. search
        try:
            search_results = await self.discovery.search_suppliers(query)
        except Exception as e:
            logger.error(f"Discovery search failed: {e}")
            return []
            
        candidates = []
        
        # 2. extract
        for result in search_results:
            url = result.get("url")
            if not url:
                continue
                
            try:
                raw_extracted_data = await self.extraction.extract_supplier_data(url)
                # Combine search snippet with extracted data if useful
                if "url" not in raw_extracted_data:
                    raw_extracted_data["url"] = url
                    
                # 3. normalize
                normalized_data = self.normalizer.normalize_supplier_data(raw_extracted_data)
                
                # 4. resolve
                matched_id = self.resolver.resolve_entity(normalized_data, existing_suppliers)
                if matched_id:
                    logger.info(f"Supplier at {url} matched existing entity ID {matched_id}")
                    normalized_data["existing_id"] = matched_id
                    
                candidates.append(normalized_data)
                
            except Exception as e:
                logger.error(f"Extraction or processing failed for URL {url}: {e}")
                
        # 5. return standardized candidates
        return candidates
