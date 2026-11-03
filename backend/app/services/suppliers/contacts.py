"""
SupplyLens Public Business Contacts Service
Sanitizes, validates, and formats official public business contact channels.
Strictly guards against exposing personal info or fabricating missing channels.
"""

from typing import Dict, Any, Optional, List


class ContactService:
    """Enforces privacy boundaries and transparent contact states."""

    @staticmethod
    def format_supplier_contacts(supplier: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formats public business contacts with proper indicators.
        If email is missing or empty, explicitly flags it so frontend displays:
        "No verified public email found."
        """
        phone = supplier.get("public_phone")
        email = supplier.get("public_email")
        website = supplier.get("website")
        address = supplier.get("address")
        source = supplier.get("data_source", "Public Business Registry")

        # Guard: If email starts with personal domain (gmail, yahoo, etc.) or is empty
        is_valid_public_email = False
        if email and isinstance(email, str) and "@" in email:
            clean_email = email.strip().lower()
            if not any(clean_email.endswith(dom) for dom in ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"]):
                is_valid_public_email = True
            else:
                email = None  # Do not expose personal email accounts

        contact_list: List[Dict[str, Any]] = []

        if phone:
            contact_list.append({
                "contact_type": "phone",
                "value": phone,
                "display_label": "Public Business Phone",
                "source": source,
                "is_public": True,
                "is_verified": True
            })

        if is_valid_public_email and email:
            contact_list.append({
                "contact_type": "email",
                "value": email,
                "display_label": "Public Business Email",
                "source": source,
                "is_public": True,
                "is_verified": True
            })
        else:
            contact_list.append({
                "contact_type": "email",
                "value": "",
                "display_label": "No verified public email found",
                "source": source,
                "is_public": False,
                "is_verified": False
            })

        if website:
            contact_list.append({
                "contact_type": "website",
                "value": website,
                "display_label": "Official Website",
                "source": "Domain Registrar",
                "is_public": True,
                "is_verified": True
            })

        if address:
            contact_list.append({
                "contact_type": "address",
                "value": address,
                "display_label": "Registered Business Address",
                "source": source,
                "is_public": True,
                "is_verified": True
            })

        return {
            "public_phone": phone or "No public phone listed",
            "public_email": email if is_valid_public_email else None,
            "has_verified_email": is_valid_public_email,
            "email_fallback_message": "No verified public email found." if not is_valid_public_email else None,
            "website": website or "",
            "address": address or "",
            "contacts": contact_list
        }
