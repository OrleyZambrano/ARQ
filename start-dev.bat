@echo off
REM Script para iniciar todo el proyecto PropFinder en Windows

echo 🚀 Iniciando PropFinder...

REM Compilar shared
echo 📦 Compilando shared...
cd shared
call npm run build
cd ..

REM Iniciar backend
echo 🔧 Iniciando Backend (puerto 3001)...
cd backend
start "PropFinder Backend" cmd /k "npm run start:dev"
cd ..

REM Esperar un poco
timeout /t 3 /nobreak > nul

REM Iniciar frontend
echo 🎨 Iniciando Frontend (puerto 3000)...
cd frontend
start "PropFinder Frontend" cmd /k "npm run dev"
cd ..

echo ✅ PropFinder iniciado!
echo 🔧 Backend: http://localhost:3001
echo 🎨 Frontend: http://localhost:3000
echo 📚 API Docs: http://localhost:3001/api/docs

pause
