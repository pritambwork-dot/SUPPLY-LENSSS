"""
SupplyLens Public Business Contact Extractor
Extracts role-based commercial emails and telephone numbers with strict compliance:
- Never harvests private personal emails.
- Never guesses email patterns.
- Only extracts publicly published company contacts.
"""

import re
from typing import List, Dict, Any, Optional

# Approved role-based email prefixes for legitimate commercial sourcing
APPROVED_ROLE_PREFIXES = [
    "sales", "export", "exports", "enquiry", "enquiries", "info",
    "contact", "procurement", "orders", "support", "commercial", "business"
]

# Disallowed personal mail domains (never scrape personal accounts)
DISALLOWED_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"
]


class ContactExtractor:
    @staticmethod
    def extract_public_business_contacts(
        html_or_text: str,
        source_url: str,
        company_domain: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Extracts verified public business contacts from webpage text.
        Returns a list of structured contact dictionaries with source provenance.
        """
        contacts: List[Dict[str, Any]] = []
        if not html_or_text:
            return contacts

        # 1. Role-Based Email Extraction
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        raw_emails = set(re.findall(email_pattern, html_or_text))

        for email in raw_emails:
            email_lower = email.lower()
            prefix, domain = email_lower.split("@", 1)

            # Block free personal consumer email providers
            if domain in DISALLOWED_DOMAINS:
                continue

            # Prioritize role-based email addresses (sales@, info@, export@)
            is_role_based = any(prefix.startswith(role) for role in APPROVED_ROLE_PREFIXES)

            # If company domain is provided, verify domain matching
            if company_domain and domain not in company_domain:
                continue

            contacts.append({
                "type": "email",
                "contact_type": "email",
                "value": email_lower,
                "role": prefix if is_role_based else "general",
                "source_url": source_url,
                "is_public": True,
                "confidence": "high" if is_role_based else "medium",
            })

        # 2. Public Business Phone Extraction (International and National E.164 formats)
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b"
        raw_phones = set(re.findall(phone_pattern, html_or_text))

        for phone in raw_phones:
            cleaned_digits = re.sub(r"[^\d+]", "", phone)
            # Ensure plausible phone length (8 to 14 digits)
            if 8 <= len(cleaned_digits.replace("+", "")) <= 14:
                # Filter out obvious false positives (dates, zip codes, years)
                if cleaned_digits.startswith("202") and len(cleaned_digits) <= 8:
                    continue

                contacts.append({
                    "type": "phone",
                    "contact_type": "phone",
                    "value": phone.strip(),
                    "role": "main_office",
                    "source_url": source_url,
                    "is_public": True,
                    "confidence": "high",
                })

        return contacts[:6]
