import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Railway internal PostgreSQL URL (hardcoded as default for deployment)
RAILWAY_URL = "postgresql+pg8000://postgres:odQscyqyrzByueLavjarepZhjSpLmDZF@postgres.railway.internal:5432/railway"
LOCAL_URL   = "postgresql+pg8000://postgres:123@localhost:5432/telleye_db"


def get_database_url():
    url = os.environ.get("DATABASE_URL") or os.environ.get("PGHOST") and None

    if url:
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+pg8000://", 1)
        if "psycopg2" in url:
            url = url.replace("psycopg2", "pg8000")
        if url.startswith("postgresql://") and "+pg8000" not in url:
            url = url.replace("postgresql://", "postgresql+pg8000://", 1)
        print(f"[DB] Using env DATABASE_URL: {url[:50]}...")
        return url

    # Check if running on Railway (any Railway env present)
    if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RAILWAY_PROJECT_ID"):
        print(f"[DB] Railway detected, using internal URL")
        return RAILWAY_URL

    print("[DB] Using local development URL")
    return LOCAL_URL


DATABASE_URL = get_database_url()
engine       = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db():
    import models  # noqa
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()