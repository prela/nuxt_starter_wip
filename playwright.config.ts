import { defineConfig, devices } from '@playwright/test'

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
    baseURL: 'http://localhost:3000',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Web server configuration - start dev server before tests
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000/api/health',
    timeout: 180000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    // Improved server lifecycle management
    env: {
      // Reduce connection timeouts to prevent hanging connections
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Disable keep-alive to prevent connection reuse issues
      HTTP_KEEP_ALIVE: 'false',
    },
  },
})
