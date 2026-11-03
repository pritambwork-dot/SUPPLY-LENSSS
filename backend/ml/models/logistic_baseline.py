"""
SupplyLens Baseline ML Model
Logistic Regression baseline to compare against the primary neural network.
Provides interpretability and a deterministic fallback.
"""

from sklearn.linear_model import LogisticRegression
import numpy as np
from typing import List, Dict, Any

class BaselineModel:
    def __init__(self):
        self.model = LogisticRegression(class_weight='balanced')
        self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the baseline logistic regression model."""
        if len(np.unique(y)) < 2:
            print("Warning: Only one class present in training data. Cannot train Logistic Regression.")
            return
        
        self.model.fit(X, y)
        self.is_trained = True

    def predict_score(self, features: np.ndarray) -> float:
        """Predict compatibility score (probability of positive class)."""
        if not self.is_trained:
            # Fallback to a neutral score if not trained
            return 0.5
            
        # Get probability of class 1
        probabilities = self.model.predict_proba(features)
        return float(probabilities[0][1])

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Evaluate the model using standard metrics."""
        if not self.is_trained:
            return {"accuracy": 0.0, "f1": 0.0}
            
        from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
        
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]
        
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "f1": float(f1_score(y_test, y_pred)),
        }
        
        try:
            metrics["roc_auc"] = float(roc_auc_score(y_test, y_prob))
        except ValueError:
            pass # Handle case where y_test has only one class
            
        return metrics

# Global instance for the baseline
baseline_model = BaselineModel()
