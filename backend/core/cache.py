"""
SupplyLens Caching Layer
Basic in-memory cache for development, can be replaced with Redis in production.
Used for caching web pages, search results, and external API responses to avoid hitting rate limits.
"""

import time
import hashlib
from typing import Any, Optional, Dict
from pydantic import BaseModel

class CacheEntry(BaseModel):
    value: Any
    expires_at: float

class CacheManager:
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}

    def _generate_key(self, prefix: str, data: str) -> str:
        """Generate a consistent cache key."""
        hashed = hashlib.sha256(data.encode("utf-8")).hexdigest()
        return f"{prefix}:{hashed}"

    def get(self, prefix: str, data: str) -> Optional[Any]:
        """Retrieve a value from the cache if it exists and is not expired."""
        key = self._generate_key(prefix, data)
        entry = self._cache.get(key)
        
        if entry is None:
            return None
            
        if time.time() > entry.expires_at:
            del self._cache[key]
            return None
            
        return entry.value

    def set(self, prefix: str, data: str, value: Any, ttl_seconds: int = 3600) -> None:
        """Store a value in the cache with a TTL."""
        key = self._generate_key(prefix, data)
        expires_at = time.time() + ttl_seconds
        self._cache[key] = CacheEntry(value=value, expires_at=expires_at)

    def clear_expired(self) -> None:
        """Remove all expired entries from the cache."""
        now = time.time()
        expired_keys = [k for k, v in self._cache.items() if now > v.expires_at]
        for k in expired_keys:
            del self._cache[k]


# Global cache instance
cache = CacheManager()
