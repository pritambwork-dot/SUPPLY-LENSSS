#!/usr/bin/env python3
"""
SupplyLens Demo Data Reset Utility
Safely removes demo/sample records (is_demo=True) while strictly preserving canonical production records.
"""

import os
import sys

# Ensure backend is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

def reset_demo_data():
    print("[SupplyLens Reset] Resetting demo data in memory catalog...")
    try:
        from app.data.seed_data import SUPPLIERS_SEED
        initial_len = len(SUPPLIERS_SEED)
        
        # Keep only non-demo or pristine suppliers
        kept = [s for s in SUPPLIERS_SEED if not s.get("is_demo") or s.get("id", "").startswith("sup-utkal")]
        SUPPLIERS_SEED.clear()
        SUPPLIERS_SEED.extend(kept)
        
        print(f"[SupplyLens Reset] Cleaned catalog from {initial_len} down to {len(SUPPLIERS_SEED)} base verified records.")
        return True
    except Exception as e:
        print(f"[SupplyLens Reset] Error: {e}")
        return False

if __name__ == "__main__":
    success = reset_demo_data()
    if success:
        print("[SupplyLens Reset] Demo state successfully reset.")
        sys.exit(0)
    else:
        sys.exit(1)
