# SupplyLens Payment Gateway Setup & Credentials Guide
**Document Reference:** `docs/PAYMENT_GATEWAY_SETUP.md`  
**Version:** 1.0.0  
**Scope:** Razorpay Standard Checkout & Cashfree Gateway Configuration

---

## 1. Overview

SupplyLens integrates with **Razorpay Standard Checkout** as its primary Indian & International payment gateway for billing customers the 5% confirmed sourcing success fee.

This document guides platform administrators and DevOps engineers through provisioning keys, setting up webhooks, and configuring environment variables in development, staging, and production.

---

## 2. Gateway Credentials Matrix

| Variable Name | Required By | Environment | Description |
|---|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Frontend (Next.js) | All | Public Key ID used to initialize `window.Razorpay()`. Safe for browser. |
| `RAZORPAY_KEY_ID` | Backend (FastAPI) | All | Server-side Key ID used for Basic Auth to the Razorpay Orders API. |
| `RAZORPAY_KEY_SECRET` | Backend (FastAPI) | Server-Only | Secret Key used to sign HMAC-SHA256 tokens and authenticate requests. |
| `RAZORPAY_WEBHOOK_SECRET` | Backend (FastAPI) | Server-Only | Cryptographic secret configured in Razorpay Webhooks dashboard. |
| `DEFAULT_SUCCESS_FEE_RATE` | Backend | All | Float value representing transaction fee (Default: `0.05` for 5%). |
| `FEE_POLICY_VERSION` | Backend | All | Version identifier (e.g. `2026-v1.0`). |

---

## 3. Razorpay Dashboard Configuration Steps

### Step 1: Generate API Keys
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Select **Test Mode** (or **Live Mode** for production deployment).
3. Navigate to **Account & Settings** → **API Keys** → **Generate Key**.
4. Copy the generated `Key ID` and `Key Secret`.
   > [!CAUTION]
   > Store `RAZORPAY_KEY_SECRET` strictly in server secret managers (AWS SSM, GCP Secret Manager, or Vercel Environment Variables). Never commit it to git or prefix it with `NEXT_PUBLIC_`.

### Step 2: Configure Webhook Endpoint
1. Navigate to **Account & Settings** → **Webhooks**.
2. Click **Add New Webhook**.
3. Set the Webhook URL:
   - **Production:** `https://api.supplylens.com/api/v1/monetization/payments/webhooks/razorpay`
   - **Local Development / Ngrok:** `https://your-ngrok-subdomain.ngrok-free.app/api/v1/monetization/payments/webhooks/razorpay`
4. Set the **Secret**: Enter a high-entropy 32+ character random string. Copy this value to `RAZORPAY_WEBHOOK_SECRET`.
5. Select the following **Active Events**:
   - `order.paid`
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
6. Click **Create Webhook**.

---

## 4. Local Development & Sandbox Mode

For local development and testing without a live Razorpay merchant account:
- SupplyLens automatically detects when mock credentials (`rzp_test_supplylens_demo`) are supplied or when live keys are absent.
- The `SandboxMockPaymentGateway` executes identical cryptographic workflows, orders generation, and signature computations with zero external network dependencies.
- Frontend payment modal displays simulated payment prompts allowing instantaneous status reconciliation.

---

## 5. Verifying Gateway Health

You can verify the backend payment gateway configuration via curl:

```bash
# Check invoice status
curl -X GET http://localhost:8000/api/v1/monetization/billing/invoices/inv-utkal-001

# Initiate checkout order
curl -X POST http://localhost:8000/api/v1/monetization/billing/invoices/inv-utkal-001/checkout \
  -H "Content-Type: application/json" \
  -d '{"gateway": "razorpay"}'
```
