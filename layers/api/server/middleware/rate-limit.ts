import { createError, defineEventHandler, getRequestIP } from 'h3'

const store = new Map<string, { count: number, resetTime: number }>()

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''
  if (!url.startsWith('/api'))
    return

  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxRequests = 100
  const ip = getRequestIP(event) || 'unknown'

  const current = store.get(ip)
  if (!current || now > current.resetTime) {
    store.set(ip, { count: 1, resetTime: now + windowMs })
    return
  }

  if (current.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: { retryAfter: Math.ceil((current.resetTime - now) / 1000) },
    })
  }

  current.count++
})
