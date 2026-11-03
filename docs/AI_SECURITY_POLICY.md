# SupplyLens AI Security Policy

## 1. Zero Trust Architecture & Identity Verification
- **No Client Trust:** The client application never dictates `user_id` or `business_id` in unauthenticated query payloads. Identity is strictly derived from the validated Supabase session token or secure server-side JWT.
- **Tenant Isolation:** All database reads and writes (`ai_conversations`, `ai_messages`, `ai_memory`, `ai_usage_logs`) enforce PostgreSQL Row Level Security (RLS) policies (`auth.uid()::text = user_id`). Users can never inspect or modify conversations belonging to other organizations.

---

## 2. Prompt Injection & Jailbreak Defense
- **Input Sanitization:** Inquiries pass through `AIRateLimiter.sanitize_prompt()` before entering the context pipeline.
- **Pattern Matching:** Common prompt injection vectors ("ignore previous instructions", "disregard all guidelines", "system prompt", "DAN mode", "bypass safety") are detected and intercepted immediately with HTTP 400.
- **System Prompt Integrity:** The system instructions explicitly instruct the model to reject any attempts to reveal internal system instructions or impersonate unauthorized entities.

---

## 3. Grounded Factuality Policy (Anti-Hallucination)
- **Canonical Records Only:** The assistant is explicitly prohibited from generating fictitious supplier names, physical addresses, contact emails, phone numbers, or unverified claims.
- **Tool-Backed Facts:** When a user inquires about suppliers, the backend executes `search_canonical_suppliers` or `get_supplier_details` against verified databases and feeds verified records into the inference context.
- **Transparent Pricing Labels:** Prices are identified as either "Quoted", "Publicly Listed Estimate", or "Requires Formal RFQ".

---

## 4. Abuse Prevention & Rate Limiting
- **Sliding-Window Limiter:** Maximum 25 requests per minute per IP/user identifier.
- **Daily Quotas:** 150,000 tokens per user per day.
- **Audit Logging:** Every rate limit event and security anomaly is recorded in `ai_rate_limit_events` with timestamp, identifier, event type, and reason.
