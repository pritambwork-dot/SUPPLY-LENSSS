from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException
from app.services.logistics.scenario_service import ScenarioService
from app.services.profile_service import get_profile
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])

@router.post("/calculate")
def calculate_scenario_endpoint(payload: Dict[str, Any] = Body(...)):
    supplier_id = payload.get("supplier_id")
    if not supplier_id:
        raise HTTPException(status_code=400, detail="supplier_id is required")

    quantity = int(payload.get("quantity", 1000))
    destination_city = payload.get("destination_city", "Bhubaneswar")
    destination_country = payload.get("destination_country", "India")
    product_name = payload.get("product_name")
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)

    scenario = ScenarioService.calculate_scenario(
        supplier_id=supplier_id,
        quantity=quantity,
        destination_city=destination_city,
        destination_country=destination_country,
        product_name=product_name,
        business_profile=profile,
    )
    return scenario

@router.post("/compare")
def compare_scenarios_endpoint(payload: Dict[str, Any] = Body(...)):
    scenarios = payload.get("scenarios", [])
    scenario_ids = payload.get("scenario_ids", [])
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)

    if not scenarios and scenario_ids:
        dest_city = payload.get("destination_city", "Bhubaneswar")
        dest_country = payload.get("destination_country", "India")
        qty = int(payload.get("quantity", 5000))
        for sid in scenario_ids:
            scen = ScenarioService.calculate_scenario(
                supplier_id=sid,
                quantity=qty,
                destination_city=dest_city,
                destination_country=dest_country,
                business_profile=profile
            )
            scenarios.append(scen)

    if len(scenarios) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 scenarios can be compared simultaneously.")

    comparison = ScenarioService.compare_scenarios(scenarios, profile)
    return comparison

@router.post("/what-if")
def what_if_simulation_endpoint(payload: Dict[str, Any] = Body(...)):
    scenario_ids = payload.get("scenario_ids", [])
    supplier_ids = payload.get("supplier_ids", [])
    new_quantity = int(payload.get("new_quantity", 5000))
    destination_city = payload.get("destination_city", "Bhubaneswar")
    destination_country = payload.get("destination_country", "India")
    business_id = payload.get("business_id", "biz-001")
    profile = payload.get("business_profile") or get_profile(business_id)

    target_ids = scenario_ids or supplier_ids
    if not target_ids:
        raise HTTPException(status_code=400, detail="scenario_ids or supplier_ids are required")

    result = ScenarioService.what_if_recalculate(
        scenario_ids=target_ids,
        new_quantity=new_quantity,
        destination_city=destination_city,
        destination_country=destination_country,
        business_profile=profile,
    )
    return result

@router.post("/explain")
def explain_scenario_endpoint(payload: Dict[str, Any] = Body(...)):
    scenario = payload.get("scenario")
    if not scenario:
        raise HTTPException(status_code=400, detail="scenario object is required")
    profile = payload.get("business_profile") or get_profile("biz-001")
    return ai_service.explain_sourcing_scenario(scenario, profile)

@router.post("/ask")
def ask_sourcing_question_endpoint(payload: Dict[str, Any] = Body(...)):
    question = payload.get("question", "")
    scenarios = payload.get("scenarios", [])
    if not question:
        raise HTTPException(status_code=400, detail="question is required")
    profile = payload.get("business_profile") or get_profile("biz-001")
    return ai_service.answer_sourcing_question(question, scenarios, profile)

@router.get("/saved")
def get_saved_scenarios_endpoint():
    return ScenarioService.get_saved_scenarios()

@router.post("/save")
def save_scenario_endpoint(payload: Dict[str, Any] = Body(...)):
    scenario_id = payload.get("scenario_id")
    if not scenario_id:
        raise HTTPException(status_code=400, detail="scenario_id is required")
    return ScenarioService.save_scenario(scenario_id)
