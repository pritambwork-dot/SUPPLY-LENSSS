# Data Ingestion

Ingestion happens asynchronously.

1. **Fetch**: Retrieves data via Nimble/Apify.
2. **Raw Storage**: Stored immutably in `raw_supplier_records`.
3. **Validation**: Data types and bounds checked.
4. **Normalization**: Phone numbers, domains, addresses standardized.
5. **Entity Resolution**: Duplicate checks against the canonical database.
6. **Evidence**: Attaches source URLs and timestamps.
7. **Verification**: Applies business rules.
8. **Canonical Database**: Writes to the `Supplier` table if criteria are met.
