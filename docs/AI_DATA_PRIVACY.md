# SupplyLens AI Data Privacy & Confidentiality Policy

## 1. Customer Data Protection
- **No Training on Private Business Data:** User prompts, bill-of-materials data, target budgets, and supplier RFQs are not utilized to train generic public models.
- **Tenant Data Isolation:** Strategic memories and preferences stored in `ai_memory` are partitioned strictly by `user_id` and `business_id`.
- **Right to Deletion:** Deleting an AI conversation via `DELETE /api/v1/assistant/conversations/{id}` purges all associated turn records and logs immediately from database tables via cascading foreign keys.
