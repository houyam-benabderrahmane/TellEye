"""
TellEye — Database Models (SQLAlchemy)
=======================================
Tables:
  Core:
    - User               → all users (farmers, researchers, admins)
    - ApiKey             → API keys for Pro/Enterprise users
    - SoilPrediction     → free anonymous point predictions

  Institutional (B2G):
    - Institution        → Ministry / INRAA / Wilaya accounts
    - SoilMap            → wilaya-level SOC maps per season
    - SeasonalUpdate     → quarterly update tracking per wilaya
    - PredictionHistory  → every ML prediction stored (for institutions)
    - Report             → generated PDF / GeoTIFF reports

  Farmer (B2C):
    - SoilAnalysis       → per-parcel analysis requests
    - FarmerRequest      → new farmer order requests (from /farmer page)
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from db import Base


# ══════════════════════════════════════════════════════════════
#  CORE TABLES
# ══════════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    full_name       = Column(String(200), nullable=False)
    email           = Column(String(200), unique=True, index=True, nullable=False)
    phone           = Column(String(30))
    password_hash   = Column(String(256), nullable=False)
    role            = Column(
        Enum("farmer", "researcher", "institution", "admin", name="user_role"),
        default="farmer", nullable=False
    )
    plan            = Column(
        Enum("free", "pro", "professional", "enterprise", name="user_plan"),
        default="free"
    )
    is_active       = Column(Boolean, default=True)
    api_calls_used  = Column(Integer, default=0)
    api_calls_limit = Column(Integer, default=3)
    last_login      = Column(DateTime)
    created_at      = Column(DateTime, default=datetime.utcnow)

    analyses    = relationship("SoilAnalysis",    back_populates="user")
    api_keys    = relationship("ApiKey",          back_populates="user")
    institution = relationship("Institution",     back_populates="user", uselist=False)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    key_hash   = Column(String(256), unique=True, nullable=False)
    name       = Column(String(100), default="Default Key")
    is_active  = Column(Boolean, default=True)
    calls_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used  = Column(DateTime)

    user = relationship("User", back_populates="api_keys")


class SoilPrediction(Base):
    __tablename__ = "soil_predictions"

    id         = Column(Integer, primary_key=True, index=True)
    latitude   = Column(Float, nullable=False)
    longitude  = Column(Float, nullable=False)
    wilaya     = Column(String(100))
    soc_value  = Column(Float)
    soc_class  = Column(String(20))
    clay_value = Column(Float)
    ph_value   = Column(Float)
    texture    = Column(String(50))
    confidence = Column(Float)
    source     = Column(String(50), default="dann_v2")
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


# ══════════════════════════════════════════════════════════════
#  INSTITUTIONAL TABLES  (B2G)
# ══════════════════════════════════════════════════════════════

class Institution(Base):
    __tablename__ = "institutions"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name            = Column(String(300), nullable=False)
    short_name      = Column(String(100))
    type            = Column(
        Enum("ministry", "research_institute", "wilaya", "agency", "other",
             name="institution_type"),
        default="ministry"
    )
    contact_person  = Column(String(200))
    contact_email   = Column(String(200))
    contact_phone   = Column(String(30))
    plan            = Column(
        Enum("pilot", "standard", "national", "custom", name="institution_plan"),
        default="pilot"
    )
    contract_start  = Column(DateTime)
    contract_end    = Column(DateTime)
    is_active       = Column(Boolean, default=True)
    wilaya_access   = Column(JSON, default=list)
    annual_fee_da   = Column(Float)
    notes           = Column(Text)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user               = relationship("User",              back_populates="institution")
    prediction_history = relationship("PredictionHistory", back_populates="institution")
    reports            = relationship("Report",            back_populates="institution")
    soil_maps          = relationship("SoilMap",           back_populates="institution")


class SoilMap(Base):
    __tablename__ = "soil_maps"

    id              = Column(Integer, primary_key=True, index=True)
    institution_id  = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    wilaya          = Column(String(100), nullable=False, index=True)
    commune         = Column(String(100))
    season          = Column(
        Enum("spring", "summer", "autumn", "winter", name="season_type"),
        nullable=False
    )
    year            = Column(Integer, nullable=False)
    quarter         = Column(Integer)
    property_type   = Column(
        Enum("soc", "clay", "ph", "texture", "sand", "silt", "full",
             name="property_type"),
        default="full"
    )
    soc_mean        = Column(Float)
    soc_min         = Column(Float)
    soc_max         = Column(Float)
    soc_std         = Column(Float)
    clay_mean       = Column(Float)
    ph_mean         = Column(Float)
    pixels_total    = Column(Integer)
    pixels_valid    = Column(Integer)
    coverage_pct    = Column(Float)
    geotiff_path    = Column(String(500))
    thumbnail_path  = Column(String(500))
    geojson_path    = Column(String(500))
    model_version   = Column(String(50), default="dann_v2")
    confidence_mean = Column(Float)
    status          = Column(
        Enum("pending", "processing", "ready", "failed", name="soil_map_status"),
        default="pending"
    )
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    institution     = relationship("Institution",    back_populates="soil_maps")
    seasonal_update = relationship("SeasonalUpdate", back_populates="soil_map", uselist=False)


class SeasonalUpdate(Base):
    __tablename__ = "seasonal_updates"

    id             = Column(Integer, primary_key=True, index=True)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    soil_map_id    = Column(Integer, ForeignKey("soil_maps.id"))
    wilaya         = Column(String(100), nullable=False)
    quarter        = Column(Integer, nullable=False)
    year           = Column(Integer, nullable=False)
    status         = Column(
        Enum("scheduled", "processing", "delivered", "failed",
             name="seasonal_update_status"),
        default="scheduled"
    )
    soc_change_pct = Column(Float)
    trend          = Column(
        Enum("improving", "stable", "degrading", "unknown", name="trend_type"),
        default="unknown"
    )
    change_notes   = Column(Text)
    scheduled_at   = Column(DateTime)
    delivered_at   = Column(DateTime)
    created_at     = Column(DateTime, default=datetime.utcnow)

    soil_map = relationship("SoilMap", back_populates="seasonal_update")


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id              = Column(Integer, primary_key=True, index=True)
    institution_id  = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    wilaya          = Column(String(100), nullable=False, index=True)
    commune         = Column(String(100))
    latitude        = Column(Float)
    longitude       = Column(Float)
    polygon_geojson = Column(Text)
    soc_value       = Column(Float)
    soc_class       = Column(String(20))
    clay_value      = Column(Float)
    ph_value        = Column(Float)
    texture_class   = Column(String(50))
    sand_value      = Column(Float)
    silt_value      = Column(Float)
    confidence      = Column(Float)
    model_version   = Column(String(50), default="dann_v2")
    sentinel2_date  = Column(DateTime)
    bands_used      = Column(JSON)
    request_type    = Column(
        Enum("point", "polygon", "wilaya", "batch", name="request_type"),
        default="point"
    )
    triggered_by    = Column(String(50), default="dashboard")
    created_at      = Column(DateTime, default=datetime.utcnow, index=True)

    institution = relationship("Institution", back_populates="prediction_history")


class Report(Base):
    __tablename__ = "reports"

    id               = Column(Integer, primary_key=True, index=True)
    institution_id   = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    soil_map_id      = Column(Integer, ForeignKey("soil_maps.id"))
    title            = Column(String(300))
    wilaya           = Column(String(100))
    report_type      = Column(
        Enum("quarterly", "annual", "custom", "pilot", name="report_type"),
        default="quarterly"
    )
    period_start     = Column(DateTime)
    period_end       = Column(DateTime)
    quarter          = Column(Integer)
    year             = Column(Integer)
    pdf_path         = Column(String(500))
    geotiff_path     = Column(String(500))
    shp_path         = Column(String(500))
    file_size_mb     = Column(Float)
    status           = Column(
        Enum("generating", "ready", "delivered", "failed", name="report_status"),
        default="generating"
    )
    downloaded_count = Column(Integer, default=0)
    last_downloaded  = Column(DateTime)
    summary_stats    = Column(JSON)
    created_at       = Column(DateTime, default=datetime.utcnow)
    delivered_at     = Column(DateTime)

    institution = relationship("Institution", back_populates="reports")


# ══════════════════════════════════════════════════════════════
#  FARMER TABLES  (B2C)
# ══════════════════════════════════════════════════════════════

class SoilAnalysis(Base):
    __tablename__ = "soil_analyses"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    wilaya            = Column(String(100))
    commune           = Column(String(100))
    latitude          = Column(Float)
    longitude         = Column(Float)
    area_ha           = Column(Float)
    polygon_geojson   = Column(Text)
    main_crop         = Column(String(100))
    specific_question = Column(Text)
    is_express        = Column(Boolean, default=False)
    status            = Column(
        Enum("pending", "processing", "completed", "delivered", "cancelled",
             name="analysis_status"),
        default="pending"
    )
    price_da          = Column(Float)
    soc_value         = Column(Float)
    soc_class         = Column(String(20))
    clay_value        = Column(Float)
    ph_value          = Column(Float)
    texture_class     = Column(String(50))
    confidence        = Column(Float)
    model_version     = Column(String(50), default="dann_v2")
    report_path       = Column(String(500))
    map_path          = Column(String(500))
    created_at        = Column(DateTime, default=datetime.utcnow)
    updated_at        = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    delivered_at      = Column(DateTime)

    user = relationship("User", back_populates="analyses")


class FarmerRequest(Base):
    """
    Farmer analysis request submitted from /farmer page.
    Visible in admin dashboard under Demandes tab.
    """
    __tablename__ = "farmer_requests"

    id           = Column(Integer, primary_key=True, index=True)
    reference    = Column(String(20), unique=True, index=True)

    # Zone
    wilaya       = Column(String(100), nullable=False)
    commune      = Column(String(100))
    zone_type    = Column(String(20), nullable=False)
    coordinates  = Column(Text)
    area_ha      = Column(Float)
    lat          = Column(Float)
    lng          = Column(Float)

    # Farmer info
    full_name    = Column(String(200), nullable=False)
    phone        = Column(String(30),  nullable=False)
    email        = Column(String(200), nullable=False)
    crop         = Column(String(100), nullable=False)
    payment      = Column(String(30),  nullable=False)
    price_da     = Column(Float, default=4500.0)

    # Status
    status       = Column(String(20), default="pending")
    notes        = Column(Text)

    created_at   = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)