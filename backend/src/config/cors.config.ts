import { INestApplication } from '@nestjs/common';
import { CORS_CONFIG } from './constants';

export function setupCors(app: INestApplication): void {
  app.enableCors({
    origin: CORS_CONFIG.allowedOrigins,
    credentials: CORS_CONFIG.credentials,
    methods: CORS_CONFIG.methods,
    allowedHeaders: CORS_CONFIG.allowedHeaders,
  });
}
