@echo off
REM ================================
REM SCRIPT DE DEPLOYMENT PARA ARQ (Windows)
REM ================================

echo 🚀 Iniciando deployment de ARQ...

REM Verificar que estamos en la rama main
for /f "tokens=*" %%i in ('git branch --show-current') do set BRANCH=%%i
if not "%BRANCH%"=="main" (
    echo ❌ Error: Debes estar en la rama 'main' para hacer deployment
    echo    Rama actual: %BRANCH%
    pause
    exit /b 1
)

REM Verificar que no hay cambios sin commit
git diff --quiet >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Hay cambios sin commit
    echo    Commit tus cambios antes de hacer deployment:
    echo    git add .
    echo    git commit -m "feat: ready for deployment"
    pause
    exit /b 1
)

REM Mostrar información del commit
for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do set COMMIT_HASH=%%i
for /f "tokens=*" %%i in ('git log -1 --pretty^=%%B') do set COMMIT_MSG=%%i

echo.
echo 📝 Información del deployment:
echo    Commit: %COMMIT_HASH%
echo    Mensaje: %COMMIT_MSG%
echo.

REM Confirmar deployment
set /p CONFIRM="¿Continuar con el deployment? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Deployment cancelado
    pause
    exit /b 1
)

echo 🔄 Haciendo push para iniciar deployment...

REM Hacer push que trigger el workflow
git push origin main

echo.
echo ✅ Push completado!
echo.
echo 📊 Monitorea el progreso en:
echo    https://github.com/OrleyZambrano/ARQ/actions
echo.
echo ⏱️  El deployment toma aproximadamente 5-10 minutos
echo.
echo 🎯 Una vez completado, tendrás:
echo    • Frontend: https://propfinder-frontend-xxx.a.run.app
echo    • Backend: https://propfinder-backend-xxx.a.run.app
echo    • API Docs: https://propfinder-backend-xxx.a.run.app/api
echo.
echo 🔗 Las URLs exactas aparecerán al final del workflow en GitHub Actions
echo.
pause
