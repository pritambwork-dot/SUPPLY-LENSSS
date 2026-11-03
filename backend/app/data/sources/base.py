from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class DiscoveryProvider(ABC):
    """Base class for finding supplier URLs."""

    @abstractmethod
    async def search_suppliers(self, query: str, country: Optional[str] = None) -> List[Dict]:
        """
        Search for suppliers based on a query.
        
        Args:
            query: The search query.
            country: Optional country code to filter by.
            
        Returns:
            A list of dictionaries containing 'url', 'title', and 'snippet'.
        """
        pass

class ExtractionProvider(ABC):
    """Base class for extracting structured supplier data from a URL."""

    @abstractmethod
    async def extract_supplier_data(self, url: str) -> Dict:
        """
        Extract supplier data from a given URL.
        
        Args:
            url: The supplier's website URL.
            
        Returns:
            A dictionary containing structured supplier data (name, description, contacts, products).
        """
        pass
