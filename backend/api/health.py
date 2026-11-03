from fastapi import APIRouter
from app.data.seed_data import SUPPLIERS_SEED

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("")
def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "SupplyLens API",
        "version": "2.0.0",
        "verified_suppliers_count": len(SUPPLIERS_SEED),
    }
