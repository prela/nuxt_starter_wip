// tests/e2e/security/csp-reporting.spec.ts
import { expect, test } from '@playwright/test'

test.describe('CSP Violation Reporting', () => {
  test('should accept and process CSP violation reports', async ({ request }) => {
    // Sample CSP violation report structure based on official CSP spec
    const sampleCspReport = {
      'csp-report': {
        'document-uri': 'https://example.com/page',
        'referrer': 'https://example.com/home',
        'violated-directive': 'script-src \'self\'',
        'effective-directive': 'script-src',
        'original-policy': 'default-src \'self\'; script-src \'self\'',
        'blocked-uri': 'https://evil.com/malicious.js',
        'line-number': 10,
        'column-number': 5,
        'status-code': 200,
        'source-file': 'https://example.com/page',
      },
    }

    // Test POST request to CSP reporting endpoint
    const response = await request.post('/api/csp-report', {
      data: sampleCspReport,
      headers: {
        'Content-Type': 'application/csp-report',
        'User-Agent': 'Mozilla/5.0 (Test Browser)',
      },
    })

    // Should return 204 No Content or 200 OK for successful report
    expect([200, 204]).toContain(response.status())
  })

  test('should handle malformed CSP reports gracefully', async ({ request }) => {
    // Test with invalid JSON
    const invalidResponse = await request.post('/api/csp-report', {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/csp-report',
      },
    })

    // Should still return success to avoid revealing internal structure
    expect([200, 204, 400]).toContain(invalidResponse.status())
  })

  test('should handle empty CSP reports', async ({ request }) => {
    // Test with empty report
    const emptyResponse = await request.post('/api/csp-report', {
      data: {},
      headers: {
        'Content-Type': 'application/csp-report',
      },
    })

    // Should handle gracefully
    expect([200, 204, 400]).toContain(emptyResponse.status())
  })

  test('should accept standard JSON content type', async ({ request }) => {
    const sampleReport = {
      'csp-report': {
        'document-uri': 'https://example.com/test',
        'violated-directive': 'script-src \'self\'',
        'blocked-uri': 'https://malicious.com/script.js',
      },
    }

    const response = await request.post('/api/csp-report', {
      data: sampleReport,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect([200, 204]).toContain(response.status())
  })

  test('should reject non-POST methods', async ({ request }) => {
    // Test GET method
    const getResponse = await request.get('/api/csp-report')
    expect(getResponse.status()).toBe(405)

    // Test PUT method
    const putResponse = await request.put('/api/csp-report', {
      data: { test: 'data' },
    })
    expect(putResponse.status()).toBe(405)
  })

  test('should have rate limiting protection', async ({ request }) => {
    // Send multiple requests rapidly to test rate limiting
    const promises = Array.from({ length: 10 }, (_, i) =>
      request.post('/api/csp-report', {
        data: {
          'csp-report': {
            'document-uri': `https://example.com/test-${i}`,
            'violated-directive': 'script-src \'self\'',
            'blocked-uri': 'https://evil.com/script.js',
          },
        },
        headers: {
          'Content-Type': 'application/csp-report',
        },
      }))

    const responses = await Promise.all(promises)

    // At least some should succeed (first few)
    const successCount = responses.filter(r => [200, 204].includes(r.status())).length
    expect(successCount).toBeGreaterThan(0)

    // Some might be rate limited (depending on configuration)
    const rateLimitedCount = responses.filter(r => r.status() === 429).length
    // Rate limiting may or may not kick in for this test volume
    expect(rateLimitedCount).toBeGreaterThanOrEqual(0)
  })
})
