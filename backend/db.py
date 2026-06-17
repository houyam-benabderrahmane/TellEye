import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


def get_database_url():
    """Get and fix DATABASE_URL from environment."""
    url = os.environ.get(
        "DATABASE_URL",
        "postgresql+pg8000://postgres:123@localhost:5432/telleye_db"
    )
    # Fix Railway's postgres:// format
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+pg8000://", 1)
    # Replace psycopg2 with pg8000
    if "psycopg2" in url:
        url = url.replace("psycopg2", "pg8000")
    # Add +pg8000 if missing
    if url.startswith("postgresql://") and "+pg8000" not in url:
        url = url.replace("postgresql://", "postgresql+pg8000://", 1)
    return url


DATABASE_URL = get_database_url()

engine = create_engine(DATABASE_URL)

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