// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    // ...@antfu/eslint-config options
    vue: true,
    typescript: true,

    // Clean ignore patterns - organized and well-documented
    ignores: [
      // Build outputs
      '.output',
      'dist',

      // Dependencies
      'node_modules',

      // Nuxt generated files
      '.nuxt',
      '.nitro',

      // Test outputs and reports (consolidated)
      'reports',

      // Development files (keep .vscode and .cursor for team sharing)
      '.data',

      // Git and other VCS
      '.git',
    ],
  }, {
    rules: {
      'node/prefer-global/process': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
    },
  }),
  // Your custom configs here
)
