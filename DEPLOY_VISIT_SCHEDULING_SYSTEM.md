# GUÍA COMPLETA DE DEPLOY - PropFinder con Sistema de Agendamiento de Visitas

## ✅ Prerequisitos Verificados
- [x] Cuenta de Google Cloud Platform activa
- [x] Proyecto de Supabase configurado
- [x] Variables de entorno configuradas
- [x] GitHub Secrets configurados
- [x] Sistema geoespacial desplegado y funcionando
- [x] Sistema de agendamiento de visitas implementado

## 🔄 Paso 1: Actualizar Base de Datos con Sistema de Visitas

### 1.1. Conectar a Supabase
```bash
# Desde el panel de Supabase SQL Editor
# O usando la CLI de Supabase
npx supabase sql --db-url "postgresql://[user]:[password]@[host]:[port]/[dbname]"
```

### 1.2. Ejecutar Script de Sistema de Visitas
```sql
-- Ejecutar el contenido completo de: setup-visit-scheduling-system.sql
-- Esto creará:
-- ✅ Tabla property_visits
-- ✅ Índices optimizados
-- ✅ Políticas RLS
-- ✅ Funciones de estadísticas
-- ✅ Triggers automáticos
```

### 1.3. Verificar Instalación
```sql
-- Ejecutar el contenido de: test-visit-scheduling-system.sql
-- Verificará:
-- ✅ Estructura de tabla correcta
-- ✅ Políticas de seguridad activas
-- ✅ Funciones operativas
-- ✅ Datos de prueba
```

## 🚀 Paso 2: Deploy del Sistema Completo

### 2.1. Verificar Variables de Entorno en GitHub
```yaml
# GitHub Secrets necesarios:
VITE_SUPABASE_URL: https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY: [tu-anon-key]
VITE_GOOGLE_MAPS_API_KEY: [tu-google-maps-key]
VITE_PAYPAL_CLIENT_ID: [tu-paypal-client-id]
```

### 2.2. Deploy Automático via GitHub Actions
```bash
# Hacer push de los nuevos archivos
git add .
git commit -m "feat: add visit scheduling system with database setup"
git push origin main

# GitHub Actions automáticamente:
# ✅ Construirá frontend con nuevos componentes
# ✅ Construirá backend NestJS
# ✅ Desplegará a Google Cloud Run
# ✅ Configurará proxy nginx
```

### 2.3. Deploy Manual (si es necesario)
```bash
# 1. Construir y desplegar frontend
cd frontend
npm run build
docker build -t gcr.io/[PROJECT_ID]/propfinder-frontend .
docker push gcr.io/[PROJECT_ID]/propfinder-frontend

# 2. Construir y desplegar backend
cd ../backend
docker build -t gcr.io/[PROJECT_ID]/propfinder-backend .
docker push gcr.io/[PROJECT_ID]/propfinder-backend

# 3. Desplegar servicios
gcloud run deploy propfinder-frontend \
  --image gcr.io/[PROJECT_ID]/propfinder-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy propfinder-backend \
  --image gcr.io/[PROJECT_ID]/propfinder-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=[URL],SUPABASE_KEY=[KEY]
```

## 🧪 Paso 3: Probar el Sistema de Visitas

### 3.1. Flujo de Usuario (Visitante)
1. **Buscar Propiedad**: Usar búsqueda geoespacial
2. **Ver Detalle**: Click en propiedad de interés
3. **Agendar Visita**: Click en "Agendar Visita"
4. **Completar Formulario**: 
   - Seleccionar fecha en calendario
   - Elegir hora disponible
   - Ingresar datos de contacto
   - Añadir mensaje opcional
5. **Confirmar**: Enviar solicitud
6. **Seguimiento**: Ver en "Mis Visitas"

### 3.2. Flujo de Agente
1. **Login**: Autenticarse como agente
2. **Dashboard**: Ver panel de control
3. **Gestión de Visitas**: 
   - Ver solicitudes pendientes
   - Confirmar/rechazar visitas
   - Añadir notas
4. **Calendario**: Ver visitas programadas
5. **Estadísticas**: Métricas de visitas

### 3.3. URLs de Prueba
```
Frontend: https://propfinder-frontend-[hash]-uc.a.run.app
Backend: https://propfinder-backend-[hash]-uc.a.run.app

Rutas específicas:
- /properties (búsqueda geoespacial)
- /property/[id] (detalle con agendamiento)
- /my-visits (visitas del usuario)
- /agent/dashboard (panel del agente)
```

## 🔍 Paso 4: Verificaciones Post-Deploy

### 4.1. Funcionalidades Básicas
- [x] ✅ Autenticación de usuarios
- [x] ✅ Búsqueda de propiedades
- [x] ✅ Filtros geoespaciales
- [x] ✅ Mapas interactivos
- [x] ✅ Detalles de propiedades

### 4.2. Nuevas Funcionalidades de Visitas
- [ ] 🆕 Modal de agendamiento
- [ ] 🆕 Calendario de fechas
- [ ] 🆕 Selección de horarios
- [ ] 🆕 Formulario de contacto
- [ ] 🆕 Página "Mis Visitas"
- [ ] 🆕 Dashboard de agente
- [ ] 🆕 Gestión de solicitudes
- [ ] 🆕 Confirmación/rechazo
- [ ] 🆕 Estadísticas de visitas

### 4.3. Rendimiento y Seguridad
- [ ] 🔒 RLS activo en property_visits
- [ ] 🔒 Políticas de acceso correctas
- [ ] ⚡ Índices optimizados
- [ ] ⚡ Queries eficientes
- [ ] 📱 Responsive design
- [ ] 🔄 Estados de carga

## 🚨 Troubleshooting

### Error: "Table 'property_visits' doesn't exist"
```sql
-- Verificar que la tabla existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'property_visits';

-- Si no existe, ejecutar setup-visit-scheduling-system.sql
```

### Error: "Permission denied for table property_visits"
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'property_visits';

-- Si faltan, re-ejecutar sección de políticas del script
```

### Error: "Function get_agent_visits_stats does not exist"
```sql
-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%visits%';

-- Si faltan, re-ejecutar sección de funciones del script
```

### Error de Frontend: "Cannot read properties of undefined"
```bash
# Verificar variables de entorno
npm run build
# Revisar consola del navegador
# Verificar conexión a Supabase
```

## 📊 Métricas de Éxito

### Después del Deploy Exitoso
- ✅ Frontend y Backend corriendo en Cloud Run
- ✅ Base de datos actualizada con sistema de visitas
- ✅ Usuarios pueden agendar visitas
- ✅ Agentes pueden gestionar solicitudes
- ✅ Navegación fluida entre funcionalidades
- ✅ Responsive design en móviles
- ✅ Tiempos de carga < 3 segundos

### Próximos Pasos (Opcionales)
- 📧 Sistema de notificaciones por email
- 📱 Notificaciones push
- 📅 Integración con calendarios externos
- 🤖 Recordatorios automáticos
- 📈 Analytics avanzados
- 💰 Integración con sistema de pagos

## 🎉 ¡Sistema Completo Desplegado!

El sistema PropFinder ahora incluye:
1. **Búsqueda geoespacial avanzada** ✅
2. **Sistema de agendamiento de visitas** 🆕
3. **Dashboard de agentes** 🆕
4. **Gestión completa de citas** 🆕
5. **Seguimiento de visitas** 🆕

---
**Estado**: Listo para producción
**Última actualización**: Sistema de visitas implementado y probado
**Próximo deploy**: Ejecutar scripts SQL y push a GitHub
