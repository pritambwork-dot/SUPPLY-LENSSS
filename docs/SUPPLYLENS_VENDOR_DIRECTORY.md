# SUPPLYLENS — VENDOR DIRECTORY SPECIFICATION & ARCHITECTURE

**Status**: Implemented & Production Ready  
**Route**: `/vendors`  
**Purpose**: Primary B2B Marketplace Discovery Engine  
**Date**: November 2026  

---

## 1. Overview & Positioning

The SupplyLens **Vendor Directory** (`/vendors`) enables entrepreneurs and enterprise buyers to discover verified manufacturers, compare commercial minimum order quantities (MOQs), audit 10-dimension compliance scores, and submit direct Requests for Quotation (RFQs).

The directory strictly avoids loading the entire database into memory by querying backend endpoints with server-side filtering, sorting, and pagination.

---

## 2. Multi-Faceted Sourcing Search

The search bar accepts natural-language or keyword queries across multiple entity properties:
- **Company Name**: e.g. "Utkal GreenFiber", "Jamestown Container"
- **Raw Material**: e.g. "Bagasse", "Corrugated kraft", "BWP marine plywood"
- **Product Category**: e.g. "Sustainable Packaging", "Food Packaging"
- **Manufacturing Capability**: e.g. "Molded Fiber", "Flexo Printing", "Hot Press Lamination"
- **Location**: City or Country (e.g. "Cuttack", "India", "Falconer", "United States")
- **Supplier Type**: OEM, Contract Manufacturer, Raw Material Producer

---

## 3. Granular Facet Filters

| Filter Dimension | Options Supported | Query Parameter |
|-----------------|-------------------|-----------------|
| **Country** | All Countries, India, United States, Vietnam | `country` |
| **Vendor Type** | All Types, OEM, Contract Manufacturer, Distributor | `supplier_type` |
| **Product Category** | Sustainable Packaging, Food Packaging, Industrial Packaging | `product` |
| **Audit Status** | 10-D Verified Only / All | `verified_only` |
| **Sorting Criterion** | Recommended Match, Highest Rated, Lowest Price, Lowest MOQ | `sort_by` |

---

## 4. Reusable Vendor Card Anatomy

Each vendor is presented in an interactive card featuring:
1. **Monogram Logo**: 2-letter uppercase initials with glossy blue gradient.
2. **Company Header**: Display name and geographical location (`City, Country`).
3. **Verification Badge**: Prominently displays `Demo Verified` or `Verified` with emerald shield icon.
4. **Commercial Data Box**:
   - Starting MOQ (e.g. `1,000 piece`, `50 sheet`)
   - Quoted Ex-Factory Price (e.g. `INR 6.8`, `INR 16.5`)
5. **Manufacturing Capabilities**: Pill tags for up to 3 core production processes.
6. **Tactile Actions**:
   - **Click Card / Name**: Navigates to `/vendors/[vendor_id]` (Mandatory requirement).
   - **Bookmark Icon**: Saves/removes from private customer shortlist (`/customer/saved-vendors`).
   - **Compare Button**: Adds to side-by-side comparison workspace (`/customer/comparisons`).
   - **Request Quote Button**: Triggers the interactive RFQ modal.
