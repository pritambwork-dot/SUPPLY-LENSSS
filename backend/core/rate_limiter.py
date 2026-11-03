"""
SupplyLens Rate Limiting Layer
Basic in-memory rate limiting to protect external APIs (NimbleWay, Apify, Gemini, Grok, DeepSeek).
"""

import time
from typing import Dict, List
from fastapi import HTTPException

class RateLimiter:
    def __init__(self):
        # Maps action_key -> list of timestamps
        self._requests: Dict[str, List[float]] = {}

    def check_rate_limit(self, action_key: str, max_requests: int, window_seconds: int) -> None:
        """
        Check if the action is allowed within the rate limit.
        Raises HTTPException 429 if the limit is exceeded.
        """
        now = time.time()
        
        # Initialize if not exists
        if action_key not in self._requests:
            self._requests[action_key] = []
            
        # Clean up old requests outside the window
        self._requests[action_key] = [
            req_time for req_time in self._requests[action_key] 
            if now - req_time <= window_seconds
        ]
        
        # Check limit
        if len(self._requests[action_key]) >= max_requests:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded for {action_key}. Try again in {window_seconds} seconds."
            )
            
        # Record new request
        self._requests[action_key].append(now)

# Global rate limiter instance
rate_limiter = RateLimiter()

def enforce_ai_limit(user_id: str = "default_user"):
    """Dependency or helper for AI request limits (e.g. 10 requests per minute)."""
    rate_limiter.check_rate_limit(f"ai:{user_id}", max_requests=10, window_seconds=60)

def enforce_discovery_limit(user_id: str = "default_user"):
    """Dependency or helper for discovery/scraping limits (e.g. 5 requests per minute)."""
    rate_limiter.check_rate_limit(f"discovery:{user_id}", max_requests=5, window_seconds=60)
