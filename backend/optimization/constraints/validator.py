"""Comprehensive constraint validation, feasibility pre-screening, and audit record generation."""
from typing import Dict, List, Optional, Tuple, Any
from ..model.problem import SourcingProblem
from ..model.variables import CandidateSupplier
from .demand import check_demand_constraint
from .moq import check_moq_constraint
from .capacity import check_capacity_constraint
from .budget import check_budget_constraint
from .supplier_limit import check_supplier_limit
from .concentration import check_concentration_constraint
from .country import check_country_constraints

class ConstraintValidator:
    """Validates pre-solve feasibility and creates post-solve constraint audit records."""

    @staticmethod
    def pre_screen_feasibility(problem: SourcingProblem) -> Tuple[bool, List[str], List[str]]:
        """Pre-screen the problem for mathematical or logical infeasibility.
        Returns: (is_feasible, root_causes, actionable_remedies)
        """
        root_causes = []
        remedies = []
        eligible = problem.get_eligible_suppliers()

        # 1. Check eligible suppliers count
        if not eligible:
            root_causes.append("No verified suppliers match the requested criteria, filters, or country exclusions.")
            remedies.append("Clear country exclusions or widen search parameters to include more verified suppliers.")
            return False, root_causes, remedies

        # 2. Check aggregate capacity vs demand
        total_capacity = sum(s.capacity for s in eligible)
        if total_capacity < problem.required_quantity:
            root_causes.append(
                f"Total available capacity across all {len(eligible)} verified suppliers ({total_capacity:,} units) is less than required demand ({problem.required_quantity:,} units)."
            )
            remedies.append(
                f"Reduce target order quantity from {problem.required_quantity:,} to at most {total_capacity:,} units, or onboard additional suppliers."
            )
            return False, root_causes, remedies

        # 3. Check K-supplier capacity (best K suppliers combined)
        sorted_by_capacity = sorted(eligible, key=lambda s: s.capacity, reverse=True)
        top_k_capacity = sum(s.capacity for s in sorted_by_capacity[:problem.max_suppliers])
        if top_k_capacity < problem.required_quantity:
            root_causes.append(
                f"Even the {problem.max_suppliers} largest suppliers combined can only supply {top_k_capacity:,} units, which is below the required {problem.required_quantity:,} units."
            )
            needed_k = 1
            cum = 0
            for s in sorted_by_capacity:
                cum += s.capacity
                if cum >= problem.required_quantity:
                    break
                needed_k += 1
            remedies.append(f"Increase maximum active supplier limit from {problem.max_suppliers} to at least {needed_k}.")
            return False, root_causes, remedies

        # 4. Check single-supplier concentration feasibility
        if problem.max_supplier_share < 0.999:
            min_suppliers_needed_by_share = int(-(-1.0 // problem.max_supplier_share)) # ceil(1 / share)
            if problem.max_suppliers < min_suppliers_needed_by_share:
                root_causes.append(
                    f"Concentration cap of {int(problem.max_supplier_share * 100)}% requires at least {min_suppliers_needed_by_share} suppliers, but max supplier limit is set to {problem.max_suppliers}."
                )
                remedies.append(f"Increase max supplier limit to at least {min_suppliers_needed_by_share} or raise the concentration cap.")
                return False, root_causes, remedies

            # Check if top K suppliers under concentration cap can meet demand
            max_per_supplier = int(round(problem.required_quantity * problem.max_supplier_share))
            max_achievable_with_cap = sum(min(s.capacity, max_per_supplier) for s in sorted_by_capacity[:problem.max_suppliers])
            if max_achievable_with_cap < problem.required_quantity:
                root_causes.append(
                    f"Under the {int(problem.max_supplier_share * 100)}% single-supplier cap, the top {problem.max_suppliers} suppliers can only provide {max_achievable_with_cap:,} units."
                )
                remedies.append(f"Relax concentration cap to at least {round((problem.required_quantity / problem.max_suppliers / problem.required_quantity) * 100, 1)}% or allow more suppliers.")
                return False, root_causes, remedies

        # 5. Check MOQ feasibility (at least one supplier must have MOQ <= required_quantity)
        min_moq = min(s.moq for s in eligible)
        if min_moq > problem.required_quantity:
            root_causes.append(
                f"The lowest MOQ among verified suppliers is {min_moq:,} units, which exceeds your required demand of {problem.required_quantity:,} units."
            )
            remedies.append(f"Increase order quantity to at least {min_moq:,} units to meet factory minimum order quantities.")
            return False, root_causes, remedies

        # 6. Check minimum possible cost vs budget
        if problem.budget_limit is not None and problem.budget_limit > 0:
            # Theoretical lowest cost: greedily take cheapest unit prices up to capacity
            sorted_by_price = sorted(eligible, key=lambda s: s.unit_price)
            rem = problem.required_quantity
            min_possible_cost = 0.0
            for s in sorted_by_price:
                take = min(rem, s.capacity)
                min_possible_cost += take * s.unit_price
                rem -= take
                if rem <= 0:
                    break

            if min_possible_cost > (problem.budget_limit + 1e-4):
                root_causes.append(
                    f"Available budget of ₹{problem.budget_limit:,.2f} is lower than the absolute minimum procurement cost (₹{min_possible_cost:,.2f}) for {problem.required_quantity:,} units."
                )
                remedies.append(
                    f"Increase budget by at least ₹{round(min_possible_cost - problem.budget_limit, 2):,.2f} (to ₹{min_possible_cost:,.2f}) or reduce order quantity."
                )
                return False, root_causes, remedies

        return True, [], []

    @staticmethod
    def audit_solution(
        problem: SourcingProblem,
        allocations: Dict[str, int]
    ) -> Tuple[bool, List[Dict[str, Any]]]:
        """Perform comprehensive constraint audit on a solved allocation.
        Returns: (all_passed, list_of_audit_records)
        """
        records = []
        eligible = problem.candidate_suppliers
        total_allocated = sum(allocations.values())

        # 1. Demand Constraint
        demand_ok = total_allocated >= problem.required_quantity
        records.append({
            "constraint_type": "demand",
            "constraint_value": f">={problem.required_quantity:,} units",
            "actual_value": f"{total_allocated:,} units",
            "status": "satisfied" if demand_ok else "violated",
            "slack": total_allocated - problem.required_quantity
        })

        # 2. MOQ Constraint
        moq_ok, moq_violations = check_moq_constraint(allocations, eligible)
        records.append({
            "constraint_type": "moq",
            "constraint_value": "x_i >= MOQ_i * y_i",
            "actual_value": "All active suppliers meet MOQ" if moq_ok else "; ".join(moq_violations),
            "status": "satisfied" if moq_ok else "violated",
            "slack": 0.0
        })

        # 3. Capacity Constraint
        cap_ok, cap_violations = check_capacity_constraint(allocations, eligible)
        records.append({
            "constraint_type": "capacity",
            "constraint_value": "x_i <= Capacity_i",
            "actual_value": "All allocations within capacity" if cap_ok else "; ".join(cap_violations),
            "status": "satisfied" if cap_ok else "violated",
            "slack": 0.0
        })

        # 4. Budget Constraint
        budget_ok, actual_cost, budget_msg = check_budget_constraint(allocations, eligible, problem.budget_limit)
        budget_str = f"<= ₹{problem.budget_limit:,.2f}" if problem.budget_limit else "No budget ceiling"
        records.append({
            "constraint_type": "budget",
            "constraint_value": budget_str,
            "actual_value": f"₹{actual_cost:,.2f}",
            "status": "satisfied" if budget_ok else "violated",
            "slack": (problem.budget_limit - actual_cost) if problem.budget_limit else 0.0
        })

        # 5. Supplier Limit (K)
        active_count = sum(1 for q in allocations.values() if q > 0)
        sup_ok = active_count <= problem.max_suppliers
        records.append({
            "constraint_type": "supplier_limit",
            "constraint_value": f"<= {problem.max_suppliers} active suppliers",
            "actual_value": f"{active_count} active suppliers",
            "status": "satisfied" if sup_ok else "violated",
            "slack": float(problem.max_suppliers - active_count)
        })

        # 6. Concentration Limit
        conc_ok, conc_violations = check_concentration_constraint(
            allocations, problem.required_quantity, problem.max_supplier_share, eligible
        )
        records.append({
            "constraint_type": "concentration",
            "constraint_value": f"<= {int(problem.max_supplier_share * 100)}% per supplier",
            "actual_value": "All allocations within concentration cap" if conc_ok else "; ".join(conc_violations),
            "status": "satisfied" if conc_ok else "violated",
            "slack": 0.0
        })

        # 7. Country Limit
        country_ok, country_violations = check_country_constraints(
            allocations, problem.required_quantity, problem.max_country_share, problem.excluded_countries, eligible
        )
        records.append({
            "constraint_type": "country_limit",
            "constraint_value": f"<= {int(problem.max_country_share * 100)}% per country",
            "actual_value": "All countries compliant" if country_ok else "; ".join(country_violations),
            "status": "satisfied" if country_ok else "violated",
            "slack": 0.0
        })

        all_passed = all(r["status"] == "satisfied" for r in records)
        return all_passed, records
