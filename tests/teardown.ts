/**
 * Global teardown for Playwright tests
 * Ensures clean shutdown and connection cleanup
 */

async function globalTeardown() {
  console.warn('Running global teardown...')

  // Give time for any pending connections to close
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.warn('Global teardown completed')
}

export default globalTeardown
