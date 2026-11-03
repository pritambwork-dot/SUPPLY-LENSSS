"""Sequential Multi-Layer Perceptron (MLP) container and serialization."""
import json
import os
from typing import List, Dict, Any, Optional
from .layers import DenseLayer

class MultiLayerPerceptron:
    """Configurable feed-forward neural network."""

    def __init__(
        self,
        layer_dims: Optional[List[int]] = None,
        activations: Optional[List[str]] = None,
        seed: Optional[int] = 42
    ):
        self.layers: List[DenseLayer] = []
        if layer_dims and activations:
            assert len(layer_dims) - 1 == len(activations), "layer_dims must have 1 more element than activations."
            for i in range(len(activations)):
                self.layers.append(
                    DenseLayer(
                        in_features=layer_dims[i],
                        out_features=layer_dims[i + 1],
                        activation=activations[i],
                        seed=seed + i if seed is not None else None
                    )
                )

    def forward(self, x: List[float]) -> List[float]:
        curr = x
        for layer in self.layers:
            curr = layer.forward(curr)
        return curr

    def predict_scalar(self, x: List[float]) -> float:
        out = self.forward(x)
        return out[0]

    def backward(
        self,
        output_grad: List[float],
        lr: float = 0.005,
        l2_reg: float = 1e-4,
        pre_activated_output: bool = True
    ) -> List[float]:
        curr_grad = output_grad
        for idx, layer in enumerate(reversed(self.layers)):
            is_last = (idx == 0)
            curr_grad = layer.backward(
                curr_grad,
                lr=lr,
                l2_reg=l2_reg,
                pre_activated_gradient=(is_last and pre_activated_output)
            )
        return curr_grad

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": "MLP",
            "layers": [layer.to_dict() for layer in self.layers]
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MultiLayerPerceptron":
        mlp = cls()
        mlp.layers = [DenseLayer.from_dict(ld) for ld in data["layers"]]
        return mlp

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, filepath: str) -> "MultiLayerPerceptron":
        with open(filepath, "r") as f:
            data = json.load(f)
        return cls.from_dict(data)
