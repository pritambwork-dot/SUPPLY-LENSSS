# Production Data Policy

## Core Principle
SupplyLens operates on the rule: **No data is better than fake data.**

## 1. No Synthetic Data
The production database must never contain synthetic suppliers, fake companies, or mocked prices/ratings.

## 2. Empty States
If no verified data is available, the system must clearly indicate "Data unavailable" or "No verified public contact found."

## 3. Data Provenance
Every critical field (price, location, contact) must be traceable to a specific source (e.g., Geoapify, Nimble, Apify, Government Registry) with a timestamp.

## 4. Verification
A supplier is only marked as "Verified" when sufficient, consistent, independent evidence supports their existence and capability.
