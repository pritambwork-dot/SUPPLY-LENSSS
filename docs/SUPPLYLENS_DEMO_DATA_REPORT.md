# SupplyLens Demo Data Report & Industry Coverage

## 1. Overview & Policy Enforcement

In strict compliance with SupplyLens real-data policy:
1. **Isolated Demo Scope**: All demo entities exist exclusively in the evaluation catalog and bear the flag `is_demo: true`.
2. **RFC 2606 Domain Safety**: All demo factory URLs use `.example.com` (`https://ecofiber.example.com`, `https://biokraft.example.com`, etc.) to guarantee zero namespace collision with real operating businesses.
3. **Simulated Evidence Scheme**: All verification certificates utilize the `demo://evidence/` and `demo://fixtures/` URI schemes.

---

## 2. Seeded Industry Matrix (8 Sectors)

| Sector | Key Demo Supplier | Products & MOQ | Country | Audit Score |
| :--- | :--- | :--- | :--- | :--- |
| **Sustainable Packaging** | EcoFiber Molded Solutions Ltd | Molded Bagasse Containers (1,000 pcs, ₹5.40/pc) | India | 100 / 100 |
| **Sustainable Textiles** | Aura Organic Looms & Knitwear | GOTS Single Jersey (500m, ₹280/m) | India | 100 / 100 |
| **Commercial Furniture** | Kalinga Timber Craft & Modular Works | Solid Teak Workstations (20 pcs, ₹12,500/pc) | India | 95 / 100 |
| **Consumer Electronics** | Vanguard MicroElectronics Assembly | 4-Layer IoT Gateway Boards (500 pcs, ₹950/pc) | India | 100 / 100 |
| **Industrial Machining** | Precision Castings & Tooling Ltd | 5-Axis CNC Alum Brackets (250 pcs, ₹420/pc) | India | 100 / 100 |
| **Food & Beverage** | Himalayan Botanical Extracts & Oils | Cold-Pressed Walnut Oil (2 drums, ₹85,000/drum)| India | 100 / 100 |
| **Clean Beauty** | Lumina Glass & Cosmetic Containers | Amber Dropper Bottles (1,000 pcs, ₹18.50/pc) | India | 98 / 100 |
| **Automotive & EV** | Apex Mobility Components & Tooling | Die-Cast EV Battery Enclosure (100 pcs, ₹3,850/pc)| India | 100 / 100 |

---

## 3. Seed & Validation Utilities

- `scripts/seed_demo_data.py`: Populates the 8 industry sectors and executes real-time 10-dimension evaluation on each factory.
- `scripts/reset_demo_data.py`: Safely wipes all demo entities (`is_demo=True`) without touching canonical records.
- `scripts/validate_demo_data.py`: Comprehensive assertion runner verifying domain safety and 5% fee arithmetic.
