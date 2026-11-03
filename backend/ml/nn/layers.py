"""Fully-connected Dense Layer with Xavier/He initialization and Adam parameter updates."""
import random
import math
from typing import List, Optional, Dict, Any
from .activations import relu, relu_prime, sigmoid, sigmoid_prime, linear, linear_prime, softplus

class DenseLayer:
    """Fully connected neural layer with analytical backward pass and Adam optimizer."""

    def __init__(
        self,
        in_features: int,
        out_features: int,
        activation: str = "relu",
        seed: Optional[int] = None
    ):
        self.in_features = in_features
        self.out_features = out_features
        self.activation_name = activation.lower()

        if seed is not None:
            random.seed(seed)

        # Weight initialization (He for ReLU, Xavier for Sigmoid/Linear)
        if self.activation_name == "relu":
            std = math.sqrt(2.0 / max(1, in_features))
        else:
            std = math.sqrt(6.0 / max(1, in_features + out_features))

        self.W: List[List[float]] = [
            [random.gauss(0.0, std) for _ in range(in_features)]
            for _ in range(out_features)
        ]
        self.b: List[float] = [0.0 for _ in range(out_features)]

        # Adam optimizer moments
        self.t = 0
        self.mW: List[List[float]] = [[0.0] * in_features for _ in range(out_features)]
        self.vW: List[List[float]] = [[0.0] * in_features for _ in range(out_features)]
        self.mb: List[float] = [0.0] * out_features
        self.vb: List[float] = [0.0] * out_features

        # Caches for backpropagation
        self.input_cache: List[float] = []
        self.z_cache: List[float] = []
        self.a_cache: List[float] = []

    def forward(self, x: List[float]) -> List[float]:
        """Compute z = Wx + b and a = activation(z)."""
        self.input_cache = x
        self.z_cache = []
        self.a_cache = []

        for j in range(self.out_features):
            val = self.b[j]
            row = self.W[j]
            for k in range(self.in_features):
                val += row[k] * x[k]
            self.z_cache.append(val)

            # Apply activation
            if self.activation_name == "relu":
                self.a_cache.append(relu(val))
            elif self.activation_name == "sigmoid":
                self.a_cache.append(sigmoid(val))
            elif self.activation_name == "softplus":
                self.a_cache.append(softplus(val))
            else:
                self.a_cache.append(linear(val))

        return self.a_cache

    def backward(
        self,
        grad_output: List[float],
        lr: float = 0.005,
        l2_reg: float = 1e-4,
        beta1: float = 0.9,
        beta2: float = 0.999,
        epsilon: float = 1e-8,
        pre_activated_gradient: bool = False
    ) -> List[float]:
        """Compute analytical parameter gradients and propagate delta to preceding layer."""
        self.t += 1

        # 1. Delta calculation: dL/dz_j
        delta = [0.0] * self.out_features
        for j in range(self.out_features):
            if pre_activated_gradient:
                # grad_output is already dL/dz (e.g. from combined BCE+Sigmoid or MSE+Linear)
                delta[j] = grad_output[j]
            else:
                act = self.a_cache[j]
                if self.activation_name == "relu":
                    prime = relu_prime(self.z_cache[j])
                elif self.activation_name == "sigmoid":
                    prime = sigmoid_prime(act)
                else:
                    prime = 1.0
                delta[j] = grad_output[j] * prime

        # 2. Gradient w.r.t input: dL/dx_k = sum_j (delta_j * W_jk)
        grad_input = [0.0] * self.in_features
        for k in range(self.in_features):
            val = 0.0
            for j in range(self.out_features):
                val += delta[j] * self.W[j][k]
            grad_input[k] = val

        # 3. Adam parameter updates for W and b with L2 regularization
        for j in range(self.out_features):
            d_b = delta[j]

            # Update bias moments
            self.mb[j] = beta1 * self.mb[j] + (1.0 - beta1) * d_b
            self.vb[j] = beta2 * self.vb[j] + (1.0 - beta2) * (d_b * d_b)
            mb_hat = self.mb[j] / (1.0 - (beta1 ** self.t))
            vb_hat = self.vb[j] / (1.0 - (beta2 ** self.t))
            self.b[j] -= lr * (mb_hat / (math.sqrt(vb_hat) + epsilon))

            row_W = self.W[j]
            row_mW = self.mW[j]
            row_vW = self.vW[j]
            x = self.input_cache

            for k in range(self.in_features):
                d_W = delta[j] * x[k] + l2_reg * row_W[k]
                row_mW[k] = beta1 * row_mW[k] + (1.0 - beta1) * d_W
                row_vW[k] = beta2 * row_vW[k] + (1.0 - beta2) * (d_W * d_W)
                mW_hat = row_mW[k] / (1.0 - (beta1 ** self.t))
                vW_hat = row_vW[k] / (1.0 - (beta2 ** self.t))
                row_W[k] -= lr * (mW_hat / (math.sqrt(vW_hat) + epsilon))

        return grad_input

    def to_dict(self) -> Dict[str, Any]:
        return {
            "in_features": self.in_features,
            "out_features": self.out_features,
            "activation": self.activation_name,
            "W": self.W,
            "b": self.b,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DenseLayer":
        layer = cls(
            in_features=data["in_features"],
            out_features=data["out_features"],
            activation=data["activation"]
        )
        layer.W = data["W"]
        layer.b = data["b"]
        return layer
