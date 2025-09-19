import { fileURLToPath } from 'node:url'

const layerCssPath = fileURLToPath(new URL('./assets/css/core.css', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',

  // Core layer configuration
  // Resolve CSS file via absolute filesystem path to be robust in layers
  css: [layerCssPath],

  // Auto-imports for core functionality
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },

  // Type augmentation
  typescript: {
    includeWorkspace: true,
    strict: true,
  },

  // Runtime config for core
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    databaseUrl: process.env.DATABASE_URL || '',

    // Public keys (exposed to client-side)
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Nuxt Enterprise App',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },

  // Development configuration
  devtools: { enabled: true },

  // Enable experimental features needed for layers
  experimental: {
    typedPages: true,
  },
})
