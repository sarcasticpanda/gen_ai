"""
ReportMaster AI — Auth Router
Handles user signup, login, and logout.
"""

from fastapi import APIRouter, HTTPException, Header
from models.schemas import UserSignup, UserLogin, AuthResponse, UserProfile
from models.database import supabase_admin, get_supabase_client
from services import supabase_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(data: UserSignup):
    """Register a new user. Creates auth user + profile with role=pending."""
    try:
        # Create auth user via Supabase
        auth_response = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
        })

        user = auth_response.user
        if not user:
            raise HTTPException(status_code=400, detail="Failed to create user account.")

        # Create profile (the handle_new_user trigger may also do this, but we ensure it)
        try:
            supabase_service.create_profile(
                user_id=str(user.id),
                email=data.email,
                full_name=data.full_name,
                role="pending",
            )
        except Exception as e:
            # Profile may already exist from trigger
            logger.info(f"Profile may already exist (trigger): {e}")
            # Update the full_name and ensure role is pending if trigger created it
            supabase_service.update_profile(str(user.id), {
                "full_name": data.full_name,
                "role": "pending",
                "is_approved": False
            })

        return {
            "message": "Account created successfully. Pending admin approval.",
            "user_id": str(user.id),
            "email": data.email,
        }

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "already" in error_msg.lower() or "duplicate" in error_msg.lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {error_msg}")


@router.post("/login")
async def login(data: UserLogin):
    """Login user and return JWT tokens + profile."""
    try:
        client = get_supabase_client()
        auth_response = client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })

        session = auth_response.session
        user = auth_response.user

        if not session or not user:
            raise HTTPException(status_code=401, detail="Invalid credentials.")

        # Get profile
        profile = supabase_service.get_profile(str(user.id))
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found.")

        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "user": profile,
        }

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed.")


@router.post("/logout")
async def logout():
    """Logout endpoint (client-side token removal)."""
    return {"message": "Logged out successfully."}
