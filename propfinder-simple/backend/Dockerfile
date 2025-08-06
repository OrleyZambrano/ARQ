# ================================
# DOCKERFILE OPTIMIZADO PARA GOOGLE CLOUD RUN
# Deploy desde GitHub Actions
# ================================

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar shared types y utils (necesarios para compilar)
COPY shared/ ./shared/

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar dependencias incluyendo devDependencies para build
RUN npm ci

# Copiar código fuente del backend
COPY backend/src ./src
COPY backend/nest-cli.json ./nest-cli.json
COPY backend/tsconfig*.json ./

# Construir la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copiar package.json para instalar solo prod dependencies
COPY backend/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicación construida desde builder stage
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Cambiar ownership de archivos
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

# Exponer puerto (Cloud Run usa PORT variable de entorno)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]
