"""Two-Tower Neural Matching Network for Personalized User-Supplier Compatibility."""
import json
import os
from typing import List, Dict, Any, Tuple
from .layers import DenseLayer
from .mlp import MultiLayerPerceptron

class TwoTowerMatchingNetwork:
    """Two-Tower personalized recommendation neural network.
    User Tower: x_user -> h_user
    Supplier Tower: x_supplier -> h_supplier
    Interaction Layer: [h_u, h_s, h_u * h_s, |h_u - h_s|] -> Cross MLP -> Compatibility Sigmoid
    """

    def __init__(
        self,
        user_dim: int = 8,
        supplier_dim: int = 8,
        embedding_dim: int = 8,
        seed: int = 42
    ):
        self.user_dim = user_dim
        self.supplier_dim = supplier_dim
        self.embedding_dim = embedding_dim

        # User representation tower: user_dim -> 16 -> embedding_dim (ReLU)
        self.user_tower = MultiLayerPerceptron(
            layer_dims=[user_dim, 16, embedding_dim],
            activations=["relu", "relu"],
            seed=seed
        )

        # Supplier representation tower: supplier_dim -> 16 -> embedding_dim (ReLU)
        self.supplier_tower = MultiLayerPerceptron(
            layer_dims=[supplier_dim, 16, embedding_dim],
            activations=["relu", "relu"],
            seed=seed + 10
        )

        # Cross Interaction Head: [h_u, h_s, h_u * h_s, |h_u - h_s|] (4 * embedding_dim) -> 16 -> 1 (Sigmoid)
        interaction_dim = 4 * embedding_dim
        self.interaction_head = MultiLayerPerceptron(
            layer_dims=[interaction_dim, 16, 1],
            activations=["relu", "sigmoid"],
            seed=seed + 20
        )

        # Caches
        self.last_h_u: List[float] = []
        self.last_h_s: List[float] = []
        self.last_cross_input: List[float] = []

    def get_user_embedding(self, x_user: List[float]) -> List[float]:
        return self.user_tower.forward(x_user)

    def get_supplier_embedding(self, x_supplier: List[float]) -> List[float]:
        return self.supplier_tower.forward(x_supplier)

    def forward(self, x_user: List[float], x_supplier: List[float]) -> float:
        # 1. Forward through towers
        h_u = self.user_tower.forward(x_user)
        h_s = self.supplier_tower.forward(x_supplier)
        self.last_h_u = h_u
        self.last_h_s = h_s

        # 2. Build cross-features: concatenation + Hadamard product + absolute difference
        cross_input = []
        cross_input.extend(h_u)
        cross_input.extend(h_s)
        for k in range(self.embedding_dim):
            cross_input.append(h_u[k] * h_s[k])
        for k in range(self.embedding_dim):
            cross_input.append(abs(h_u[k] - h_s[k]))

        self.last_cross_input = cross_input

        # 3. Forward through interaction head
        out = self.interaction_head.forward(cross_input)
        return out[0]

    def backward(
        self,
        y_true: float,
        y_pred: float,
        lr: float = 0.005,
        l2_reg: float = 1e-4
    ):
        """Analytical backpropagation through interaction head and both towers."""
        # Output delta for BCE + Sigmoid: dL/dz = y_pred - y_true
        grad_out = [y_pred - y_true]

        # 1. Backprop through interaction head
        grad_cross = self.interaction_head.backward(
            grad_out, lr=lr, l2_reg=l2_reg, pre_activated_output=True
        )

        # 2. Split gradient w.r.t cross_input:
        # cross_input = [h_u (0..k-1), h_s (k..2k-1), h_u*h_s (2k..3k-1), |h_u - h_s| (3k..4k-1)]
        k_dim = self.embedding_dim
        grad_h_u = [0.0] * k_dim
        grad_h_s = [0.0] * k_dim

        for i in range(k_dim):
            # Direct tower contribution
            grad_h_u[i] += grad_cross[i]
            grad_h_s[i] += grad_cross[k_dim + i]

            # Product interaction contribution: d(h_u * h_s)/dh_u = h_s
            grad_h_u[i] += grad_cross[2 * k_dim + i] * self.last_h_s[i]
            grad_h_s[i] += grad_cross[2 * k_dim + i] * self.last_h_u[i]

            # Diff interaction contribution: d(|h_u - h_s|)/dh_u = sign(h_u - h_s)
            sign = 1.0 if (self.last_h_u[i] >= self.last_h_s[i]) else -1.0
            grad_h_u[i] += grad_cross[3 * k_dim + i] * sign
            grad_h_s[i] += grad_cross[3 * k_dim + i] * (-sign)

        # 3. Backprop through individual towers
        self.user_tower.backward(grad_h_u, lr=lr, l2_reg=l2_reg, pre_activated_output=False)
        self.supplier_tower.backward(grad_h_s, lr=lr, l2_reg=l2_reg, pre_activated_output=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "TwoTowerMatchingNetwork",
            "user_dim": self.user_dim,
            "supplier_dim": self.supplier_dim,
            "embedding_dim": self.embedding_dim,
            "user_tower": self.user_tower.to_dict(),
            "supplier_tower": self.supplier_tower.to_dict(),
            "interaction_head": self.interaction_head.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TwoTowerMatchingNetwork":
        net = cls(
            user_dim=data["user_dim"],
            supplier_dim=data["supplier_dim"],
            embedding_dim=data["embedding_dim"]
        )
        net.user_tower = MultiLayerPerceptron.from_dict(data["user_tower"])
        net.supplier_tower = MultiLayerPerceptron.from_dict(data["supplier_tower"])
        net.interaction_head = MultiLayerPerceptron.from_dict(data["interaction_head"])
        return net

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, filepath: str) -> "TwoTowerMatchingNetwork":
        with open(filepath, "r") as f:
            data = json.load(f)
        return cls.from_dict(data)
