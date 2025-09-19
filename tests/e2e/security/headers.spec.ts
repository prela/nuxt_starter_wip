// tests/e2e/security/headers.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Security Headers', () => {
  test('should include all required security headers', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers()

    // Test required security headers
    expect(headers?.['x-frame-options']).toBeTruthy()
    expect(headers?.['x-content-type-options']).toBe('nosniff')
    expect(headers?.['referrer-policy']).toBeTruthy()
    expect(headers?.['content-security-policy']).toBeTruthy()
  })

  test('should prevent clickjacking attacks', async ({ page }) => {
    const response = await page.goto('/')
    const xFrameOptions = response?.headers()['x-frame-options']

    // Should either be DENY or SAMEORIGIN
    expect(xFrameOptions).toBeTruthy()
    expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions)
  })

  test('should prevent MIME type sniffing', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('should have proper referrer policy', async ({ page }) => {
    const response = await page.goto('/')
    const referrerPolicy = response?.headers()['referrer-policy']

    expect(referrerPolicy).toBeTruthy()
    // Should be a valid referrer policy value
    expect([
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ]).toContain(referrerPolicy)
  })

  test('should include CSP reporting directive', async ({ page }) => {
    const response = await page.goto('/')
    const cspHeader = response?.headers()['content-security-policy']

    expect(cspHeader).toBeTruthy()

    // Should include either report-uri or report-to directive
    const hasReportUri = cspHeader?.includes('report-uri')
    const hasReportTo = cspHeader?.includes('report-to')

    expect(hasReportUri || hasReportTo).toBe(true)

    // If report-uri is present, should point to our endpoint
    if (hasReportUri) {
      expect(cspHeader).toContain('report-uri /api/csp-report')
    }
  })
})
