export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
  TIMEOUT_MS: 15000,
  RETRY_COUNT: 2,
} as const;

export const APP_CONFIG = {
  NAME: 'UniNest',
  VERSION: '1.0.0',
} as const;
