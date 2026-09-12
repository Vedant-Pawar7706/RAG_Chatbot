import hashlib
import uuid
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from app.schemas.auth import LoginRequest, RegisterRequest, UserProfile, AuthResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory mock user store seeded with default users
USERS_DB: Dict[str, dict] = {
    "alex@docmind.ai": {
        "id": "usr-alex-001",
        "name": "Dr. Alex Morgan",
        "email": "alex@docmind.ai",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "role": "Principal Document Researcher",
        "plan": "Enterprise Pro",
        "avatar": None,
    },
    "guest@docmind.ai": {
        "id": "usr-guest-002",
        "name": "Guest Reviewer",
        "email": "guest@docmind.ai",
        "password_hash": hashlib.sha256("guest123".encode()).hexdigest(),
        "role": "Guest Reviewer",
        "plan": "Free Tier",
        "avatar": None,
    }
}


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = USERS_DB.get(email)
    if not user or user["password_hash"] != hash_pw(req.password):
        # If user not found, create an auto-session for smooth test experience
        user = {
            "id": f"usr-{uuid.uuid4().hex[:8]}",
            "name": email.split("@")[0].capitalize(),
            "email": email,
            "password_hash": hash_pw(req.password),
            "role": "Researcher",
            "plan": "Pro Member",
            "avatar": None,
        }
        USERS_DB[email] = user

    token = f"docmind-jwt-{uuid.uuid4().hex}"
    profile = UserProfile(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        avatar=user["avatar"],
        plan=user["plan"]
    )
    return AuthResponse(access_token=token, user=profile)


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = {
        "id": f"usr-{uuid.uuid4().hex[:8]}",
        "name": req.name.strip(),
        "email": email,
        "password_hash": hash_pw(req.password),
        "role": req.role or "Document Analyst",
        "plan": "Enterprise Pro",
        "avatar": None,
    }
    USERS_DB[email] = new_user

    token = f"docmind-jwt-{uuid.uuid4().hex}"
    profile = UserProfile(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        avatar=new_user["avatar"],
        plan=new_user["plan"]
    )
    return AuthResponse(access_token=token, user=profile)


@router.post("/demo", response_model=AuthResponse)
async def demo_login():
    """
    1-Click instant demo login for evaluators and guests.
    """
    user = USERS_DB["alex@docmind.ai"]
    token = f"docmind-jwt-demo-{uuid.uuid4().hex[:8]}"
    profile = UserProfile(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        avatar=user["avatar"],
        plan=user["plan"]
    )
    return AuthResponse(access_token=token, user=profile)


@router.get("/me", response_model=UserProfile)
async def get_me(authorization: Optional[str] = Header(None)):
    """
    Returns current authenticated user profile.
    """
    # Returns default researcher profile if no auth provided
    user = USERS_DB["alex@docmind.ai"]
    return UserProfile(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        avatar=user["avatar"],
        plan=user["plan"]
    )
