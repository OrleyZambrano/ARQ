#!/bin/bash
# ================================
# COMANDOS PARA CONFIGURAR VARIABLES EN GOOGLE CLOUD RUN
# ================================

echo "🔧 Configurando variables de entorno en Google Cloud Run..."

# Variables de tus archivos .env
SUPABASE_URL="https://vxmpifukfohjafrbiqvw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDUwNDYsImV4cCI6MjA2OTM4MTA0Nn0.JPwFO4UL-LileKVD6JDVZc2RrfCFsK5KgKlS5CFkUPc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgwNTA0NiwiZXhwIjoyMDY5MzgxMDQ2fQ.VIESvnVaLFiVdnKT5fB2hhmhBKv683j33iJK_BtrwBg"

# Variables de PayPal - REEMPLAZA CON TUS VALORES REALES
PAYPAL_CLIENT_ID="SB_TU_CLIENT_ID_DE_SANDBOX_AQUI"
PAYPAL_CLIENT_SECRET="TU_CLIENT_SECRET_DE_SANDBOX_AQUI"
PAYPAL_MODE="sandbox"

echo "📡 Configurando Backend..."
gcloud run services update propfinder-backend \
  --region=europe-west1 \
  --update-env-vars="SUPABASE_URL=${SUPABASE_URL},SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY},PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID},PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET},PAYPAL_MODE=${PAYPAL_MODE},NODE_ENV=production"

echo "🌐 Configurando Frontend..."
gcloud run services update propfinder-frontend \
  --region=europe-west1 \
  --update-env-vars="VITE_SUPABASE_URL=${SUPABASE_URL},VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY},VITE_PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID},VITE_PAYPAL_MODE=${PAYPAL_MODE}"

echo "✅ Variables configuradas correctamente!"
