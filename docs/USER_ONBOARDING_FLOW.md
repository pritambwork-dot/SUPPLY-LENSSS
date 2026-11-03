# SupplyLens User Onboarding Flow

## 1. Overview

The SupplyLens onboarding experience is a 6-step guided wizard that bridges raw business concepts into verified, mathematically optimizable sourcing specifications. Designed with an Apple-style glossy light theme, smooth micro-interactions, and progressive disclosure, the wizard ensures effortless data entry while persisting step snapshots to Supabase at each phase.

---

## 2. Onboarding Steps Breakdown

```mermaid
flowchart LR
    S1[1. Personal Details] --> S2[2. Business Profile]
    S2 --> S3[3. Products & Materials]
    S3 --> S4[4. Sourcing Scope]
    S4 --> S5[5. AI Intelligence]
    S5 --> S6[6. Review & Launch]
    S6 --> Dash[Personalized Dashboard]
```

### Step 1: Personal Details (`Let's get to know you`)
- **Required Fields**: Full Name, Verified Email (synced from Supabase Auth), Country of Residence, Preferred Operating Currency (`USD`, `INR`, `EUR`, `GBP`).
- **Optional Fields**: Phone number, Operating City, Job Title, Professional Role (`Sourcing Director`, `Founder / CEO`, `Procurement Manager`).
- **Persistence Target**: `profiles` table.

### Step 2: Business Profile (`Tell us about your business`)
- **Required Fields**: Business Name or Working Title, Industry Sector (`Sustainable Packaging`, `Apparel & Textiles`, `Consumer Electronics`, `Furniture`, `Food & Beverage`, `Industrial Materials`), Business Stage (`Idea stage`, `Planning to launch`, `Newly launched`, `Operating business`, `Scaling business`), Business Type (`D2C brand`, `E-commerce`, `Manufacturing`, `Retail`, `Wholesale`), Operating Country, Business Description.
- **Optional Fields**: Official Website, Operating City/State, Target Customer Market, Business Size.
- **Persistence Target**: `businesses` and `business_members` tables.

### Step 3: Product and Material Requirements (`What are you looking to source?`)
- **Product Information**: Primary Product Name, Product Category, Engineering / Quality Specifications.
- **Raw Materials Bill of Materials (BOM)**:
  - Material Name, Grade / Standard, Required Batch Quantity, Unit of Measure (`kg`, `units`, `meters`, `sq.m`, `tons`).
  - Dynamic interactive adder allowing multiple materials with real-time deletion and quantity adjustment.
- **Persistence Target**: `products`, `product_materials`, `business_requirements`.

### Step 4: Sourcing Preferences (`How would you like to source?`)
- **Commercial Boundaries**: Estimated Batch Sourcing Budget, Expected Batch Order Quantity and Measurement Unit.
- **Geographic Preferences**: Multi-select factory origins (India, Vietnam, United States, Germany, China, Bangladesh, Japan).
- **Supplier Priorities**: Multi-select sourcing goals (Lowest price, Low MOQ, Quality certifications, Geographic proximity, Faster delivery, Established supplier).
- **Persistence Target**: `businesses.geographic_preferences`, `businesses.supplier_priorities`.

### Step 5: AI Sourcing Intelligence (`Let's organize your sourcing requirements`)
- **Engine**: Calls Google Gemini (`/api/onboarding/ai-understand`) to decompose the prompt into normalized engineering requirements.
- **Outputs**:
  - Executive Sourcing Summary: Synthesizes business model and primary challenges.
  - Industry Normalization: Standardizes material classifications.
  - AI Suggested Materials: Proactively flags complementary components (e.g., molded bamboo barriers, bio-film coatings) with one-click **"+ Add to BOM"** capability.
  - Recommended Clarifications: Formulates procurement questions for supplier negotiations.
- **Resilient Fallback**: If Gemini is offline, a deterministic heuristic extraction engine ensures zero interruption to onboarding.

### Step 6: Review & Confirmation (`Your sourcing profile is ready`)
- **Overview Matrix**: Structured summary cards for Personal Details, Business Profile, BOM Materials, and Commercial Scope.
- **Inline Editing**: One-click jump links to edit any prior step.
- **Confirmation Action**: **"Confirm & Create Personalized Dashboard"** commits transaction to Supabase, updates `user_onboarding_progress.onboarding_status` to `'completed'`, records completion timestamp, and routes to `/dashboard`.

---

## 3. Resumability & Data Loss Prevention

1. **Atomic Step Persistence**: Every forward step transition calls `/api/onboarding/save-step`, saving a JSON snapshot in PostgreSQL `user_onboarding_progress`.
2. **Session Resumption**: If a user refreshes their browser or returns after a disconnect, `/api/onboarding/progress` restores all form fields and resumes the user at their active step.
3. **No Repeat Friction**: Authenticated users who have already completed onboarding bypass `/onboarding` directly into `/dashboard`.
