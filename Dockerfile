# Multi-stage build para PropFinder App
# Stage 1: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .
RUN npm run build

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
# Build frontend with production environment
ENV VITE_BACKEND_URL=__BACKEND_URL__
RUN npm run build

# Stage 3: Production image
FROM nginx:alpine
# Install Node.js for backend
RUN apk add --no-cache nodejs npm

# Copy nginx configuration
COPY nginx-proxy.conf /etc/nginx/conf.d/default.conf

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy backend
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && node dist/main.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]