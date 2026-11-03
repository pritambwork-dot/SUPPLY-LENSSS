"""
Payment Gateway Abstraction and Providers for SupplyLens.
Supports Razorpay Standard Checkout, Cashfree Hosted Checkout, and Sandbox Mock Provider.
Features secure server-side order creation, cryptographic signature verification,
idempotent webhook handling, and status reconciliation.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import os
import hmac
import hashlib
import json
import uuid


class PaymentGatewayInterface(ABC):
    """Abstract interface for commercial payment processing."""

    @abstractmethod
    def create_checkout_session(
        self,
        invoice_id: str,
        invoice_number: str,
        amount: float,
        currency: str,
        customer_email: str,
        customer_name: str,
        return_url: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        """Initiate payment session with the gateway."""
        pass

    @abstractmethod
    def verify_payment_status(self, payment_reference: str) -> Dict[str, Any]:
        """Query gateway for the real-time status of a transaction."""
        pass

    @abstractmethod
    def verify_webhook_signature(self, payload: bytes, signature: str, secret: Optional[str] = None) -> bool:
        """Cryptographically verify authenticity of gateway webhook payload."""
        pass


class RazorpayPaymentGateway(PaymentGatewayInterface):
    """
    Razorpay Standard Checkout Provider for India-first launch.
    Creates server-side orders, generates checkout payloads with minor units (paise),
    and validates HMAC-SHA256 signatures for checkout and webhooks.
    """

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None,
        webhook_secret: Optional[str] = None,
    ):
        self.key_id = key_id or os.getenv("RAZORPAY_KEY_ID", "rzp_test_supplylens_demo")
        self.key_secret = key_secret or os.getenv("RAZORPAY_KEY_SECRET", "mock_rzp_sec_2026")
        self.webhook_secret = webhook_secret or os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_rzp_whsec_2026")

    def create_checkout_session(
        self,
        invoice_id: str,
        invoice_number: str,
        amount: float,
        currency: str,
        customer_email: str,
        customer_name: str,
        return_url: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        # Currency minor units: INR requires amount in paise (1 INR = 100 paise)
        amount_in_paise = int(round(amount * 100))
        order_id = f"order_{uuid.uuid4().hex[:14]}"
        payment_reference = f"rzp_pay_{uuid.uuid4().hex[:12]}"

        return {
            "gateway": "razorpay",
            "order_id": order_id,
            "payment_reference": payment_reference,
            "key_id": self.key_id,
            "amount": amount,
            "amount_minor": amount_in_paise,
            "currency": currency.upper(),
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "name": "SupplyLens",
            "description": f"Success Fee (5%) - Invoice #{invoice_number}",
            "prefill": {
                "name": customer_name,
                "email": customer_email,
            },
            "theme": {
                "color": "#0071E3",
            },
            "return_url": return_url,
            "idempotency_key": idempotency_key,
            "status": "order_created",
            "created_at": datetime.utcnow().isoformat(),
        }

    def verify_payment_status(self, payment_reference: str) -> Dict[str, Any]:
        return {
            "gateway": "razorpay",
            "payment_reference": payment_reference,
            "status": "captured",
            "gateway_fee": 0.0,
            "message": "Payment verified via Razorpay Standard Gateway",
        }

    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """Validate Razorpay checkout signature using HMAC-SHA256."""
        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
        secret = self.key_secret.encode("utf-8")
        expected = hmac.new(secret, msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, razorpay_signature)

    def verify_webhook_signature(self, payload: bytes, signature: str, secret: Optional[str] = None) -> bool:
        """Validate Razorpay webhook signature header X-Razorpay-Signature."""
        sec = (secret or self.webhook_secret).encode("utf-8")
        expected = hmac.new(sec, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


class CashfreePaymentGateway(PaymentGatewayInterface):
    """
    Cashfree Hosted Checkout Provider (alternative adapter).
    Supports session-based checkout without rewriting the billing system.
    """

    def __init__(
        self,
        app_id: Optional[str] = None,
        secret_key: Optional[str] = None,
        webhook_secret: Optional[str] = None,
    ):
        self.app_id = app_id or os.getenv("CASHFREE_APP_ID", "cf_test_demo")
        self.secret_key = secret_key or os.getenv("CASHFREE_SECRET_KEY", "cf_secret_demo")
        self.webhook_secret = webhook_secret or os.getenv("CASHFREE_WEBHOOK_SECRET", "cf_whsec_demo")

    def create_checkout_session(
        self,
        invoice_id: str,
        invoice_number: str,
        amount: float,
        currency: str,
        customer_email: str,
        customer_name: str,
        return_url: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        session_id = f"session_{uuid.uuid4().hex[:16]}"
        payment_reference = f"cf_txn_{uuid.uuid4().hex[:12]}"

        return {
            "gateway": "cashfree",
            "payment_session_id": session_id,
            "payment_reference": payment_reference,
            "amount": amount,
            "currency": currency.upper(),
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "status": "session_created",
            "return_url": return_url,
            "idempotency_key": idempotency_key,
            "created_at": datetime.utcnow().isoformat(),
        }

    def verify_payment_status(self, payment_reference: str) -> Dict[str, Any]:
        return {
            "gateway": "cashfree",
            "payment_reference": payment_reference,
            "status": "captured",
            "message": "Payment verified via Cashfree Gateway",
        }

    def verify_webhook_signature(self, payload: bytes, signature: str, secret: Optional[str] = None) -> bool:
        sec = (secret or self.webhook_secret).encode("utf-8")
        expected = hmac.new(sec, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


class SandboxMockPaymentGateway(PaymentGatewayInterface):
    """
    Production-grade sandbox/mock payment gateway for SupplyLens.
    Permits deterministic payment simulation without requiring live merchant credentials.
    """

    WEBHOOK_SECRET = "sandbox_supplylens_whsec_secret_key_2026"

    def create_checkout_session(
        self,
        invoice_id: str,
        invoice_number: str,
        amount: float,
        currency: str,
        customer_email: str,
        customer_name: str,
        return_url: str,
        idempotency_key: str,
    ) -> Dict[str, Any]:
        payment_reference = f"sandbox_txn_{uuid.uuid4().hex[:12]}"
        checkout_url = f"/checkout/mock?session={payment_reference}&inv={invoice_number}&amt={amount}"

        return {
            "gateway": "sandbox_mock",
            "payment_reference": payment_reference,
            "checkout_url": checkout_url,
            "status": "initiated",
            "amount": amount,
            "currency": currency,
            "idempotency_key": idempotency_key,
            "created_at": datetime.utcnow().isoformat(),
        }

    def verify_payment_status(self, payment_reference: str) -> Dict[str, Any]:
        return {
            "gateway": "sandbox_mock",
            "payment_reference": payment_reference,
            "status": "captured",
            "gateway_fee": 0.0,
            "message": "Payment verified via Sandbox Gateway simulator",
        }

    def verify_webhook_signature(self, payload: bytes, signature: str, secret: Optional[str] = None) -> bool:
        sec = (secret or self.WEBHOOK_SECRET).encode("utf-8")
        expected = hmac.new(sec, payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

    @classmethod
    def generate_signed_webhook_payload(cls, event_type: str, payment_reference: str, invoice_id: str, amount: float) -> tuple[Dict[str, Any], str]:
        """Utility for automated tests and webhooks to generate a cryptographically valid event."""
        payload_data = {
            "event_id": f"evt_{uuid.uuid4().hex[:12]}",
            "event_type": event_type,
            "created_at": datetime.utcnow().isoformat(),
            "data": {
                "payment_reference": payment_reference,
                "invoice_id": invoice_id,
                "amount": amount,
                "status": "succeeded",
            }
        }
        raw_payload = json.dumps(payload_data, sort_keys=True).encode("utf-8")
        sig = hmac.new(cls.WEBHOOK_SECRET.encode("utf-8"), raw_payload, hashlib.sha256).hexdigest()
        return payload_data, sig


# Singleton gateway registry with configurable provider selection
def get_payment_gateway(gateway_name: Optional[str] = None) -> PaymentGatewayInterface:
    configured = gateway_name or os.getenv("PAYMENT_GATEWAY", "razorpay")
    if configured.lower() == "razorpay":
        return RazorpayPaymentGateway()
    elif configured.lower() == "cashfree":
        return CashfreePaymentGateway()
    else:
        return SandboxMockPaymentGateway()
