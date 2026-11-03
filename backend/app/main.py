import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env or root .env
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import init_db
from api import health, suppliers, business, scenarios, ai, optimization, ml, monetization, verification, customer, onboarding, assistant, discovery

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and models
    init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="SupplyLens API",
    description="Backend API for AI-powered global supplier discovery and business sourcing intelligence.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(suppliers.router)
app.include_router(verification.router)
app.include_router(business.router)
app.include_router(scenarios.router)
app.include_router(ai.router)
app.include_router(optimization.router)
app.include_router(ml.router)
app.include_router(monetization.router)
app.include_router(customer.router)
app.include_router(onboarding.router)
app.include_router(assistant.router)
app.include_router(discovery.router)

from app.data.seed_data import DESTINATIONS_SEED

@app.get("/api/destinations")
def get_destinations():
    return DESTINATIONS_SEED

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
