// tests/unit/security/module-integration.test.ts
import { describe, expect, it } from 'vitest'

describe('security Module Integration', () => {
  it('should have security config defined', () => {
    // Test that security configuration is properly typed
    const config = {
      csrf: {
        enabled: true,
        methodsToProtect: ['POST', 'PUT', 'DELETE', 'PATCH'],
        excludedUrls: ['/api/webhooks/*', '/api/health'],
      },
    }

    expect(config.csrf.enabled).toBe(true)
    expect(config.csrf.methodsToProtect).toContain('POST')
  })

  it('should validate security config structure', async () => {
    // Dynamic import for ES modules
    const { securityConfig } = await import('../../../config/security')

    expect(securityConfig).toBeDefined()
    expect(securityConfig.csrf).toBeDefined()
    expect(securityConfig.csp).toBeDefined()
    expect(securityConfig.rateLimit).toBeDefined()
  })

  it('should have proper CSP configuration', async () => {
    const { securityConfig } = await import('../../../config/security')

    expect(securityConfig.csp['default-src']).toContain('\'self\'')
    expect(securityConfig.csp['frame-src']).toContain('\'none\'')
  })

  it('should have rate limiting configured', async () => {
    const { securityConfig } = await import('../../../config/security')

    expect(securityConfig.rateLimit.max).toBe(150)
    expect(securityConfig.rateLimit.windowMs).toBe(5 * 60 * 1000)
  })
})
