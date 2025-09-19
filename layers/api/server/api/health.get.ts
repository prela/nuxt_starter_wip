import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
  }
})
