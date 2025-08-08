// Application constants
export const APP_CONFIG = {
  name: 'PropFinder API',
  version: '1.0.0',
  description: 'API para la plataforma inmobiliaria PropFinder',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// CORS configuration
export const CORS_CONFIG = {
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    /https:\/\/.*\.a\.run\.app$/, // Google Cloud Run
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
} as const;

// Swagger configuration
export const SWAGGER_CONFIG = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  version: APP_CONFIG.version,
  tags: ['propfinder', 'properties', 'health'],
  servers: [
    {
      url: process.env.BACKEND_URL || 'http://localhost:3000',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development',
    },
  ],
} as const;
