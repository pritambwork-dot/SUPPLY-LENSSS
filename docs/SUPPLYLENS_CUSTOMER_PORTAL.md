# SUPPLYLENS — CUSTOMER PORTAL SPECIFICATION & ARCHITECTURE

**Status**: Implemented & Production Ready  
**Component**: Customer Workspace (`/customer` and sub-routes)  
**Primary User Archetypes**: Entrepreneurs, D2C Founders, SMB Sourcing Managers  
**Date**: November 2026  

---

## 1. Overview & Objectives

The SupplyLens **Customer Portal** serves as the central command workspace for entrepreneurs and business operators to manage their end-to-end procurement lifecycle. Rather than treating sourcing as a static catalog lookup, the portal supports an active operational journey:

```mermaid
flowchart LR
    A["Register & Profile"] --> B["BOM Requirements"]
    B --> C["Discover Vendors"]
    C --> D["Compare & Shortlist"]
    D --> E["Request Quotation (RFQ)"]
    E --> F["Contract & 5% Fee Settlement"]
```

The portal strictly adheres to the SupplyLens glossy light theme (`#F7F9FC` background, crisp `#FFFFFF` cards, Apple Electric Blue `#0071E3` accents, and `#10B981` emerald trust badges).

---

## 2. Route Architecture & Workspace Sub-Modules

| Route | View Component | Core Functionality |
|-------|---------------|-------------------|
| `/customer` | [`CustomerDashboardPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/page.tsx) | Welcome greeting, prominent sourcing search, 6 quick actions, metrics cards, and live activity stream. |
| `/customer/profile` | [`CustomerBusinessProfilePage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/profile/page.tsx) | Company name, concept, industry, stage, city/country, budget amount, currency, and strategic priorities. |
| `/customer/business` | Alias to `/customer/profile` | Permissive routing alias for business settings. |
| `/customer/requirements` | [`CustomerRequirementsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/requirements/page.tsx) | Natural-language AI requirement decomposition (via Google Gemini) into a structured Bill of Materials. |
| `/customer/saved-vendors` | [`CustomerSavedVendorsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/saved-vendors/page.tsx) | Private bookmarks, quick RFQ submission, and vendor comparison. |
| `/customer/comparisons` | [`CustomerComparisonsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/comparisons/page.tsx) | Side-by-side evaluation of up to 5 vendors across landed cost, MOQ, audit scores, and lead times. |
| `/customer/quotations` | [`CustomerQuotationsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/quotations/page.tsx) | Tracking submitted RFQs, vendor responses, formal quotes, validity dates, and deal progression. |
| `/customer/deals` | [`CustomerDealsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/deals/page.tsx) | Commercial contracts, purchase order references, and 5% platform fee calculations. |
| `/customer/invoices` | [`CustomerInvoicesPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/invoices/page.tsx) | Transparent 5% service fee invoices with instant in-dashboard payment settlement. |
| `/customer/searches` | [`CustomerSearchesPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/searches/page.tsx) | Query telemetry, applied filter history, and one-click re-run buttons. |
| `/customer/settings` | [`CustomerSettingsPage`](file:///Users/pritambiswas/Desktop/supply%20lens/frontend/src/app/customer/settings/page.tsx) | Currency preferences (INR, USD, EUR), default Incoterms (FOB, CIF, DAP, EXW), and alerts. |

---

## 3. Customer Dashboard Metrics & Database Backing

All metrics displayed on the dashboard are backed by real database records and API endpoints (`/api/customer/dashboard-metrics`):

- **Customer Welcome Greeting**: *"Welcome back, Hossein. What are you looking to source today?"*
- **Supporting Description**: *"Discover vendors, explore raw materials and make smarter sourcing decisions for your business."*
- **Profile Completion Score**: Dynamically calculated based on required profile attributes (currently 75%).
- **Live Metrics**:
  - Saved Vendors: `4`
  - Pending Quotation Requests: `1`
  - Confirmed Sourcing Deals: `1`
  - Outstanding 5% Invoices: `1`
  - Recorded Activity Stream Events: `5+`

---

## 4. Natural-Language Sourcing Requirement Decomposition

Entrepreneurs often start with an unstructured statement of what they wish to build. SupplyLens bridges this gap using Google Gemini AI:

```json
{
  "natural_language_input": "I need 15,000 sugarcane bagasse meal trays (3-compartment, 750ml, home compostable EN 13432 certified) and 10,000 virgin kraft food delivery bowls with zero PE lining."
}
```

The AI engine parses this into structured BOM records:
- **Item 1**: *Sugarcane Bagasse Meal Trays (3-Compartment, 750ml)* · 15,000 pieces · Raw Materials · Required.
- **Item 2**: *Virgin Kraft Paper Food Delivery Bowls (500ml & 750ml)* · 10,000 pieces · Packaging · Required.
- **Item 3**: *PLA Clear Leak-Proof Snap Lids* · 25,000 pieces · Raw Materials · Required.

Customers can review, edit quantities, and save directly to their active workspace without synthetic data fabrication.
