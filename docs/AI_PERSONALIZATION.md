# SupplyLens AI Personalization & Context Engineering

## 1. Context Engineering Pipeline
Context is dynamically composed in `ContextBuilder` (`backend/app/services/ai/context_builder.py`):
1. **Business Profile:** Business name, stage (pilot/growth), model (contract OEM), target market, location, budget.
2. **Bill of Materials (BOM):** Active raw materials, required grades, quantities, and quality standards.
3. **Saved Suppliers:** Historical bookmarks and evaluations.
4. **Strategic Memory:** Learned preferences and constraints from `ai_memory`.
5. **Active Page Entity:** If on a supplier page (`/vendors/[id]`), loads the specific vendor's verification dossier.

---

## 2. Bounded Token Budget
To prevent context overflow and reduce latency, context summaries are capped at 3,500 tokens. Historical chat turns are summarized or trimmed to the last 10 messages, preserving critical context while optimizing response speed.
