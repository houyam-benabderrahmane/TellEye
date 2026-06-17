import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _prep(password: str) -> str:
    # Hash to 64 chars to avoid bcrypt 72-byte limit
    return hashlib.sha256(password.encode()).hexdigest()

def hash_password(password: str) -> str:
    return pwd_context.hash(_prep(password))

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_prep(plain), hashed)

