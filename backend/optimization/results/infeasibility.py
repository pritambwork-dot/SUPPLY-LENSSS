"""Infeasibility diagnostics representation and generation."""
from typing import List, Dict, Any

def format_infeasibility_diagnostics(
    is_feasible: bool,
    root_causes: List[str],
    actionable_remedies: List[str]
) -> Dict[str, Any]:
    """Structure diagnostic feedback when the optimization problem cannot be solved."""
    return {
        "is_feasible": is_feasible,
        "root_causes": root_causes,
        "actionable_remedies": actionable_remedies
    }
