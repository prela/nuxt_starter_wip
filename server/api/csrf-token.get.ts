// server/api/csrf-token.get.ts
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const secret = process.env.NUXT_CSRF_SECRET || 'default-dev-secret-change-in-production'

  const token = jwt.sign(
    {
      purpose: 'csrf',
      timestamp: Date.now(),
      sessionId: Math.random().toString(36),
    },
    secret,
    { expiresIn: '1h' },
  )

  // Set as HTTP-only cookie for additional security
  setCookie(event, 'csrf-token', token, {
    httpOnly: false, // Needs to be accessible to JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  })

  return { token }
})
