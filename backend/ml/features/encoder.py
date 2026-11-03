"""Feature normalization and vector encoding transformations."""
import math
from typing import Dict, Any, List

def min_max_scale(val: float, min_val: float, max_val: float) -> float:
    if max_val <= min_val:
        return 0.5
    return max(0.0, min(1.0, (val - min_val) / (max_val - min_val)))

def log_scale(val: float, min_val: float, max_val: float) -> float:
    v = max(min_val, val)
    ln_min = math.log(min_val)
    ln_max = math.log(max_val)
    return max(0.0, min(1.0, (math.log(v) - ln_min) / (ln_max - ln_min)))

def normalize_budget(budget: float) -> float:
    """Scale budget between ₹10,000 and ₹5,00,00,000 (5 Crore)."""
    return log_scale(budget, 10000.0, 50000000.0)

def normalize_moq(moq: int) -> float:
    """Scale factory MOQ between 50 and 50,000 units."""
    return log_scale(float(moq), 50.0, 50000.0)

def normalize_capacity(capacity: int) -> float:
    """Scale factory monthly capacity between 1,000 and 1,00,000 units."""
    return log_scale(float(capacity), 1000.0, 100000.0)

def normalize_price(price: float) -> float:
    """Scale unit price between ₹4.0 and ₹35.0."""
    return min_max_scale(price, 4.0, 35.0)

def normalize_lead_time(lead_time_days: int) -> float:
    """Scale order turnaround lead time between 1 and 45 days."""
    return min_max_scale(float(lead_time_days), 1.0, 45.0)

def normalize_rating(rating: float) -> float:
    """Scale customer rating between 3.0 and 5.0."""
    return min_max_scale(rating, 3.0, 5.0)
