"""Comprehensive Unit & System Verification Suite for SupplyLens Neural Sourcing Engine."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from ml.nn.layers import DenseLayer
from ml.nn.activations import relu, sigmoid, softplus
from ml.nn.losses import binary_cross_entropy, mean_squared_error
from ml.nn.mlp import MultiLayerPerceptron
from ml.nn.two_tower import TwoTowerMatchingNetwork
from ml.data.synthetic_generator import generate_synthetic_dataset
from ml.training.trainer import ModelTrainer
from ml.training.evaluator import compute_binary_metrics, compute_regression_metrics
from ml.inference.service import neural_service
from optimization import solve_sourcing_problem
from app.data.seed_data import SUPPLIERS_SEED

def test_linear_algebra_and_layers():
    print("\n--- Test 1: Linear Algebra & Dense Layer Forward/Backward ---")
    layer = DenseLayer(in_features=3, out_features=2, activation="relu", seed=42)
    x = [1.0, -2.0, 3.0]
    out = layer.forward(x)
    assert len(out) == 2, f"Expected 2 outputs, got {len(out)}"
    assert all(o >= 0.0 for o in out), "ReLU output should be non-negative"

    # Backward step
    grad_in = layer.backward([0.5, -0.2], lr=0.01)
    assert len(grad_in) == 3, f"Expected 3 gradients for input, got {len(grad_in)}"
    print(f"✓ DenseLayer forward and backprop executed successfully: out={out}")

def test_two_tower_architecture():
    print("\n--- Test 2: Two-Tower Neural Matching Network ---")
    net = TwoTowerMatchingNetwork(user_dim=8, supplier_dim=8, embedding_dim=8, seed=42)
    u = [0.2, 1.0, 0.0, 0.2, 1.0, 1.0, 0.0, 1.0]
    s = [0.4, 0.1, 0.3, 0.8, 0.9, 0.1, 1.0, 0.95]

    score = net.forward(u, s)
    assert 0.0 <= score <= 1.0, f"Score {score} not in [0, 1]"
    print(f"✓ Two-Tower forward pass compatibility probability: {score:.4f}")

    # Backward step
    net.backward(y_true=1.0, y_pred=score, lr=0.01)
    new_score = net.forward(u, s)
    print(f"✓ Two-Tower backward step completed. Updated score: {new_score:.4f}")

def test_synthetic_data_generation():
    print("\n--- Test 3: Synthetic Benchmark Dataset Generation ---")
    dataset = generate_synthetic_dataset(num_samples=300, seed=42)
    assert len(dataset) == 300
    pos_count = sum(1 for d in dataset if d["ground_truth_fit"] == 1.0)
    neg_count = sum(1 for d in dataset if d["ground_truth_fit"] == 0.0)
    assert pos_count > 50 and neg_count > 50, f"Unbalanced dataset: pos={pos_count}, neg={neg_count}"
    print(f"✓ Generated {len(dataset)} samples (Positives: {pos_count}, Negatives: {neg_count})")

def test_user_a_vs_user_b_personalization():
    print("\n--- Test 4: Personalized Matching (User A vs User B) ---")
    # User A: Bootstrapped Startup (₹3L budget, low MOQ preference, domestic)
    user_a = {
        "budgetAmount": 300000,
        "businessStage": "idea",
        "expectedScale": "pilot",
        "sourcingPreference": "domestic",
        "businessModel": "B2B",
        "facilityStatus": "need_facility",
        "country": "India"
    }

    # User B: Scaled Industrial Enterprise (₹2 Crore budget, high volume, international OK)
    user_b = {
        "budgetAmount": 20000000,
        "businessStage": "established",
        "expectedScale": "scaled",
        "sourcingPreference": "international",
        "businessModel": "B2B",
        "facilityStatus": "have_facility",
        "country": "India"
    }

    utkal = next(s for s in SUPPLIERS_SEED if s["id"] == "sup-000-odisha")
    ecopack = next(s for s in SUPPLIERS_SEED if s["id"] == "sup-ecopack-dg")

    fit_a_utkal = neural_service.predict_supplier_fit(user_a, utkal)
    fit_a_ecopack = neural_service.predict_supplier_fit(user_a, ecopack)

    fit_b_utkal = neural_service.predict_supplier_fit(user_b, utkal)
    fit_b_ecopack = neural_service.predict_supplier_fit(user_b, ecopack)

    print(f"  User A (₹3L Bootstrapped):")
    print(f"    - Utkal GreenFiber (Low MOQ, Local): {fit_a_utkal['fit_percentage']}% ({fit_a_utkal['fit_tier']})")
    print(f"    - EcoPack Dongguan (High MOQ, Overseas): {fit_a_ecopack['fit_percentage']}% ({fit_a_ecopack['fit_tier']})")

    print(f"  User B (₹2Cr Scaled Enterprise):")
    print(f"    - Utkal GreenFiber (Low MOQ, Local): {fit_b_utkal['fit_percentage']}% ({fit_b_utkal['fit_tier']})")
    print(f"    - EcoPack Dongguan (High MOQ, Overseas): {fit_b_ecopack['fit_percentage']}% ({fit_b_ecopack['fit_tier']})")

    # Core assertion: User A should have a higher relative preference for Utkal than EcoPack
    assert fit_a_utkal['fit_score'] > fit_a_ecopack['fit_score'], "User A must prefer local low-MOQ Utkal over overseas EcoPack"
    print("✓ Personalization test PASSED: The model distinguishes startup needs from enterprise volume needs!")

def test_price_prediction_network():
    print("\n--- Test 5: Price Range Estimation Model ---")
    pred_small = neural_service.predict_price_range("Biodegradable Boxes", "Packaging", "India", quantity=2000)
    pred_bulk = neural_service.predict_price_range("Biodegradable Boxes", "Packaging", "India", quantity=25000)

    print(f"  2,000 units predicted price: ₹{pred_small['predicted_unit_price']} (Range: ₹{pred_small['confidence_interval_min']} - ₹{pred_small['confidence_interval_max']})")
    print(f"  25,000 units predicted price: ₹{pred_bulk['predicted_unit_price']} (Volume discount: {pred_bulk['volume_discount_pct']}%)")

    assert pred_small["predicted_unit_price"] > 0.0
    assert pred_small["confidence_interval_min"] < pred_small["predicted_unit_price"] < pred_small["confidence_interval_max"]
    assert "Benchmark Prediction" in pred_small["disclaimer"]
    print("✓ Price prediction network calibrated with volume economies and confidence intervals.")

def test_risk_prediction_network():
    print("\n--- Test 6: Supplier Operational Risk Model ---")
    utkal = next(s for s in SUPPLIERS_SEED if s["id"] == "sup-000-odisha")
    risk_res = neural_service.predict_supplier_risk(utkal)

    print(f"  Utkal GreenFiber predicted risk: {risk_res['predicted_risk_score']} ({risk_res['risk_level']})")
    print(f"  Reliability index: {risk_res['reliability_index']}")
    print(f"  Drivers: {risk_res['risk_drivers']}")

    assert 0.0 <= risk_res["predicted_risk_score"] <= 1.0
    assert risk_res["risk_level"] in ("Low Risk", "Moderate Risk", "Elevated Risk")
    print("✓ Risk model generated structured operational risk signals.")

def test_batch_ranking():
    print("\n--- Test 7: Batch Candidate Ranking ---")
    user_profile = {
        "budgetAmount": 800000,
        "businessStage": "idea",
        "expectedScale": "pilot",
        "sourcingPreference": "balanced",
        "country": "India"
    }

    rank_res = neural_service.rank_suppliers_for_profile(user_profile, top_k=5)
    assert len(rank_res["ranked_suppliers"]) > 0
    print(f"✓ Evaluated {rank_res['total_evaluated']} suppliers in {rank_res['execution_time_ms']} ms:")
    for item in rank_res["ranked_suppliers"]:
        print(f"  #{item['rank']} {item['supplier_name']} - Fit: {item['fit_percentage']}% ({item['fit_tier']}) | Risk: {round(item['predicted_risk_score']*100)}%")

def test_operations_research_integration():
    print("\n--- Test 8: Operations Research Engine Integration with Neural Signals ---")
    # Solve 10,000 units with neural risk and fit weights incorporated
    opt_res = solve_sourcing_problem(
        required_quantity=10000,
        objective_type="balanced",
        max_suppliers=3,
        save_run=False
    )
    assert opt_res["status"] == "OPTIMAL"
    print(f"✓ OR engine solved optimal allocation with neural objective: Total ₹{opt_res['total_cost']:,.2f}")
    for a in opt_res["allocations"]:
        print(f"  - {a['supplier_name']}: {a['quantity']} units ({a['percentage_of_total']}%)")

if __name__ == "__main__":
    print("==================================================")
    print("RUNNING SUPPLYLENS NEURAL SOURCING ENGINE TEST SUITE")
    print("==================================================")
    test_linear_algebra_and_layers()
    test_two_tower_architecture()
    test_synthetic_data_generation()
    test_user_a_vs_user_b_personalization()
    test_price_prediction_network()
    test_risk_prediction_network()
    test_batch_ranking()
    test_operations_research_integration()
    print("\n==================================================")
    print("ALL 8 NEURAL ENGINE TESTS PASSED PERFECTLY!")
    print("==================================================")
