export default defineEventHandler((event) => {
  setResponseStatus(event, 405)
  setHeader(event, 'Allow', 'POST')
  return ''
})
