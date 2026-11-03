"""Loss functions and analytical gradients for regression and binary classification."""
import math
from typing import List

EPSILON = 1e-7

def binary_cross_entropy(y_true: float, y_pred: float) -> float:
    """BCE loss with numerical stability clamping: L = -[y ln(p) + (1-y) ln(1-p)]."""
    p = max(EPSILON, min(1.0 - EPSILON, y_pred))
    return -(y_true * math.log(p) + (1.0 - y_true) * math.log(1.0 - p))

def bce_sigmoid_gradient(y_true: float, y_pred: float) -> float:
    """Analytical gradient of BCE when combined with Sigmoid output: dL/dz = y_pred - y_true."""
    return y_pred - y_true

def mean_squared_error(y_true: float, y_pred: float) -> float:
    """MSE Loss: L = 0.5 * (y_pred - y_true)^2."""
    diff = y_pred - y_true
    return 0.5 * diff * diff

def mse_gradient(y_true: float, y_pred: float) -> float:
    """dL/dz = y_pred - y_true."""
    return y_pred - y_true

def huber_loss(y_true: float, y_pred: float, delta: float = 1.0) -> float:
    """Robust Huber loss for price regression."""
    diff = abs(y_pred - y_true)
    if diff <= delta:
        return 0.5 * diff * diff
    return delta * (diff - 0.5 * delta)

def huber_gradient(y_true: float, y_pred: float, delta: float = 1.0) -> float:
    diff = y_pred - y_true
    if abs(diff) <= delta:
        return diff
    return delta if diff > 0 else -delta
