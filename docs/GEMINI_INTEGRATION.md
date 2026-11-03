# Google Gemini API Integration Architecture

## 1. Model Configuration
- **Primary Model:** `gemini-flash-lite-latest` (with fallback to `gemini-flash-latest`, `gemini-2.5-flash`).
- **Inference Mode:** Streaming Server-Sent Events (`iter_lines()` on SSE channel).
- **Client Implementation:** Dual-mode using official `google.genai` SDK with zero-dependency HTTP REST fallback.

---

## 2. Controlled Backend Tool Calling
To ensure 100% adherence to verified facts, tools are executed server-side before feeding data to Gemini:
```python
# Server-side tool execution
tool_results, referenced_ids = self._execute_relevant_tools(query, context)
```
Supported tools:
1. `search_canonical_suppliers(query, country, category, limit)`
2. `get_supplier_details(supplier_id)`
3. `compare_suppliers(supplier_ids)`
4. `draft_rfq(supplier_id, business_name, product_item, target_quantity)`

---

## 3. Streaming Response Protocol
The assistant communicates via standard Server-Sent Events:
- `data: {"type": "status", "status": "Analyzing requirement & searching verified database..."}`
- `data: {"type": "chunk", "delta": "### Strategic Sourcing..."}`
- `data: {"type": "complete", "full_text": "...", "referenced_supplier_ids": [...], "suggested_actions": [...]}`
- `data: {"type": "saved", "message_id": "msg-xyz", "created_at": "2026-11-03T..."}`
