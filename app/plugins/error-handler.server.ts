/**
 * Server-side error handler plugin for Nuxt
 * Handles unhandled promise rejections and connection errors
 */

export default defineNuxtPlugin(() => {
  // Only run on server
  if (import.meta.server) {
    // Handle unhandled promise rejections gracefully
    process.on('unhandledRejection', (reason, _promise) => {
      // Check if this is a connection-related error that we can safely ignore
      if (reason && typeof reason === 'object') {
        const errorCode = 'code' in reason ? (reason as { code?: string }).code : undefined
        const errorMessage = 'message' in reason ? (reason as { message?: string }).message : undefined

        // Common connection errors that occur during cleanup
        const ignorableErrors = [
          'ECONNRESET',
          'ECONNREFUSED',
          'EPIPE',
          'ENOTFOUND',
          'ETIMEDOUT',
        ]

        const ignorableMessages = [
          'write EPIPE',
          'read ECONNRESET',
          'write ECONNRESET',
          'socket hang up',
          'Connection terminated',
        ]

        if (
          (errorCode && ignorableErrors.includes(errorCode))
          || (errorMessage && ignorableMessages.some(msg => errorMessage.includes(msg)))
        ) {
          console.warn(`Ignoring connection error during cleanup: ${errorCode || errorMessage}`)
          return
        }
      }

      // For other errors, log more details but still don't fail
      console.error('Unhandled promise rejection:', reason)
    })

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
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

      // For other errors, log them
      console.error('Uncaught Exception:', error)
    })
  }
})
