# Ransomware Detection System

AI-powered ransomware detection platform with a FastAPI backend and a modern React (Vite + Tailwind) dashboard. This repository is structured as a monorepo so both services can be deployed together (locally or on Render).

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, scikit-learn, SQLite/MySQL, Uvicorn
- **Frontend:** React 18, Vite 5, TailwindCSS, Axios, React Router
- **Other:** Python Dotenv, lucide-react icons, date-fns utilities

## Directory Layout
```
backend/   # FastAPI application, ML pipeline, database utilities
frontend/  # React single-page app served via Vite
database/  # SQL schemas, seed scripts, Mongo prototypes
```

## Getting Started Locally
1. **Clone repo & install tools**
   ```powershell
   git clone https://github.com/brookme1/ransomware-detection-system.git
   cd ransomware-detection-system
   ```
2. **Backend setup**
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   copy .env.example .env   # adjust secrets + DB settings
   python main.py
   ```
3. **Frontend setup (new terminal)**
   ```powershell
   cd frontend
   npm install --legacy-peer-deps
   copy .env.example .env   # point VITE_API_URL to backend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

## Environment Variables
| Location          | Key                   | Description                                                |
|-------------------|-----------------------|------------------------------------------------------------|
| `backend/.env`    | `SECRET_KEY`          | Required for session/security. Replace in production.      |
|                   | `DB_TYPE`             | `sqlite`, `mysql`, or `mongodb`.                           |
|                   | `SQLITE_PATH`         | Optional absolute path for SQLite DB file.                 |
|                   | `MYSQL_*` / `MONGODB_*`| Only used when those backends are selected.                |
|                   | `WEBHOOK_*`, `SMTP_*` | Optional alerting hooks.                                   |
|                   | `MODEL_PATH`          | Location of serialized ML model.                           |
| `frontend/.env`   | `VITE_API_URL`        | Base URL to the deployed backend API.                      |

`backend/.env.example` and `frontend/.env.example` are tracked so you can copy them without leaking secrets.

## Running Tests & Linters
```powershell
# Backend (from backend/)
pytest

# Frontend (from frontend/)
npm run lint
```

## Render Deployment
Render supports monorepos by letting each service point to a different root directory. You will typically create **two services**: one FastAPI web service and one static site.

### 1. Backend (FastAPI) — Render Web Service
- **Name:** `ransomware-api` (choose anything)
- **Root Directory:** `backend`
- **Runtime:** Python 3
- **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION=3.10.13`
  - `SECRET_KEY=<strong random value>`
  - `DB_TYPE=sqlite` (or `mysql`/`mongodb` if you provision those services)
  - `SQLITE_PATH=/data/ransomware.db` (only if you attach a Render disk)
  - Any alert/webhook credentials you plan to use
- **Persistent storage:** If you remain on SQLite, attach at least a 1 GB Render Disk mounted at `/data` and update `SQLITE_PATH` accordingly. Otherwise, point the app to a managed database and set the relevant environment variables.
- **Health check:** `/api/health`

### 2. Frontend (React) — Render Static Site
- **Name:** `ransomware-ui`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:** `VITE_API_URL=https://<backend-service>.onrender.com`
- Render automatically serves the static build and proxies API calls directly to the backend through your configured `VITE_API_URL`.

### Connecting the GitHub Repo
1. Commit everything locally and add the new remote:
   ```powershell
   git init
   git remote add origin https://github.com/brookme1/ransomware-detection-system.git
   git add .
   git commit -m "chore: prepare render deployment"
   git push -u origin main
   ```
2. In Render, create each service, select the `brookme1/ransomware-detection-system` repository, and choose the `main` branch.

## Additional Notes
- **Sensitive files ignored:** `.env`, virtual environments, uploaded files, SQLite databases, and build artifacts are excluded via the root `.gitignore` so they never reach GitHub.
- **Model file:** `backend/models/ransomware_detector.pkl` stays tracked because it is required for detection on every deployment. Replace it with your own model if needed.
- **SQLite in production:** SQLite is perfect for prototyping but not ideal for scale. Consider moving to Render PostgreSQL or another managed database and updating `DB_TYPE` + connection strings.

Feel free to open issues or discussions on GitHub if you need help enhancing the detector or adapting it to other hosting platforms.
