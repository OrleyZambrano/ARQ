# 🚀 Guía de Despliegue en Google Cloud Run

## Prerrequisitos completados ✅

- [x] Proyecto funcionando localmente
- [x] GitHub Actions workflows configurados
- [x] Dockerfiles optimizados para Cloud Run

## Pasos para el primer despliegue:

### 1. Configurar Google Cloud (una sola vez)

```bash
# Instalar gcloud CLI si no lo tienes
# https://cloud.google.com/sdk/docs/install

# Autenticarse
gcloud auth login

# Crear proyecto
gcloud projects create propfinder-prod --name="PropFinder"

# Seleccionar proyecto
gcloud config set project propfinder-prod

# Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Crear repositorio de imágenes
gcloud artifacts repositories create propfinder \
  --repository-format=docker \
  --location=us-central1
```

### 2. Configurar Workload Identity (una sola vez)

```bash
# Obtener PROJECT_NUMBER
gcloud projects describe propfinder-prod --format="value(projectNumber)"

# Crear pool de identidad
gcloud iam workload-identity-pools create "github-actions" \
  --project="propfinder-prod" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Crear proveedor OIDC
gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="propfinder-prod" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='OrleyZambrano/ARQ'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Crear service account
gcloud iam service-accounts create "github-actions-sa" \
  --project="propfinder-prod"

# Asignar permisos
gcloud projects add-iam-policy-binding propfinder-prod \
  --member="serviceAccount:github-actions-sa@propfinder-prod.iam.gserviceaccount.com" \
  --role="roles/run.developer"

gcloud projects add-iam-policy-binding propfinder-prod \
  --member="serviceAccount:github-actions-sa@propfinder-prod.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Permitir que GitHub Actions use el service account
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-sa@propfinder-prod.iam.gserviceaccount.com" \
  --project="propfinder-prod" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/attribute.repository/OrleyZambrano/ARQ"
```

### 3. Configurar GitHub Secrets

En GitHub: Settings → Secrets and variables → Actions

Agregar estos secrets:

- `WIF_PROVIDER`: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github
- `WIF_SERVICE_ACCOUNT`: github-actions-sa@propfinder-prod.iam.gserviceaccount.com
- `SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
- `SUPABASE_SERVICE_KEY`: Tu clave de servicio de Supabase

### 4. Primer despliegue

```bash
# Hacer cambio pequeño y push
git add .
git commit -m "feat: initial deploy to Cloud Run"
git push origin main
```

### 5. Ver el progreso

- Ve a GitHub → Actions para ver el progreso del despliegue
- Una vez completado, tendrás las URLs de tus servicios

## 🎯 URLs finales esperadas:

- Backend: https://propfinder-backend-xyz-uc.a.run.app
- Frontend: https://propfinder-frontend-xyz-uc.a.run.app
- API Docs: https://propfinder-backend-xyz-uc.a.run.app/api/docs

## 🔧 Configuración adicional después del primer deploy:

1. Agregar `BACKEND_URL` a los secrets de GitHub con la URL del backend
2. Re-deployar el frontend para que use la URL correcta del backend
