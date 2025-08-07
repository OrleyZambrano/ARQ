# 🚀 PASOS PARA DESPLEGAR ARQ EN GOOGLE CLOUD RUN

## ✅ PASO 1: Configurar GitHub Secrets

Ve a tu repositorio GitHub: https://github.com/OrleyZambrano/ARQ

1. **Settings** → **Secrets and variables** → **Actions**
2. **Agregar estos secrets** (click "New repository secret"):

### Secrets requeridos:

```
SUPABASE_URL
Valor: https://vxmpifukfohjafrbiqvw.supabase.co

SUPABASE_ANON_KEY
Valor: [Ve a tu proyecto Supabase → Settings → API → anon/public key]

SUPABASE_SERVICE_ROLE_KEY
Valor: [Ve a tu proyecto Supabase → Settings → API → service_role key]

PAYPAL_CLIENT_ID
Valor: [Tu Client ID de PayPal Sandbox - ver instrucciones abajo]

PAYPAL_CLIENT_SECRET
Valor: [Tu Client Secret de PayPal Sandbox - ver instrucciones abajo]

PAYPAL_MODE
Valor: sandbox
```

### 🔥 **OBTENER CREDENCIALES DE PAYPAL SANDBOX:**

1. **Ve a PayPal Developer**: https://developer.paypal.com/
2. **Log in** con tu cuenta PayPal
3. **My Apps & Credentials** → **Sandbox**
4. **Create App**:
   - App Name: `ARQ-PropFinder-Sandbox`
   - Merchant: Selecciona tu cuenta sandbox
   - Features: Check ✅ **Accept payments**
5. **Copia las credenciales**:
   - **Client ID**: (público, va en frontend y backend)
   - **Client Secret**: (privado, solo backend)
6. **Importante**: ¡Estas son para SANDBOX, no producción!## ✅ PASO 2: Verificar configuración de Google Cloud

Tu proyecto ya está configurado:

- ✅ **Proyecto**: arq-final-468222
- ✅ **Región**: europe-west1
- ✅ **Workload Identity**: Configurado
- ✅ **Service Account**: github-actions-sa@arq-final-468222.iam.gserviceaccount.com

## ✅ PASO 3: Hacer push para deployar

```bash
# Desde la carpeta ARQ
git add .
git commit -m "feat: deploy to Cloud Run with frontend/backend separation"
git push origin main
```

## ✅ PASO 4: Monitorear el despliegue

1. **Ve a GitHub** → **Actions** → Ve el workflow corriendo
2. **El deploy toma ~5-10 minutos**
3. **Al finalizar verás**:
   - Frontend URL: https://propfinder-frontend-xxx.a.run.app
   - Backend URL: https://propfinder-backend-xxx.a.run.app
   - API Docs: https://propfinder-backend-xxx.a.run.app/api

## ✅ PASO 5: URLs finales

Una vez deployado, tendrás:

### 🌐 **Frontend (App principal)**

- URL: Se mostrará al final del workflow
- Contiene: React app con todas las páginas

### 🔧 **Backend (API)**

- URL: Se mostrará al final del workflow
- Endpoints: /api/properties, /health, etc.
- Docs: /api (Swagger UI)

### 📊 **Base de datos**

- Supabase: Ya está funcionando
- Funciones SQL: Ya creadas y funcionando

## 🎯 **Lo que incluye este deploy:**

- ✅ Sistema completo de propiedades
- ✅ Autenticación con Supabase
- ✅ Sistema de créditos funcionando
- ✅ PayPal integrado
- ✅ Dashboard de agentes
- ✅ Publicación de propiedades
- ✅ Panel administrativo

## 🚨 **Si hay errores:**

1. **Revisa GitHub Actions logs**
2. **Verifica que todos los secrets estén configurados**
3. **Checa que las claves de Supabase sean correctas**

## 📝 **Después del primer deploy:**

Tu aplicación estará live y funcionando completamente con:

- Registro/login de usuarios
- Convertirse en agente
- Comprar créditos con PayPal
- Publicar propiedades
- Dashboard funcional
