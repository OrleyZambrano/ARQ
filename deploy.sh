#!/bin/bash

# ================================
# SCRIPT DE DEPLOYMENT PARA ARQ
# ================================

echo "🚀 Iniciando deployment de ARQ..."

# Verificar que estamos en la rama main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Error: Debes estar en la rama 'main' para hacer deployment"
  echo "   Rama actual: $BRANCH"
  exit 1
fi

# Verificar que no hay cambios sin commit
if ! git diff --quiet; then
  echo "❌ Error: Hay cambios sin commit"
  echo "   Commit tus cambios antes de hacer deployment:"
  echo "   git add ."
  echo "   git commit -m 'feat: ready for deployment'"
  exit 1
fi

# Mostrar información del commit
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)

echo "📝 Información del deployment:"
echo "   Commit: $COMMIT_HASH"
echo "   Mensaje: $COMMIT_MSG"
echo ""

# Confirmar deployment
read -p "¿Continuar con el deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Deployment cancelado"
  exit 1
fi

echo "🔄 Haciendo push para iniciar deployment..."

# Hacer push que trigger el workflow
git push origin main

echo ""
echo "✅ Push completado!"
echo ""
echo "📊 Monitorea el progreso en:"
echo "   https://github.com/OrleyZambrano/ARQ/actions"
echo ""
echo "⏱️  El deployment toma aproximadamente 5-10 minutos"
echo ""
echo "🎯 Una vez completado, tendrás:"
echo "   • Frontend: https://propfinder-frontend-xxx.a.run.app"
echo "   • Backend: https://propfinder-backend-xxx.a.run.app"
echo "   • API Docs: https://propfinder-backend-xxx.a.run.app/api"
echo ""
echo "🔗 Las URLs exactas aparecerán al final del workflow en GitHub Actions"
