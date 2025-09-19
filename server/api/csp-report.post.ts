/**
 * CSP Violation Reporting Endpoint
 *
 * Accepts Content Security Policy violation reports from browsers
 * and safely logs them for security monitoring.
 *
 * Specification: https://www.w3.org/TR/CSP3/#report-directive
 *
 * Security considerations:
 * - Validates report structure to prevent log injection
 * - Removes potential PII from logs
 * - Rate limited by global middleware
 * - Returns minimal response to avoid information leakage
 */

import { z } from 'zod'

// CSP Report schema validation to prevent malicious payloads
const CspReportSchema = z.object({
  'csp-report': z.object({
    'document-uri': z.string().url().optional(),
    'referrer': z.string().url().optional(),
    'violated-directive': z.string().min(1).max(500),
    'effective-directive': z.string().max(100).optional(),
    'original-policy': z.string().max(2000).optional(),
    'blocked-uri': z.string().max(2000).optional(),
    'line-number': z.number().int().min(0).optional(),
    'column-number': z.number().int().min(0).optional(),
    'source-file': z.string().url().optional(),
    'status-code': z.number().int().min(100).max(599).optional(),
    'script-sample': z.string().max(200).optional(),
  }).strict(),
}).strict()

/**
 * Sanitizes report data to remove potential PII and prevent log injection
 */
function sanitizeReport(report: any): Record<string, unknown> {
  try {
    const validated = CspReportSchema.parse(report)
    const cspReport = validated['csp-report']

    // Create sanitized version with controlled fields
    const sanitized = {
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      blockedUri: cspReport['blocked-uri'] ? new URL(cspReport['blocked-uri']).origin : undefined,
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      statusCode: cspReport['status-code'],
      // Only log domain, not full URI to avoid PII leakage
      documentDomain: cspReport['document-uri'] ? new URL(cspReport['document-uri']).origin : undefined,
      sourceFileDomain: cspReport['source-file'] ? new URL(cspReport['source-file']).origin : undefined,
    }

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(sanitized).filter(([_, value]) => value !== undefined),
    )
  }
  catch {
    // Return minimal info if validation fails
    return {
      error: 'Invalid report structure',
      hasViolatedDirective: typeof report?.['csp-report']?.['violated-directive'] === 'string',
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Only accept POST requests
    assertMethod(event, 'POST')

    // Read and parse the request body
    const rawBody = await readBody(event)

    // Sanitize the report to prevent log injection and PII leakage
    const sanitizedReport = sanitizeReport(rawBody)

    // Create structured log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'csp-violation',
      report: sanitizedReport,
      metadata: {
        userAgent: getHeader(event, 'user-agent')?.substring(0, 200) || 'unknown',
        ip: getRequestIP(event),
        contentType: getHeader(event, 'content-type'),
      },
    }

    // Log the violation for monitoring
    // In production, consider sending to dedicated security monitoring service
    console.warn('[SECURITY] CSP Violation:', JSON.stringify(logEntry))

    // In production environment, could integrate with monitoring services
    if (process.env.NODE_ENV === 'production') {
      // Example: await sendToSecurityMonitoringService(logEntry)
      // Example: await sendToSentry(logEntry)
    }

    // Set appropriate headers
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

    // Return 204 No Content as per CSP spec recommendation
    setResponseStatus(event, 204)
    return ''
  }
  catch (error) {
    // Log errors but don't expose internal details
    console.error('[SECURITY] CSP Report Handler Error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      userAgent: getHeader(event, 'user-agent')?.substring(0, 200),
      ip: getRequestIP(event),
    })

    // Always return success to avoid revealing system internals
    // Attackers shouldn't know if their reports are being processed
    setResponseStatus(event, 204)
    return ''
  }
})
