"""
Fee Calculator Service for SupplyLens.
Authoritative calculation engine for the transparent 5% success fee.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import math


class FeeCalculationResult:
    def __init__(
        self,
        fee_base_amount: float,
        fee_percentage: float,
        calculated_fee: float,
        tax_rate: float,
        tax_amount: float,
        total_fee_due: float,
        currency: str,
        policy_version: str,
        calculation_explanation: str,
        due_date: datetime,
    ):
        self.fee_base_amount = fee_base_amount
        self.fee_percentage = fee_percentage
        self.calculated_fee = calculated_fee
        self.tax_rate = tax_rate
        self.tax_amount = tax_amount
        self.total_fee_due = total_fee_due
        self.currency = currency
        self.policy_version = policy_version
        self.calculation_explanation = calculation_explanation
        self.due_date = due_date

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fee_base_amount": round(self.fee_base_amount, 2),
            "fee_percentage": self.fee_percentage,
            "calculated_fee": round(self.calculated_fee, 2),
            "tax_rate": self.tax_rate,
            "tax_amount": round(self.tax_amount, 2),
            "total_fee_due": round(self.total_fee_due, 2),
            "currency": self.currency,
            "policy_version": self.policy_version,
            "calculation_explanation": self.calculation_explanation,
            "due_date": self.due_date.isoformat(),
        }


class FeeCalculator:
    """Calculates SupplyLens service fees based on active policies."""

    DEFAULT_FEE_PERCENTAGE = 5.0
    DEFAULT_TAX_RATE = 18.0  # GST 18%
    DEFAULT_PAYMENT_TERMS_DAYS = 15

    @classmethod
    def calculate_success_fee(
        cls,
        confirmed_contract_value: float,
        currency: str = "INR",
        policy: Optional[Any] = None,
        custom_terms_days: Optional[int] = None,
    ) -> FeeCalculationResult:
        """
        Calculate the 5% service fee on confirmed deal value.
        Formula:
          Base Fee = Confirmed Value * (Fee Percentage / 100)
          Tax = Base Fee * (Tax Rate / 100)
          Total Due = Base Fee + Tax
        """
        if confirmed_contract_value <= 0:
            raise ValueError("Confirmed contract value must be greater than zero to assess a service fee.")

        # Determine policy parameters
        if policy:
            fee_percentage = float(policy.fee_percentage)
            tax_rate = float(policy.tax_rate_percentage)
            policy_version = policy.version
            min_cap = policy.min_fee_cap
            max_cap = policy.max_fee_cap
        else:
            fee_percentage = cls.DEFAULT_FEE_PERCENTAGE
            tax_rate = cls.DEFAULT_TAX_RATE
            policy_version = "v1.0-standard"
            min_cap = None
            max_cap = None

        # Pre-tax base fee calculation
        raw_fee = confirmed_contract_value * (fee_percentage / 100.0)

        # Apply min/max caps if configured in policy
        if min_cap is not None and raw_fee < min_cap:
            calculated_fee = float(min_cap)
            cap_note = f" (Adjusted to policy minimum cap of {currency} {min_cap:,.2f})"
        elif max_cap is not None and raw_fee > max_cap:
            calculated_fee = float(max_cap)
            cap_note = f" (Capped at policy maximum limit of {currency} {max_cap:,.2f})"
        else:
            calculated_fee = raw_fee
            cap_note = ""

        # Tax calculation (e.g. 18% GST)
        tax_amount = calculated_fee * (tax_rate / 100.0)
        total_fee_due = calculated_fee + tax_amount

        # Net payment terms (default 15 days from calculation)
        terms_days = custom_terms_days or cls.DEFAULT_PAYMENT_TERMS_DAYS
        due_date = datetime.utcnow() + timedelta(days=terms_days)

        explanation = (
            f"SupplyLens 5% Success Fee calculation under policy {policy_version}: "
            f"{fee_percentage}% on confirmed pre-tax contract value of {currency} {confirmed_contract_value:,.2f} "
            f"= {currency} {calculated_fee:,.2f}{cap_note}. "
            f"Plus applicable GST/tax ({tax_rate}%) of {currency} {tax_amount:,.2f}, "
            f"for a total payable amount of {currency} {total_fee_due:,.2f}. "
            f"Payment due within {terms_days} days."
        )

        return FeeCalculationResult(
            fee_base_amount=confirmed_contract_value,
            fee_percentage=fee_percentage,
            calculated_fee=calculated_fee,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_fee_due=total_fee_due,
            currency=currency,
            policy_version=policy_version,
            calculation_explanation=explanation,
            due_date=due_date,
        )
