// tests/unit/security/csrf.test.ts
import { describe, expect, it, vi } from 'vitest'

describe('cSRF Protection', () => {
  it('should have CSRF token structure', () => {
    const mockToken = {
      token: 'mock-jwt-token',
    }

    expect(mockToken.token).toBeDefined()
    expect(typeof mockToken.token).toBe('string')
  })

  it('should validate CSRF configuration', async () => {
    const { securityConfig } = await import('../../../config/security')

    expect(securityConfig.csrf.enabled).toBe(true)
    expect(securityConfig.csrf.methodsToProtect).toContain('POST')
    expect(securityConfig.csrf.methodsToProtect).toContain('PUT')
    expect(securityConfig.csrf.methodsToProtect).toContain('DELETE')
    expect(securityConfig.csrf.methodsToProtect).toContain('PATCH')
  })

  it('should have proper excluded URLs', async () => {
    const { securityConfig } = await import('../../../config/security')

    expect(securityConfig.csrf.excludedUrls).toContain('/api/webhooks/*')
    expect(securityConfig.csrf.excludedUrls).toContain('/api/health')
  })

  it('should mock token validation', () => {
    const mockValidateToken = vi.fn().mockReturnValue(true)
    const token = 'valid-token'

    const result = mockValidateToken(token)

    expect(result).toBe(true)
    expect(mockValidateToken).toHaveBeenCalledWith(token)
  })
})
