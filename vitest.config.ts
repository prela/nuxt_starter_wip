import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#layers/core': resolve(__dirname, './layers/core'),
      '#layers/core/*': resolve(__dirname, './layers/core/*'),
      '~': resolve(__dirname, './app'),
      '~~': resolve(__dirname, '.'),
      '@': resolve(__dirname, './app'),
      '@@': resolve(__dirname, '.'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/unit/components/**/*.test.ts', 'nuxt'],
    ],
    environmentOptions: {
      nuxt: {
        url: 'http://localhost:3000',
        domEnvironment: 'happy-dom',
      },
      nuxtRuntimeConfig: {
        app: { baseURL: '/' },
      },
    },
    globals: true,
    typecheck: { tsconfig: 'tests/tsconfig.json' },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'reports/coverage',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/components/**/*.{vue,ts}',
        'layers/**/components/**/*.{vue,ts}',
        'app/composables/**/*.{ts}',
        'layers/**/composables/**/*.{ts}',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
        '.nuxt/',
        '.output/',
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
