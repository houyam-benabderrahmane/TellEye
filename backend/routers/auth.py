"""
TellEye — Auth Router
======================
Endpoints:
  POST /api/auth/login       → email + password → JWT token
  POST /api/auth/logout      → client-side only (clears token)
  GET  /api/auth/me          → get current user from token
  POST /api/auth/refresh     → refresh token before expiry
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from db import get_db
import models
from utils import verify_password
from config import settings

router = APIRouter()

# OAuth2 scheme — token expected in Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Pydantic schemas ───────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    token_type:    str = "bearer"
    role:          str
    full_name:     str
    institution_id: Optional[int] = None   # only for institutions
    redirect_to:   str                     # where to send the user


class UserOut(BaseModel):
    id:             int
    full_name:      str
    email:          str
    role:           str
    plan:           str
    is_active:      bool
    institution_id: Optional[int] = None

    class Config:
        from_attributes = True


# ── JWT helpers ────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises HTTPException if invalid."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_redirect_url(role: str) -> str:
    """Return the dashboard URL based on user role."""
    return {
        "admin":       "/admin",
        "institution": "/gov/dashboard",
        "farmer":      "/dashboard",
        "researcher":  "/dashboard",
    }.get(role, "/")


# ── Dependency: get current user from token ────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db)
) -> models.User:
    """FastAPI dependency — injects the current user from JWT."""
    payload = decode_token(token)
    user_id: int = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide — utilisateur introuvable."
        )
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé.")
    return user


async def require_admin(current_user: models.User = Depends(get_current_user)):
    """Dependency — only allows admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs TellEye."
        )
    return current_user


async def require_institution(current_user: models.User = Depends(get_current_user)):
    """Dependency — only allows institution role."""
    if current_user.role not in ("institution", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux institutions."
        )
    return current_user


# ══════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════

@router.post("/login", response_model=TokenResponse, summary="Login — get JWT token")
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Accepts email + password.
    Returns a JWT token + role + redirect URL.

    Used by:
      - /gov/login      → institutions
      - /admin/login    → admin (future)
      - /login          → farmers / researchers
    """
    # Find user
    user = db.query(models.User).filter(
        models.User.email == payload.email.lower().strip()
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Contactez l'équipe TellEye."
        )

    # Get institution_id if applicable
    institution_id = None
    if user.role == "institution" and user.institution:
        institution_id = user.institution.id
        if not user.institution.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Contrat institution expiré ou inactif."
            )

    # Create JWT token
    token_data = {
        "sub":            str(user.id),
        "role":           user.role,
        "email":          user.email,
        "institution_id": institution_id,
    }
    access_token = create_access_token(token_data)

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    return TokenResponse(
        access_token   = access_token,
        role           = user.role,
        full_name      = user.full_name,
        institution_id = institution_id,
        redirect_to    = get_redirect_url(user.role),
    )


@router.post("/login/form", summary="Login via form (OAuth2 standard)")
async def login_form(
    form: OAuth2PasswordRequestForm = Depends(),
    db:   Session = Depends(get_db)
):
    """Standard OAuth2 form login — used by FastAPI /docs Authorize button."""
    user = db.query(models.User).filter(
        models.User.email == form.username.lower().strip()
    ).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect."
        )
    token = create_access_token({
        "sub":  str(user.id),
        "role": user.role,
    })
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut, summary="Get current user")
async def get_me(current_user: models.User = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    institution_id = None
    if current_user.institution:
        institution_id = current_user.institution.id
    return {
        **current_user.__dict__,
        "institution_id": institution_id,
    }


@router.post("/refresh", summary="Refresh JWT token")
async def refresh_token(current_user: models.User = Depends(get_current_user)):
    """Issues a new token for a still-valid session."""
    institution_id = None
    if current_user.institution:
        institution_id = current_user.institution.id

    new_token = create_access_token({
        "sub":            str(current_user.id),
        "role":           current_user.role,
        "email":          current_user.email,
        "institution_id": institution_id,
    })
    return {
        "access_token": new_token,
        "token_type":   "bearer",
        "role":         current_user.role,
        "redirect_to":  get_redirect_url(current_user.role),
    }


@router.post("/logout", summary="Logout (client-side)")
async def logout():
    """
    JWT is stateless — logout is handled client-side by deleting the token.
    This endpoint just confirms the action.
    """
