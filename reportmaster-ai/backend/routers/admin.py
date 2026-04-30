"""
ReportMaster AI — Admin Router
User management, approvals, and analytics. Admin-only endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from starlette.concurrency import run_in_threadpool
from services import supabase_service
from routers.users import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure the user is an admin."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


@router.get("/users/pending")
async def list_pending_users(admin: dict = Depends(require_admin)):
    """List all users awaiting approval."""
    users = await run_in_threadpool(supabase_service.list_pending_users)
    return {"users": users, "count": len(users)}


@router.post("/users/{user_id}/approve")
async def approve_user(user_id: str, admin: dict = Depends(require_admin)):
    """Approve a pending user."""
    profile = await run_in_threadpool(supabase_service.get_profile, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found.")

    result = await run_in_threadpool(supabase_service.approve_user, user_id)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to approve user.")

    return {"message": f"User {profile.get('email', user_id)} approved.", "user": result}


@router.post("/users/{user_id}/reject")
async def reject_user(user_id: str, admin: dict = Depends(require_admin)):
    """Reject and delete a pending user."""
    profile = await run_in_threadpool(supabase_service.get_profile, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found or already deleted.")

    success = await run_in_threadpool(supabase_service.reject_user, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to reject user.")

    return {"message": f"User {profile.get('email', user_id)} rejected and removed."}


@router.get("/users/all")
async def list_all_users(admin: dict = Depends(require_admin)):
    """List all users."""
    users = await run_in_threadpool(supabase_service.list_all_users)
    return {"users": users, "count": len(users)}


@router.delete("/users/{user_id}")
async def remove_user(user_id: str, admin: dict = Depends(require_admin)):
    """Remove a user entirely."""
    success = await run_in_threadpool(supabase_service.delete_user, user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user.")
    return {"message": "User removed successfully."}


@router.get("/analytics")
async def get_analytics(
    admin: dict = Depends(require_admin),
    period: str = Query("7d", pattern="^(24h|7d|30d)$"),
):
    """Get system analytics."""
    analytics = await run_in_threadpool(supabase_service.get_analytics, period)
    return analytics
