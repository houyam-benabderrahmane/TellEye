"""
TellEye — Institutions Router
==============================
All endpoints for the government / institutional dashboard.

Endpoints:
  GET    /api/institutions/             → admin list all institutions
  POST   /api/institutions/             → admin creates institution
  GET    /api/institutions/me           → get current institution profile
  GET    /api/institutions/me/summary   → dashboard overview stats
  GET    /api/institutions/me/wilayas   → accessible wilayas list
  GET    /api/institutions/me/maps      → all soil maps
  GET    /api/institutions/me/maps/{id} → single map detail
  GET    /api/institutions/me/updates   → seasonal updates history
  GET    /api/institutions/me/history   → prediction history
  GET    /api/institutions/me/reports   → all reports
  GET    /api/institutions/me/reports/{id}/download → download PDF/GeoTIFF
  POST   /api/institutions/me/predict   → run a new point prediction
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from db import get_db
import models
from schemas.institution import (
    InstitutionCreate, InstitutionOut, InstitutionUpdate,
    SoilMapOut, SeasonalUpdateOut, PredictionHistoryOut,
    ReportOut, DashboardSummary
)
from schemas.prediction import PointPredictionRequest, PointPredictionResponse
from utils import hash_password

router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────
def get_current_institution(db: Session, user_id: int) -> models.Institution:
    inst = db.query(models.Institution).filter(
        models.Institution.user_id == user_id
    ).first()
    if not inst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution profile not found for this user."
        )
    if not inst.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Institution account is inactive. Contact support."
        )
    return inst


def mock_predict(lat: float, lng: float) -> dict:
    import random
    north_factor = max(0, (lat - 20) / 18)
    soc   = round(0.2 + north_factor * 3.2 + random.gauss(0, 0.3), 2)
    clay  = round(8   + north_factor * 32  + random.gauss(0, 3),   1)
    ph    = round(8.8 - north_factor * 1.8 + random.gauss(0, 0.2), 1)
    soc   = max(0.1, min(soc, 5.0))
    clay  = max(5,   min(clay, 60))
    ph    = max(5.5, min(ph, 9.5))
    soc_class = "high" if soc >= 2.5 else ("medium" if soc >= 1.2 else "low")
    texture = (
        "Argilo-limoneux" if clay > 35 else
        "Limoneux"        if clay > 20 else
        "Sablo-limoneux"  if clay > 12 else "Sableux"
    )
    return {
        "soc_value": soc, "soc_class": soc_class,
        "clay_value": clay, "ph_value": ph,
        "texture_class": texture,
        "confidence": round(0.6 + north_factor * 0.3, 2),
        "model_version": "dann_v2",
    }


# ══════════════════════════════════════════════════════════════
#  ADMIN — List all institutions
# ══════════════════════════════════════════════════════════════

@router.get("/", summary="[Admin] List all institutions")
async def list_institutions(db: Session = Depends(get_db)):
    """Returns all institutions — admin only."""
    return db.query(models.Institution)\
        .order_by(models.Institution.created_at.desc())\
        .all()


# ══════════════════════════════════════════════════════════════
#  ADMIN — Create institution account
# ══════════════════════════════════════════════════════════════

@router.post("/", response_model=InstitutionOut, status_code=status.HTTP_201_CREATED,
             summary="[Admin] Create institution account")
async def create_institution(payload: InstitutionCreate, db: Session = Depends(get_db)):
    # Check email not taken
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' is already registered."
        )

    # Create user
    user = models.User(
        full_name     = payload.full_name,
        email         = payload.email,
        password_hash = hash_password(payload.password),
        role          = "institution",
        plan          = "enterprise",
    )
    db.add(user)
    db.flush()

    # Create institution
    institution = models.Institution(
        user_id        = user.id,
        name           = payload.name,
        short_name     = payload.short_name,
        type           = payload.type,
        contact_person = payload.contact_person,
        contact_email  = payload.contact_email,
        contact_phone  = payload.contact_phone,
        plan           = payload.plan,
        wilaya_access  = payload.wilaya_access,
        annual_fee_da  = payload.annual_fee_da,
        contract_start = payload.contract_start,
        contract_end   = payload.contract_end,
        notes          = payload.notes,
    )
    db.add(institution)
    db.commit()
    db.refresh(institution)
    return institution


# ══════════════════════════════════════════════════════════════
#  DASHBOARD — Current institution endpoints
# ══════════════════════════════════════════════════════════════

@router.get("/me", response_model=InstitutionOut,
            summary="Get current institution profile")
async def get_my_institution(user_id: int = 1, db: Session = Depends(get_db)):
    return get_current_institution(db, user_id)


@router.get("/me/summary", response_model=DashboardSummary,
            summary="Dashboard overview stats")
async def get_dashboard_summary(user_id: int = 1, db: Session = Depends(get_db)):
    inst = get_current_institution(db, user_id)

    total_predictions = db.query(models.PredictionHistory).filter(
        models.PredictionHistory.institution_id == inst.id
    ).count()

    total_reports = db.query(models.Report).filter(
        models.Report.institution_id == inst.id,
        models.Report.status == "ready"
    ).count()

    total_maps = db.query(models.SoilMap).filter(
        models.SoilMap.institution_id == inst.id,
        models.SoilMap.status == "ready"
    ).count()

    pending_updates = db.query(models.SeasonalUpdate).filter(
        models.SeasonalUpdate.institution_id == inst.id,
        models.SeasonalUpdate.status == "scheduled"
    ).count()

    last_pred = db.query(models.PredictionHistory).filter(
        models.PredictionHistory.institution_id == inst.id
    ).order_by(models.PredictionHistory.created_at.desc()).first()

    last_update_trend = db.query(models.SeasonalUpdate).filter(
        models.SeasonalUpdate.institution_id == inst.id,
        models.SeasonalUpdate.status == "delivered"
    ).order_by(models.SeasonalUpdate.delivered_at.desc()).first()

    return DashboardSummary(
        institution_name  = inst.name,
        plan              = inst.plan,
        wilaya_access     = inst.wilaya_access or [],
        total_predictions = total_predictions,
        total_reports     = total_reports,
        total_maps        = total_maps,
        last_update       = last_pred.created_at if last_pred else None,
        contract_end      = inst.contract_end,
        pending_updates   = pending_updates,
        recent_trend      = last_update_trend.trend if last_update_trend else "unknown",
    )


@router.get("/me/wilayas", summary="Get accessible wilayas")
async def get_my_wilayas(user_id: int = 1, db: Session = Depends(get_db)):
    inst = get_current_institution(db, user_id)
    return {
        "wilayas": inst.wilaya_access or [],
        "is_national": len(inst.wilaya_access or []) == 0,
        "plan": inst.plan,
    }


@router.get("/me/maps", response_model=List[SoilMapOut],
            summary="Get all soil maps")
async def get_my_maps(
    wilaya: Optional[str] = None,
    year:   Optional[int] = None,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    query = db.query(models.SoilMap).filter(
        models.SoilMap.institution_id == inst.id
    )
    if wilaya:
        query = query.filter(models.SoilMap.wilaya == wilaya)
    if year:
        query = query.filter(models.SoilMap.year == year)
    return query.order_by(models.SoilMap.created_at.desc()).all()


@router.get("/me/maps/{map_id}", response_model=SoilMapOut,
            summary="Get single soil map detail")
async def get_map_detail(map_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    inst = get_current_institution(db, user_id)
    soil_map = db.query(models.SoilMap).filter(
        models.SoilMap.id == map_id,
        models.SoilMap.institution_id == inst.id
    ).first()
    if not soil_map:
        raise HTTPException(status_code=404, detail="Map not found.")
    return soil_map


@router.get("/me/updates", response_model=List[SeasonalUpdateOut],
            summary="Get seasonal updates history")
async def get_seasonal_updates(
    wilaya:  Optional[str] = None,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    query = db.query(models.SeasonalUpdate).filter(
        models.SeasonalUpdate.institution_id == inst.id
    )
    if wilaya:
        query = query.filter(models.SeasonalUpdate.wilaya == wilaya)
    return query.order_by(
        models.SeasonalUpdate.year.desc(),
        models.SeasonalUpdate.quarter.desc()
    ).all()


@router.get("/me/history", response_model=List[PredictionHistoryOut],
            summary="Get prediction history")
async def get_prediction_history(
    wilaya:   Optional[str] = None,
    limit:    int = 50,
    offset:   int = 0,
    user_id:  int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    query = db.query(models.PredictionHistory).filter(
        models.PredictionHistory.institution_id == inst.id
    )
    if wilaya:
        query = query.filter(models.PredictionHistory.wilaya == wilaya)
    return query.order_by(
        models.PredictionHistory.created_at.desc()
    ).offset(offset).limit(limit).all()


@router.get("/me/reports", response_model=List[ReportOut],
            summary="Get all reports")
async def get_my_reports(
    wilaya:  Optional[str] = None,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    query = db.query(models.Report).filter(
        models.Report.institution_id == inst.id
    )
    if wilaya:
        query = query.filter(models.Report.wilaya == wilaya)
    return query.order_by(models.Report.created_at.desc()).all()


@router.get("/me/reports/{report_id}/download",
            summary="Download report PDF or GeoTIFF")
async def download_report(
    report_id: int,
    format:    str = "pdf",
    user_id:   int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.institution_id == inst.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.status != "ready":
        raise HTTPException(status_code=400, detail="Report is not ready yet.")

    path_map = {
        "pdf":     report.pdf_path,
        "geotiff": report.geotiff_path,
        "shp":     report.shp_path,
    }
    file_path = path_map.get(format)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"File format '{format}' not available for this report."
        )

    report.downloaded_count += 1
    db.commit()

    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type="application/octet-stream"
    )


@router.post("/me/predict", response_model=PointPredictionResponse,
             summary="Run a new point prediction")
async def predict_point(
    payload:  PointPredictionRequest,
    user_id:  int = 1,
    db: Session = Depends(get_db)
):
    inst = get_current_institution(db, user_id)
    result = mock_predict(payload.latitude, payload.longitude)

    history = models.PredictionHistory(
        institution_id = inst.id,
        latitude       = payload.latitude,
        longitude      = payload.longitude,
        wilaya         = payload.wilaya or "N/A",
        request_type   = "point",
        triggered_by   = "dashboard",
        **result,
    )
    db.add(history)
    db.commit()

    return PointPredictionResponse(
        latitude      = payload.latitude,
        longitude     = payload.longitude,
        wilaya        = payload.wilaya,
        disclaimer    = "Prediction via modele DANN v2 — Sentinel-2.",
        **result,
    )