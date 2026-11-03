# SupplyLens — AI-Powered Global Supplier Discovery & Business Sourcing Intelligence

> **"Tell us what you want to build, and we'll help you figure out what you need and who you should source it from."**

SupplyLens is a modern, high-trust sourcing intelligence platform designed specifically for non-technical entrepreneurs. It demystifies the complex journey from an initial business idea to a structured business profile, bill-of-materials requirement decomposition, verified global supplier discovery, side-by-side price comparison, and personalized AI supplier recommendations.

Inspired by global intelligence platforms like WorldLens, SupplyLens pairs clean typography, subtle borders, interactive maps, and transparent pricing metrics (Supplier Quoted Factory Price vs. Estimated Landed Cost) with an unobtrusive AI advisor.

---

## 🧭 Core Workflow

```
Business Idea → Business Profile → Required Products (BOM) → Verified Suppliers → 
Price Comparison (Ex-Factory vs Landed) → Supplier Ratings & Audits → 
Global Map → AI Recommendation (Best Match / Cheapest / Highest Rated / Fastest) → 
Direct Contact
```

---

## 🚀 Key Features

1. **Global Search / AI Command Bar**:
   - Prominent prompt input: *"Tell us what you want to build..."*
   - Real-time extraction of sector, target geography, budget, operating model, and scale.
2. **First-Time User Experience**:
   - Clean, non-technical choice:
     - **Start a business** (Primary onboarding pathway)
     - **Find a product** (Browse specifications and catalog)
     - **Find suppliers** (Global directory & interactive map)
3. **Conversational Business Onboarding**:
   - Step-by-step 6-question guide OR natural language 1-sentence parser.
4. **Business Profile & Readiness Assessment**:
   - Transparent evaluation across 5 dimensions: **Market**, **Suppliers**, **Budget**, **Logistics**, and **Competition**.
   - No confusing mathematical formulas—clear qualitative statuses and practical next steps.
5. **AI Business Understanding ("Here's what you'll probably need")**:
   - Decomposes concepts into categorized requirements (Raw Materials, Machinery, Packaging, Logistics, Certifications).
   - Full user control: **Add**, **Remove**, and **Edit** items with one-click supplier matching.
6. **Verified Supplier Discovery & Interactive Global Map**:
   - Plotted across verified global manufacturing hubs (India, Vietnam, Germany, etc.).
   - Transparent verification badges with audit dates. Clear distinction of prototype demo records from live registries.
   - Filter by Country, Price, MOQ, Rating, and "Verified Only".
7. **Side-by-Side Price Comparison Matrix**:
   - Evaluates factory quoted price, MOQ, minimum capital requirement, transit distance, lead time, and **Estimated Landed Cost** (freight + duties).
8. **AI Supplier Recommendation ("Best match for your business")**:
   - 4 tailored recommendation lenses with plain-English rationales:
     - **Best Match for Your Business**
     - **Cheapest Suitable Option**
     - **Highest Rated & Zero-Defect Option**
     - **Fastest Domestic Dispatch**
9. **"Ask SupplyLens" Unobtrusive AI Assistant**:
   - Contextual sourcing advisor grounded in the loaded catalog. Answers queries like *"What does MOQ mean?"*, *"Show suppliers near Mumbai"*, *"Which supplier is cheapest for ₹5 lakh?"*.

---

## 🛠️ Technology Foundation

### Frontend
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom global intelligence design tokens (Obsidian dark mode / Ice Zinc light mode)
- **Icons**: Lucide React
- **Geospatial Map**: Leaflet with custom CartoDB dark/light raster tile rendering (Google Maps Platform API ready via abstraction)

### Backend
- **Framework**: Python 3.14 + FastAPI
- **ORM / Database**: SQLAlchemy 2.0 PostgreSQL relational models
- **Optimization**: Google OR-Tools Mixed-Integer Linear Programming (MILP) model blueprint for minimum-landed-cost multi-supplier allocation
- **AI Engine**: Google Gemini API integration with structured prompt schemas and deterministic fallback heuristics

---

## 📊 Relational Database Architecture (PostgreSQL / SQLAlchemy)

The backend data models in `backend/app/models/database.py` cover all 14 core entities:

1. **`User`**: Platform accounts and sourcing profiles.
2. **`Business`**: Entrepreneur business concepts, budgets, models, and readiness state.
3. **`Sector`**: Industry verticals (Packaging, Coffee, Furniture, EV Mobility, Skincare, etc.).
4. **`Product`**: Global standard product catalog items with HS codes.
5. **`BusinessRequirement`**: Bill of Materials (BOM) items linked to a business.
6. **`Supplier`**: Verified manufacturing facilities and verified entities.
7. **`SupplierProduct`**: Specific products quoted by a supplier with MOQ, ex-factory price, and lead time.
8. **`SupplierContact`**: Verified public business phones, emails, and inquiry desks.
9. **`SupplierLocation`**: Precise geocoded facility addresses with latitude and longitude.
10. **`SupplierRating`**: Multi-dimensional quality, delivery, and communication ratings.
11. **`SupplierVerification`**: Onsite physical inspection logs and official certifications.
12. **`SavedSupplier`**: Entrepreneur shortlists and bookmarks.
13. **`SearchHistory`**: Sourcing queries and filter telemetry.
14. **`PriceHistory`**: Commodity and freight quote timeline for price tracking.

---

## 🏃 Running the Application

### 1. Frontend (Next.js)
```bash
cd frontend
# To build production bundle:
npm run build
# Or run with node directly:
node ./node_modules/next/dist/bin/next dev -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend (FastAPI)
```bash
cd backend
python3 -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation: [http://localhost:8000/docs](http://localhost:8000/docs).
