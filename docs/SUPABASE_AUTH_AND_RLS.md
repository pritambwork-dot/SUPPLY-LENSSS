# Supabase Authentication & Row Level Security (RLS) Guide

## 1. Architecture Overview

SupplyLens integrates **Supabase Auth** with PostgreSQL **Row Level Security (RLS)** to enforce tenant privacy, data isolation, and cryptographic session validation.

---

## 2. Row Level Security Policies

The following security policies are defined across migrations `001` through `006`:

| Table Name | Operation | Policy Definition | Scope / Isolation |
| :--- | :---: | :--- | :--- |
| `profiles` | SELECT | `auth.uid()::text = user_id OR auth.uid()::text = id` | User private |
| `profiles` | ALL | `auth.uid()::text = user_id OR auth.uid()::text = id` | User private |
| `user_onboarding_progress` | ALL | `auth.uid()::text = user_id` | User private |
| `business_members` | SELECT | `auth.uid()::text = user_id` | User private |
| `businesses` | SELECT | `user_id = auth.uid()::text OR user_id IS NULL` | Tenant isolated |
| `customer_activities` | SELECT | `auth.uid()::text = user_id OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()::text)` | Customer private |
| `quotation_requests` | SELECT | `auth.uid()::text = user_id OR business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()::text)` | Customer & Vendor private |
| `product_materials` | ALL | Scoped to user's authorized businesses | Tenant isolated |
| `suppliers` | SELECT | `true` (Active public catalog) | Publicly read-only |

---

## 3. Session & Token Lifecycle

1. **Token Issuance**: Upon successful signup or login via Supabase Auth, a cryptographically signed JWT is issued with standard claims (`sub` = user UID, `email`, `role`).
2. **Client Storage**: Tokens are stored in browser localStorage and secure cookies, with automatic refresh enabled (`autoRefreshToken: true`).
3. **API Headers**: REST requests to protected endpoints pass `Authorization: Bearer <access_token>`.
4. **Backend Verification**: Backend services parse and validate tokens using the Supabase JWT secret or verified service-role bindings.

---

## 4. Cross-Tenant Protection Tests

- **Test Case SEC-01**: User B attempting to read User A's `quotation_requests` receives 0 records.
- **Test Case SEC-02**: User B attempting to fetch User A's `business_profiles` receives HTTP 403 Forbidden.
- **Test Case SEC-03**: Unauthenticated requests to protected endpoints receive HTTP 401 Unauthorized.
