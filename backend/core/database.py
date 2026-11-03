"""
SupplyLens Database Configuration
Connects to PostgreSQL when available, falls back to SQLite for development.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings
from app.models.database import Base

# Try PostgreSQL first, fall back to SQLite if unavailable
_db_url = settings.DATABASE_URL
_engine = None

def _get_engine():
    global _engine
    if _engine is not None:
        return _engine
    try:
        _engine = create_engine(_db_url, pool_pre_ping=True)
        # Quick connectivity check
        with _engine.connect() as conn:
            conn.execute(conn.default_dialect.statement_compiler(conn.dialect, None).__class__.__module__ and conn.connection)
        print(f"[DB] Connected to PostgreSQL")
    except Exception:
        fallback_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "supplylens_dev.db")
        fallback_url = f"sqlite:///{fallback_path}"
        _engine = create_engine(fallback_url)
        print(f"[DB] PostgreSQL unavailable, using SQLite at {fallback_path}")
    return _engine

try:
    engine = create_engine(_db_url, pool_pre_ping=True)
    with engine.connect() as conn:
        pass
    print("[DB] Connected to PostgreSQL")
except Exception:
    fallback_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "supplylens_dev.db")
    fallback_url = f"sqlite:///{fallback_path}"
    engine = create_engine(fallback_url)
    print(f"[DB] PostgreSQL unavailable, using SQLite fallback")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables from SQLAlchemy models for core SupplyLens sourcing intelligence."""
    try:
        import app.models.monetization
        import app.models.database
        Base.metadata.create_all(bind=engine)
        print("[DB] SupplyLens core sourcing tables initialized successfully")
    except Exception as e:
        print(f"[DB] Warning: Could not initialize tables: {e}")

