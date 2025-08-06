# 🏗️ PropFinder - Estructura Completa del Proyecto

## Arquitectura Monorepo con NestJS + React + Supabase

---

## 📁 ESTRUCTURA GENERAL DEL PROYECTO

```
propfinder/
├── 📦 apps/
│   ├── 🚀 backend/           # NestJS API
│   └── 💻 frontend/          # React App
├── 📚 packages/             # Librerías compartidas
│   ├── 🎯 shared-types/     # TypeScript types
│   ├── 🛠️ utils/           # Utilidades compartidas
│   └── 🎨 ui-components/    # Componentes UI compartidos
├── 🐳 docker/              # Configuración Docker
├── 📋 docs/                # Documentación
└── 🔧 tools/               # Scripts y herramientas
```

---

## 🚀 BACKEND - NESTJS ESTRUCTURA

```
apps/backend/
├── 📄 package.json
├── 🔧 nest-cli.json
├── ⚙️ .env
├── 🐳 Dockerfile
└── 📂 src/
    ├── 🏠 main.ts
    ├── 📋 app.module.ts
    ├── 🔒 auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   ├── roles.guard.ts
    │   │   └── supabase-auth.guard.ts
    │   ├── decorators/
    │   │   ├── current-user.decorator.ts
    │   │   └── roles.decorator.ts
    │   └── dto/
    │       ├── login.dto.ts
    │       ├── register.dto.ts
    │       └── update-profile.dto.ts
    │
    ├── 👤 users/
    │   ├── users.module.ts
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── entities/
    │   │   ├── user-profile.entity.ts
    │   │   ├── agent.entity.ts
    │   │   └── user-avatar.entity.ts
    │   └── dto/
    │       ├── create-user.dto.ts
    │       ├── update-user.dto.ts
    │       └── agent-registration.dto.ts
    │
    ├── 🏘️ properties/
    │   ├── properties.module.ts
    │   ├── properties.controller.ts
    │   ├── properties.service.ts
    │   ├── images/
    │   │   ├── property-images.module.ts
    │   │   ├── property-images.controller.ts
    │   │   ├── property-images.service.ts
    │   │   └── dto/
    │   │       └── upload-image.dto.ts
    │   ├── entities/
    │   │   ├── property.entity.ts
    │   │   └── property-image.entity.ts
    │   └── dto/
    │       ├── create-property.dto.ts
    │       ├── update-property.dto.ts
    │       ├── search-properties.dto.ts
    │       └── property-filters.dto.ts
    │
    ├── 💬 chat/
    │   ├── chat.module.ts
    │   ├── chat.controller.ts
    │   ├── chat.service.ts
    │   ├── chat.gateway.ts            # WebSocket Gateway
    │   ├── entities/
    │   │   ├── chat-session.entity.ts
    │   │   ├── chat-message.entity.ts
    │   │   └── chat-file.entity.ts
    │   └── dto/
    │       ├── create-chat-session.dto.ts
    │       ├── send-message.dto.ts
    │       └── upload-chat-file.dto.ts
    │
    ├── 📅 appointments/
    │   ├── appointments.module.ts
    │   ├── appointments.controller.ts
    │   ├── appointments.service.ts
    │   ├── entities/
    │   │   └── appointment.entity.ts
    │   └── dto/
    │       ├── create-appointment.dto.ts
    │       ├── update-appointment.dto.ts
    │       └── appointment-response.dto.ts
    │
    ├── 💳 payments/
    │   ├── payments.module.ts
    │   ├── payments.controller.ts
    │   ├── payments.service.ts
    │   ├── webhooks/
    │   │   ├── stripe-webhook.controller.ts
    │   │   └── paypal-webhook.controller.ts
    │   ├── entities/
    │   │   ├── payment-transaction.entity.ts
    │   │   ├── publication-plan.entity.ts
    │   │   └── credit-usage-history.entity.ts
    │   └── dto/
    │       ├── create-payment-intent.dto.ts
    │       ├── process-payment.dto.ts
    │       └── payment-webhook.dto.ts
    │
    ├── 📊 analytics/
    │   ├── analytics.module.ts
    │   ├── analytics.controller.ts
    │   ├── analytics.service.ts
    │   ├── tracking/
    │   │   ├── tracking.service.ts
    │   │   └── tracking.middleware.ts
    │   ├── entities/
    │   │   ├── property-analytics.entity.ts
    │   │   └── tracking-event.entity.ts
    │   └── dto/
    │       ├── track-event.dto.ts
    │       ├── analytics-query.dto.ts
    │       └── analytics-response.dto.ts
    │
    ├── 📁 storage/
    │   ├── storage.module.ts
    │   ├── storage.controller.ts
    │   ├── storage.service.ts
    │   ├── providers/
    │   │   └── supabase-storage.provider.ts
    │   └── dto/
    │       ├── upload-file.dto.ts
    │       └── file-metadata.dto.ts
    │
    ├── 🔍 search/
    │   ├── search.module.ts
    │   ├── search.controller.ts
    │   ├── search.service.ts
    │   ├── elasticsearch/
    │   │   ├── elasticsearch.provider.ts
    │   │   └── search-index.service.ts
    │   └── dto/
    │       ├── search-query.dto.ts
    │       ├── geospatial-search.dto.ts
    │       └── search-results.dto.ts
    │
    ├── 📬 notifications/
    │   ├── notifications.module.ts
    │   ├── notifications.controller.ts
    │   ├── notifications.service.ts
    │   ├── providers/
    │   │   ├── email.provider.ts
    │   │   └── push-notification.provider.ts
    │   ├── entities/
    │   │   └── notification.entity.ts
    │   └── dto/
    │       ├── create-notification.dto.ts
    │       └── notification-settings.dto.ts
    │
    ├── ❤️ favorites/
    │   ├── favorites.module.ts
    │   ├── favorites.controller.ts
    │   ├── favorites.service.ts
    │   ├── entities/
    │   │   └── user-favorite.entity.ts
    │   └── dto/
    │       ├── add-favorite.dto.ts
    │       └── favorite-response.dto.ts
    │
    ├── 📊 reports/
    │   ├── reports.module.ts
    │   ├── reports.controller.ts
    │   ├── reports.service.ts
    │   ├── generators/
    │   │   ├── pdf-report.generator.ts
    │   │   └── excel-report.generator.ts
    │   └── dto/
    │       ├── generate-report.dto.ts
    │       └── report-config.dto.ts
    │
    ├── 🛠️ common/
    │   ├── config/
    │   │   ├── supabase.config.ts
    │   │   ├── app.config.ts
    │   │   └── database.config.ts
    │   ├── interfaces/
    │   │   ├── supabase-response.interface.ts
    │   │   ├── paginated-response.interface.ts
    │   │   └── api-response.interface.ts
    │   ├── pipes/
    │   │   ├── validation.pipe.ts
    │   │   └── transform.pipe.ts
    │   ├── filters/
    │   │   ├── http-exception.filter.ts
    │   │   └── supabase-error.filter.ts
    │   ├── interceptors/
    │   │   ├── response.interceptor.ts
    │   │   ├── logging.interceptor.ts
    │   │   └── cache.interceptor.ts
    │   └── middleware/
    │       ├── cors.middleware.ts
    │       └── rate-limit.middleware.ts
    │
    └── 🧪 __tests__/
        ├── 🔧 setup/
        │   └── test-setup.ts
        ├── 🏭 factories/
        │   ├── user.factory.ts
        │   ├── property.factory.ts
        │   └── chat.factory.ts
        └── 📝 fixtures/
            └── sample-data.json
```

---

## 💻 FRONTEND - REACT ESTRUCTURA

```
apps/frontend/
├── 📄 package.json
├── 🔧 vite.config.ts
├── 🐳 Dockerfile
├── 🎨 tailwind.config.js
├── 📁 public/
│   ├── 🖼️ images/
│   └── 🌐 locales/
└── 📂 src/
    ├── 🏠 main.tsx
    ├── 📋 App.tsx
    ├── 🗂️ components/
    │   ├── 🎨 ui/                    # Componentes básicos de UI
    │   │   ├── Button/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Button.styles.ts
    │   │   │   └── Button.test.tsx
    │   │   ├── Input/
    │   │   │   ├── Input.tsx
    │   │   │   └── Input.variants.tsx
    │   │   ├── Modal/
    │   │   │   ├── Modal.tsx
    │   │   │   └── Modal.context.tsx
    │   │   ├── Card/
    │   │   │   └── Card.tsx
    │   │   ├── Badge/
    │   │   │   └── Badge.tsx
    │   │   ├── Avatar/
    │   │   │   └── Avatar.tsx
    │   │   ├── Spinner/
    │   │   │   └── Spinner.tsx
    │   │   └── Toast/
    │   │       ├── Toast.tsx
    │   │       └── ToastProvider.tsx
    │   │
    │   ├── 🔗 layout/               # Componentes de layout
    │   │   ├── Header/
    │   │   │   ├── Header.tsx
    │   │   │   ├── Navigation.tsx
    │   │   │   └── UserMenu.tsx
    │   │   ├── Footer/
    │   │   │   └── Footer.tsx
    │   │   ├── Sidebar/
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── SidebarItem.tsx
    │   │   └── Layout/
    │   │       ├── MainLayout.tsx
    │   │       ├── AuthLayout.tsx
    │   │       └── DashboardLayout.tsx
    │   │
    │   ├── 🏘️ properties/          # Componentes de propiedades
    │   │   ├── PropertyCard/
    │   │   │   ├── PropertyCard.tsx
    │   │   │   └── PropertyCard.skeleton.tsx
    │   │   ├── PropertyList/
    │   │   │   ├── PropertyList.tsx
    │   │   │   └── PropertyGrid.tsx
    │   │   ├── PropertyDetail/
    │   │   │   ├── PropertyDetail.tsx
    │   │   │   ├── PropertyGallery.tsx
    │   │   │   ├── PropertyInfo.tsx
    │   │   │   └── PropertyContact.tsx
    │   │   ├── PropertyForm/
    │   │   │   ├── PropertyForm.tsx
    │   │   │   ├── BasicInfoStep.tsx
    │   │   │   ├── LocationStep.tsx
    │   │   │   ├── FeaturesStep.tsx
    │   │   │   └── ImagesStep.tsx
    │   │   ├── PropertyFilters/
    │   │   │   ├── PropertyFilters.tsx
    │   │   │   ├── PriceRangeFilter.tsx
    │   │   │   ├── LocationFilter.tsx
    │   │   │   └── FeaturesFilter.tsx
    │   │   └── PropertySearch/
    │   │       ├── SearchBar.tsx
    │   │       ├── SearchResults.tsx
    │   │       └── SearchSuggestions.tsx
    │   │
    │   ├── 🗺️ maps/                # Componentes de mapas
    │   │   ├── PropertyMap/
    │   │   │   ├── PropertyMap.tsx
    │   │   │   └── PropertyMarker.tsx
    │   │   ├── LocationPicker/
    │   │   │   └── LocationPicker.tsx
    │   │   └── MapControls/
    │   │       ├── ZoomControl.tsx
    │   │       └── LayerControl.tsx
    │   │
    │   ├── 💬 chat/                # Componentes de chat
    │   │   ├── ChatWindow/
    │   │   │   ├── ChatWindow.tsx
    │   │   │   ├── ChatHeader.tsx
    │   │   │   └── ChatInput.tsx
    │   │   ├── MessageList/
    │   │   │   ├── MessageList.tsx
    │   │   │   ├── Message.tsx
    │   │   │   └── MessageBubble.tsx
    │   │   ├── ChatSessions/
    │   │   │   ├── SessionsList.tsx
    │   │   │   └── SessionItem.tsx
    │   │   └── FileUpload/
    │   │       ├── FileUpload.tsx
    │   │       └── FilePreview.tsx
    │   │
    │   ├── 📅 appointments/         # Componentes de citas
    │   │   ├── AppointmentCalendar/
    │   │   │   ├── Calendar.tsx
    │   │   │   └── TimeSlot.tsx
    │   │   ├── AppointmentForm/
    │   │   │   └── AppointmentForm.tsx
    │   │   └── AppointmentList/
    │   │       ├── AppointmentList.tsx
    │   │       └── AppointmentCard.tsx
    │   │
    │   ├── 💳 payments/             # Componentes de pagos
    │   │   ├── PlanSelection/
    │   │   │   ├── PlanCard.tsx
    │   │   │   └── PlanComparison.tsx
    │   │   ├── PaymentForm/
    │   │   │   ├── PaymentForm.tsx
    │   │   │   ├── StripeForm.tsx
    │   │   │   └── PayPalForm.tsx
    │   │   └── PaymentHistory/
    │   │       ├── TransactionsList.tsx
    │   │       └── TransactionItem.tsx
    │   │
    │   ├── 📊 analytics/           # Componentes de analytics
    │   │   ├── Dashboard/
    │   │   │   ├── DashboardGrid.tsx
    │   │   │   └── DashboardCard.tsx
    │   │   ├── Charts/
    │   │   │   ├── ViewsChart.tsx
    │   │   │   ├── ConversionChart.tsx
    │   │   │   └── TrafficChart.tsx
    │   │   ├── Metrics/
    │   │   │   ├── MetricsCard.tsx
    │   │   │   └── MetricsGrid.tsx
    │   │   └── Reports/
    │   │       ├── ReportGenerator.tsx
    │   │       └── ReportViewer.tsx
    │   │
    │   ├── 👤 profile/             # Componentes de perfil
    │   │   ├── UserProfile/
    │   │   │   ├── ProfileForm.tsx
    │   │   │   ├── ProfileHeader.tsx
    │   │   │   └── ProfileSettings.tsx
    │   │   ├── AgentProfile/
    │   │   │   ├── AgentDashboard.tsx
    │   │   │   ├── AgentSettings.tsx
    │   │   │   └── AgentVerification.tsx
    │   │   └── AvatarUpload/
    │   │       └── AvatarUpload.tsx
    │   │
    │   ├── ❤️ favorites/           # Componentes de favoritos
    │   │   ├── FavoritesList/
    │   │   │   └── FavoritesList.tsx
    │   │   └── FavoriteButton/
    │   │       └── FavoriteButton.tsx
    │   │
    │   └── 🔒 auth/               # Componentes de autenticación
    │       ├── LoginForm/
    │       │   └── LoginForm.tsx
    │       ├── RegisterForm/
    │       │   ├── RegisterForm.tsx
    │       │   ├── BuyerRegistration.tsx
    │       │   └── AgentRegistration.tsx
    │       ├── ForgotPassword/
    │       │   └── ForgotPassword.tsx
    │       └── AuthGuard/
    │           ├── AuthGuard.tsx
    │           └── RoleGuard.tsx
    │
    ├── 📄 pages/                   # Páginas principales
    │   ├── Home/
    │   │   ├── HomePage.tsx
    │   │   ├── HeroSection.tsx
    │   │   ├── FeaturedProperties.tsx
    │   │   └── SearchSection.tsx
    │   ├── Properties/
    │   │   ├── PropertiesPage.tsx
    │   │   ├── PropertyDetailPage.tsx
    │   │   └── CreatePropertyPage.tsx
    │   ├── Search/
    │   │   ├── SearchPage.tsx
    │   │   └── SearchResultsPage.tsx
    │   ├── Profile/
    │   │   ├── ProfilePage.tsx
    │   │   └── EditProfilePage.tsx
    │   ├── Dashboard/
    │   │   ├── AgentDashboard.tsx
    │   │   ├── BuyerDashboard.tsx
    │   │   └── AdminDashboard.tsx
    │   ├── Chat/
    │   │   └── ChatPage.tsx
    │   ├── Appointments/
    │   │   └── AppointmentsPage.tsx
    │   ├── Payments/
    │   │   ├── PlansPage.tsx
    │   │   ├── CheckoutPage.tsx
    │   │   └── PaymentSuccessPage.tsx
    │   ├── Auth/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── ForgotPasswordPage.tsx
    │   └── Errors/
    │       ├── NotFoundPage.tsx
    │       ├── UnauthorizedPage.tsx
    │       └── ServerErrorPage.tsx
    │
    ├── 🔗 hooks/                  # Custom React Hooks
    │   ├── 🔒 auth/
    │   │   ├── useAuth.ts
    │   │   ├── useCurrentUser.ts
    │   │   └── useAuthGuard.ts
    │   ├── 🏘️ properties/
    │   │   ├── useProperties.ts
    │   │   ├── usePropertyDetail.ts
    │   │   ├── usePropertySearch.ts
    │   │   └── usePropertyTracking.ts
    │   ├── 💬 chat/
    │   │   ├── useChat.ts
    │   │   ├── useChatSessions.ts
    │   │   └── useRealTimeChat.ts
    │   ├── 💳 payments/
    │   │   ├── usePayments.ts
    │   │   ├── useStripe.ts
    │   │   └── usePayPal.ts
    │   ├── 📊 analytics/
    │   │   ├── useAnalytics.ts
    │   │   └── useMetrics.ts
    │   ├── 🗺️ maps/
    │   │   ├── useGeolocation.ts
    │   │   └── useMapSearch.ts
    │   ├── 📁 storage/
    │   │   ├── useFileUpload.ts
    │   │   └── useImageGallery.ts
    │   └── 🛠️ common/
    │       ├── useApi.ts
    │       ├── usePagination.ts
    │       ├── useDebounce.ts
    │       ├── useLocalStorage.ts
    │       └── useWebSocket.ts
    │
    ├── 🏪 store/                  # Estado global (Zustand/Redux)
    │   ├── 🔒 auth/
    │   │   ├── auth.store.ts
    │   │   └── auth.types.ts
    │   ├── 🏘️ properties/
    │   │   ├── properties.store.ts
    │   │   └── properties.types.ts
    │   ├── 💬 chat/
    │   │   ├── chat.store.ts
    │   │   └── chat.types.ts
    │   ├── 🔍 search/
    │   │   ├── search.store.ts
    │   │   └── search.types.ts
    │   ├── 🛠️ ui/
    │   │   ├── ui.store.ts
    │   │   └── ui.types.ts
    │   └── index.ts
    │
    ├── 🌐 services/               # Servicios API
    │   ├── 🔧 api/
    │   │   ├── client.ts
    │   │   ├── endpoints.ts
    │   │   └── interceptors.ts
    │   ├── 🔒 auth/
    │   │   └── auth.service.ts
    │   ├── 🏘️ properties/
    │   │   ├── properties.service.ts
    │   │   └── property-images.service.ts
    │   ├── 💬 chat/
    │   │   ├── chat.service.ts
    │   │   └── websocket.service.ts
    │   ├── 💳 payments/
    │   │   ├── payments.service.ts
    │   │   ├── stripe.service.ts
    │   │   └── paypal.service.ts
    │   ├── 📊 analytics/
    │   │   └── analytics.service.ts
    │   ├── 🗺️ maps/
    │   │   └── maps.service.ts
    │   └── 📁 storage/
    │       └── storage.service.ts
    │
    ├── 🛠️ utils/                 # Utilidades
    │   ├── 📝 formatters/
    │   │   ├── currency.ts
    │   │   ├── date.ts
    │   │   └── text.ts
    │   ├── ✅ validators/
    │   │   ├── forms.ts
    │   │   ├── files.ts
    │   │   └── email.ts
    │   ├── 🔧 helpers/
    │   │   ├── api.ts
    │   │   ├── storage.ts
    │   │   └── navigation.ts
    │   └── 🎨 styles/
    │       ├── theme.ts
    │       ├── colors.ts
    │       └── responsive.ts
    │
    ├── 📋 types/                 # TypeScript definitions
    │   ├── 🔒 auth.types.ts
    │   ├── 🏘️ property.types.ts
    │   ├── 💬 chat.types.ts
    │   ├── 💳 payment.types.ts
    │   ├── 📊 analytics.types.ts
    │   ├── 🌐 api.types.ts
    │   └── 🛠️ common.types.ts
    │
    ├── ⚙️ config/               # Configuración
    │   ├── env.ts
    │   ├── supabase.ts
    │   ├── routes.ts
    │   └── constants.ts
    │
    └── 🧪 __tests__/            # Tests
        ├── 🔧 setup/
        │   └── test-setup.ts
        ├── 🛠️ utils/
        │   └── test-utils.tsx
        ├── 🏭 mocks/
        │   ├── api.mock.ts
        │   ├── supabase.mock.ts
        │   └── data.mock.ts
        └── 📝 fixtures/
            └── test-data.ts
```

---

## 📚 PACKAGES COMPARTIDOS

```
packages/
├── 🎯 shared-types/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── entities/
│       │   ├── user.types.ts
│       │   ├── property.types.ts
│       │   ├── chat.types.ts
│       │   ├── payment.types.ts
│       │   └── analytics.types.ts
│       ├── dto/
│       │   ├── requests.types.ts
│       │   └── responses.types.ts
│       └── enums/
│           ├── roles.enum.ts
│           ├── property-status.enum.ts
│           └── payment-status.enum.ts
│
├── 🛠️ utils/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── formatters/
│       │   ├── currency.ts
│       │   ├── date.ts
│       │   └── text.ts
│       ├── validators/
│       │   ├── email.ts
│       │   ├── phone.ts
│       │   └── password.ts
│       └── constants/
│           ├── api.constants.ts
│           └── app.constants.ts
│
└── 🎨 ui-components/
    ├── package.json
    └── src/
        ├── index.ts
        ├── components/
        │   ├── Button/
        │   ├── Input/
        │   ├── Card/
        │   └── Modal/
        ├── hooks/
        │   ├── useTheme.ts
        │   └── useResponsive.ts
        └── styles/
            ├── theme.ts
            └── globals.css
```

---

## 🐳 CONFIGURACIÓN DOCKER

```
docker/
├── 📄 docker-compose.yml
├── 📄 docker-compose.dev.yml
├── 📄 docker-compose.prod.yml
├── 🚀 backend/
│   └── Dockerfile
├── 💻 frontend/
│   └── Dockerfile
└── 🔧 nginx/
    ├── Dockerfile
    └── nginx.conf
```

---

## 📋 DOCUMENTACIÓN

```
docs/
├── 📖 README.md
├── 🚀 api/
│   ├── authentication.md
│   ├── properties.md
│   ├── chat.md
│   ├── payments.md
│   └── analytics.md
├── 💻 frontend/
│   ├── components.md
│   ├── hooks.md
│   ├── state-management.md
│   └── deployment.md
├── 🏗️ architecture/
│   ├── overview.md
│   ├── database-design.md
│   ├── security.md
│   └── performance.md
└── 🔧 deployment/
    ├── local-development.md
    ├── staging.md
    └── production.md
```

---

## 🔧 HERRAMIENTAS

```
tools/
├── 📊 scripts/
│   ├── build.sh
│   ├── deploy.sh
│   ├── migrate.sh
│   └── seed-data.sh
├── 🧪 testing/
│   ├── e2e-tests/
│   └── performance-tests/
└── 🔧 generators/
    ├── component-generator.js
    ├── api-generator.js
    └── type-generator.js
```

---

## ⚙️ ARCHIVOS DE CONFIGURACIÓN RAÍZ

```
propfinder/
├── 📄 package.json           # Workspaces configuration
├── 🔧 turbo.json            # Monorepo build system
├── 🎨 .eslintrc.js          # ESLint configuration
├── 🔧 .prettierrc           # Prettier configuration
├── 📝 tsconfig.json         # TypeScript base config
├── 🚫 .gitignore            # Git ignore rules
├── 🔒 .env.example          # Environment variables template
├── 🐳 docker-compose.yml    # Docker services
├── 📋 README.md             # Project documentation
├── 📄 LICENSE               # License file
└── 🔧 .github/              # GitHub workflows
    └── workflows/
        ├── ci.yml
        ├── cd.yml
        └── security.yml
```

---

## 📊 MÉTRICAS DE CÓDIGO POR ARCHIVO

### 🎯 **Objetivo de Líneas por Archivo:**

- **📦 Componentes React:** 50-150 líneas
- **🔧 Services:** 100-200 líneas
- **🏪 Stores:** 150-300 líneas
- **🛠️ Hooks:** 50-150 líneas
- **⚙️ Controllers NestJS:** 100-200 líneas
- **💼 Services NestJS:** 150-300 líneas
- **📋 DTOs:** 20-100 líneas
- **🏛️ Entities:** 50-150 líneas

### 🚨 **Reglas de Refactoring:**

1. **200+ líneas**: Revisar si se puede dividir
2. **300+ líneas**: Refactoring obligatorio
3. **500+ líneas**: División inmediata en múltiples archivos

### 🔄 **Estrategias de División:**

- **Componentes grandes**: Dividir en sub-componentes
- **Services complejos**: Extraer providers especializados
- **Controllers extensos**: Crear controllers específicos por funcionalidad
- **Hooks complejos**: Dividir en hooks más específicos

---

## 🎯 PRINCIPIOS DE ORGANIZACIÓN

### 📁 **Estructura por Funcionalidad:**

- Cada módulo es independiente y auto-contenido
- Reutilización mediante packages compartidos
- Separación clara de responsabilidades

### 🔧 **Convenciones de Nomenclatura:**

- **PascalCase**: Componentes y Classes
- **camelCase**: Variables y funciones
- **kebab-case**: Nombres de archivos
- **UPPER_CASE**: Constantes y variables de entorno

### 📦 **Gestión de Dependencias:**

- Yarn Workspaces para monorepo
- Versionado semántico
- Lock files para estabilidad

---

## 🚀 COMANDOS DE DESARROLLO

```bash
# Instalación inicial
npm install

# Desarrollo local
npm run dev              # Inicia backend + frontend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Build
npm run build            # Build completo
npm run build:backend    # Solo backend
npm run build:frontend   # Solo frontend

# Testing
npm run test            # Tests unitarios
npm run test:e2e        # Tests end-to-end
npm run test:coverage   # Coverage report

# Linting y formato
npm run lint            # ESLint
npm run format          # Prettier
npm run type-check      # TypeScript

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Datos de prueba
npm run db:reset        # Reset completo

# Docker
npm run docker:up       # Levantar servicios
npm run docker:down     # Bajar servicios
npm run docker:build    # Build imágenes
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### 🏗️ **Fase 1 - Setup Base:**

- [ ] Configurar monorepo con Yarn Workspaces
- [ ] Setup NestJS con configuración base
- [ ] Setup React con Vite y TypeScript
- [ ] Configurar ESLint y Prettier
- [ ] Setup Docker y docker-compose

### 🔒 **Fase 2 - Autenticación:**

- [ ] Integrar Supabase Auth
- [ ] Guards y decorators en NestJS
- [ ] Context y hooks de auth en React
- [ ] Páginas de login/registro

### 🏘️ **Fase 3 - Propiedades Core:**

- [ ] CRUD de propiedades
- [ ] Upload de imágenes a Supabase Storage
- [ ] Búsqueda y filtros
- [ ] Componentes de propiedades

### 💬 **Fase 4 - Chat Tiempo Real:**

- [ ] WebSocket gateway en NestJS
- [ ] Integración con Supabase Realtime
- [ ] Componentes de chat en React
- [ ] Upload de archivos en chat

### 📊 **Fase 5 - Analytics:**

- [ ] Sistema de tracking
- [ ] Dashboard de métricas
- [ ] Reportes exportables

### 💳 **Fase 6 - Pagos:**

- [ ] Integración Stripe y PayPal
- [ ] Webhooks de pagos
- [ ] Sistema de créditos

---

**🎯 Esta estructura garantiza:**

- ✅ Máximo 200-500 líneas por archivo
- ✅ Separación de responsabilidades
- ✅ Escalabilidad y mantenibilidad
- ✅ Reutilización de código
- ✅ Testing fácil y completo
- ✅ Deploy independiente de módulos

¡Lista para empezar el desarrollo! 🚀
