"""Synthetic Business Sourcing Benchmark Dataset Generator.

Simulates 2,500 realistic entrepreneurial sourcing scenarios across 5 distinct
founder archetypes to benchmark neural matching, price prediction, and operational risk.
"""
import random
import math
from typing import List, Dict, Any, Tuple
from ..features.encoder import (
    normalize_budget,
    normalize_moq,
    normalize_capacity,
    normalize_price,
    normalize_lead_time,
    normalize_rating,
    min_max_scale
)

ARCHETYPES = [
    "bootstrapped_startup",
    "growth_b2b",
    "scaled_enterprise",
    "urgent_turnaround",
    "high_compliance"
]

def generate_synthetic_dataset(num_samples: int = 2500, seed: int = 42) -> List[Dict[str, Any]]:
    """Generate balanced, realistic synthetic business-supplier pairing scenarios."""
    random.seed(seed)
    dataset = []

    for idx in range(num_samples):
        archetype = random.choice(ARCHETYPES)

        # 1. Generate User Profile based on Archetype
        if archetype == "bootstrapped_startup":
            budget = random.uniform(100000.0, 500000.0)  # ₹1L - ₹5L
            is_idea = 1.0
            is_growth = 0.0
            scale = 0.2  # pilot
            domestic_pref = 1.0 if random.random() < 0.85 else 0.0
            is_b2b = 1.0 if random.random() < 0.60 else 0.5
            has_facility = 0.0
            is_india = 1.0

        elif archetype == "growth_b2b":
            budget = random.uniform(1000000.0, 4000000.0)  # ₹10L - ₹40L
            is_idea = 0.0
            is_growth = 1.0
            scale = 0.6  # growth
            domestic_pref = 0.5
            is_b2b = 1.0
            has_facility = 1.0 if random.random() < 0.5 else 0.0
            is_india = 1.0

        elif archetype == "scaled_enterprise":
            budget = random.uniform(8000000.0, 30000000.0)  # ₹80L - ₹3Cr
            is_idea = 0.0
            is_growth = 1.0
            scale = 1.0  # scaled
            domestic_pref = 0.0
            is_b2b = 1.0
            has_facility = 1.0
            is_india = 1.0 if random.random() < 0.7 else 0.5

        elif archetype == "urgent_turnaround":
            budget = random.uniform(300000.0, 1500000.0)
            is_idea = 1.0 if random.random() < 0.5 else 0.0
            is_growth = 1.0 - is_idea
            scale = 0.4
            domestic_pref = 1.0
            is_b2b = 1.0
            has_facility = 0.0
            is_india = 1.0

        else: # high_compliance
            budget = random.uniform(1500000.0, 6000000.0)
            is_idea = 0.0
            is_growth = 1.0
            scale = 0.7
            domestic_pref = 0.5
            is_b2b = 1.0
            has_facility = 1.0
            is_india = 1.0

        user_vec = [
            round(normalize_budget(budget), 4),
            is_idea,
            is_growth,
            scale,
            domestic_pref,
            is_b2b,
            has_facility,
            is_india
        ]

        # 2. Generate Candidate Supplier Profile
        # Two main varieties: Local regional factory vs Large overseas volume factory
        is_overseas = random.random() < 0.40
        if is_overseas:
            unit_price = random.uniform(6.0, 12.0)  # Low unit price
            moq = random.choice([5000, 10000, 15000, 20000])  # High MOQ
            capacity = random.randint(35000, 80000)
            lead_time = random.randint(20, 35)  # Long ocean transit
            is_domestic = 0.0
            verif_score = random.uniform(88.0, 98.0)
            rating = random.uniform(4.3, 4.9)
            confidence = random.uniform(85.0, 95.0)
        else:
            unit_price = random.uniform(12.0, 22.0)  # Higher local price
            moq = random.choice([500, 1000, 2000, 3000])  # Accessible low MOQ
            capacity = random.randint(8000, 30000)
            lead_time = random.randint(2, 8)  # Fast local road trucking
            is_domestic = 1.0
            verif_score = random.uniform(85.0, 99.0)
            rating = random.uniform(4.4, 5.0)
            confidence = random.uniform(90.0, 98.0)

        sup_vec = [
            round(normalize_price(unit_price), 4),
            round(normalize_moq(moq), 4),
            round(normalize_capacity(capacity), 4),
            round(normalize_rating(rating), 4),
            round(min_max_scale(verif_score, 50.0, 100.0), 4),
            round(normalize_lead_time(lead_time), 4),
            is_domestic,
            round(min_max_scale(confidence, 50.0, 100.0), 4),
        ]

        # 3. Determine Ground-Truth Fit Utility (Label)
        # Business logic for compatibility:
        # Bootstrapped founders cannot afford overseas MOQ/cash buffer
        # Scaled enterprises reject small local factories with < 25k capacity
        fit_score_latent = 0.50

        if archetype == "bootstrapped_startup":
            # MOQ affordability is #1
            min_cash_required = moq * unit_price
            if min_cash_required > budget * 0.40:
                fit_score_latent -= 0.60
            else:
                fit_score_latent += 0.35

            if is_domestic == 1.0 and lead_time <= 7:
                fit_score_latent += 0.25
            if not is_domestic and lead_time > 15:
                fit_score_latent -= 0.30

        elif archetype == "scaled_enterprise":
            # Volume and unit price are #1
            if unit_price < 11.0:
                fit_score_latent += 0.40
            if capacity >= 40000:
                fit_score_latent += 0.30
            if capacity < 15000:
                fit_score_latent -= 0.50  # cannot meet demand

        elif archetype == "urgent_turnaround":
            if lead_time <= 6:
                fit_score_latent += 0.50
            else:
                fit_score_latent -= 0.45

        elif archetype == "high_compliance":
            if verif_score >= 95.0 and confidence >= 92.0:
                fit_score_latent += 0.40
            else:
                fit_score_latent -= 0.40

        else: # growth_b2b
            if moq <= 5000 and capacity >= 20000 and unit_price <= 16.0:
                fit_score_latent += 0.40

        # Clip latent fit probability
        fit_prob = max(0.02, min(0.98, fit_score_latent))
        ground_truth_label = 1.0 if fit_prob >= 0.50 else 0.0

        # Ground truth risk
        risk_latent = (
            (100.0 - verif_score) / 100.0 * 0.40 +
            (100.0 - confidence) / 100.0 * 0.30 +
            (lead_time / 45.0) * 0.20 +
            (0.10 if not is_domestic else 0.0)
        )
        risk_label = max(0.05, min(0.85, risk_latent))

        # Price target with noise
        qty_tier = moq * random.randint(2, 5)
        volume_discount = max(0.80, 1.0 - (math.log(qty_tier / 500.0) * 0.04))
        actual_price = round(unit_price * volume_discount, 2)

        dataset.append({
            "sample_id": f"syn-{idx:05d}",
            "archetype": archetype,
            "user_vector": user_vec,
            "supplier_vector": sup_vec,
            "ground_truth_fit": ground_truth_label,
            "fit_probability": round(fit_prob, 4),
            "risk_target": round(risk_label, 4),
            "actual_price": actual_price,
            "quantity": qty_tier,
            "country": "China" if is_overseas else "India"
        })

    return dataset
