"""Training pipeline for Two-Tower Matching, Price Regression, and Operational Risk networks."""
import os
import random
from typing import Dict, Any, List, Tuple
from ..nn.two_tower import TwoTowerMatchingNetwork
from ..nn.mlp import MultiLayerPerceptron
from ..nn.losses import binary_cross_entropy, mean_squared_error
from ..features.pipeline import extract_price_regression_vector, extract_risk_vector
from .evaluator import compute_binary_metrics, compute_regression_metrics

CHECKPOINTS_DIR = os.path.join(os.path.dirname(__file__), "..", "checkpoints")

class ModelTrainer:
    """Orchestrates model training, validation checkpoints, and telemetry logging."""

    @staticmethod
    def train_supplier_fit_model(
        dataset: List[Dict[str, Any]],
        epochs: int = 25,
        lr: float = 0.008,
        l2_reg: float = 1e-4,
        batch_size: int = 32,
        seed: int = 42
    ) -> Tuple[TwoTowerMatchingNetwork, Dict[str, Any]]:
        """Train Two-Tower supplier matching network on user-supplier pair dataset."""
        random.seed(seed)
        shuffled = list(dataset)
        random.shuffle(shuffled)

        n = len(shuffled)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)

        train_set = shuffled[:n_train]
        val_set = shuffled[n_train:n_train + n_val]
        test_set = shuffled[n_train + n_val:]

        model = TwoTowerMatchingNetwork(user_dim=8, supplier_dim=8, embedding_dim=8, seed=seed)
        history = {"train_loss": [], "val_loss": [], "val_auc": []}

        for ep in range(epochs):
            random.shuffle(train_set)
            epoch_loss = 0.0

            for sample in train_set:
                x_u = sample["user_vector"]
                x_s = sample["supplier_vector"]
                y_true = sample["ground_truth_fit"]

                y_pred = model.forward(x_u, x_s)
                loss = binary_cross_entropy(y_true, y_pred)
                epoch_loss += loss

                # Backprop
                model.backward(y_true, y_pred, lr=lr, l2_reg=l2_reg)

            avg_train_loss = epoch_loss / len(train_set)

            # Validation evaluation
            val_loss = 0.0
            val_preds = []
            val_trues = []
            for sample in val_set:
                x_u = sample["user_vector"]
                x_s = sample["supplier_vector"]
                yt = sample["ground_truth_fit"]
                yp = model.forward(x_u, x_s)
                val_loss += binary_cross_entropy(yt, yp)
                val_preds.append(yp)
                val_trues.append(yt)

            avg_val_loss = val_loss / len(val_set)
            val_metrics = compute_binary_metrics(val_trues, val_preds)

            history["train_loss"].append(round(avg_train_loss, 4))
            history["val_loss"].append(round(avg_val_loss, 4))
            history["val_auc"].append(val_metrics["roc_auc"])

        # Final Test Evaluation
        test_preds = []
        test_trues = []
        for sample in test_set:
            yp = model.forward(sample["user_vector"], sample["supplier_vector"])
            test_preds.append(yp)
            test_trues.append(sample["ground_truth_fit"])

        test_metrics = compute_binary_metrics(test_trues, test_preds)

        metadata = {
            "model_name": "SupplierFitTwoTower",
            "version": "v1.0.0",
            "epochs": epochs,
            "train_samples": len(train_set),
            "val_samples": len(val_set),
            "test_samples": len(test_set),
            "test_metrics": test_metrics,
            "final_val_auc": history["val_auc"][-1],
            "loss_history": history
        }

        # Save checkpoint
        checkpoint_path = os.path.join(CHECKPOINTS_DIR, "supplier_fit_v1.json")
        model.save(checkpoint_path)

        return model, metadata

    @staticmethod
    def train_price_predictor_model(
        dataset: List[Dict[str, Any]],
        epochs: int = 30,
        lr: float = 0.005,
        seed: int = 42
    ) -> Tuple[MultiLayerPerceptron, Dict[str, Any]]:
        """Train MLP for Price Estimation: 5 input dims -> 16 -> 8 -> 1 (Softplus / Linear)."""
        random.seed(seed)
        shuffled = list(dataset)
        random.shuffle(shuffled)

        n = len(shuffled)
        n_train = int(n * 0.70)
        train_set = shuffled[:n_train]
        test_set = shuffled[n_train:]

        # Price MLP: 5 dims (qty_norm, is_china, is_india, is_vietnam, is_oem) -> 16 (ReLU) -> 8 (ReLU) -> 1 (Linear)
        model = MultiLayerPerceptron(layer_dims=[5, 16, 8, 1], activations=["relu", "relu", "linear"], seed=seed)

        # Scale target prices to [0, 1] range via price/35.0 for training stability
        for ep in range(epochs):
            for sample in train_set:
                x = extract_price_regression_vector(
                    category="packaging",
                    country=sample.get("country", "India"),
                    quantity=sample.get("quantity", 5000),
                    supplier_type="OEM"
                )
                target = sample["actual_price"] / 35.0
                pred = model.forward(x)[0]
                diff = pred - target
                model.backward([diff], lr=lr, l2_reg=1e-4)

        # Test evaluation
        trues = []
        preds = []
        for sample in test_set:
            x = extract_price_regression_vector("packaging", sample.get("country", "India"), sample.get("quantity", 5000))
            pred = model.forward(x)[0] * 35.0
            preds.append(pred)
            trues.append(sample["actual_price"])

        metrics = compute_regression_metrics(trues, preds)
        metadata = {
            "model_name": "PriceEstimationNetwork",
            "version": "v1.0.0",
            "test_metrics": metrics
        }

        checkpoint_path = os.path.join(CHECKPOINTS_DIR, "price_predictor_v1.json")
        model.save(checkpoint_path)

        return model, metadata

    @staticmethod
    def train_risk_predictor_model(
        dataset: List[Dict[str, Any]],
        epochs: int = 25,
        lr: float = 0.008,
        seed: int = 42
    ) -> Tuple[MultiLayerPerceptron, Dict[str, Any]]:
        """Train MLP for Supplier Risk Score: 6 input dims -> 12 -> 6 -> 1 (Sigmoid)."""
        random.seed(seed)
        shuffled = list(dataset)
        random.shuffle(shuffled)

        n = len(shuffled)
        n_train = int(n * 0.70)
        train_set = shuffled[:n_train]
        test_set = shuffled[n_train:]

        model = MultiLayerPerceptron(layer_dims=[6, 12, 6, 1], activations=["relu", "relu", "sigmoid"], seed=seed)

        for ep in range(epochs):
            for sample in train_set:
                # 6 risk features from supplier profile
                s_vec = sample["supplier_vector"]
                x = [
                    1.0 - s_vec[4], # 1 - verif
                    1.0 - s_vec[7], # 1 - conf
                    s_vec[5],       # lead time
                    1.0 - s_vec[6], # overseas
                    1.0 - s_vec[3], # 1 - rating
                    1.0 - s_vec[2]  # low capacity
                ]
                target = sample["risk_target"]
                pred = model.forward(x)[0]
                diff = pred - target
                model.backward([diff], lr=lr, l2_reg=1e-4)

        trues = []
        preds = []
        for sample in test_set:
            s_vec = sample["supplier_vector"]
            x = [1.0 - s_vec[4], 1.0 - s_vec[7], s_vec[5], 1.0 - s_vec[6], 1.0 - s_vec[3], 1.0 - s_vec[2]]
            pred = model.forward(x)[0]
            preds.append(pred)
            trues.append(sample["risk_target"])

        metrics = compute_regression_metrics(trues, preds)
        metadata = {
            "model_name": "SupplierRiskNetwork",
            "version": "v1.0.0",
            "test_metrics": metrics
        }

        checkpoint_path = os.path.join(CHECKPOINTS_DIR, "risk_predictor_v1.json")
        model.save(checkpoint_path)

        return model, metadata
