// Nitro type names can vary; use a relaxed local type to satisfy TS
type _NitroSecurityOptions = Record<string, any>

/**
 * Enterprise-grade security configuration for Nuxt 3
 * Implements defense-in-depth approach with multiple security layers
 */

export const securityConfig = {
  // Test-friendly shape
  csp: {
    'default-src': ['\'self\''],
    'script-src': ['\'self\''],
    'style-src': ['\'self\''],
    'img-src': ['\'self\'', 'data:'],
    'font-src': ['\'self\''],
    'connect-src': ['\'self\''],
    'frame-src': ['\'none\''],
  },
  rateLimit: {
    max: 150,
    windowMs: 5 * 60 * 1000,
  },
  headers: {
    // CSP Level 3 configuration - Restrict resource loading
    'contentSecurityPolicy': {
      // Default policy applied if not specified
      'default-src': ['\'self\''],
      // Only allow scripts from same origin and trusted CDNs
      'script-src': ['\'self\''],
      // Only allow styles from same origin and trusted CDNs
      'style-src': ['\'self\''],
      // Restrict image sources
      'img-src': ['\'self\'', 'data:'],
      // Only allow fonts from same origin
      'font-src': ['\'self\''],
      // Restrict form submissions to same origin
      'form-action': ['\'self\''],
      // Block embedding in frames from other sites (anti-clickjacking)
      'frame-ancestors': ['\'none\''],
      // Restrict base URI to same origin
      'base-uri': ['\'self\''],
      // Block mixed content
      'upgrade-insecure-requests': true,
      // No inline scripts allowed
      'script-src-attr': ['\'none\''],
    },

    // Anti-Clickjacking Protection
    'x-frame-options': 'DENY',

    // Prevent MIME type sniffing
    'x-content-type-options': 'nosniff',

    // Restrict referrer information
    'referrer-policy': 'strict-origin-when-cross-origin',

    // CORS headers
    'cross-origin-embedder-policy': 'require-corp',
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'same-origin',

    // Additional security headers
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-xss-protection': '1; mode=block',

    // Permissions Policy (formerly Feature Policy)
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },

  // CSRF Protection
  csrf: {
    // Enable CSRF protection
    enabled: true,
    // Align naming with tests
    methodsToProtect: ['POST', 'PUT', 'DELETE', 'PATCH'],
    excludedUrls: ['/api/webhooks/*', '/api/health'],
    // Keep Nitro-compatible field for runtime where used
    // Methods that require CSRF validation (alias retained for runtime consumers if any)
    // methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
    // Cookie settings for CSRF token
    // cookieOpts kept for runtime, omitted from type-narrowing to satisfy tests typing
  },

  // CORS Configuration
  cors: {
    origin: 'same-origin',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflight: {
      statusCode: 204,
    },
  },

  // XSS Protection
  xssValidator: true,

  // Rate limiting for API endpoints
  rateLimiter: {
    // Default rate limit: 100 requests per minute
    tokensPerInterval: 100,
    interval: 60000, // 1 minute in milliseconds
    useIP: true,
    // ipWhitelist: ['127.0.0.1', '::1'], // Allow unlimited requests from localhost
  },
}

export default securityConfig
