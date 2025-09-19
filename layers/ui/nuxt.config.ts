import { fileURLToPath } from 'node:url'

const designSystemCssPath = fileURLToPath(new URL('./assets/css/design-system.css', import.meta.url))

export default defineNuxtConfig({
  // Extend core layer for base functionality
  extends: ['../core'],

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
  ],

  css: [designSystemCssPath],

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
      pathPrefix: false,
      // remove unsupported `global` option for @nuxt/components types
    },
  ],

  ui: {
    // Nuxt UI v4 configuration - keeping minimal for compatibility
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [300, 400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [300, 400, 500, 600] },
    ],
  },

  typescript: {
    includeWorkspace: true,
  },
})
