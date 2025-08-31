// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  eslint: {
    config: {
      standalone: false,
    },
  },

  // Development server configuration
  devServer: {
    // Handle connection errors gracefully
    host: '127.0.0.1',
    port: 3000,
  },

  // Nitro configuration for better error handling
  nitro: {
    // Handle development server errors
    devHandlers: [],
    // Experimental features for better error handling
    experimental: {
      wasm: false,
    },
    // Better error handling in development
    devErrorHandler: async (error, _event) => {
      // Check if this is a connection-related error
      if (error.message && (
        error.message.includes('ECONNRESET')
        || error.message.includes('EPIPE')
        || error.message.includes('write EPIPE')
        || error.message.includes('read ECONNRESET')
      )) {
        console.warn('Ignoring connection error:', error.message)
        return
      }

      // Log other errors
      console.error('Nitro dev error:', error)
    },
  },

  // Vite configuration to handle connection errors
  vite: {
    server: {
      // Prevent connection hanging
      hmr: {
        port: 24678,
      },
    },
  },
})
