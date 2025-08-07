# Multi-stage build para PropFinder App
# Stage 1: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app

# Copiar shared types para backend
COPY shared/ ./shared/

# Copiar y build backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copiar shared types para frontend
COPY shared/ ./shared/

# Copiar y build frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Build frontend with production environment
ENV VITE_BACKEND_URL=/api
RUN npm run build

# Stage 3: Production image
FROM nginx:alpine
# Install Node.js for backend
RUN apk add --no-cache nodejs npm

# Copy nginx configuration
COPY nginx-proxy.conf /etc/nginx/conf.d/default.conf

# Copy frontend build
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy backend
WORKDIR /app/backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./

# Install only production dependencies for runtime
RUN npm ci --only=production

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && PORT=3000 node dist/main.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]