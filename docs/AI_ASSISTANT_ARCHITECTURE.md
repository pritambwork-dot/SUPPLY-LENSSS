# SupplyLens AI Assistant Architecture

## Executive Overview
The **SupplyLens AI Assistant** is an intelligent, domain-specialized industrial sourcing consultant built directly into the SupplyLens application. Powered by Google Gemini and backed by PostgreSQL/Supabase, it operates with strict tenant isolation, zero-hallucination data policies, controlled server-side tool calling, and live SSE (Server-Sent Events) streaming.

---

## High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                            SupplyLens Next.js Frontend                            |
|                                                                                   |
|  +------------------------------+             +--------------------------------+  |
|  |   Floating AI Assistant      |             |   Full-Screen Assistant Page   |  |
|  |   (Across all auth routes)   |             |   (/assistant)                 |  |
|  +--------------+---------------+             +---------------+----------------+  |
|                 |                                             |                   |
+-----------------|---------------------------------------------|-------------------+
                  |                                             |
                  |  POST /api/v1/assistant/conversations       |
                  |  POST /api/v1/assistant/.../messages/stream |
                  v                                             v
+-----------------------------------------------------------------------------------+
|                            FastAPI Sourcing Backend                               |
|                                                                                   |
|  +-------------------------+  +-------------------------+  +-------------------+  |
|  | AIRateLimiter & Safety  |  | ContextBuilder          |  | SuggestionEngine  |  |
|  | (Sliding window, token  |  | (Loads user business,   |  | (Generates route  |  |
|  |  budget, anti-injection)|  |  BOM, verified suppliers|  |  & context chips) |  |
|  +------------+------------+  +------------+------------+  +---------+---------+  |
|               |                            |                         |            |
|               +----------------------------+-------------------------+            |
|                                            |                                      |
|                                            v                                      |
|                          +-----------------------------------+                    |
|                          | GeminiAssistantService            |                    |
|                          | - Tool Dispatcher                 |                    |
|                          | - SSE Stream Generator            |                    |
|                          | - Strategic Memory Extractor      |                    |
|                          +-----------------+-----------------+                    |
|                                            |                                      |
|                 +--------------------------+--------------------------+           |
|                 v                                                     v           |
|  +------------------------------+                   +--------------------------+  |
|  | Google Gemini API            |                   | Controlled Backend Tools |  |
|  | (gemini-flash-lite-latest,   |                   | - search_canonical_sups  |  |
|  |  streaming token inference)  |                   | - get_supplier_details   |  |
|  +------------------------------+                   | - compare_suppliers      |  |
|                                                     | - draft_rfq              |  |
|                                                     +--------------------------+  |
+-----------------------------------------------------------------------------------+
                                            |
                                            v
+-----------------------------------------------------------------------------------+
|                               PostgreSQL / Supabase                               |
|                                                                                   |
|  - ai_conversations (threads, context snapshots, tenancy)                         |
|  - ai_messages (turns, tokens, role, referenced suppliers)                        |
|  - ai_memory (learned preferences, constraints, standards)                        |
|  - ai_usage_logs (token accounting, latency ms, observability)                    |
|  - ai_rate_limit_events (breaches, audit trail)                                   |
|  - ai_feedback (user thumbs up/down, quality metrics)                             |
|  - suppliers, product_materials, businesses, saved_suppliers                      |
+-----------------------------------------------------------------------------------+
```

---

## Core System Components

### 1. `ContextBuilder` (`backend/app/services/ai/context_builder.py`)
- Authorizes the user and identifies active business workspace.
- Ingests active Bill of Materials (BOM), raw materials, required grades, and quantities.
- Bounds total context prompt within strict token limits (under 3,500 tokens).
- Injects strict factual directives: model is instructed to cite verified records and never hallucinate.

### 2. `GeminiAssistantService` (`backend/app/services/ai/gemini_assistant.py`)
- Manages connection to Google GenAI SDK (`google.genai`) with fallback HTTP REST.
- Executes server-side tools (`search_canonical_suppliers`, `compare_suppliers`, `draft_rfq`, `get_supplier_details`).
- Automatically extracts strategic user preferences and persists them into `ai_memory`.
- Provides streaming generator yielding SSE event envelopes (`status`, `chunk`, `complete`, `saved`).

### 3. `AIRateLimiter` (`backend/app/services/ai/rate_limiter.py`)
- Sliding-window rate limiter: 25 requests per minute per IP/user.
- Daily token budget: 150,000 tokens per user per day.
- Returns HTTP 429 with standard `Retry-After` header when exceeded.
- Prompt injection and jailbreak detector flagging unauthorized prompt alteration.

### 4. `FloatingAIAssistant` & Full-Screen Assistant
- Floating frosted glassmorphism launcher accessible across `/dashboard`, `/customer/*`, and `/vendors/*`.
- Interactive streaming text display, markdown table rendering, suggestion chips, and supplier dossier preview cards.
- Dedicated full-screen workstation at `/assistant` with conversation history, search, and Markdown report export.
