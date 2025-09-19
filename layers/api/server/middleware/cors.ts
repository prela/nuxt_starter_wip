import { defineEventHandler, getHeader, getMethod, setHeader, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const origin = getHeader(event, 'origin')
  const allowed = ['http://localhost:3000']

  if (origin && allowed.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
  }
  setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,Authorization')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
