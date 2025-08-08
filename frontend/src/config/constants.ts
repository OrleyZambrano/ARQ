// Application constants
export const APP_CONFIG = {
  name: 'PropFinder',
  version: '1.0.0',
  description: 'Plataforma de Bienes Raíces',
  apiVersion: 'v1',
} as const;

// Publication settings
export const PUBLICATION_CONFIG = {
  freePublicationsLimit: 2,
  freePublicationDurationDays: 60,
  newAgentGracePeriodDays: 30,
} as const;

// UI constants
export const UI_CONFIG = {
  itemsPerPage: 12,
  maxImageUploadSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// API endpoints
export const API_ENDPOINTS = {
  properties: '/properties',
  health: '/health',
  agents: '/agents',
  visits: '/visits',
} as const;
