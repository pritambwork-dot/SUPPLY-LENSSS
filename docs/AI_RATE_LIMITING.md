# SupplyLens AI Rate Limiting & Token Budget Architecture

## 1. Multi-Tiered Rate Limiter
- **Per-Minute Window:** 25 requests per minute per IP / User identifier.
- **Per-Day Token Budget:** 150,000 tokens per user per day.
- **HTTP 429 Response:** Returns standard `Retry-After` header indicating seconds until the window slides.

---

## 2. Token Accounting & Auditing
Every AI consultation turn logs metrics to `ai_usage_logs`:
- `input_tokens`: Estimated input prompt tokens.
- `output_tokens`: Generated tokens from Gemini.
- `latency_ms`: Response time in milliseconds.
- `status`: `success`, `rate_limited`, or `error`.
- `model`: Exact model used (`gemini-flash-lite-latest`).
