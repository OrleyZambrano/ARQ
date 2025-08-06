# ================================
# DOCKERFILE PARA FRONTEND EN CLOUD RUN
# Deploy desde GitHub Actions
# ================================

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar shared types y utils (necesarios para el frontend)
COPY shared/ ./shared/

# Copiar package.json del frontend
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

# Build para producción
RUN npm run build

# Production stage con nginx
FROM nginx:alpine-slim

# Copiar build al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE $PORT

# Script para usar PORT dinámico de Cloud Run
RUN echo 'server { listen $PORT; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf.template

CMD ["sh", "-c", "envsubst '$$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
