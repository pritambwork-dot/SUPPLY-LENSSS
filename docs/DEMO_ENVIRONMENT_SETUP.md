# SupplyLens Demo Environment Setup & Operations Guide

## 1. Quickstart Instructions

To initialize and run the complete SupplyLens development and demonstration environment:

### Step 1: Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt
```

### Step 2: Seed Deterministic Demo Data
```bash
python3 scripts/seed_demo_data.py
```
This populates all 8 industrial sectors with `.example` factory entities and runs the 10-dimension verification engine.

### Step 3: Run Integrity Validation
```bash
python3 scripts/validate_demo_data.py
```
Asserts that all 8 industries are present, no fake domains collide with real companies, and the 5% service fee formula is mathematically sound.

### Step 4: Run Test Suite
```bash
PYTHONPATH=backend:. python3 -m unittest backend/tests/test_demo_verification.py
```

### Step 5: Start Local Servers
```bash
# Start FastAPI backend (port 8000)
cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Next.js frontend (port 3000)
cd frontend && npm run dev
```

---

## 2. Resetting the Demo Environment

To purge all synthetic evaluation records and restore the catalog to a clean baseline:
```bash
python3 scripts/reset_demo_data.py
```
This safely removes records where `is_demo = True` without altering canonical tables.
