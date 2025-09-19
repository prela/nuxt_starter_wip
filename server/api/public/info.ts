/**
 * Sample public GET API endpoint for testing cache headers
 * This endpoint will be cached using Nitro routeRules
 */
export default defineEventHandler(() => {
  return {
    message: 'Public API endpoint',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cache: 'This endpoint should have cache-control headers',
  }
})
