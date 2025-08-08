@echo off
echo 🧹 Limpiando repositorio ARQ...
echo.

REM Crear backup antes de limpiar
echo 📦 Creando backup...
git add -A
git commit -m "backup: before cleanup" 2>nul

echo.
echo 🗑️ Eliminando archivos innecesarios...

REM Eliminar documentación duplicada/obsoleta
del /f "CHECKLIST.md" 2>nul
del /f "CLOUD_RUN_DEPLOY.md" 2>nul
del /f "CLOUDRUN_COMMANDS.md" 2>nul
del /f "CONFIGURE_GITHUB_SECRETS.md" 2>nul
del /f "DEPLOY_GUIDE.md" 2>nul
del /f "DEPLOY_INSTRUCTIONS.md" 2>nul
del /f "DEPLOY_VISIT_SCHEDULING_SYSTEM.md" 2>nul
del /f "GITHUB_SECRETS.md" 2>nul
del /f "INSTRUCCIONES_PAYPAL_SETUP.md" 2>nul
del /f "PAYPAL_SANDBOX_SETUP.md" 2>nul
del /f "READY_TO_DEPLOY_COMMANDS.md" 2>nul

REM Eliminar archivos SQL de prueba y setup (ya no necesarios)
del /f "diagnostic-script.sql" 2>nul
del /f "fix-database-structure.sql" 2>nul
del /f "fix-functions-cascade.sql" 2>nul
del /f "fix-functions-with-permissions.sql" 2>nul
del /f "fix-visit-cancellation-policies.sql" 2>nul
del /f "limpiar-datos-prueba.sql" 2>nul
del /f "setup-complete-structure.sql" 2>nul
del /f "setup-paypal-and-free-publications.sql" 2>nul
del /f "setup-visit-scheduling-system.sql" 2>nul
del /f "simplified-fix.sql" 2>nul
del /f "test-consume-function.sql" 2>nul
del /f "test-functions.sql" 2>nul
del /f "test-visit-scheduling-system.sql" 2>nul
del /f "update-metrics-system.sql" 2>nul

REM Eliminar scripts de configuración duplicados
del /f "configure-cloudrun-vars.bat" 2>nul
del /f "configure-cloudrun-vars.sh" 2>nul
del /f "deploy.bat" 2>nul
del /f "deploy.sh" 2>nul
del /f "start-dev.bat" 2>nul
del /f "start-dev.sh" 2>nul
del /f "test-docker-build.bat" 2>nul
del /f "test-docker-build.sh" 2>nul

REM Eliminar archivos de configuración obsoletos
del /f "template-alternativo.yml" 2>nul
REM nginx-proxy.conf NO se elimina - es necesario para Dockerfile
del /f "error-consola.txt" 2>nul

REM Eliminar documentación técnica obsoleta
del /f "FUNCIONALIDAD_AGENDAMIENTO_VISITAS.md" 2>nul
del /f "FUNCIONALIDAD_GEOESPACIAL_COMPLETA.md" 2>nul
del /f "LOGICA_DE_NEGOCIO.md" 2>nul
del /f "PROBLEMA_RESUELTO_PROPERTYDETAIL.md" 2>nul
del /f "PROYECTO_ESTRUCTURA_COMPLETA.md" 2>nul
del /f "PROYECTO_PROPFINDER_ESPECIFICACIONES.md" 2>nul
del /f "SISTEMA_MEJORADO_COMPLETO.md" 2>nul
del /f "SOLUCION_ERRORES_AUTENTICACION.md" 2>nul
del /f "SOLUCION_PROBLEMA_PUBLICACIONES.md" 2>nul

echo.
echo ✅ Archivos eliminados exitosamente
echo.

REM Mostrar archivos restantes importantes
echo 📁 Archivos importantes que se mantienen:
echo    - README.md (documentación principal)
echo    - Dockerfile (imagen principal)
echo    - nginx-proxy.conf (configuración proxy nginx)
echo    - SUPABASE_DATABASE_SETUP.sql (setup de BD principal)
echo    - .github/ (workflows de CI/CD)
echo    - frontend/ (código fuente)
echo    - backend/ (código fuente)
echo    - shared/ (tipos compartidos)
echo.

echo 🎯 Repositorio limpio y listo para deployment
echo.
echo 📋 Próximos pasos:
echo    1. Revisar los cambios: git status
echo    2. Hacer commit: git add . && git commit -m "cleanup: remove unnecessary files"
echo    3. Push para deploy: git push origin main
echo.
pause
