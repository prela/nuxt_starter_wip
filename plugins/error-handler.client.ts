/**
 * Client-side error handler plugin for Nuxt
 * Handles unhandled promise rejections and connection errors
 */

export default defineNuxtPlugin(() => {
  // Handle unhandled promise rejections on the client
  if (import.meta.client) {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason

      // Check if this is a connection-related error
      if (reason && typeof reason === 'object') {
        const errorCode = 'code' in reason ? (reason as { code?: string }).code : undefined
        const errorMessage = 'message' in reason ? (reason as { message?: string }).message : undefined

        // Common connection errors that we can safely ignore
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
          'fetch',
        ]

        if (
          (errorCode && ignorableErrors.includes(errorCode))
          || (errorMessage && ignorableMessages.some(msg => errorMessage.includes(msg)))
        ) {
          console.warn('Ignoring connection error:', errorCode || errorMessage)
          event.preventDefault()
          return
        }
      }

      // Log other errors but don't prevent default behavior
      console.error('Unhandled promise rejection:', reason)
    })
  }
})
