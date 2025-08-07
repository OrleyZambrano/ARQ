# 💳 CONFIGURACIÓN DE PAYPAL SANDBOX PARA DEPLOYMENT

## 🎯 **¿Por qué usar Sandbox?**

✅ **Recomendado para deployment inicial**

- Transacciones de prueba (no dinero real)
- Testing completo del flujo de pagos
- Fácil debug y troubleshooting
- PayPal recomienda esta práctica

## 🔧 **PASO A PASO:**

### 1. **Obtener credenciales de PayPal Sandbox**

```bash
# 1. Ve a PayPal Developer
https://developer.paypal.com/

# 2. Login con tu cuenta PayPal personal

# 3. My Apps & Credentials → Sandbox tab

# 4. Create App:
```

**Configuración de la App:**

- **App Name**: `ARQ-PropFinder-Sandbox`
- **Sandbox Business Account**: Selecciona tu cuenta
- **Features**: ✅ Accept payments
- **Click "Create App"**

### 2. **Copiar credenciales generadas**

Después de crear la app, verás:

```
Client ID: SB_xxxxxxxxxxxxxxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. **Configurar GitHub Secrets**

Ve a: https://github.com/OrleyZambrano/ARQ/settings/secrets/actions

Agrega estos 3 nuevos secrets:

```
PAYPAL_CLIENT_ID
Valor: SB_xxxxxxxxxxxxxxxxxxxxxxxxx
(El Client ID que obtuviste)

PAYPAL_CLIENT_SECRET
Valor: xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
(El Client Secret que obtuviste)

PAYPAL_MODE
Valor: sandbox
(Literalmente la palabra "sandbox")
```

## 🧪 **Testing en Sandbox:**

### **Cuentas de prueba PayPal:**

PayPal te da cuentas de prueba automáticamente:

1. **Merchant Account** (tu negocio)

   - Recibe los pagos
   - Ya está configurada

2. **Personal Account** (compradores)
   - Para hacer testing de pagos
   - Busca en "Sandbox accounts"

### **Flujo de testing:**

1. **Usuario hace "compra" en tu app**
2. **PayPal sandbox abre** (parece real)
3. **Usa cuenta personal de sandbox** para "pagar"
4. **Tu app recibe confirmación**
5. **Créditos se agregan** al usuario

## 🚀 **Comandos para Google Cloud Run:**

Si quieres configurar las variables manualmente en Cloud Run:

```bash
# Variables de entorno para Backend
gcloud run services update propfinder-backend \
  --region=europe-west1 \
  --update-env-vars="PAYPAL_CLIENT_ID=SB_tu_client_id_aqui,PAYPAL_CLIENT_SECRET=tu_secret_aqui,PAYPAL_MODE=sandbox"

# Variables de entorno para Frontend
gcloud run services update propfinder-frontend \
  --region=europe-west1 \
  --update-env-vars="VITE_PAYPAL_CLIENT_ID=SB_tu_client_id_aqui,VITE_PAYPAL_MODE=sandbox"
```

## ⚠️ **IMPORTANTE:**

- ✅ **Sandbox es PERFECTO** para deployment inicial
- ✅ **Todas las funciones** funcionan igual que producción
- ✅ **Cero riesgo** financiero
- ✅ **Fácil cambiar** a producción después

## 🔄 **Cambiar a Producción (futuro):**

Cuando quieras aceptar pagos reales:

1. Crear app en **Live** (no Sandbox)
2. Cambiar `PAYPAL_MODE` de `sandbox` a `live`
3. Actualizar `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`
4. Re-deployar

## 🎯 **Resumen para deployment:**

1. ✅ Crea app en PayPal Sandbox
2. ✅ Copia Client ID y Secret
3. ✅ Agrega los 3 secrets a GitHub
4. ✅ Ejecuta `.\deploy.bat`
5. ✅ ¡App funcionando con PayPal!
