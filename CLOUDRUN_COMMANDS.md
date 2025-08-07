# 📋 COMANDOS PARA COPIAR/PEGAR EN GOOGLE CLOUD SHELL

## 🔧 **OPCIÓN 1: Configurar Backend**

```bash
gcloud run services update propfinder-backend \
  --region=europe-west1 \
  --update-env-vars="SUPABASE_URL=https://vxmpifukfohjafrbiqvw.supabase.co,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgwNTA0NiwiZXhwIjoyMDY5MzgxMDQ2fQ.VIESvnVaLFiVdnKT5fB2hhmhBKv683j33iJK_BtrwBg,PAYPAL_CLIENT_ID=SB_TU_CLIENT_ID_AQUI,PAYPAL_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI,PAYPAL_MODE=sandbox,NODE_ENV=production"
```

## 🌐 **OPCIÓN 2: Configurar Frontend**

```bash
gcloud run services update propfinder-frontend \
  --region=europe-west1 \
  --update-env-vars="VITE_SUPABASE_URL=https://vxmpifukfohjafrbiqvw.supabase.co,VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDUwNDYsImV4cCI6MjA2OTM4MTA0Nn0.JPwFO4UL-LileKVD6JDVZc2RrfCFsK5KgKlS5CFkUPc,VITE_PAYPAL_CLIENT_ID=SB_TU_CLIENT_ID_AQUI,VITE_PAYPAL_MODE=sandbox"
```

## 🎯 **PASOS PARA USAR:**

### **1. Obtener credenciales PayPal Sandbox:**

1. Ve a: https://developer.paypal.com/
2. Login → My Apps & Credentials → Sandbox
3. Create App: `ARQ-PropFinder-Sandbox`
4. Copia: Client ID y Client Secret

### **2. Reemplazar en comandos:**

- Reemplaza `SB_TU_CLIENT_ID_AQUI` con tu Client ID real
- Reemplaza `TU_CLIENT_SECRET_AQUI` con tu Client Secret real

### **3. Ejecutar comandos:**

```bash
# 1. Configura tu proyecto
gcloud config set project arq-final-468222

# 2. Autentica (si es necesario)
gcloud auth login

# 3. Ejecuta los comandos de arriba (con tus credenciales reales)
```

## 🚨 **IMPORTANTE:**

- ✅ **Primero obtén** las credenciales de PayPal
- ✅ **Reemplaza** SB_TU_CLIENT_ID_AQUI y TU_CLIENT_SECRET_AQUI
- ✅ **Ejecuta ambos** comandos (backend y frontend)
- ✅ **Verifica** que no hay errores

## 🔍 **Verificar configuración:**

```bash
# Ver variables del backend
gcloud run services describe propfinder-backend --region=europe-west1 --format="value(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)"

# Ver variables del frontend
gcloud run services describe propfinder-frontend --region=europe-west1 --format="value(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)"
```
