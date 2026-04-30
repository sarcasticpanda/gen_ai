"""
ReportMaster AI — Users Router
Current user profile endpoints.
"""

from fastapi import APIRouter, HTTPException, Header
from models.database import supabase_admin
from services import supabase_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["users"])


def get_current_user(authorization: str = Header(...)) -> dict:
    """Extract and validate user from JWT token.

    The frontend sends: Authorization: Bearer <supabase_access_token>
    We verify it with Supabase and return the user profile.
    """
    try:
        token = authorization.replace("Bearer ", "").strip()
        if not token:
            raise HTTPException(status_code=401, detail="No token provided.")

        # Verify token with Supabase
        user_response = supabase_admin.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")

        # Get profile from our profiles table
        profile = supabase_service.get_profile(str(user.id))
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found.")

        return profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")


@router.get("/me")
async def get_me(current_user: dict = None, authorization: str = Header(...)):
    """Get current user's profile."""
    user = get_current_user(authorization)
    return {"user": user}


@router.patch("/me")
async def update_me(updates: dict, authorization: str = Header(...)):
    """Update current user's profile (limited fields)."""
    user = get_current_user(authorization)

    allowed_fields = {"full_name"}
    filtered = {k: v for k, v in updates.items() if k in allowed_fields}

    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields to update.")

    result = supabase_service.update_profile(user["id"], filtered)
    return {"user": result}
