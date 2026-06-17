"""
TellEye — Orders Router
========================
Handles farmer analysis requests.
  POST /api/orders/          → create new request
  GET  /api/orders/          → list all requests (admin)
  GET  /api/orders/{id}      → get one request
  PUT  /api/orders/{id}/status → update status
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from db import get_db
import models

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────
class OrderCreate(BaseModel):
    # Zone
    wilaya:      str
    commune:     Optional[str]   = None
    zone_type:   str
    coordinates: Optional[list]  = None
    area_ha:     Optional[float] = None
    lat:         Optional[float] = None
    lng:         Optional[float] = None
    # Info
    full_name:   str
    phone:       str
    email:       EmailStr
    crop:        Optional[str]   = None
    payment:     str
    farmer_notes: Optional[str] = None
    price_da:    float = 4500.0


class OrderOut(BaseModel):
    id:           int
    wilaya:       str
    commune:      Optional[str]
    zone_type:    str
    area_ha:      Optional[float]
    lat:          Optional[float]
    lng:          Optional[float]
    full_name:    str
    phone:        str
    email:        str
    crop:         Optional[str]
    payment:      str
    price_da:     float
    status:       str
    reference:    str
    created_at:   datetime
    processed_at: Optional[datetime]
    notes:        Optional[str]

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str
    notes:  Optional[str] = None


# ── Endpoints ──────────────────────────────────────────────────
@router.post("/", response_model=OrderOut, summary="Create farmer order")
async def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    import random, string
    ref = "TE-" + ''.join(random.choices(string.digits, k=6))

    order = models.FarmerRequest(
        wilaya      = payload.wilaya,
        commune     = payload.commune,
        zone_type   = payload.zone_type,
        coordinates = str(payload.coordinates) if payload.coordinates else None,
        area_ha     = payload.area_ha,
        lat         = payload.lat,
        lng         = payload.lng,
        full_name   = payload.full_name,
        phone       = payload.phone,
        email       = payload.email,
        crop        = payload.crop or "Non spécifié",
        payment     = payload.payment,
        price_da    = payload.price_da,
        status      = "pending",
        reference   = ref,
        notes       = payload.farmer_notes,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/", summary="List all orders (admin)")
async def list_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.FarmerRequest)
    if status:
        query = query.filter(models.FarmerRequest.status == status)
    return query.order_by(models.FarmerRequest.created_at.desc()).all()


@router.get("/{order_id}", summary="Get one order")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.FarmerRequest).filter(
        models.FarmerRequest.id == order_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Demande introuvable.")
    return order


@router.put("/{order_id}/status", summary="Update order status")
async def update_status(order_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.FarmerRequest).filter(
        models.FarmerRequest.id == order_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Demande introuvable.")

    order.status = payload.status
    if payload.notes:
        order.notes = payload.notes
    if payload.status == "done":
        order.processed_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order