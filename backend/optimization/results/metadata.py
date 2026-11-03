"""Optimization run metadata and technical audit data structures."""
from typing import Dict, Any

def format_solver_metadata(
    solver_name: str,
    runtime_ms: float,
    status: str,
    iterations: int = 0,
    optimality_gap: float = 0.0,
    model_version: str = "v1.0-exact"
) -> Dict[str, Any]:
    """Format technical solver telemetry for auditability and the technical drawer."""
    return {
        "solver": solver_name,
        "runtime_ms": runtime_ms,
        "solver_status": status,
        "iterations": iterations,
        "optimality_gap": optimality_gap,
        "model_version": model_version
    }
