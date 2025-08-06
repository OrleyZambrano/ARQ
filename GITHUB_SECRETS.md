# GitHub Secrets que necesitas configurar en tu repositorio

## Workload Identity Federation

WIF_PROVIDER=projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github
WIF_SERVICE_ACCOUNT=github-actions-sa@propfinder-prod.iam.gserviceaccount.com

## Supabase Configuration

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_supabase_service_key_aqui

## Backend URL (se genera después del primer deploy del backend)

BACKEND_URL=https://propfinder-backend-xyz-uc.a.run.app

## Notas:

# - Reemplaza "123456789" con tu PROJECT_NUMBER de Google Cloud

# - Reemplaza las URLs y keys de Supabase con las reales

# - BACKEND_URL se configura después del primer deploy del backend
