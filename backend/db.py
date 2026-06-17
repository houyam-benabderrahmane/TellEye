import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


def get_database_url():
    # Try DATABASE_URL first
    url = os.environ.get("DATABASE_URL")
    if url:
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+pg8000://", 1)
        if "psycopg2" in url:
            url = url.replace("psycopg2", "pg8000")
        if url.startswith("postgresql://") and "+pg8000" not in url:
            url = url.replace("postgresql://", "postgresql+pg8000://", 1)
        print(f"[DB] Using DATABASE_URL: {url[:40]}...")
        return url

    # Fallback: use Railway's individual PG variables
    pghost = os.environ.get("PGHOST")
    if pghost:
        pgport     = os.environ.get("PGPORT", "5432")
        pguser     = os.environ.get("PGUSER", "postgres")
        pgpassword = os.environ.get("PGPASSWORD", "")
        pgdatabase = os.environ.get("PGDATABASE", "railway")
        url = f"postgresql+pg8000://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}"
        print(f"[DB] Using PGHOST variables: {pghost}:{pgport}/{pgdatabase}")
        return url

    # Local dev fallback
    print("[DB] WARNING: No Railway env vars found, using localhost!")
    return "postgresql+pg8000://postgres:123@localhost:5432/telleye_db"


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