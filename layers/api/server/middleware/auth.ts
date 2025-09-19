import { createError, defineEventHandler, getCookie, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Only protect routes under /api/protected
  const url = event.node.req.url || ''
  if (!url.startsWith('/api/protected'))
    return

  const bearer = getHeader(event, 'authorization')
  const token = bearer?.replace('Bearer ', '') || getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  // Minimal token presence check; integrate real verification when available
  event.context.user = { id: 'anonymous' }
})
