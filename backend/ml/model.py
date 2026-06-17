"""
TellEye — DANN Model Inference
================================
Architecture: CDAN Dual Discriminator (from Lastmodel.ipynb)
Input:  12 Sentinel-2 bands [B1,B2,B3,B4,B5,B6,B7,B8,B8A,B9,B11,B12]
Output: SOC (g/kg) — mineral or organic regime via router
R²:     0.935 (test set)
"""

import os
import numpy as np
import joblib
import torch
import torch.nn as nn
import torch.nn.functional as F

# ── Constants (from training notebook) ────────────────────────
BANDS       = ["B1","B2","B3","B4","B5","B6","B7","B8","B8A","B9","B11","B12"]
THRESHOLD   = 7.0          # mineral / organic boundary (log1p space)
SOC_MAX     = 150.0        # clip ceiling
LOG1P_MAX   = float(np.log1p(SOC_MAX))
ROUTER_TEMP = 0.7          # router temperature at inference
DEVICE      = torch.device("cpu")

# ── Model paths ────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "..", "storage", "models", "best_da_model.pt")
SCALER_PATH = os.path.join(BASE_DIR, "..", "storage", "models", "scaler.pkl")


# ══════════════════════════════════════════════════════════════
#  MODEL ARCHITECTURE  (exact copy from training notebook)
# ══════════════════════════════════════════════════════════════

class Encoder(nn.Module):
    def __init__(self, in_dim=12):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 256), nn.ReLU(), nn.BatchNorm1d(256), nn.Dropout(0.3),
            nn.Linear(256, 512),    nn.ReLU(), nn.BatchNorm1d(512), nn.Dropout(0.3),
            nn.Linear(512, 256),    nn.ReLU(), nn.BatchNorm1d(256), nn.Dropout(0.3),
            nn.Linear(256, 128),    nn.ReLU(), nn.BatchNorm1d(128),
        )
    def forward(self, x): return self.net(x)


class RegressionHead(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 1))
    def forward(self, x): return self.net(x)


class RegimeRouter(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 1))
    def forward(self, x, temp=1.0):
        return torch.sigmoid(self.net(x) / temp)


class ProjectionHead(nn.Module):
    def __init__(self, in_dim=128, out_dim=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128), nn.BatchNorm1d(128), nn.ReLU(),
            nn.Linear(128, out_dim))
    def forward(self, z):
        return F.normalize(self.net(z), dim=1)


class DANNModel(nn.Module):
    def __init__(self, in_dim=12):
        super().__init__()
        self.encoder  = Encoder(in_dim)
        self.head_min = RegressionHead()
        self.head_org = RegressionHead()
        self.router   = RegimeRouter()
        self.proj     = ProjectionHead()

    def forward(self, x, temp=1.0):
        z = self.encoder(x)
        return self.head_min(z), self.head_org(z), self.router(z, temp), z

    def encode(self, x):
        return self.encoder(x)


# ══════════════════════════════════════════════════════════════
#  MODEL LOADER  (singleton — loaded once at startup)
# ══════════════════════════════════════════════════════════════

_model  = None
_scaler = None


def load_model():
    """Load model + scaler once, cache globally."""
    global _model, _scaler

    if _model is not None:
        return _model, _scaler

    # ── Load scaler ───────────────────────────────────────────
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(
            f"Scaler not found at {SCALER_PATH}\n"
            "Put scaler.pkl in backend/storage/models/"
        )
    _scaler = joblib.load(SCALER_PATH)

    # ── Load model ────────────────────────────────────────────
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}\n"
            "Put best_da_model.pt in backend/storage/models/"
        )

    _model = DANNModel(in_dim=12)
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    _model.load_state_dict(state_dict)
    _model.eval()
    _model.to(DEVICE)

    print(f"TellEye DANN model loaded — R²=0.935")
    return _model, _scaler


# ══════════════════════════════════════════════════════════════
#  PREDICTION FUNCTION
# ══════════════════════════════════════════════════════════════

@torch.no_grad()
def predict_soc(band_values: list[float]) -> dict:
    """
    Predict SOC from 12 Sentinel-2 band values.

    Parameters
    ----------
    band_values : list of 12 floats
        Raw reflectance values for bands:
        [B1, B2, B3, B4, B5, B6, B7, B8, B8A, B9, B11, B12]

    Returns
    -------
    dict with:
        soc_value   : float  — predicted SOC in g/kg
        soc_class   : str    — 'mineral' | 'organic'
        regime_prob : float  — probability of organic regime (0-1)
        confidence  : float  — model confidence (0-1)
        model_version: str
    """
    model, scaler = load_model()

    if len(band_values) != 12:
        raise ValueError(f"Expected 12 band values, got {len(band_values)}")

    # ── Preprocess ────────────────────────────────────────────
    X_raw = np.array(band_values, dtype=np.float32).reshape(1, -1)
    X_sc  = scaler.transform(X_raw).astype(np.float32)
    x_t   = torch.tensor(X_sc, device=DEVICE)

    # ── Inference ─────────────────────────────────────────────
    pm, po, pi, _ = model(x_t, temp=ROUTER_TEMP)

    # Clamp predictions to valid log1p range
    pm = pm.clamp(0, LOG1P_MAX)
    po = po.clamp(0, LOG1P_MAX)

    pi_val = pi.squeeze().item()    # organic probability (0=mineral, 1=organic)

    # Route: mineral if pi < 0.5, organic otherwise
    if pi_val < 0.5:
        soc_log = pm.squeeze().item()
        regime  = "mineral"
    else:
        soc_log = po.squeeze().item()
        regime  = "organic"

    # Inverse log1p transform → actual SOC in g/kg
    soc_value = float(np.clip(np.expm1(soc_log), 0, SOC_MAX))

    # Confidence: how far router is from 0.5 (certain about regime)
    confidence = float(abs(pi_val - 0.5) * 2)  # 0=uncertain, 1=certain

    # SOC quality class
    if soc_value >= 20:
        soc_class = "high"
    elif soc_value >= 5:
        soc_class = "medium"
    else:
        soc_class = "low"

    return {
        "soc_value":    round(soc_value, 3),
        "soc_class":    soc_class,
        "regime":       regime,
        "regime_prob":  round(pi_val, 4),
        "confidence":   round(confidence, 4),
        "model_version": "dann_cdan_v1",
        "r2":           0.935,
    }


@torch.no_grad()
def predict_batch(band_matrix: list[list[float]]) -> list[dict]:
    """
    Predict SOC for multiple points at once.

    Parameters
    ----------
    band_matrix : list of N lists of 12 floats

    Returns
    -------
    list of N prediction dicts
    """
    model, scaler = load_model()

    X_raw = np.array(band_matrix, dtype=np.float32)
    X_sc  = scaler.transform(X_raw).astype(np.float32)
    x_t   = torch.tensor(X_sc, device=DEVICE)

    pm, po, pi, _ = model(x_t, temp=ROUTER_TEMP)
    pm = pm.clamp(0, LOG1P_MAX)
    po = po.clamp(0, LOG1P_MAX)

    results = []
    for i in range(len(band_matrix)):
        pi_val = pi[i].item()
        if pi_val < 0.5:
            soc_log = pm[i].item()
            regime  = "mineral"
        else:
            soc_log = po[i].item()
            regime  = "organic"

        soc_value  = float(np.clip(np.expm1(soc_log), 0, SOC_MAX))
        confidence = float(abs(pi_val - 0.5) * 2)

        if soc_value >= 20:
            soc_class = "high"
        elif soc_value >= 5:
            soc_class = "medium"
        else:
            soc_class = "low"

        results.append({
            "soc_value":    round(soc_value, 3),
            "soc_class":    soc_class,
            "regime":       regime,
            "regime_prob":  round(pi_val, 4),
            "confidence":   round(confidence, 4),
            "model_version": "dann_cdan_v1",
        })

    return results