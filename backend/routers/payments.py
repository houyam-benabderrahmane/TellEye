"""
TellEye — Payments Router (Chargily Pay)
=========================================
Endpoints:
  POST /api/payments/checkout/{order_id} → create Chargily checkout
  POST /api/payments/webhook             → handle Chargily webhook
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
import models
from config import settings

router = APIRouter()

CHARGILY_API_URL = "https://pay.chargily.net/test/api/v2"


# ── Create checkout ────────────────────────────────────────────
@router.post("/checkout/{order_id}", summary="Create Chargily checkout")
async def create_checkout(order_id: int, db: Session = Depends(get_db)):

    # Get the order
    order = db.query(models.FarmerRequest).filter(
        models.FarmerRequest.id == order_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable.")

    # Build Chargily payload
    payload = {
        "amount":      int(order.price_da),
        "currency":    "dzd",
        "success_url": f"{settings.FRONTEND_URL}/farmer/success?ref={order.reference}",
        "failure_url": f"{settings.FRONTEND_URL}/farmer?payment=failed",
        "description": f"Analyse SOC TellEye — {order.reference}",
        "locale":      "fr",
        "metadata": {
            "order_id":        str(order.id),
            "order_reference": order.reference,
            "farmer_email":    order.email,
        }
    }

    # Call Chargily API
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{CHARGILY_API_URL}/checkouts",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.CHARGILY_API_KEY}",
                "Content-Type":  "application/json",
            },
            timeout=15.0,
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Chargily: {resp.text}"
        )

    data = resp.json()
    checkout_url = data.get("checkout_url")

    if not checkout_url:
        raise HTTPException(status_code=502, detail="URL de paiement non reçue.")

    # Update order status to processing
    order.status = "processing"
    db.commit()

    return {
        "checkout_url": checkout_url,
        "checkout_id":  data.get("id"),
        "reference":    order.reference,
    }


# ── Webhook ────────────────────────────────────────────────────
@router.post("/webhook", summary="Chargily webhook")
async def chargily_webhook(payload: dict, db: Session = Depends(get_db)):
    """
    Called by Chargily when payment status changes.
    Updates the order status in DB.
    """
    event_type = payload.get("type")
    data       = payload.get("data", {})
    metadata   = data.get("metadata", {})
    order_id   = metadata.get("order_id")

    if not order_id:
        return {"status": "ignored"}

    order = db.query(models.FarmerRequest).filter(
        models.FarmerRequest.id == int(order_id)
    ).first()

    if not order:
        return {"status": "order_not_found"}

    if event_type == "checkout.paid":
        order.status = "processing"
    elif event_type == "checkout.failed":
        order.status = "pending"

    db.commit()
    return {"status": "ok"}