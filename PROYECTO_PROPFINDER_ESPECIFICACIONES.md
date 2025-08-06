# 🏠 Portal Inmobiliario "PropFinder"

## Especificaciones Completas del Proyecto

---

## 📋 INFORMACIÓN GENERAL

**Tipo de Proyecto:** Portal Inmobiliario - Marketplace de Propiedades  
**Fecha de Inicio:** 6 de agosto de 2025  
**Modalidad:** Arquitectura de Software - Proyecto Real

---

## 🎯 OBJETIVOS DE APRENDIZAJE

- ✅ **Aplicar principios de diseño arquitectónico en un proyecto real**
- ✅ **Implementar patrones de diseño y arquitectónicos**
- ✅ **Garantizar la calidad del software mediante herramientas automatizadas**
- ✅ **Desarrollar una solución que funcione tanto local como en la nube**
- ✅ **Documentar decisiones arquitectónicas de manera profesional**

---

## 🎨 DESCRIPCIÓN DEL PROYECTO

**PropFinder** es un marketplace completo de propiedades inmobiliarias que conecta compradores, vendedores y agentes inmobiliarios en una plataforma moderna y escalable.

### 🚀 FUNCIONALIDADES PRINCIPALES

#### Para Compradores/Inquilinos:

- **Listado de propiedades con búsqueda geoespacial**
- **Sistema de filtros avanzados** (precio, ubicación, tipo, características)
- **Agendamiento de visitas** con calendario integrado
- **Chat en tiempo real con agentes**
- **Favoritos y búsquedas guardadas**
- **Alertas automáticas por email/SMS**

#### Para Agentes/Propietarios:

- **Planes de publicación** (pago único por propiedad)
- **Panel de analytics** para propietarios
- **Gestión de citas y visitas**
- **Dashboard de rendimiento**
- **Herramientas de marketing**

#### Funcionalidades del Sistema:

- **Autenticación y autorización robusta**
- **Sistema de pagos integrado**
- **Notificaciones push y email**
- **Geolocalización y mapas interactivos**
- **Sistema de reviews y ratings**

---

## 🔧 REQUISITOS TÉCNICOS OBLIGATORIOS

### 1. 📐 DOCUMENTACIÓN DE ARQUITECTURA

**Herramientas:** C4 Model o arc42

**Entregables Mínimos:**

- [x] **Diagrama de contexto (C1)** - Vista general del sistema
- [x] **Diagrama de contenedores (C2)** - Aplicaciones y servicios principales
- [x] **Diagrama de componentes (C3)** - Componentes internos detallados
- [x] **Decisiones arquitectónicas (ADRs)** - Registro de decisiones importantes

### 2. 🛡️ CALIDAD DE CÓDIGO

**Herramientas:** SonarQube + GitHub Actions

**Métricas Obligatorias:**

- [x] **Coverage mínimo:** 70%
- [x] **Quality Gate:** Passed
- [x] **Vulnerabilidades críticas:** 0
- [x] **Integración continua** con análisis automático

### 3. 🌿 CONTROL DE VERSIONES

**Plataforma:** GitHub

**Estrategia Obligatoria:**

- [x] **Branching strategy:** GitFlow (main, develop, feature/, release/, hotfix/)
- [x] **Pull requests** obligatorios para merge
- [x] **Code reviews** entre miembros del equipo
- [x] **README completo** con instrucciones detalladas
- [x] **Commits descriptivos** con convención establecida

### 4. 🏗️ PATRONES DE DISEÑO (Mínimo 3)

#### Patrones Obligatorios:

- [x] **Factory Method** - Creación de diferentes tipos de propiedades
- [x] **Singleton** - Configuración global y conexiones de BD
- [x] **Repository Pattern** - Abstracción de acceso a datos
- [x] **Strategy Pattern** - Diferentes estrategias de búsqueda y filtrado

#### Patrones Adicionales Recomendados:

- [ ] **Observer** - Notificaciones y alertas
- [ ] **Command** - Procesamiento de comandos de usuario
- [ ] **Builder** - Construcción compleja de consultas de búsqueda
- [ ] **Facade** - Simplificación de APIs complejas

### 5. 🏛️ MODELO ARQUITECTÓNICO

#### Opciones Disponibles:

- **Opción A: Monolítico Modular**
  - Ventajas: Simplicidad de deployment, menor latencia
  - Desventajas: Acoplamiento, escalabilidad limitada
- **Opción B: Microservicios**
  - Ventajas: Escalabilidad independiente, tecnologías heterogéneas
  - Desventajas: Complejidad operacional, latencia de red

**⚠️ Importante:** Justificar la elección en la documentación arquitectónica

### 6. 🔄 ESTILOS ARQUITECTÓNICOS ÁGILES

- [x] **CI/CD Pipeline** implementado
- [x] **Despliegue automatizado** en múltiples ambientes
- [x] **Pruebas automatizadas** (unit, integration, e2e)
- [x] **Infrastructure as Code** (Terraform/ARM templates)

### 7. 🌩️ FUNCIONAMIENTO LOCAL Y CLOUD

#### Ambiente Local:

- [x] **Docker Compose** para orquestación local
- [x] **Base de datos local** (PostgreSQL/MySQL)
- [x] **Variables de entorno** configurables
- [x] **Hot reload** para desarrollo

#### Ambiente Cloud (elegir mínimo uno):

- [ ] **AWS** (EC2, RDS, S3, Lambda)
- [ ] **Azure** (App Service, SQL Database, Blob Storage)
- [ ] **Google Cloud Platform** (Cloud Run, Cloud SQL, Cloud Storage)
- [ ] **Vercel** (para frontend)
- [ ] **Render** (para full-stack)

### 8. 🚀 DESPLIEGUE AUTOMATIZADO

#### Herramientas Disponibles:

- [x] **GitHub Actions**
- [ ] **Azure DevOps**
- [ ] **AWS CodePipeline**
- [ ] **Google Cloud Build**

#### Ambientes Obligatorios:

- [x] **Desarrollo** (dev) - Para pruebas internas
- [x] **Staging** (staging) - Para testing pre-producción
- [x] **Producción** (prod) - Ambiente final del usuario

### 9. ☁️ ARQUITECTURA CLOUD-NATIVE

#### Principios Obligatorios:

- [x] **Diseño escalable** - Horizontal scaling
- [x] **Stateless services** - Sin estado en los servicios
- [x] **Health checks** - Monitoreo de salud
- [x] **Circuit breaker** - Tolerancia a fallos
- [x] **Logging centralizado** - Trazabilidad
- [x] **Metrics y monitoring** - Observabilidad

### 10. 🛡️ MIDDLEWARE

#### Componentes Obligatorios:

- [x] **API Gateway** - Punto de entrada único
- [x] **Rate limiting** - Control de tráfico
- [x] **Autenticación/Autorización** - JWT/OAuth2
- [x] **CORS configuration** - Políticas de origen cruzado
- [x] **Request/Response logging** - Auditoría
- [x] **Error handling** - Gestión centralizada de errores

### 11. 💳 PASARELAS DE PAGO

#### Obligatorias:

- [x] **Stripe** - Pagos con tarjeta de crédito/débito
- [x] **PayPal** - Pagos con cuenta PayPal

#### Opcional:

- [ ] **Mercado Pago** - Para mercado latinoamericano
- [ ] **Square** - Para comercios físicos
- [ ] **Adyen** - Para mercado global

#### Funcionalidades Requeridas:

- [x] **Procesamiento de pagos únicos** (planes de publicación)
- [x] **Webhooks** para confirmación de pagos
- [x] **Modo sandbox/test** para desarrollo
- [x] **Gestión de reembolsos** (opcional)

### 12. 📊 MODELO DE NEGOCIO

#### Documentación Requerida:

- [x] **Business Model Canvas** completo
- [x] **Análisis de costos cloud** por servicio
- [x] **Proyección de escalabilidad** (usuarios, propiedades, transacciones)
- [x] **Análisis competitivo**
- [x] **Pricing strategy** para diferentes tipos de usuarios

---

## 📐 ARQUITECTURA DE REFERENCIA

### 🏗️ OPCIÓN A: MONOLÍTICO MODULAR

```
propfinder-monolith/
├── api-gateway/                 # Punto de entrada único
│   ├── middleware/             # Autenticación, rate limiting
│   ├── routes/                 # Definición de rutas
│   └── config/                 # Configuración del gateway
├── core/                       # Lógica de negocio central
│   ├── domain/                 # Entidades de dominio
│   │   ├── Property.js
│   │   ├── User.js
│   │   ├── Agent.js
│   │   └── Booking.js
│   ├── application/            # Casos de uso
│   │   ├── PropertyService.js
│   │   ├── UserService.js
│   │   ├── SearchService.js
│   │   └── PaymentService.js
│   └── infrastructure/         # Acceso a datos
│       ├── repositories/
│       ├── external-apis/
│       └── database/
├── modules/                    # Módulos funcionales
│   ├── auth/                   # Autenticación y autorización
│   ├── properties/             # Gestión de propiedades
│   ├── search/                 # Motor de búsqueda
│   ├── payments/               # Procesamiento de pagos
│   ├── notifications/          # Sistema de notificaciones
│   ├── chat/                   # Chat en tiempo real
│   └── analytics/              # Analytics y reportes
├── shared/                     # Componentes compartidos
│   ├── middleware/             # Middleware común
│   ├── utils/                  # Utilidades
│   ├── patterns/               # Implementación de patrones
│   ├── validators/             # Validadores
│   └── constants/              # Constantes del sistema
├── tests/                      # Suite de pruebas
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/                     # Configuración Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── docs/                       # Documentación
│   ├── architecture/
│   ├── api/
│   └── deployment/
└── scripts/                    # Scripts de automatización
    ├── setup.sh
    ├── deploy.sh
    └── seed-data.js
```

### 🔗 OPCIÓN B: MICROSERVICIOS

```
propfinder-microservices/
├── api-gateway/                # Gateway principal
│   ├── src/
│   ├── Dockerfile
│   └── k8s/
├── services/                   # Microservicios independientes
│   ├── auth-service/           # Servicio de autenticación
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── k8s/
│   ├── property-service/       # Servicio de propiedades
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── k8s/
│   ├── search-service/         # Servicio de búsqueda
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── k8s/
│   ├── payment-service/        # Servicio de pagos
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── k8s/
│   ├── notification-service/   # Servicio de notificaciones
│   │   ├── src/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── k8s/
│   └── analytics-service/      # Servicio de analytics
│       ├── src/
│       ├── tests/
│       ├── Dockerfile
│       └── k8s/
├── shared/                     # Librerías compartidas
│   ├── contracts/              # Contratos de API
│   ├── utils/                  # Utilidades comunes
│   ├── middleware/             # Middleware compartido
│   └── patterns/               # Patrones implementados
├── infrastructure/             # Infraestructura como código
│   ├── docker/                 # Configuración Docker
│   ├── k8s/                    # Manifiestos Kubernetes
│   ├── terraform/              # IaC con Terraform
│   └── helm/                   # Charts de Helm
├── frontend/                   # Aplicación frontend
│   ├── public/
│   ├── src/
│   ├── tests/
│   └── Dockerfile
└── docs/                       # Documentación global
    ├── architecture/
    ├── apis/
    └── deployment/
```

---

## 📦 ENTREGABLES DETALLADOS

### 1. 💻 CÓDIGO FUENTE

#### Repositorio GitHub:

- [x] **Acceso público** con organización clara
- [x] **Branches organizados** según GitFlow:
  - `main` - Código de producción
  - `develop` - Integración de features
  - `feature/*` - Nuevas funcionalidades
  - `release/*` - Preparación de releases
  - `hotfix/*` - Correcciones urgentes
- [x] **Commits descriptivos** con convención:

  ```
  tipo(scope): descripción breve

  Descripción más detallada del cambio

  Closes #123
  ```

- [x] **Pull requests documentados** con:
  - Descripción del cambio
  - Screenshots (si aplica)
  - Checklist de verificación
  - Reviewers asignados

#### Estructura de Commits:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato
- `refactor:` - Refactoring de código
- `test:` - Agregado/modificación de tests
- `chore:` - Tareas de mantenimiento

### 2. 📚 DOCUMENTACIÓN

#### README.md Completo:

```markdown
# 🏠 PropFinder - Portal Inmobiliario

## 🚀 Inicio Rápido

- Instrucciones de instalación
- Variables de entorno requeridas
- Comandos de desarrollo

## 📐 Arquitectura

- Diagrama de arquitectura
- Decisiones técnicas importantes
- Patrones implementados

## 🛠️ Desarrollo

- Setup del ambiente local
- Guías de contribución
- Estándares de código

## 🚀 Despliegue

- Instrucciones de deployment
- Configuración de CI/CD
- Ambientes disponibles

## 📊 Monitoreo

- Health checks
- Logs y métricas
- Troubleshooting
```

#### Documentación de Arquitectura (C4/arc42):

- **Contexto del Sistema (C1)**
- **Contenedores (C2)**
- **Componentes (C3)**
- **Código (C4)** - opcional

#### ADRs (Architecture Decision Records):

```markdown
# ADR-001: Elección de Base de Datos

## Estado

Aceptado

## Contexto

Necesitamos una base de datos que soporte...

## Decisión

Utilizaremos PostgreSQL porque...

## Consecuencias

Positivas:

- ...
  Negativas:
- ...
```

#### API Documentation:

- **Swagger/OpenAPI 3.0**
- **Postman Collections**
- **Ejemplos de requests/responses**

#### Modelo de Negocio:

- **Business Model Canvas**
- **Análisis de mercado**
- **Estrategia de monetización**

### 3. 🛡️ CALIDAD

#### Reporte de SonarQube:

- **Code Coverage:** >70%
- **Quality Gate:** Passed
- **Technical Debt:** <1 día
- **Vulnerabilidades:** 0 críticas
- **Code Smells:** Mínimos

#### Resultados de Tests:

- **Unit Tests:** >80% coverage
- **Integration Tests:** Casos críticos cubiertos
- **E2E Tests:** User journeys principales
- **Performance Tests:** Tiempos de respuesta

### 4. 🚀 DESPLIEGUE

#### URLs de Aplicación:

- **Desarrollo:** https://dev.propfinder.com
- **Staging:** https://staging.propfinder.com
- **Producción:** https://propfinder.com

#### Scripts de Deployment:

```bash
# Deployment a desarrollo
npm run deploy:dev

# Deployment a staging
npm run deploy:staging

# Deployment a producción
npm run deploy:prod
```

#### Configuración de CI/CD:

- **Pipeline de CI:** Testing automatizado
- **Pipeline de CD:** Deployment automático
- **Rollback strategy:** Reversión automática

### 5. 🎤 PRESENTACIÓN

#### Estructura de la Demo (30 minutos total):

**Demo en Vivo (15 minutos):**

- Usuario final registrándose
- Búsqueda y filtrado de propiedades
- Agendamiento de cita
- Chat con agente
- Proceso de pago

**Presentación Técnica (10 minutos):**

- Arquitectura implementada
- Patrones de diseño utilizados
- Decisiones técnicas importantes
- Métricas de calidad
- Pipeline de CI/CD

**Q&A (5 minutos):**

- Preguntas técnicas
- Justificaciones arquitectónicas
- Lecciones aprendidas

---

## 🛠️ RECURSOS Y HERRAMIENTAS

### 🔧 HERRAMIENTAS OBLIGATORIAS

#### Control de Versiones:

- **Git** - Control de versiones
- **GitHub** - Repositorio remoto y CI/CD

#### Contenerización:

- **Docker** - Contenerización de aplicaciones
- **Docker Compose** - Orquestación local

#### Calidad de Código:

- **SonarQube Cloud** - Análisis de código
  - URL: https://sonarcloud.io
  - Integración con GitHub automática
- **ESLint/TSLint** - Linting de código
- **Prettier** - Formateo de código

#### Testing de APIs:

- **Postman** - Testing manual de APIs
- **Insomnia** - Alternativa a Postman
- **Newman** - Testing automatizado con Postman

### ☁️ SERVICIOS CLOUD GRATUITOS

#### Amazon Web Services (Free Tier):

- **EC2** - 750 horas/mes t2.micro
- **RDS** - 750 horas/mes db.t2.micro
- **S3** - 5GB de almacenamiento
- **Lambda** - 1M requests/mes

#### Microsoft Azure (Estudiantes):

- **$200 créditos** para estudiantes
- **App Service** - Hosting de aplicaciones
- **SQL Database** - Base de datos gestionada
- **Blob Storage** - Almacenamiento de archivos

#### Google Cloud Platform:

- **$300 créditos** para nuevos usuarios
- **Cloud Run** - Contenedores serverless
- **Cloud SQL** - Base de datos gestionada
- **Cloud Storage** - Almacenamiento de archivos

#### Alternativas Gratuitas:

- **Render** - Hosting full-stack gratuito
- **Vercel** - Hosting frontend gratuito
- **Supabase** - Backend-as-a-Service gratuito
- **Railway** - $5/mes de crédito gratuito
- **PlanetScale** - Base de datos MySQL gratuita
- **Cloudflare** - CDN y DNS gratuito

### 💳 PASARELAS DE PAGO (Modo Test)

#### Stripe (Recomendado):

- **Test Mode** completo
- **Tarjetas de prueba** incluidas
- **Webhooks** para testing
- **Dashboard** completo
- **Documentación** excelente

```javascript
// Tarjetas de prueba Stripe
const testCards = {
  visa: "4242424242424242",
  visaDebit: "4000056655665556",
  mastercard: "5555555555554444",
  amex: "378282246310005",
};
```

#### PayPal Sandbox:

- **Ambiente completo** de testing
- **Cuentas de prueba** incluidas
- **Simulación** de pagos reales
- **APIs** completas disponibles

#### Mercado Pago (Opcional):

- **Ambiente de pruebas** disponible
- **Tarjetas de prueba** incluidas
- **Ideal para mercado** latinoamericano

### 📐 HERRAMIENTAS DE DOCUMENTACIÓN

#### C4 Model:

- **PlantUML** - Diagramas como código
  ```plantuml
  @startuml
  !include C4_Context.puml
  Person(customer, "Customer", "A customer of the bank")
  System(banking_system, "Internet Banking System")
  customer --> banking_system : "Uses"
  @enduml
  ```
- **Structurizr** - Herramienta oficial C4
- **Diagrams.net** - Editor visual online

#### arc42:

- **Template oficial** disponible
- **Estructura** bien definida
- **Ejemplos** disponibles online

#### API Documentation:

- **Swagger UI** - Interfaz interactiva
- **Redoc** - Documentación limpia
- **Postman** - Collections documentadas

---

## 📋 CHECKLIST DE PROGRESO

### 🏗️ Fase 1: Preparación y Setup (Semana 1-2)

- [ ] **Repositorio GitHub** creado y configurado
- [ ] **Equipo definido** y roles asignados
- [ ] **Branching strategy** implementada
- [ ] **Ambiente de desarrollo** local configurado
- [ ] **Docker Compose** funcionando
- [ ] **Base de datos** local configurada
- [ ] **Documentación inicial** creada

### 📐 Fase 2: Arquitectura y Diseño (Semana 2-3)

- [ ] **Decisión arquitectónica** tomada y documentada
- [ ] **Diagramas C4** creados (C1, C2, C3)
- [ ] **ADRs** iniciales documentadas
- [ ] **Modelo de datos** diseñado
- [ ] **APIs** diseñadas y documentadas
- [ ] **Patrones de diseño** identificados
- [ ] **SonarQube** configurado

### 🛠️ Fase 3: Desarrollo Core (Semana 3-6)

- [ ] **Autenticación y autorización** implementada
- [ ] **CRUD de propiedades** completado
- [ ] **Sistema de búsqueda** básico funcionando
- [ ] **API Gateway** configurado
- [ ] **Middleware** implementado
- [ ] **Tests unitarios** escritos (>70% coverage)
- [ ] **CI/CD pipeline** configurado

### 🎨 Fase 4: Funcionalidades Avanzadas (Semana 6-8)

- [ ] **Búsqueda geoespacial** implementada
- [ ] **Sistema de filtros** avanzados
- [ ] **Chat en tiempo real** funcionando
- [ ] **Agendamiento de citas** implementado
- [ ] **Sistema de notificaciones** funcionando
- [ ] **Panel de analytics** básico
- [ ] **Tests de integración** escritos

### 💳 Fase 5: Pagos y Despliegue (Semana 8-10)

- [ ] **Stripe** integrado y funcionando
- [ ] **PayPal** integrado y funcionando
- [ ] **Webhooks** de pagos configurados
- [ ] **Despliegue en cloud** funcionando
- [ ] **Ambientes** (dev/staging/prod) configurados
- [ ] **Monitoreo y logs** implementados
- [ ] **Performance testing** completado

### 📊 Fase 6: Calidad y Documentación (Semana 10-11)

- [ ] **SonarQube Quality Gate** pasado
- [ ] **Coverage >70%** alcanzado
- [ ] **Documentación** completa y actualizada
- [ ] **README** detallado
- [ ] **API documentation** actualizada
- [ ] **Modelo de negocio** documentado
- [ ] **E2E tests** escritos

### 🎤 Fase 7: Preparación de Presentación (Semana 11-12)

- [ ] **Demo script** preparado
- [ ] **Presentación técnica** creada
- [ ] **Ambiente de demo** estable
- [ ] **Datos de prueba** cargados
- [ ] **Backup plans** preparados
- [ ] **Q&A preparation** completada
- [ ] **Video demo** grabado (backup)

---

## 📝 NOTAS IMPORTANTES

### ⚠️ ASPECTOS CRÍTICOS

#### 👥 Trabajo en Equipo:

- **Contribución equitativa** - Todos los miembros deben contribuir
- **Comunicación constante** - Daily standups recomendados
- **Code reviews** obligatorios antes de merge
- **Documentación** de decisiones en equipo
- **Resolución de conflictos** de manera profesional

#### 🚫 Políticas de Penalización:

- **Plagio:** Penalizado con **nota 0**
- **Código copiado** sin atribución apropiada
- **Falta de contribución** individual demostrable
- **No cumplir** con requisitos mínimos

#### 📅 Asistencia y Comunicación:

- **Asistencia obligatoria** a presentaciones finales
- **Comunicar problemas** al docente inmediatamente
- **Updates regulares** de progreso
- **Reportar bloqueos** técnicos tempranamente

#### 🔧 Problemas Técnicos:

- **Documentar problemas** encontrados
- **Buscar soluciones** colaborativamente
- **Escalation path** definido
- **Backup plans** para demo final

---

## 🎯 CRITERIOS DE ÉXITO

### ✅ PROYECTO EXITOSO DEBE:

#### 🚀 Funcionalidad:

- [x] **Funcionar correctamente** en ambiente local
- [x] **Funcionar correctamente** en ambiente cloud
- [x] **Todas las funcionalidades** principales implementadas
- [x] **Performance aceptable** (< 3s tiempo de respuesta)
- [x] **Sin bugs críticos** en funcionalidades principales

#### 📚 Documentación:

- [x] **Documentación clara** y completa
- [x] **Diagramas arquitectónicos** correctos y actualizados
- [x] **ADRs** bien justificados
- [x] **README** con instrucciones precisas
- [x] **API documentation** actualizada

#### 🛡️ Calidad:

- [x] **Estándares de calidad** cumplidos (SonarQube passed)
- [x] **Coverage >70%** en tests
- [x] **Sin vulnerabilidades** críticas
- [x] **Code smells** mínimos
- [x] **Technical debt** controlado

#### 🏗️ Arquitectura:

- [x] **Patrones de diseño** correctamente implementados
- [x] **Arquitectura bien** definida y justificada
- [x] **Separación de responsabilidades** clara
- [x] **Escalabilidad** considerada en el diseño

#### 👥 Colaboración:

- [x] **Trabajo colaborativo** demostrable
- [x] **Git flow** correctamente seguido
- [x] **Code reviews** documentados
- [x] **Contribución equitativa** del equipo

#### 🎤 Presentación:

- [x] **Demo profesional** sin errores técnicos
- [x] **Presentación técnica** clara y concisa
- [x] **Q&A** respondido con conocimiento técnico
- [x] **Tiempo** respetado (30 minutos total)

### 📊 RÚBRICA DE EVALUACIÓN

| Criterio          | Excelente (90-100)                                        | Bueno (75-89)                           | Satisfactorio (60-74)                 | Insuficiente (0-59)                     |
| ----------------- | --------------------------------------------------------- | --------------------------------------- | ------------------------------------- | --------------------------------------- |
| **Funcionalidad** | Todo funciona perfectamente                               | Funcionalidades principales funcionan   | Algunas funcionalidades fallan        | No funciona o tiene errores críticos    |
| **Arquitectura**  | Arquitectura excellente, todos los patrones implementados | Buena arquitectura, mayoría de patrones | Arquitectura básica, algunos patrones | Arquitectura pobre o sin patrones       |
| **Calidad**       | Quality Gate passed, >80% coverage                        | Quality Gate passed, >70% coverage      | Algunas métricas no cumplen           | No cumple estándares mínimos            |
| **Documentación** | Documentación excepcional y completa                      | Documentación buena y clara             | Documentación básica pero suficiente  | Documentación insuficiente              |
| **Colaboración**  | Excelente trabajo en equipo demostrable                   | Buen trabajo colaborativo               | Colaboración básica                   | Falta de colaboración evidente          |
| **Presentación**  | Presentación profesional y convincente                    | Buena presentación con pequeños errores | Presentación básica pero adecuada     | Presentación pobre o con errores graves |

---

## 📞 CONTACTO Y SOPORTE

### 🆘 CANALES DE COMUNICACIÓN:

- **Email del profesor:** [profesor@universidad.edu]
- **Slack del curso:** #arquitectura-software
- **Horarios de oficina:** Martes y Jueves 2-4 PM
- **Sesiones de consulta:** Viernes 10-12 AM (previa cita)

### 🚨 ESCALATION PARA PROBLEMAS:

1. **Problemas técnicos menores** - Resolver en equipo
2. **Bloqueos técnicos** - Consultar con compañeros de otros equipos
3. **Problemas graves** - Contactar al profesor inmediatamente
4. **Problemas de infraestructura** - Reportar al TI del curso

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1-2: Preparación

- Setup inicial del proyecto
- Definición de arquitectura
- Configuración de herramientas

### Semana 3-6: Desarrollo Core

- Implementación de funcionalidades básicas
- Setup de CI/CD
- Implementación de patrones

### Semana 7-10: Funcionalidades Avanzadas

- Integración de pagos
- Chat en tiempo real
- Despliegue en cloud

### Semana 11-12: Finalización

- Testing exhaustivo
- Documentación final
- Preparación de presentación

---

**¡Éxito en tu proyecto PropFinder! 🏠✨**

---

_Documento generado el 6 de agosto de 2025_  
_Versión: 1.0_  
_Última actualización: 6 de agosto de 2025_
