// server/middleware/csrf.ts
import jwt from 'jsonwebtoken'

const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']
const EXCLUDED_URLS = [
  '/api/csrf-token',
  '/api/health',
  '/api/webhooks',
  '/api/csp-report',
]

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const url = getRequestURL(event)

  // Always skip CSRF for CSP reports
  if (url.pathname === '/api/csp-report') {
    return
  }

  // Skip CSRF for safe methods
  if (!PROTECTED_METHODS.includes(method)) {
    return
  }

  // Skip for excluded URLs
  if (EXCLUDED_URLS.some(excluded => url.pathname.startsWith(excluded))) {
    return
  }

  const token = getCookie(event, 'csrf-token')
    || getHeader(event, 'x-csrf-token')
    || getHeader(event, 'csrf-token')

  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token missing',
    })
  }

  const secret = process.env.NUXT_CSRF_SECRET || 'default-dev-secret-change-in-production'

  try {
    jwt.verify(token, secret)
  }
  catch {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid CSRF token',
    })
  }
})
