# THERMOSENSE - Run Backend and Frontend Simultaneously
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       THERMOSENSE - Starting Dev Environment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3001 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npx next dev -p 3001"

Write-Host ""
Write-Host "Both servers are launching in separate windows:" -ForegroundColor Yellow
Write-Host "  - Backend API:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor White
Write-Host "  - Frontend App: http://localhost:3001" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
