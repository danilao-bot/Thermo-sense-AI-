@echo off
echo ========================================================
echo        THERMOSENSE - Starting Dev Environment
echo ========================================================
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "ThermoSense Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Next.js Frontend on http://localhost:3001 ...
start "ThermoSense Frontend" cmd /k "cd frontend && npx next dev -p 3001"

echo.
echo Both servers have been launched in separate terminal windows:
echo   - Backend:  http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/docs)
echo   - Frontend: http://localhost:3001
echo ========================================================
