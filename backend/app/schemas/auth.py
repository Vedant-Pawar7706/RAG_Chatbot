from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=4, description="User password")


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full name")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=4, description="User password")
    role: Optional[str] = Field(default="Researcher", description="User role or title")


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    plan: str = "Enterprise Pro"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
