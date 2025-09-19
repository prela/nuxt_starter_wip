export default defineNuxtConfig({
  // Extend core layer for base functionality
  extends: ['../core'],

  // Server-side functionality
  nitro: {
    experimental: {
      wasm: false,
    },
  },

  // Auto-imports for API functionality
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },

  typescript: {
    includeWorkspace: true,
  },
})
