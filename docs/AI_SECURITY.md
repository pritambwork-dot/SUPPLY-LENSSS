# SupplyLens AI Security & Threat Modeling

## 1. Threat Vectors Addressed
| Threat Vector | Mitigation Strategy | Implemented In |
| :--- | :--- | :--- |
| **Prompt Injection** | RegEx pattern matching & intent validation | `rate_limiter.py` |
| **System Prompt Leakage** | Explicit negative directives in system prompt | `context_builder.py` |
| **Unauthorized Access (IDOR)** | Server-side identity extraction & DB RLS | `assistant.py` & RLS Migration 007 |
| **Hallucination of Data** | Canonical verification & server-side tool execution | `gemini_assistant.py` |
| **Resource Exhaustion (DDoS)** | Sliding window rate limits & daily token quotas | `rate_limiter.py` |

---

## 2. Row Level Security Policies
Migration `007_ai_assistant_and_conversations.sql` enforces strict PostgreSQL Row Level Security on:
- `ai_conversations`
- `ai_messages`
- `ai_memory`
- `ai_usage_logs`
- `ai_feedback`
