from pydantic import BaseModel
from typing import Optional


class PointPredictionRequest(BaseModel):
    latitude:       float
    longitude:      float
    wilaya:         Optional[str] = None
    institution_id: Optional[int] = None


class PointPredictionResponse(BaseModel):
    latitude:      float
    longitude:     float
    wilaya:        Optional[str]
    soc_value:     float
    soc_class:     str
    clay_value:    float
    ph_value:      float
    texture_class: str
    confidence:    float
    model_version: str
    disclaimer:    str