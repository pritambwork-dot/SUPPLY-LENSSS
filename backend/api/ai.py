import httpx
from typing import Any, Dict
from fastapi import APIRouter, Body, HTTPException
from app.services.ai_service import ai_service
from app.services.business_service import classify_budget, generate_business_snapshot
from app.services.profile_service import get_profile
from app.schemas.schemas import ChatQueryRequest, ChatQueryResponse
from app.data.seed_data import SUPPLIERS_SEED
from core.config import settings

router = APIRouter(tags=["ai"])

@router.post("/api/ai/extract")
def extract_business_profile(payload: Dict[str, str] = Body(...)):
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text prompt is required")
    extracted = ai_service.extract_business_info(text)
    budget_info = classify_budget(extracted.get("budget_amount", 0), extracted.get("budget_currency", "INR"))
    extracted["budget_constraint_category"] = budget_info["category"]
    extracted["budget_insight"] = budget_info["insight"]
    extracted["business_snapshot"] = generate_business_snapshot(extracted)
    return extracted

@router.post("/api/ai/clarify")
def clarify_missing_info(profile: Dict[str, Any] = Body(...)):
    question = ai_service.detect_missing_info_and_clarify(profile)
    return {"has_question": question is not None, "question_data": question}

@router.post("/api/ai/requirements")
def generate_business_requirements(payload: Dict[str, Any] = Body(...)):
    idea = payload.get("idea", "")
    sector = payload.get("sector", "Sustainable Packaging")
    reqs = ai_service.generate_requirements(idea, sector)
    return reqs

async def ask_grok(prompt: str) -> str:
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "grok-3-mini",
        "messages": [{"role": "user", "content": prompt}]
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=data, timeout=30.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

@router.post("/api/assistant/ask", response_model=ChatQueryResponse)
async def ask_assistant(request: ChatQueryRequest):
    context = request.context or {}
    business_profile = context.get("business_profile") or get_profile("biz-001")
    suppliers_pool = context.get("suppliers") or SUPPLIERS_SEED
    
    # Query SupplyLens Gemini Intelligence Engine
    res = ai_service.answer_assistant_query(request.query, business_profile, suppliers_pool)
    return res

async def ask_deepseek(prompt: str) -> str:
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}]
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=data, timeout=30.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

@router.post("/api/ai/detailed-info")
async def get_detailed_info(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "")
    prompt = f"Provide detailed market/supplier info on: {query}"
    
    try:
        if settings.DEEPSEEK_API_KEY:
            reply = await ask_deepseek(prompt)
            return {"info": reply}
        else:
            raise Exception("No DeepSeek key")
    except Exception as e:
        # Fallback to Gemini (via ai_service generic text)
        reply = ai_service.generate_text(prompt)
        if reply:
            return {"info": reply}
        return {"info": "Could not retrieve detailed info at this time."}
