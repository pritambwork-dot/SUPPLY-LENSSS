# SupplyLens Complete Repository Audit & Architecture Inventory

## 1. Executive Summary

SupplyLens is an enterprise sourcing intelligence and transaction settlement platform built on a deterministic architecture:
- **Core Domain Workflow**: `Business Profile -> Product BOM -> Raw Materials -> Verified Suppliers -> 10-Dimension Compliance -> Landed Economics -> OR-Tools Allocation -> Tenders & Contracts -> Deals -> 5% Success Fee Monetization -> Invoices`.
- **Theme & Aesthetic**: High-contrast, pure glossy light theme (`#F7F9FC` background, `#FFFFFF` crisp surfaces, `#0071E3` Apple/SaaS vibrant blue, `#152238` high-contrast typography, `#E4EAF1` subtle borders).
- **Demo Data Policy**: Strict environment isolation with fictional `.example` domains and simulated `demo://` cryptographic evidence fixtures.

---

## 2. Full Route & Page Inventory

| Route | Type | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `/` | Client/SPA | Flagship 3D Dashboard, Discovery, Compare, Verification, Economics, Optimizer, Deals, Revenue | Operational (200 OK) |
| `/landing` | Static | Cinematic 3D Freight Logistics Landing Page with interactive scroll camera | Operational (200 OK) |
| `/billing` | Dynamic | Customer Billing Hub, Statements, Payment Verification, and 5% Success Fee Invoices | Operational (200 OK) |
| `/billing/invoices/[id]` | Dynamic | Individual Invoice Inspection, Cryptographic Receipt, and Checkout Settlement | Operational (200 OK) |
| `/login` | Static | Interactive Authentication Gateway with Supabase & Demo Login options | Operational (200 OK) |

---

## 3. Frontend Architecture

### 3.1 Technology Stack
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.4+ (Strict typing, zero compile errors)
- **Styling**: Tailwind CSS with custom light-theme tokens, iOS frosted glass blur, and smooth rounded geometry (`rounded-3xl`, `rounded-2xl`).
- **3D Engine**: Three.js & React Three Fiber (`AiSphere3D`, `GlobalGlobe`, `SpatialCard`, `FactoryModel`).
- **Motion**: Framer Motion for entrance animations, hover elevations, modal scale-ins, and live telemetry spin.

### 3.2 Key Component Inventory
- `Header.tsx`: Sticky navigation with `DEMO ENVIRONMENT · SAMPLE DATA` badge, tabs, and compare/scenario counters.
- `LeftNavRail.tsx`: Compact side navigation bar with direct links to Landing, Dashboard, Verification, Deals, Billing, and Optimizer.
- `ModernDashboard.tsx`: High-contrast glossy white dashboard with interactive Spline chart, 3D Sphere/Globe switcher, and Verified Factory partner table.
- `VerificationDashboard.tsx`: 10-dimension deterministic compliance engine, live telemetry trigger, evidence dossier inspect modal, and admin override drawer.
- `SupplierDirectory.tsx`: Multi-filter supplier catalog with live search, geocoding maps, and compare matrix selector.
- `DealsTransactionsView.tsx`: End-to-end commercial contract settlement, deal status progression, and 5% fee calculation.
- `AdminRevenueDashboard.tsx`: Real-time financial telemetry, GMV metrics, and fee assessments.

---

## 4. Backend Architecture

### 4.1 Technology Stack
- **Framework**: FastAPI (Asynchronous Python 3.11+)
- **Database Layer**: SQLAlchemy 2.0 with PostgreSQL/Supabase connectivity + SQLite fallback for offline development.
- **Optimization**: Google OR-Tools for mixed-integer programming and multi-criteria sourcing allocation.
- **Machine Learning**: Custom batch ranking and fit scoring pipelines (`api/ml.py`).

### 4.2 API Endpoint Inventory
- `GET /api/health`: Health status and verified supplier counts.
- `GET /api/verification/dashboard`: Real-time 10-dimension compliance metrics, pass rates, and audit logs.
- `POST /api/verification/verify/{id}`: Deterministic audit execution updating supplier status.
- `GET /api/verification/{id}/evidence`: Cryptographic evidence dossier with `demo://` fixtures and SHA-256 hashes.
- `POST /api/verification/{id}/review`: Admin review override with audit logging.
- `GET /api/suppliers`: Search and catalog retrieval with live ingestion fallback.
- `POST /api/scenarios/calculate`: Landed economics calculator.
- `POST /api/optimization/solve`: Mixed-integer multi-supplier sourcing solver.
- `GET /api/monetization/analytics`: GMV, assessed 5% fees, and transaction metrics.
- `GET /api/tenders` & `POST /api/deals`: Tender tracking and contract deal confirmations.
