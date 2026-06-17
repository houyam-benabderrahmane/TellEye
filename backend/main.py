from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from config import settings
from db import init_db, SessionLocal
import models
from utils import hash_password
from routers import auth, institutions, predictions, orders, payments

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(
            models.User.email == settings.ADMIN_EMAIL
        ).first()
        if not admin:
            admin = models.User(
                full_name=settings.ADMIN_FULL_NAME,
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
                plan="enterprise",
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info(f"Admin created: {settings.ADMIN_EMAIL}")

        test_user = db.query(models.User).filter(
            models.User.email == "test@institution.dz"
        ).first()
        if not test_user:
            test_user = models.User(
                full_name="Institution Test",
                email="test@institution.dz",
                password_hash=hash_password("Test@1234"),
                role="institution",
                plan="enterprise",
            )
            db.add(test_user)
            db.flush()

            institution = models.Institution(
                user_id=test_user.id,
                name="Institution Test TellEye",
                short_name="Test",
                type="ministry",
                plan="pilot",
                wilaya_access=["Alger", "Blida", "Setif", "Constantine"],
                is_active=True,
            )
            db.add(institution)
            db.commit()
            logger.info("Test institution created: test@institution.dz")

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("TellEye API starting...")
    init_db()
    create_admin()
    os.makedirs("./storage/reports", exist_ok=True)
    os.makedirs("./storage/maps", exist_ok=True)
    yield
    logger.info("TellEye API shutting down")


app = FastAPI(
    title="TellEye API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://telleye-production.up.railway.app",
        "https://tell-apzak3ien-houyems-projects-bd8958be.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/auth",        tags=["Auth"])
app.include_router(institutions.router, prefix="/api/institutions", tags=["Institutions"])
app.include_router(predictions.router,  prefix="/api/predict",     tags=["Predictions"])
app.include_router(orders.router,       prefix="/api/orders",      tags=["Orders"])
app.include_router(payments.router,     prefix="/api/payments",    tags=["Payments"])


@app.get("/")
async def root():
    return {"service": "TellEye API", "status": "running", "docs": "/docs"}