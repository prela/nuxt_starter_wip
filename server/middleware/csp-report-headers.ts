/**
 * Ensures CSP reporting directives are present on all responses.
 * - Adds `report-uri /api/csp-report`
 * - Adds `report-to csp` and corresponding Reporting-Endpoints header
 */
export default defineEventHandler((event) => {
  // Only modify for HTML and general responses; skip for static assets
  const url = getRequestURL(event)
  if (url.pathname.startsWith('/_nuxt') || url.pathname.startsWith('/assets'))
    return

  const cspHeaderName = 'Content-Security-Policy'
  const cspLower = 'content-security-policy'

  const existing = getHeader(event, cspLower) || getHeader(event, cspHeaderName)

  const needsReportUri = !existing || !existing.includes('report-uri')
  const needsReportTo = !existing || !existing.includes('report-to')

  if (existing && !(needsReportUri || needsReportTo)) {
    return
  }

  const additions: string[] = []
  if (needsReportUri)
    additions.push('report-uri /api/csp-report')
  if (needsReportTo)
    additions.push('report-to csp')

  const updated = existing
    ? `${existing}${existing.trim().endsWith(';') ? ' ' : '; '}${additions.join('; ')};`
    : `${additions.join('; ')};`

  setHeader(event, cspHeaderName, updated)

  // Set Reporting-Endpoints header required by report-to
  setHeader(event, 'Reporting-Endpoints', 'csp="/api/csp-report"')
})
