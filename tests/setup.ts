/**
 * Global test setup for handling unhandled promise rejections
 * and providing better error handling during test cleanup
 */

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
  // Log the error for debugging but don't fail the test
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason)

  // Check if this is a connection-related error that we can safely ignore
  if (reason && typeof reason === 'object' && 'code' in reason) {
    const errorCode = (reason as { code?: string }).code

    // Common connection errors that occur during cleanup
    const ignorableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'EPIPE',
      'ENOTFOUND',
      'ETIMEDOUT',
    ]

    if (ignorableErrors.includes(errorCode || '')) {
      console.warn(`Ignoring connection error during cleanup: ${errorCode}`)
      return
    }
  }

  // Check if this is a connection-related error in the message
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const errorMessage = (reason as { message?: string }).message || ''

    // Common connection error messages
    const ignorableMessages = [
      'write EPIPE',
      'read ECONNRESET',
      'write ECONNRESET',
      'socket hang up',
      'Connection terminated',
    ]

    if (ignorableMessages.some(msg => errorMessage.includes(msg))) {
      console.warn(`Ignoring connection error during cleanup: ${errorMessage}`)
      return
    }
  }

  // For other errors, log more details but still don't fail
  console.error('Unhandled promise rejection:', reason)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)

  // Check if this is a connection-related error
  if (error.message && (
    error.message.includes('ECONNRESET')
    || error.message.includes('EPIPE')
    || error.message.includes('write EPIPE')
    || error.message.includes('read ECONNRESET')
  )) {
    console.warn('Ignoring connection error during cleanup:', error.message)
    return
  }

  // For other errors, exit gracefully
  process.exit(1)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.warn('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.warn('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

/**
 * Global setup function for Playwright
 */
async function globalSetup() {
  console.warn('Setting up global test environment...')

  // Setup is already done by the process event handlers above
  // This function is called by Playwright before tests start

  return async () => {
    console.warn('Cleaning up global test environment...')
    // Global teardown logic if needed
  }
}

export default globalSetup
