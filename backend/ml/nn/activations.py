"""Pure-Python activation functions and analytical derivatives for Neural Networks."""
import math
from typing import List

def clip(val: float, min_val: float = -15.0, max_val: float = 15.0) -> float:
    return max(min_val, min(max_val, val))

def relu(x: float) -> float:
    return x if x > 0.0 else 0.0

def relu_prime(x: float) -> float:
    return 1.0 if x > 0.0 else 0.0

def sigmoid(x: float) -> float:
    c = clip(x, -15.0, 15.0)
    return 1.0 / (1.0 + math.exp(-c))

def sigmoid_prime(s: float) -> float:
    # s is sigmoid(x)
    return s * (1.0 - s)

def softplus(x: float) -> float:
    c = clip(x, -15.0, 15.0)
    return math.log(1.0 + math.exp(c))

def linear(x: float) -> float:
    return x

def linear_prime(x: float) -> float:
    return 1.0

def vector_relu(vec: List[float]) -> List[float]:
    return [relu(v) for v in vec]

def vector_sigmoid(vec: List[float]) -> List[float]:
    return [sigmoid(v) for v in vec]
