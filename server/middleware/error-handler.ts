/**
 * Global error handler middleware for server-side errors
 * Handles connection errors and unhandled rejections
 */

export default defineEventHandler(async (event) => {
  // Only handle errors, let other requests pass through
  if (event.node.req.url && !event.node.req.url.startsWith('/api/')) {
    return
  }

  // Add error handling for connection issues
  event.node.res.on('error', (error: Error) => {
    // Log connection errors but don't crash the server
    if (error.message.includes('ECONNRESET')
      || error.message.includes('EPIPE')
      || error.message.includes('ECONNABORTED')) {
      console.warn('Connection error (ignored):', error.message)
      return
    }

    console.error('Server response error:', error)
  })

  // Handle request connection errors
  event.node.req.on('error', (error: Error) => {
    if (error.message.includes('ECONNRESET')
      || error.message.includes('EPIPE')
      || error.message.includes('ECONNABORTED')) {
      console.warn('Request connection error (ignored):', error.message)
      return
    }

    console.error('Server request error:', error)
  })

  // Set default headers to prevent connection hanging
  setHeader(event, 'Connection', 'close')
})
