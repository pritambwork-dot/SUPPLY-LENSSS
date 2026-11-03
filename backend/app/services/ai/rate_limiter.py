"""
SupplyLens AI Assistant Rate Limiting & Abuse Protection
Implements sliding-window rate limiting, token budget enforcement,
prompt injection protection, and security telemetry.
"""

import time
import uuid
from typing import Dict, Tuple, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from app.models.database import AIRateLimitEvent, AIUsageLog

# Configuration defaults
MAX_REQUESTS_PER_MINUTE = 25
DAILY_TOKEN_BUDGET = 150000

# In-memory sliding window cache: user_id/ip -> list of timestamps
_request_history: Dict[str, list] = defaultdict(list)


class AIRateLimiter:
    @staticmethod
    def check_rate_limit(
        identifier: str,
        user_id: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> Tuple[bool, int, str]:
        """
        Validates whether request is within limits.
        Returns: (is_allowed, retry_after_seconds, reason)
        """
        now = time.time()
        minute_ago = now - 60

        # Prune older records
        history = _request_history[identifier]
        history = [ts for ts in history if ts > minute_ago]
        _request_history[identifier] = history

        # Check per-minute frequency
        if len(history) >= MAX_REQUESTS_PER_MINUTE:
            retry_after = int(60 - (now - history[0])) if history else 30
            if db:
                try:
                    event = AIRateLimitEvent(
                        id=f"rate-{uuid.uuid4().hex[:12]}",
                        user_id=user_id,
                        ip_address=identifier if not user_id else None,
                        event_type="per_minute_exceeded",
                        reason=f"Exceeded {MAX_REQUESTS_PER_MINUTE} requests/min",
                    )
                    db.add(event)
                    db.commit()
                except Exception:
                    pass
            return False, max(retry_after, 1), "Request rate limit exceeded. Please wait before sending another prompt."

        # Check daily token budget if user_id is provided and DB is connected
        if user_id and db:
            try:
                today_start = time.strftime("%Y-%m-%d 00:00:00")
                total_tokens = (
                    db.query(AIUsageLog)
                    .filter(
                        AIUsageLog.user_id == user_id,
                        AIUsageLog.created_at >= today_start,
                    )
                    .all()
                )
                tokens_sum = sum((t.input_tokens or 0) + (t.output_tokens or 0) for t in total_tokens)
                if tokens_sum >= DAILY_TOKEN_BUDGET:
                    return False, 3600, "Daily AI consultation token quota reached. Quota resets at midnight UTC."
            except Exception:
                pass

        # Record this request
        _request_history[identifier].append(now)
        return True, 0, ""

    @staticmethod
    def sanitize_prompt(query: str) -> Tuple[bool, str]:
        """
        Checks for malicious prompt injection or jailbreak patterns.
        Returns (is_safe, sanitized_text).
        """
        q_lower = query.lower()
        injection_signals = [
            "ignore previous instructions",
            "disregard all previous",
            "system prompt",
            "you are now dan",
            "bypass security",
            "reveal internal instructions",
            "ignore guidelines",
            "print developer prompt",
        ]

        for signal in injection_signals:
            if signal in q_lower:
                return False, "Your message triggered our safety filters. Please focus your inquiry on sourcing, materials, and suppliers."

        return True, query.strip()
