import unittest
from app.services.suppliers.verification import VerificationEngine
from scripts.seed_demo_data import INDUSTRIES_DATA, seed_demo_dataset
from app.services.monetization.fee_calculator import FeeCalculator


class TestDemoVerification(unittest.TestCase):

    def setUp(self):
        seed_demo_dataset()

    def test_eight_industries_populated(self):
        self.assertEqual(len(INDUSTRIES_DATA), 8)

    def test_demo_domains_use_example(self):
        for ind in INDUSTRIES_DATA:
            for s in ind["suppliers"]:
                self.assertTrue(".example" in s["website"] or ".org" in s["website"], f"Invalid domain: {s['website']}")
                self.assertTrue(".example" in s["email"] or "@" in s["email"], f"Invalid email: {s['email']}")

    def test_ten_dimensions_evaluated(self):
        sample_sup = INDUSTRIES_DATA[0]["suppliers"][0]
        result = VerificationEngine.evaluate_supplier(sample_sup, is_demo=True)
        self.assertEqual(result["dimensions_evaluated"], 10)
        self.assertEqual(len(result["checks"]), 10)
        self.assertTrue("Demo" in result["verification_status"])
        self.assertIn("SIMULATED EVIDENCE", result["badge_text"])
        self.assertGreaterEqual(result["verification_score"], 70)

    def test_service_fee_monetization_five_percent(self):
        deal_value = 500000.0
        res = FeeCalculator.calculate_success_fee(confirmed_contract_value=deal_value, currency="INR")
        self.assertEqual(res.calculated_fee, 25000.0)
        self.assertEqual(res.fee_percentage, 5.0)


if __name__ == "__main__":
    unittest.main()
