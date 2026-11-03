# Entity Resolution

When multiple sources refer to the same real business, the system must merge them securely.

## Match Criteria
- Exact Company Name
- Exact Website Domain
- Exact Phone Number
- Geographic overlap

## Policy
We do not automatically merge weak matches.
If a duplicate is probable but not exact, we maintain a `supplier_entity_link` for manual or scheduled review.
