export default defineNuxtConfig({
  // Extend core layer for base functionality
  extends: ['../core'],

  modules: [
    '@nuxt/content',
  ],

  content: {},

  typescript: {
    includeWorkspace: true,
  },
})
