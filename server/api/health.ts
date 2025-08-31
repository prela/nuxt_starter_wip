/**
 * Health Check Endpoint
 *
 * This endpoint is used by Coolify and other monitoring services
 * to verify that the application is running and healthy.
 *
 * Returns:
 * - status: 'ok' if healthy
 * - timestamp: current ISO timestamp
 * - uptime: process uptime in seconds
 * - version: package version from package.json
 */

export default defineEventHandler(async (event) => {
  try {
    // Basic health check - if we can respond, we're healthy
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    // Set appropriate headers for health check
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    // Prevent connection keep-alive to avoid hanging connections
    setHeader(event, 'Connection', 'close')

    // Set response status explicitly
    setResponseStatus(event, 200)

    return healthData
  }
  catch (error) {
    // Enhanced error handling with detailed logging
    console.error('Health check failed:', error)

    // If there's any error, return 500 status
    setResponseStatus(event, 500)
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Connection', 'close')

    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    }
  }
})
