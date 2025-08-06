# PropFinder - Plataforma de Bienes Raíces

PropFinder es una plataforma completa de bienes raíces desarrollada con tecnologías modernas, que permite a usuarios comprar, vender y rentar propiedades de manera fácil y segura.

## 🏗️ Arquitectura del Proyecto

```
ARQ/
├── backend/          # API NestJS
├── frontend/         # Aplicación React
├── shared/           # Types y utilidades compartidas
├── .github/          # Workflows de CI/CD
└── docs/             # Documentación adicional
```

## 🚀 Stack Tecnológico

### Backend

- **NestJS** - Framework Node.js para APIs robustas
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos PostgreSQL con RLS
- **Swagger** - Documentación automática de API
- **Docker** - Containerización

### Frontend

- **React 18** - Library de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool rápido
- **TailwindCSS** - Framework de estilos utility-first
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

### DevOps & Deploy

- **Google Cloud Run** - Servicio serverless
- **GitHub Actions** - CI/CD automático
- **Docker** - Containerización
- **Nginx** - Servidor web para frontend

## 📋 Características Principales

### 🏠 Para Usuarios

- Búsqueda avanzada de propiedades
- Filtros por ubicación, precio, características
- Galería de imágenes de alta calidad
- Calculadora de hipoteca
- Sistema de favoritos
- Chat en tiempo real con agentes

### 🏢 Para Agentes

- Panel de administración de propiedades
- Analytics y reportes
- Gestión de leads
- Sistema de notificaciones

### 🔧 Para Administradores

- Panel de control completo
- Gestión de usuarios y agentes
- Moderación de contenido
- Analytics avanzados

## 🛠️ Instalación y Desarrollo Local

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Docker (opcional)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ARQ
```

### 2. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### 4. Base de Datos

El archivo `SUPABASE_DATABASE_SETUP.sql` contiene todo el esquema de la base de datos. Importarlo en Supabase para configurar:

- Tablas de usuarios, propiedades, chat, pagos
- Políticas de Row Level Security (RLS)
- Funciones y triggers
- Buckets de almacenamiento

## 🌐 Deployment

### Google Cloud Run (Recomendado)

#### Configuración inicial

1. Crear proyecto en Google Cloud Platform
2. Habilitar APIs necesarias:
   - Cloud Run API
   - Artifact Registry API
   - Cloud Build API

3. Configurar Workload Identity Federation para GitHub Actions
4. Crear repositorio en Artifact Registry:

```bash
gcloud artifacts repositories create propfinder \
  --repository-format=docker \
  --location=us-central1
```

#### Variables de entorno para GitHub Actions

Configurar los siguientes secrets en GitHub:

- `WIF_PROVIDER`: Workload Identity Provider
- `WIF_SERVICE_ACCOUNT`: Service Account email
- `SUPABASE_URL`: URL de Supabase
- `SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `SUPABASE_SERVICE_KEY`: Clave de servicio de Supabase
- `BACKEND_URL`: URL del backend para el frontend

#### Deploy automático

Los workflows de GitHub Actions se ejecutan automáticamente:

- **Backend**: Al hacer push a archivos en `/backend/**`
- **Frontend**: Al hacer push a archivos en `/frontend/**`

### Deploy manual

```bash
# Backend
cd backend
docker build -t propfinder-backend .
docker run -p 3001:3001 propfinder-backend

# Frontend
cd frontend
docker build -t propfinder-frontend .
docker run -p 3000:8080 propfinder-frontend
```

## 📚 API Documentation

Una vez que el backend esté ejecutándose, la documentación de la API estará disponible en:

- **Swagger UI**: `http://localhost:3001/api/docs`
- **JSON Schema**: `http://localhost:3001/api/docs-json`

### Endpoints principales

#### Properties

- `GET /api/properties` - Listar propiedades con filtros
- `GET /api/properties/:id` - Obtener detalles de propiedad
- `POST /api/properties` - Crear nueva propiedad (requiere auth)
- `PUT /api/properties/:id` - Actualizar propiedad (requiere auth)
- `DELETE /api/properties/:id` - Eliminar propiedad (requiere auth)

#### Health

- `GET /api/health` - Status de la API
- `GET /api/health/ready` - Readiness check

## 🔒 Seguridad

### Backend

- CORS configurado para dominios específicos
- Validación de datos con class-validator
- Rate limiting
- Sanitización de inputs

### Base de Datos

- Row Level Security (RLS) habilitado
- Políticas de acceso granular
- Encriptación de datos sensibles
- Backups automáticos

### Frontend

- CSP headers configurados
- XSS protection
- HTTPS enforced en producción

## 🧪 Testing

### Backend

```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Coverage report
```

### Frontend

```bash
cd frontend
npm run test           # Unit tests with Vitest
```

## 📈 Monitoring y Analytics

### Application Monitoring

- Google Cloud Monitoring
- Error tracking con Cloud Logging
- Performance metrics

### Business Analytics

- User behavior tracking
- Property view analytics
- Conversion funnels
- Revenue tracking

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Convenciones de código

- ESLint para linting
- Prettier para formateo
- Conventional Commits para mensajes de commit

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:

- Email: dev@propfinder.com
- Issues: GitHub Issues
- Documentación: `/docs`

## 🗺️ Roadmap

### v1.1 (Q2 2024)

- [ ] Integración con mapas interactivos
- [ ] Sistema de tours virtuales
- [ ] Notificaciones push
- [ ] API mobile mejorada

### v1.2 (Q3 2024)

- [ ] Marketplace de servicios inmobiliarios
- [ ] Integración con CRM externo
- [ ] Analytics avanzados
- [ ] Multi-idioma

### v2.0 (Q4 2024)

- [ ] AI para recomendaciones
- [ ] Blockchain para contratos
- [ ] IoT integration
- [ ] Expansion internacional
