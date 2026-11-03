"""
SupplyLens Supplier Source Providers Abstraction
Enables modular data source integration without modifying the core discovery engine.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class SupplierSourceProvider(ABC):
    """Abstract base interface for all supplier data feeds and connectors."""

    @abstractmethod
    def get_provider_name(self) -> str:
        pass

    @abstractmethod
    def fetch_suppliers(self, query: Optional[str] = None, country: Optional[str] = None) -> List[Dict[str, Any]]:
        pass


class RegistrySourceProvider(SupplierSourceProvider):
    """Connector interface for national company registration databases (e.g. MCA India, Handelsregister)."""

    def get_provider_name(self) -> str:
        return "Government Corporate Registry"

    def fetch_suppliers(self, query: Optional[str] = None, country: Optional[str] = None) -> List[Dict[str, Any]]:
        # In Prompt 3 prototype, live corporate registry queries are mocked/stubbed
        return []


class GooglePlacesProvider(SupplierSourceProvider):
    """Connector interface for Google Places verified business listings."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    def get_provider_name(self) -> str:
        return "Google Places Platform"

    def fetch_suppliers(self, query: Optional[str] = None, country: Optional[str] = None) -> List[Dict[str, Any]]:
        # In Prompt 3, Google Places provides location evidence rather than serving as the sole supplier database
        return []
