"""
SupplyLens Price Intelligence and Currency Normalization Service
Handles price type classification, approximate currency conversions, and plain-English MOQ interpretations.
"""

from typing import Dict, Any, Optional

# Static indicative exchange rates against INR for normalization
EXCHANGE_RATES_TO_INR = {
    "INR": 1.0,
    "USD": 83.5,
    "EUR": 90.2,
    "CNY": 11.5,
    "VND": 0.0033,
}


class PriceIntelligenceService:
    """Normalizes supplier pricing and formats honest, transparent cost summaries."""

    @staticmethod
    def interpret_moq(moq: int) -> str:
        """Translates numerical MOQ into friendly, plain-English guidance."""
        if moq <= 1000:
            return "Good for starting small"
        elif moq <= 5000:
            return "Moderate initial batch"
        elif moq <= 15000:
            return "Medium volume batch"
        else:
            return "Large minimum order"

    @classmethod
    def format_price_display(
        cls,
        price_min: float,
        price_max: Optional[float] = None,
        currency: str = "INR",
        unit: str = "piece",
        price_type: str = "estimated",
        target_currency: str = "INR"
    ) -> Dict[str, Any]:
        """
        Prepares pricing object preserving original currency while generating approximate converted figures.
        """
        price_type_labels = {
            "quoted": "Direct Quoted Price",
            "publicly_listed": "Publicly listed estimate",
            "estimated": "Estimated from available supplier data",
            "range": "Estimated price range",
            "user_provided": "User-reported benchmark"
        }

        note = price_type_labels.get(price_type, "Estimated from available supplier data")

        # Range or single price
        if price_max and price_max > price_min:
            display_range = f"{cls._format_curr(price_min, currency)}–{cls._format_curr(price_max, currency)} / {unit}"
        else:
            display_range = f"From {cls._format_curr(price_min, currency)} / {unit}"

        # Approximate conversion if currencies differ
        conversion_info = None
        if currency.upper() != target_currency.upper():
            rate_from = EXCHANGE_RATES_TO_INR.get(currency.upper(), 1.0)
            rate_to = EXCHANGE_RATES_TO_INR.get(target_currency.upper(), 1.0)
            conv_min = (price_min * rate_from) / rate_to
            conversion_info = {
                "converted_amount": round(conv_min, 2),
                "target_currency": target_currency,
                "display_text": f"Approx. {cls._format_curr(conv_min, target_currency)} (indicative conversion)",
                "is_approximate": True
            }

        return {
            "price_min": price_min,
            "price_max": price_max or price_min,
            "currency": currency,
            "unit": unit,
            "price_type": price_type,
            "price_note": note,
            "display_price": display_range,
            "conversion": conversion_info,
        }

    @staticmethod
    def _format_curr(amount: float, curr: str) -> str:
        symbols = {"INR": "₹", "USD": "$", "EUR": "€", "CNY": "¥"}
        sym = symbols.get(curr.upper(), curr + " ")
        if curr.upper() == "INR":
            return f"{sym}{amount:,.2f}" if amount < 100 else f"{sym}{amount:,.0f}"
        return f"{sym}{amount:,.2f}"
