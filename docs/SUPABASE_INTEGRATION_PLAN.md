# SUPPLYLENS — SUPABASE INTEGRATION PLAN & SECURITY ARCHITECTURE

**Product:** SupplyLens  
**Engineering Discipline:** Database Architecture, Cloud Infrastructure, Row-Level Security, Authentication  
**Version:** 1.0 (Production Blueprint)  

---

## 1. Supabase Environment & Connectivity Architecture

SupplyLens uses PostgreSQL and Supabase as its authoritative persistence, authentication, and file storage engine. The application operates in two coordinated deployment environments:

1. **Development & Local Staging:**
   - FastAPI backend interacting with PostgreSQL / local SQLite fallback via SQLAlchemy with asynchronous connection pools.
   - Next.js client utilizing `@supabase/supabase-js` with graceful offline fallback services.
2. **Production Cloud (Supabase & Vercel):**
   - Supabase project hosted on AWS/GCP with pgvector, Row-Level Security (RLS), and automated daily WAL archiving.
   - Next.js hosted on Vercel with server-side environment variables and Edge-compatible data clients.

---

## 2. Row Level Security (RLS) Policy Matrix

To enforce strict zero-trust data access:

| Table | Policy Role | Permitted Actions | Condition / Expression |
|---|---|---|---|
| `brands` | Public / Authenticated | `SELECT` | `verification_status IN ('verified', 'partially_verified')` |
| `brands` | Admin / Service Role | `ALL` | `auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)` |
| `parent_companies` | Public / Authenticated | `SELECT` | `TRUE` |
| `brand_products` | Public / Authenticated | `SELECT` | `TRUE` |
| `brand_supplier_relationships` | Public / Authenticated | `SELECT` | `verification_status = 'verified'` |
| `brand_source_evidence` | Authenticated | `SELECT` | `TRUE` |
| `brand_audit_events` | Admin / Service Role | `SELECT, INSERT` | Admin role only |
| `saved_brands` | Authenticated User | `SELECT, INSERT, DELETE` | `auth.uid()::text = user_id` |
| `invoices` | Authenticated User | `SELECT` | `customer_id = auth.uid()::text` |
| `invoices` | Admin / Service Role | `ALL` | Admin role only |
| `payments` | Authenticated User | `SELECT` | `customer_id = auth.uid()::text` |
| `payment_webhook_events`| Service Role | `INSERT, SELECT` | Server-side webhooks only |

---

## 3. Environment Variable Configuration

### Frontend (`frontend/.env.local` / Vercel Environment Variables):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
```

### Backend (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> [!CAUTION]
> The `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` must **never** be exposed in `NEXT_PUBLIC_*` variables or client bundles.

---

## 4. Frontend Supabase Client Architecture

The frontend integrates Supabase through a layered architecture:

```
frontend/src/
  ├── lib/
  │    └── supabase/
  │         ├── client.ts         // Browser-safe client using NEXT_PUBLIC_SUPABASE_ANON_KEY
  │         └── server.ts         // Server-Component & API-safe client
  ├── services/
  │    ├── brand.service.ts       // Typed query engine for brands, categories, and products
  │    ├── payment.service.ts     // Checkout orchestration and payment verification
  │    └── auth.service.ts        // Session handling and profile management
  └── hooks/
       ├── useBrands.ts           // React hook with filter state, debounced search, and pagination
       └── useSavedBrands.ts      // Optimistic saved brand toggles persisted in Supabase
```

---

## 5. Incremental Migration Pipeline

1. **`001_initial_schema.sql`:** Core users, sectors, businesses, products, suppliers, logistics.
2. **`002_deals_and_monetization.sql`:** Tenders, sourcing deals, invoices, service fee policies, payments.
3. **`003_brand_intelligence_database.sql`:** Canonical brand tables, parent companies, brand products, supplier-brand relationships, source evidence, and RLS policies.
