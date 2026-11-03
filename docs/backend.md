# SupplyLens — Backend Architecture & API Specification

## 1. Overview & Clean Architecture Principles

The SupplyLens backend is a high-performance asynchronous REST API built using **Python 3.14 / FastAPI**, adhering strictly to clean layered architectural boundaries:

```mermaid
flowchart TD
    subgraph Client ["Client / Consumer"]
        Web["Next.js Web Application / External API Clients"]
    end

    subgraph PresentationLayer ["1. Presentation Layer (Routers)"]
        HealthRouter["api/health.py"]
        SupplierRouter["api/suppliers.py"]
        BusinessRouter["api/business.py"]
        ScenariosRouter["api/scenarios.py"]
        AIRouter["api/ai.py"]
        OptimizationRouter["api/optimization.py"]
        MLRouter["api/ml.py"]
    end

    subgraph ServiceLayer ["2. Domain Service Layer"]
        SupplierDiscovery["services/suppliers/discovery.py"]
        LandedCost["services/logistics/cost_engine.py"]
        AIService["services/ai_service.py (Gemini/Grok/DeepSeek)"]
        BusinessService["services/business_service.py"]
        ProfileService["services/profile_service.py"]
    end

    subgraph SpecializedEngines ["3. Specialized Mathematical & ML Engines"]
        MLEngine["ml/inference/service.py (Two-Tower Net)"]
        OREngine["optimization/solvers/exact_solver.py (MILP Solver)"]
        ScenarioEngine["optimization/scenarios/what_if.py"]
    end

    subgraph DataAccessLayer ["4. Persistence & Data Layer"]
        SQLAlchemyORM["SQLAlchemy 2.0 ORM (app/models/database.py)"]
        CoreDB["core/database.py (SessionLocal, Pool, Fallbacks)"]
        Cache["core/cache.py (In-Memory TTL Store)"]
        PostgresDB[(PostgreSQL 16+ / SQLite DB)]
    end

    Web -->|HTTP REST / JSON| PresentationLayer
    PresentationLayer -->|Orchestrates| ServiceLayer
    PresentationLayer -->|Invokes Directly| SpecializedEngines
    ServiceLayer -->|Delegates to Engines| SpecializedEngines
    ServiceLayer -->|Queries & Mutates| DataAccessLayer
    SpecializedEngines -->|Fetches Features & Logs Runs| DataAccessLayer
    DataAccessLayer --> PostgresDB
```

### Core Design Rules
* **No Business Logic in Routers**: API route handlers are thin orchestrators that validate incoming DTOs, invoke domain services or mathematical solvers, and format responses.
* **Separation of Computation**: Compute-intensive Operations Research (OR) and Neural Machine Learning (ML) live in dedicated isolated packages (`backend/optimization/` and `backend/ml/`).
* **Dependency Injection**: Database sessions, background workers, and shared caches are managed via FastAPI's `Depends()` mechanism.

---

## 2. Directory Structure

```
backend/
├── api/                             # FastAPI APIRouter definitions
│   ├── __init__.py
│   ├── health.py                    # Health & liveness probes
│   ├── suppliers.py                 # Supplier discovery, comparison, clustering
│   ├── business.py                  # Business profiles, readiness, guidelines
│   ├── scenarios.py                 # Delivery destinations, landed cost calculation
│   ├── ai.py                        # Grok, DeepSeek, and Gemini AI endpoints
│   ├── optimization.py              # MILP multi-supplier allocation & what-if
│   └── ml.py                        # Neural fit, price regression, risk prediction
├── app/
│   ├── data/
│   │   └── seed_data.py             # Verified supplier registry & destination seed
│   ├── models/
│   │   └── database.py              # SQLAlchemy 2.0 declarative database models
│   ├── schemas/
│   │   └── schemas.py               # Pydantic v2 validation and response schemas
│   └── services/
│       ├── ai_service.py            # Gemini client & multi-LLM orchestration
│       ├── business_service.py      # Readiness assessment & budget classification
│       ├── profile_service.py       # Entrepreneur business workspace persistence
│       ├── recommendation_service.py# 4-lens supplier recommendation heuristics
│       ├── logistics/
│       │   ├── cost_engine.py       # Haversine distance, freight, tariffs
│       │   └── scenario_service.py  # Sourcing scenario persistence & comparisons
│       ├── maps/
│       │   └── service.py           # Geospatial map clustering & viewport culling
│       └── suppliers/
│           ├── contacts.py          # Verified public business contacts
│           ├── discovery.py         # Multi-criteria filter & natural search
│           ├── ranking.py           # Supplier scoring & ranking logic
│           └── verification.py      # Onsite audit, registry match, trust scoring
├── core/
│   ├── config.py                    # Pydantic Settings & environment parsing
│   ├── database.py                  # SQLAlchemy engine & session factory
│   ├── dependencies.py              # FastAPI dependency providers
│   ├── cache.py                     # High-throughput thread-safe memory cache
│   └── rate_limiter.py              # Sliding-window rate limiter
├── ml/                              # Neural Sourcing Intelligence Engine
│   ├── checkpoints/                 # Serialized weight parameters (JSON/NumPy)
│   ├── data/                        # Synthetic interaction dataset generators
│   ├── features/                    # User & supplier 8D continuous encoders
│   ├── inference/                   # NeuralInferenceService (pure vectorized)
│   ├── models/                      # Two-Tower, Price Regressor, Risk Model
│   ├── nn/                          # Pure Python/NumPy MLP dense layers & activations
│   ├── training/                    # SGD / Adam vectorized backpropagation loops
│   └── versioning.py                # Model metadata & registry tracking
├── optimization/                    # Operations Research Allocation Engine
│   ├── constraints/                 # Demand, MOQ, Capacity, Budget validators
│   ├── model/                       # Decision variables, candidate suppliers, objectives
│   ├── objectives/                  # Scalarized cost, risk, logistics, HHI penalties
│   ├── results/                     # Allocation formatter, savings calculator
│   ├── scenarios/                   # What-if sensitivity & disruption simulations
│   └── solvers/                     # Exact Branch-and-Bound & OR-Tools integration
├── main.py                          # FastAPI application initialization & lifespan
├── requirements.txt                 # Pinned backend dependencies
└── run_server.py                    # Standalone zero-dependency runtime server
```

---

## 3. Comprehensive API Route Catalog

### 3.1 Health & System Probes
* `GET /api/health`
  * **Summary**: Liveness and readiness health check.
  * **Response**: `{"status": "healthy", "service": "SupplyLens API", "version": "2.0.0"}`

---

### 3.2 Supplier Intelligence (`/api/suppliers`)

#### `GET /api/suppliers`
* **Summary**: Filtered supplier search across global manufacturing hubs.
* **Query Parameters**:
  * `country` (string, optional): ISO country name filter (e.g. "India", "Vietnam").
  * `city` (string, optional): Specific hub city filter.
  * `product` (string, optional): Product name keyword.
  * `search` (string, optional): Generic search term matching name, city, or catalog.
  * `supplier_type` (string, optional): `OEM`, `Contract Manufacturer`, `Distributor`.
  * `max_moq` (integer, optional): Filter out suppliers whose MOQ exceeds this value.
  * `max_price` (float, optional): Maximum unit factory price filter.
  * `min_rating` (float, optional): Minimum quality rating (e.g., 4.5).
  * `verified_only` (bool, default: `true`): Restrict to audited facilities.
  * `sort_by` (string, default: `recommended`): `recommended`, `cheapest`, `highest_rated`, `fastest`.
* **Response**: List of enriched supplier objects including physical address, verification badge, product catalog, and contact details.

#### `POST /api/suppliers/natural-search`
* **Summary**: Translates free-form founder intent into structured multi-criteria filters.
* **Request Body**:
  ```json
  {
    "query": "Need cheap bagasse containers in India under 5 rupees with MOQ under 2000",
    "business_id": "biz-001"
  }
  ```
* **Response**: Structured intent representation paired with resolved supplier candidates.

#### `POST /api/suppliers/compare`
* **Summary**: Side-by-side comparison matrix for up to 5 candidate suppliers.
* **Request Body**:
  ```json
  {
    "supplier_ids": ["sup-ply-001", "sup-ply-002", "sup-ply-003"]
  }
  ```
* **Response**: Multi-dimensional matrix comparing unit price, factory MOQ, minimum capital requirement, transit distance, estimated lead time, and landed unit cost.

#### `GET /api/suppliers/clusters`
* **Summary**: Geospatial clustering of verified suppliers by zoom level for interactive maps.
* **Query Parameters**: `zoom` (integer, default: 4).

---

### 3.3 Business & Founder Readiness (`/api/business`)

#### `GET /api/business/profile`
* **Summary**: Retrieves the active sourcing profile and workspace for an entrepreneur.
* **Query Parameters**: `business_id` (string, default: "biz-001").

#### `POST /api/business/profile`
* **Summary**: Creates or updates business idea parameters, target geography, and budget.

#### `GET /api/business/readiness`
* **Summary**: Evaluates business readiness across 5 dimensions: Market, Suppliers, Budget, Logistics, and Competition without confusing mathematical scores.

---

### 3.4 Sourcing Scenarios & Landed Cost (`/api/scenarios`)

#### `GET /api/scenarios/destinations`
* **Summary**: Retrieves saved entrepreneur delivery destinations (factories, warehouses, fulfillment hubs).

#### `POST /api/scenarios/calculate-landed-cost`
* **Summary**: Computes transparent landed cost breakdown between supplier factory and delivery destination.
* **Request Body**:
  ```json
  {
    "supplier_id": "sup-ply-001",
    "unit_price": 4.50,
    "quantity": 10000,
    "destination_lat": 20.2961,
    "destination_lng": 85.8245,
    "shipping_mode": "road"
  }
  ```
* **Response**:
  ```json
  {
    "ex_factory_total": 45000.0,
    "freight_cost": 5420.0,
    "customs_and_tariffs": 0.0,
    "port_and_handling": 650.0,
    "insurance": 450.0,
    "total_landed_cost": 51520.0,
    "landed_unit_cost": 5.15,
    "distance_km": 420.5
  }
  ```

---

### 3.5 AI & Multi-LLM Services (`/api/ai` & `/api/assistant`)

#### `POST /api/ai/extract`
* **Engine**: Google Gemini 2.5 Flash (with deterministic regex fallback).
* **Summary**: Decomposes free-form founder statements into structured business profiles.

#### `POST /api/ai/clarify`
* **Engine**: Google Gemini 2.5 Flash.
* **Summary**: Detects missing parameters and generates a single, smart conversational clarifying question.

#### `POST /api/ai/requirements`
* **Engine**: Google Gemini 2.5 Flash.
* **Summary**: Generates categorized Bill of Materials (BOM) for the specified business concept.

#### `POST /api/assistant/ask`
* **Engine**: **xAI Grok-3-mini** (Primary) $\to$ **Google Gemini 2.5 Flash** (Fallback).
* **Summary**: Real-time conversational sourcing assistant grounded with active business profile and verified supplier context.

#### `POST /api/ai/detailed-info`
* **Engine**: **DeepSeek-Chat** (Primary) $\to$ **Google Gemini 2.5 Flash** (Fallback).
* **Summary**: Generates in-depth industrial market intelligence, regional manufacturing dynamics, and competitive supplier landscape reports.

---

### 3.6 Operations Research Optimization (`/api/optimization`)

#### `POST /api/optimization/solve`
* **Engine**: Exact Branch-and-Bound / Bound-and-Search Multi-Objective Solver.
* **Summary**: Computes the exact minimum-cost, minimum-risk multi-supplier allocation satisfying demand, factory MOQs, and capacity ceilings.
* **Request Body**:
  ```json
  {
    "required_quantity": 15000,
    "budget_limit": 800000,
    "objective_type": "balanced",
    "max_suppliers": 3,
    "max_supplier_share": 0.60,
    "max_country_share": 1.0,
    "preferred_countries": ["India", "Vietnam"],
    "neural_assisted": true
  }
  ```

#### `POST /api/optimization/scenarios`
* **Summary**: Generates 4 parallel strategic allocation plans (Cheapest, Balanced, Lowest Risk, Fastest Lead Time) for side-by-side trade-off review.

#### `POST /api/optimization/what-if`
* **Summary**: Simulates disruption scenarios (e.g. "What if Supplier A experiences a 30-day shutdown?" or "What if demand surges 50%?").

---

### 3.7 Machine Learning Inference (`/api/ml`)

#### `POST /api/ml/predict-fit`
* **Summary**: Computes non-linear founder-supplier compatibility score ($0.0 - 1.0$) via the Two-Tower Siamese network.

#### `POST /api/ml/predict-price`
* **Summary**: Estimates unit price mean and $95\%$ confidence bounds ($\hat{\mu} \pm 1.96\hat{\sigma}$) factoring in order quantity and volume elasticity.

#### `POST /api/ml/predict-risk`
* **Summary**: Predicts operational disruption probability ($0.0 - 1.0$) based on facility audits, location risks, and defect rates.

#### `POST /api/ml/batch-rank`
* **Summary**: Vectorized ranking of all catalog suppliers for an entrepreneur's profile.

#### `GET /api/ml/models`
* **Summary**: Inspects model metadata, checkpoint tags, and validation metrics.

---

## 4. Configuration & Security Management

Backend configuration is handled by `core/config.py` using `pydantic-settings`:

```python
class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GROK_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    GEOAPIFY_API_KEY: str = ""
    DATABASE_URL: str = "postgresql://supplylens:supplylens@localhost:5432/supplylens"

    class Config:
        env_file = ".env"
```

### Rate Limiting & Memory Caching
* **Sliding Window Rate Limiting** (`core/rate_limiter.py`): Protects LLM and optimization endpoints from burst floods.
* **In-Memory Cache** (`core/cache.py`): Thread-safe, TTL-based key-value store caching expensive distance queries and static catalog metadata.

---

## 5. Execution & Deployment

### Local Development Server
```bash
cd backend
python3 -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production ASGI Execution
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```
Interactive OpenAPI Swagger documentation is available at `http://localhost:8000/docs`.
