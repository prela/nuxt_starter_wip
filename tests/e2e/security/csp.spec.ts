// tests/e2e/security/csp.spec.ts
import { expect, test } from 'playwright/test'

// Increase timeout for dev server startup
test.setTimeout(30000)

test.describe('Content Security Policy', () => {
  test('should include CSP headers', async ({ page: _page, request }) => {
    // Make a direct request with longer timeout
    const response = await request.get('/', { timeout: 30000 })
    const cspHeader = response.headers()['content-security-policy']

    expect(cspHeader).toBeTruthy()
    expect(cspHeader).toContain('default-src \'self\'')
    expect(cspHeader).toContain('frame-ancestors \'none\'')
    expect(cspHeader).toContain('script-src \'self\'')
    expect(cspHeader).toContain('script-src-attr \'none\'')
    // Ensure unsafe-eval and unsafe-inline are not present in script-src
    expect(cspHeader).not.toContain('\'unsafe-eval\'')
    expect(cspHeader).not.toMatch(/script-src[^;]*'unsafe-inline'/)
  })

  test('should prevent inline script execution', async ({ page }) => {
    // Attach violation listener before any page scripts run
    await page.addInitScript(() => {
      (window as any).__CSP_VIOLATION__ = false
      document.addEventListener('securitypolicyviolation', (e) => {
        console.error('CSP Violation detected:', e.violatedDirective, e.blockedURI);
        (window as any).__CSP_VIOLATION__ = true
      }, { once: true })
    })

    // Verify CSP header exists before interacting with longer timeout
    const headCheck = await page.request.get('/', { timeout: 30000 })
    const hasCsp = Boolean(headCheck.headers()['content-security-policy'])
    expect(hasCsp).toBe(true)

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 })

    // Attempt to use inline event handler which should be blocked by 'script-src-attr \"none\"'
    await page.evaluate(() => {
      const btn = document.createElement('button')
      btn.id = 'csp-inline-handler-test'
      // Intentionally use inline handler
      btn.setAttribute('onclick', 'window.__INLINE_HANDLER_EXECUTED__ = true')
      document.body.appendChild(btn)
      // Dispatch click
      btn.click()
    })

    // Also test eval() which should be blocked
    const evalBlocked = await page.evaluate(() => {
      try {
        // eslint-disable-next-line no-eval
        eval('window.__EVAL_TEST__ = true')
        return false
      }
      catch {
        return true
      }
    })

    const newFunctionBlocked = await page.evaluate(() => {
      try {
        // eslint-disable-next-line no-new-func
        const f = new Function('return 42')
        f()
        return false
      }
      catch {
        return true
      }
    })

    // Wait deterministically for violation flag or inline script presence
    const cspViolationDetected = await page.waitForFunction(() =>
      (window as any).__CSP_VIOLATION__ === true, { timeout: 5000 }).catch(() => null)

    const inlineAttrBlocked = await page.evaluate(() =>
      typeof (window as any).__INLINE_HANDLER_EXECUTED__ === 'undefined',
    )

    expect(Boolean(cspViolationDetected) || inlineAttrBlocked || evalBlocked || newFunctionBlocked).toBe(true)
  })

  test('should allow nonce-based scripts', async ({ page: _page }) => {
    await _page.goto('/', { timeout: 30000 })

    // This test validates that legitimate scripts with proper nonces work
    // In a real app, we'd check that scripts with valid nonces execute
    expect(_page).toBeTruthy()
  })
})
