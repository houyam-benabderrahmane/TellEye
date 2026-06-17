"""
Pydantic schemas for Institution, SoilMap, SeasonalUpdate, Report
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────
class InstitutionType(str, Enum):
    ministry          = "ministry"
    research_institute = "research_institute"
    wilaya            = "wilaya"
    agency            = "agency"
    other             = "other"

class InstitutionPlan(str, Enum):
    pilot    = "pilot"
    standard = "standard"
    national = "national"
    custom   = "custom"

class SeasonEnum(str, Enum):
    spring = "spring"
    summer = "summer"
    autumn = "autumn"
    winter = "winter"

class MapStatus(str, Enum):
    pending    = "pending"
    processing = "processing"
    ready      = "ready"
    failed     = "failed"

class UpdateStatus(str, Enum):
    scheduled  = "scheduled"
    processing = "processing"
    delivered  = "delivered"
    failed     = "failed"

class ReportType(str, Enum):
    quarterly = "quarterly"
    annual    = "annual"
    custom    = "custom"
    pilot     = "pilot"

class TrendEnum(str, Enum):
    improving = "improving"
    stable    = "stable"
    degrading = "degrading"
    unknown   = "unknown"


# ── Institution ────────────────────────────────────────────────
class InstitutionCreate(BaseModel):
    """Admin creates an institution + user account."""
    # User fields
    full_name:      str
    email:          EmailStr
    password:       str = Field(min_length=8)

    # Institution fields
    name:           str
    short_name:     Optional[str] = None
    type:           InstitutionType = InstitutionType.ministry
    contact_person: Optional[str] = None
    contact_email:  Optional[EmailStr] = None
    contact_phone:  Optional[str] = None

    # Subscription
    plan:           InstitutionPlan = InstitutionPlan.pilot
    wilaya_access:  List[str] = []       # [] = national access
    annual_fee_da:  Optional[float] = None
    contract_start: Optional[datetime] = None
    contract_end:   Optional[datetime] = None
    notes:          Optional[str] = None


class InstitutionUpdate(BaseModel):
    name:           Optional[str] = None
    plan:           Optional[InstitutionPlan] = None
    wilaya_access:  Optional[List[str]] = None
    is_active:      Optional[bool] = None
    annual_fee_da:  Optional[float] = None
    contract_end:   Optional[datetime] = None
    notes:          Optional[str] = None


class InstitutionOut(BaseModel):
    id:             int
    user_id:        int
    name:           str
    short_name:     Optional[str]
    type:           str
    plan:           str
    wilaya_access:  List[str]
    is_active:      bool
    contract_start: Optional[datetime]
    contract_end:   Optional[datetime]
    annual_fee_da:  Optional[float]
    created_at:     datetime

    class Config:
        from_attributes = True


# ── SoilMap ────────────────────────────────────────────────────
class SoilMapCreate(BaseModel):
    institution_id: int
    wilaya:         str
    season:         SeasonEnum
    year:           int
    quarter:        Optional[int] = None
    property_type:  str = "full"


class SoilMapOut(BaseModel):
    id:              int
    institution_id:  int
    wilaya:          str
    season:          str
    year:            int
    quarter:         Optional[int]
    property_type:   str

    # Stats
    soc_mean:        Optional[float]
    soc_min:         Optional[float]
    soc_max:         Optional[float]
    clay_mean:       Optional[float]
    ph_mean:         Optional[float]
    coverage_pct:    Optional[float]
    confidence_mean: Optional[float]

    # Files
    geotiff_path:    Optional[str]
    thumbnail_path:  Optional[str]
    geojson_path:    Optional[str]

    status:          str
    model_version:   Optional[str]
    created_at:      datetime

    class Config:
        from_attributes = True


# ── SeasonalUpdate ─────────────────────────────────────────────
class SeasonalUpdateOut(BaseModel):
    id:              int
    institution_id:  int
    wilaya:          str
    quarter:         int
    year:            int
    status:          str
    soc_change_pct:  Optional[float]
    trend:           Optional[str]
    change_notes:    Optional[str]
    scheduled_at:    Optional[datetime]
    delivered_at:    Optional[datetime]

    class Config:
        from_attributes = True


# ── PredictionHistory ──────────────────────────────────────────
class PredictionHistoryOut(BaseModel):
    id:              int
    institution_id:  int
    wilaya:          str
    commune:         Optional[str]
    latitude:        Optional[float]
    longitude:       Optional[float]

    soc_value:       Optional[float]
    soc_class:       Optional[str]
    clay_value:      Optional[float]
    ph_value:        Optional[float]
    texture_class:   Optional[str]
    confidence:      Optional[float]

    model_version:   Optional[str]
    request_type:    str
    created_at:      datetime

    class Config:
        from_attributes = True


# ── Report ─────────────────────────────────────────────────────
class ReportOut(BaseModel):
    id:               int
    institution_id:   int
    title:            Optional[str]
    wilaya:           Optional[str]
    report_type:      str
    quarter:          Optional[int]
    year:             Optional[int]
    pdf_path:         Optional[str]
    geotiff_path:     Optional[str]
    shp_path:         Optional[str]
    file_size_mb:     Optional[float]
    status:           str
    downloaded_count: int
    summary_stats:    Optional[dict]
    created_at:       datetime
    delivered_at:     Optional[datetime]

    class Config:
        from_attributes = True


# ── Dashboard summary (for overview page) ─────────────────────
class DashboardSummary(BaseModel):
    institution_name:   str
    plan:               str
    wilaya_access:      List[str]
    total_predictions:  int
    total_reports:      int
    total_maps:         int
    last_update:        Optional[datetime]
    contract_end:       Optional[datetime]
    pending_updates:    int
    recent_trend:       Optional[str]   # improving / stable / degrading