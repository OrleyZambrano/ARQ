# 📋 COMANDOS LISTOS CON TUS CREDENCIALES REALES

## 🔧 **COMANDO PARA GOOGLE CLOUD RUN (Backend):**

```bash
gcloud run services update propfinder-app \
  --region=europe-west1 \
  --set-env-vars="SUPABASE_URL=https://vxmpifukfohjafrbiqvw.supabase.co,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgwNTA0NiwiZXhwIjoyMDY5MzgxMDQ2fQ.VIESvnVaLFiVdnKT5fB2hhmhBKv683j33iJK_BtrwBg,PAYPAL_CLIENT_ID=AbYKlb2RXOBy0HDMyt1cB76UTSN3cX8_28MZpLYEaqnATydf3zLrB8Ig550fQDB1aUFeo_Uz3f-s4Us5,PAYPAL_CLIENT_SECRET=EJS7GBQIq_vX91BF8GdeveQ3eZ4QgEeZUCeneaUb6aZpjKVMyl8W60_y_LaOuqgIV_YYcTwGmEO5Neaa,PAYPAL_MODE=sandbox,NODE_ENV=production"
```

## ✅ **TODAS LAS CREDENCIALES CONFIGURADAS**

PayPal Sandbox ahora completamente configurado con:

### **Opción 1: Buscar en PayPal Developer**

1. Ve a: https://developer.paypal.com/
2. Login → My Apps & Credentials → Sandbox
3. Busca tu app existente con Client ID: `AbYKlb2RXOBy0HDMyt1cB76UTSN3cX8_28MZpLYEaqnATydf3zLrB8Ig550fQDB1aUFeo_Uz3f-s4Us5`
4. Copia el Client Secret

### **Opción 2: Crear nueva app (si no encuentras la original)**

1. Create App en PayPal Developer
2. Copia tanto Client ID como Client Secret
3. Actualiza también el código en PaymentPlansPage.tsx

## 🎯 **COMANDO SIMPLIFICADO (Solo para frontend):**

Si solo necesitas el frontend funcionando (pagos sandbox):

```bash
gcloud run services update propfinder-app \
  --region=europe-west1 \
  --set-env-vars="SUPABASE_URL=https://vxmpifukfohjafrbiqvw.supabase.co,SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgwNTA0NiwiZXhwIjoyMDY5MzgxMDQ2fQ.VIESvnVaLFiVdnKT5fB2hhmhBKv683j33iJK_BtrwBg,PAYPAL_MODE=sandbox,NODE_ENV=production"
```

## ✅ **TUS ARCHIVOS .ENV.LOCAL YA ESTÁN ACTUALIZADOS:**

- ✅ **Backend**: Client ID configurado
- ✅ **Frontend**: Client ID configurado
- ⚠️ **Falta**: Client Secret para backend

## 🚀 **PARA DEPLOYMENT COMPLETO:**

1. **Obtén el Client Secret** de PayPal Developer
2. **Reemplaza** `TU_CLIENT_SECRET_AQUI` en el comando
3. **Ejecuta** el comando en Google Cloud Shell
4. **Listo** para deployment con PayPal funcionando
