# SupplyLens AI Personalization Design

## 1. Personalization Principles
SupplyLens provides tailored sourcing intelligence rather than generic LLM chatbot answers. Personalization operates along four distinct dimensions:
1. **Business Profile & Stage:** D2C brand, OEM contract manufacturer, distributor, pilot stage vs. growth scale.
2. **Bill of Materials (BOM) & Technical Specifications:** Ingests raw materials, quality requirements, and target volumes.
3. **Budgetary & Geographic Constraints:** Classifies budget tiers (e.g. INR 800,000), evaluates working capital risk, and factors in transport corridors.
4. **Active Workflow Context:** Detects whether the user is viewing a supplier dossier (`/vendors/[id]`), engineering requirements (`/customer/requirements`), or reviewing agreements (`/customer/deals`).

---

## 2. Personalization Lifecycle

```
User Onboarding & Profile Definition
               │
               ▼
   Active Business Workspace
 (Industry, Stage, Budget, BOM)
               │
               ▼
       ContextBuilder
 (Extracts facts, bounds prompt)
               │
               ▼
     Gemini Model Reasoning
 (Applies manufacturing rules)
               │
               ▼
     Strategic Memory Store
(Extracts preferences & limits)
               │
               ▼
   Dynamic Suggestion Engine
(Route-aware actionable chips)
```

---

## 3. Persistent Strategic Memory (`ai_memory`)
The assistant passively identifies and stores key decisions made by the entrepreneur across sessions:
- **`preference`:** Geographic affinity (e.g., "Prefers suppliers in Odisha and Gujarat").
- **`constraint`:** Order volume minimums (e.g., "Maximum pilot MOQ of 1,000 units").
- **`priority`:** Commercial focus (e.g., "Prioritizes FSC and food-grade certifications over lowest price").
- **`decision`:** Contractual requirements (e.g., "Requires 30/70 payment terms with pre-dispatch third-party inspection").

---

## 4. Route-Aware Dynamic Suggestions
- **Vendor Dossier (`/vendors/[id]`):**
  - "Audit verification evidence for this supplier"
  - "Compare with regional competitors"
  - "Draft RFQ for this vendor"
  - "Estimate landed freight cost to my facility"
- **BOM & Requirements (`/customer/requirements`):**
  - "Suggest raw material specs & grades"
  - "Identify missing packaging materials"
  - "Find certified suppliers for this BOM"
- **Saved Vendors (`/customer/saved-vendors`):**
  - "Compare saved vendors side-by-side"
  - "Optimal order allocation across saved vendors"
