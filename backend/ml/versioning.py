"""
SupplyLens ML Model Versioning
Wires ML model metadata and metrics into the PostgreSQL database.
"""

from typing import Dict, Any, Optional
import uuid
import json
from datetime import datetime
from core.database import SessionLocal
from app.models.database import ModelVersion

def register_model_version(
    model_name: str,
    version: str,
    dataset_version: str,
    feature_version: str,
    hyperparameters: Dict[str, Any],
    metrics: Dict[str, float],
    status: str = "active",
    artifact_location: str = ""
) -> str:
    """Register a new ML model version in the database."""
    db = SessionLocal()
    try:
        new_version = ModelVersion(
            id=str(uuid.uuid4()),
            model_name=model_name,
            version=version,
            dataset_version=dataset_version,
            feature_version=feature_version,
            hyperparameters=hyperparameters,
            metrics=metrics,
            status=status,
            artifact_location=artifact_location
        )
        db.add(new_version)
        db.commit()
        db.refresh(new_version)
        print(f"[ML] Registered new model version: {model_name} v{version}")
        return new_version.id
    except Exception as e:
        db.rollback()
        print(f"[ML] Failed to register model version: {e}")
        return ""
    finally:
        db.close()

def get_active_model(model_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve the active model version metadata."""
    db = SessionLocal()
    try:
        active = db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.status == "active"
        ).order_by(ModelVersion.created_at.desc()).first()
        
        if active:
            return {
                "id": active.id,
                "version": active.version,
                "metrics": active.metrics,
                "artifact_location": active.artifact_location
            }
        return None
    except Exception as e:
        print(f"[ML] Failed to fetch active model: {e}")
        return None
    finally:
        db.close()
