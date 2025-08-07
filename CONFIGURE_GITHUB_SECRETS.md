# 🔐 CONFIGURAR GITHUB SECRETS PARA DEPLOYMENT

## 🚨 **PROBLEMA DETECTADO:**

El deployment está fallando porque las **variables de entorno están vacías**. Necesitas configurar los GitHub Secrets.

## 📝 **PASOS PARA CONFIGURAR:**

### 1. **Ve a tu repositorio en GitHub:**

```
https://github.com/OrleyZambrano/ARQ
```

### 2. **Navega a Settings → Secrets and Variables → Actions:**

```
Settings → Secrets and variables → Actions → Repository secrets → New repository secret
```

### 3. **Agrega estos SECRETS uno por uno:**

#### ✅ **SUPABASE_URL**

```
Name: SUPABASE_URL
Secret: https://vxmpifukfohjafrbiqvw.supabase.co
```

#### ✅ **SUPABASE_SERVICE_ROLE_KEY**

```
Name: SUPABASE_SERVICE_ROLE_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bXBpZnVrZm9oamFmcmJpcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgwNTA0NiwiZXhwIjoyMDY5MzgxMDQ2fQ.VIESvnVaLFiVdnKT5fB2hhmhBKv683j33iJK_BtrwBg
```

#### ✅ **PAYPAL_CLIENT_ID**

```
Name: PAYPAL_CLIENT_ID
Secret: AbYKlb2RXOBy0HDMyt1cB76UTSN3cX8_28MZpLYEaqnATydf3zLrB8Ig550fQDB1aUFeo_Uz3f-s4Us5
```

#### ✅ **PAYPAL_CLIENT_SECRET**

```
Name: PAYPAL_CLIENT_SECRET
Secret: EJS7GBQIq_vX91BF8GdeveQ3eZ4QgEeZUCeneaUb6aZpjKVMyl8W60_y_LaOuqgIV_YYcTwGmEO5Neaa
```

#### ✅ **PAYPAL_MODE**

```
Name: PAYPAL_MODE
Secret: sandbox
```

## 🎯 **DESPUÉS DE CONFIGURAR LOS SECRETS:**

### **Re-ejecutar el workflow:**

1. Ve a: `https://github.com/OrleyZambrano/ARQ/actions`
2. Encuentra el workflow fallido
3. Click en "Re-run all jobs"

### **O hacer un nuevo push:**

```bash
git commit --allow-empty -m "trigger: re-run deployment with secrets configured"
git push origin main
```

## ✅ **VERIFICACIÓN:**

Una vez configurados los secrets, el workflow debería mostrar:

```
--update-env-vars SUPABASE_URL=https://vxmpifukfohjafrbiqvw.supabase.co,SUPABASE_SERVICE_ROLE_KEY=eyJ...,PAYPAL_CLIENT_ID=AbY...,PAYPAL_CLIENT_SECRET=EJS...,PAYPAL_MODE=sandbox
```

En lugar de variables vacías.

## 🚀 **RESULTADO ESPERADO:**

- Backend deployado exitosamente en Cloud Run
- Aplicación funcionando con todas las credenciales
- PayPal sandbox operativo
- Sistema de créditos funcional
