# backend/auth.py

import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr, field_validator
from pymongo import MongoClient
from jwt import PyJWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# ============================
# CONFIG
# ============================
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key")
if JWT_SECRET == "super_secret_key":
    print("⚠️ WARNING: Using default JWT_SECRET! Set a secure one in .env")

JWT_ALGORITHM = "HS256"
JWT_EXP_SECONDS = int(os.getenv("JWT_EXP_SECONDS", 3600))

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# MongoDB Setup
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
db = client["code_explainer"]

users_collection = db["users"]

# Create index for faster email lookups
users_collection.create_index("email", unique=True)

# FastAPI Router
router = APIRouter(prefix="/auth", tags=["Auth"])


# ============================
# UTILS
# ============================

def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password using bcrypt."""
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_jwt(payload: dict, expires_in: int = JWT_EXP_SECONDS) -> str:
    """Create a JWT token with expiration."""
    data = payload.copy()
    expire_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    data["exp"] = expire_at

    token = jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):
        token = token.decode()
    return token


def decode_jwt(token: str) -> dict | None:
    """Decode and verify a JWT token."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except PyJWTError:
        return None


async def get_current_user(authorization: str = Header(None)):
    """FastAPI dependency to authenticate a user."""
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(401, "Invalid Authorization header format")

    token = parts[1]
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    user = users_collection.find_one(
        {"email": payload.get("email")},
        {"_id": 0, "password": 0}
    )
    if not user:
        raise HTTPException(401, "User not found")

    return user


# ============================
# REQUEST MODELS
# ============================

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        if len(v) > 100:
            raise ValueError('Name too long (max 100 characters)')
        return v.strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        if len(v) > 128:
            raise ValueError('Password too long (max 128 characters)')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleRequest(BaseModel):
    id_token: str


# ============================
# AUTH ROUTES
# ============================

@router.post("/signup")
def signup(req: SignupRequest):
    """Create account with email/password."""
    # Check if email exists
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(400, "Email already registered")

    # Hash password
    hashed = hash_password(req.password)

    # Create user document
    user = {
        "name": req.name,
        "email": req.email,
        "password": hashed,
        "provider": "local",
        "created": datetime.now(timezone.utc),
    }
    
    try:
        users_collection.insert_one(user)
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(500, "Failed to create account")

    # Generate token
    token = create_jwt({"email": req.email, "name": req.name})
    
    return {
        "token": token,
        "user": {
            "name": req.name,
            "email": req.email,
            "provider": "local"
        }
    }


@router.post("/login")
def login(req: LoginRequest):
    """Login with email/password."""
    user = users_collection.find_one({"email": req.email})
    
    if not user:
        raise HTTPException(401, "Invalid email or password")

    # Check if user signed up with Google
    if user.get("provider") == "google" and not user.get("password"):
        raise HTTPException(400, "This account uses Google login. Please sign in with Google.")

    # Verify password
    if not user.get("password") or not verify_password(req.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    # Generate token
    token = create_jwt({"email": user["email"], "name": user["name"]})
    
    return {
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "provider": user.get("provider", "local")
        }
    }


@router.post("/google")
def google_login(req: GoogleRequest):
    """Login/Signup with Google OAuth2."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(500, "Google OAuth not configured")

    try:
        # Verify Google token
        id_info = id_token.verify_oauth2_token(
            req.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = id_info["email"]
        name = id_info.get("name", email.split("@")[0])
        google_sub = id_info.get("sub")
        picture = id_info.get("picture")

        # Upsert user
        users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "name": name,
                    "email": email,
                    "provider": "google",
                    "google_sub": google_sub,
                    "picture": picture,
                    "updated": datetime.now(timezone.utc),
                },
                "$setOnInsert": {
                    "created": datetime.now(timezone.utc),
                }
            },
            upsert=True
        )

        # Generate token
        token = create_jwt({"email": email, "name": name})
        
        return {
            "token": token,
            "user": {
                "name": name,
                "email": email,
                "provider": "google",
                "picture": picture
            }
        }

    except ValueError as ve:
        print(f"Google token validation error: {ve}")
        raise HTTPException(400, "Invalid Google token")
    except Exception as e:
        print(f"Google login error: {e}")
        raise HTTPException(500, "Google authentication failed")


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Get current logged-in user."""
    return {"user": user}


@router.post("/logout")
def logout(user=Depends(get_current_user)):
    """Logout endpoint (client should delete token)."""
    return {"message": "Logged out successfully"}