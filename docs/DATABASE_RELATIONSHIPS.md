# SupplyLens Database Relationships & Foreign Key Hierarchy

## 1. Relational Integrity Architecture

SupplyLens enforces referential integrity across all sourcing, evaluation, and commercial settlement workflows.

### 1.1 Sourcing Pipeline Data Cascade
The platform's relational workflow is structured as follows:

```
[User / Business Workspace]
          │
          ▼
   [Business Requirements / BOM]
          │
          ▼
 [Sourcing Scenarios & Optimization Runs]
          │
          ▼
   [Published Tender / RFQ]
          │
          ▼
  [Selected Verified Supplier] ───► [10-Dimension Audit Dossier]
          │
          ▼
    [Confirmed Sourcing Deal]
          │
          ▼
[5% Success Fee Assessment]
          │
          ▼
[Service Fee Tax Invoice]
          │
          ▼
[Cryptographic Payment Settlement]
```

---

## 2. Table Relationship Matrix

| Primary Table | Foreign Key Column | Referenced Table | On Delete Rule | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `businesses` | `user_id` | `users(id)` | `SET NULL` | Preserves business records for audit trail if user leaves |
| `businesses` | `sector_id` | `sectors(id)` | `SET NULL` | Sector modifications do not wipe active workspaces |
| `business_requirements` | `business_id` | `businesses(id)` | `CASCADE` | Requirements belong strictly to a workspace |
| `supplier_products` | `supplier_id` | `suppliers(id)` | `CASCADE` | Product lines deleted if supplier removed |
| `supplier_contacts` | `supplier_id` | `suppliers(id)` | `CASCADE` | Contact endpoints belong to supplier |
| `supplier_locations` | `supplier_id` | `suppliers(id)` | `CASCADE` | Physical facilities belong to supplier |
| `verification_audit_logs` | `supplier_id` | `suppliers(id)` | `CASCADE` | Audit logs tied to supplier entity |
| `verification_evidence_fixtures` | `supplier_id` | `suppliers(id)` | `CASCADE` | Evidence fixtures belong to supplier |
| `tenders` | `business_id` | `businesses(id)` | `CASCADE` | Tenders belong to business workspace |
| `tenders` | `selected_supplier_id`| `suppliers(id)` | `SET NULL` | Preserves tender historical record |
| `sourcing_deals` | `supplier_id` | `suppliers(id)` | `RESTRICT` | Cannot delete supplier with active confirmed contract |
| `sourcing_deals` | `business_id` | `businesses(id)` | `CASCADE` | Deals belong to purchasing business |
| `service_fee_assessments` | `deal_id` | `sourcing_deals(id)` | `CASCADE` | 5% fee calculated directly from deal value |
| `service_fee_invoices` | `assessment_id`| `service_fee_assessments(id)` | `RESTRICT`| Invoice cannot exist without audited assessment |
| `payments` | `invoice_id` | `service_fee_invoices(id)` | `RESTRICT` | Payment receipts immutable once issued |

---

## 3. Query Optimization & Indexes

To ensure sub-millisecond retrieval under 4K and heavy dashboard telemetry:
- `idx_suppliers_country_city`: Composite index for geospatial lookups.
- `idx_supplier_products_price`: B-tree index for rapid MOQ and unit price filtering.
- `idx_verification_audit_supplier`: Indexed for fast compliance dossier assembly.
- `idx_sourcing_deals_business`: Fast customer deal pipeline lookups.
- `idx_service_fee_invoices_status`: Instant retrieval of pending vs settled 5% fees.
