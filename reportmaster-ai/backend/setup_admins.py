import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def create_admin_user(email: str, password: str, full_name: str):
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env")
        return

    supabase: Client = create_client(url, key)

    print(f"Checking for user: {email}...")
    
    try:
        # Check if user exists
        # Note: admin.list_users() is the only way to check safely by email
        users = supabase.auth.admin.list_users()
        existing_user = next((u for u in users if u.email == email), None)

        if not existing_user:
            print(f"Creating new auth user: {email}...")
            auth_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user = auth_response.user
            print(f"User created with ID: {user.id}")
        else:
            user = existing_user
            print(f"User already exists with ID: {user.id}")

        # Update or create profile
        print(f"Setting role=admin and is_approved=True for {email}...")
        
        # We use upsert for the profile
        profile_data = {
            "id": user.id,
            "email": email,
            "full_name": full_name,
            "role": "admin",
            "is_approved": True
        }
        
        supabase.table("profiles").upsert(profile_data).execute()
        print(f"Success! {email} is now an approved admin.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Create the default admin users from README
    create_admin_user("admin@reportmaster.ai", "Admin@1234", "System Admin")
    create_admin_user("clumsypanda6o9@gmail.com", "ADMIN@1234", "Super Admin")
