import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PLAYWRIGHT_PORT || 3100)

export default defineConfig({
  testDir: './tests/e2e',

  // Global test timeout (per test)
  timeout: 60000,

  // Global setup timeout
  globalTimeout: 300000,

  // Global setup file for error handling
  globalSetup: './tests/setup.ts',

  // Global teardown for cleanup
  globalTeardown: './tests/teardown.ts',

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },

  // Output directories for reports
  outputDir: 'reports/test-results',

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list'],
  ],

  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Base URL for tests
    baseURL: `http://127.0.0.1:${PORT}`,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Web server configuration - use preview build for stability
  webServer: {
    command: `pnpm preview --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096',
      HTTP_KEEP_ALIVE: 'false',
      // Provide required secrets so env validation does not fail in preview
      NODE_ENV: 'production',
      JWT_SECRET: 'test-jwt-secret-1234567890abcd',
      NUXT_CSRF_SECRET: 'test-csrf-secret-1234567890abcd',
      // Ensure sharp prefers bundled binaries and increase logging for diagnostics
      SHARP_IGNORE_GLOBAL_LIBVIPS: '1',
      DEBUG: '@nuxt/image*,nitro:*',
      // Expose PORT in case the preview process reads from env
      PORT: String(PORT),
      HOST: '127.0.0.1',
    },
  },
})
