# Running ReportMaster AI

Follow these instructions to run the project locally.

## Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase account (see `.env` files)

## 1. Run the Backend
The backend is a FastAPI application.

```powershell
cd backend
# Create venv if not exists
# python -m venv venv

# Install dependencies (ensure venv is used)
.\venv\Scripts\pip.exe install -r requirements.txt

# Run the server using venv's uvicorn directly
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```
The backend will be available at `http://localhost:8000`.

## 2. Run the Frontend
The frontend is a Vite + React application.

```powershell
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Admin Credentials
Use these credentials to log in as an administrator:


- **Email:** `admin@reportmaster.ai`
- **Password:** `Admin@1234`


