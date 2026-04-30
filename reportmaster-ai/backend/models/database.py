"""
ReportMaster AI — Database Client
Supabase client initialization (anon + service_role).
"""

from supabase import create_client, Client
from config import settings


def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for user-scoped RLS operations)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_supabase_admin() -> Client:
    """Get Supabase client with service_role key (bypasses RLS)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# Singleton admin client for server-side operations
supabase_admin: Client = get_supabase_admin()
