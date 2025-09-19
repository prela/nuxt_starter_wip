# Immediate Implementation Guide: Week 1 Action Plan

## 🚀 Starting Your Nuxt Enterprise Implementation

This guide provides the **exact steps** to begin implementing your enterprise Nuxt 4.1.1 starter project, following the Work Breakdown Structure methodology with Test-Driven Development principles.

---

## 📋 Pre-Implementation Checklist

Before starting, ensure your development environment meets these requirements:

- ✅ **Node.js 22+** installed
- ✅ **pnpm 10.15.0+** as package manager
- ✅ **Git** configured with your repository
- ✅ **VS Code** or preferred IDE with TypeScript support
- ✅ **Docker Desktop** running (for containerization testing)

## 🎯 Week 1 Implementation Plan (0.0.1: Security Infrastructure)

### Day 1-2: Security Module Integration (0.0.0-alpha)

**Priority**: 🔴 **CRITICAL** - Security is foundational

#### Step 1: Install and Configure nuxt-security (4 hours)

**Start with Tests** (TDD Approach):
```bash
# Create test file first
mkdir -p tests/unit/security
touch tests/unit/security/module-integration.test.ts
```

```typescript
import { $fetch, setup } from '@nuxt/test-utils'
// tests/unit/security/module-integration.test.ts
import { describe, expect, test } from 'vitest'

describe('Security Module Integration', () => {
  test('should register security module correctly', async () => {
    await setup({
      server: true
    })
    const response = await $fetch('/')
    expect(response).toBeDefined()
  })

  test('should include security headers in response', async () => {
    await setup({ server: true })
    const response = await $fetch.raw('/')
    const headers = response.headers

    expect(headers.get('x-frame-options')).toBeTruthy()
    expect(headers.get('x-content-type-options')).toBe('nosniff')
    expect(headers.get('content-security-policy')).toBeTruthy()
  })
})
```

**Now Implement** (Make tests pass):

1. **Install Security Module** (30 minutes):
   ```bash
   cd /path/to/your/nuxt_starter_wip
   pnpm add @nuxtjs/security
   ```

2. **Update nuxt.config.ts** (1 hour):
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     compatibilityDate: '2025-05-15',
     devtools: { enabled: true },

     modules: [
       '@nuxt/content',
       '@nuxt/fonts',
       '@nuxt/icon',
       '@nuxt/image',
       '@nuxt/scripts',
       '@nuxt/test-utils',
       '@nuxt/eslint',
       '@nuxt/ui',
       '@vueuse/nuxt',
       '@nuxtjs/security', // ← ADD THIS
     ],

     // Add security configuration
     security: {
       headers: {
         crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
         contentSecurityPolicy: {
           'base-uri': ['\'none\''],
           'font-src': ['\'self\'', 'https:', 'data:'],
           'form-action': ['\'self\''],
           'frame-ancestors': ['\'none\''],
           'img-src': ['\'self\'', 'data:', 'https:'],
           'object-src': ['\'none\''],
           'script-src-attr': ['\'none\''],
           'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
           'script-src': ['\'self\'', 'https:', '\'unsafe-inline\'', '\'unsafe-eval\''],
           'upgrade-insecure-requests': true
         }
       },
       rateLimiter: {
         tokensPerInterval: 150,
         interval: 300000,
         headers: false,
         driver: {
           name: 'lruCache'
         }
       }
     },

     css: ['~/assets/css/main.css'],
     // ... rest of your existing config
   })
   ```

3. **Test Implementation** (30 minutes):
   ```bash
   # Run tests to verify security module works
   pnpm test:unit

   # Start development server and check headers
   pnpm dev
   # Open browser dev tools → Network tab → Check response headers
   ```

4. **Create Security Configuration File** (2 hours):
   ```bash
   mkdir -p config
   touch config/security.ts
   ```

   ```typescript
   // config/security.ts
   export interface SecurityConfig {
     csrf: {
       enabled: boolean
       methodsToProtect: string[]
       excludedUrls: string[]
     }
     csp: {
       'default-src': string[]
       'script-src': string[]
       'style-src': string[]
       'img-src': string[]
       'font-src': string[]
       'connect-src': string[]
       'frame-src': string[]
     }
     rateLimit: {
       max: number
       windowMs: number
     }
   }

   export const securityConfig: SecurityConfig = {
     csrf: {
       enabled: true,
       methodsToProtect: ['POST', 'PUT', 'DELETE', 'PATCH'],
       excludedUrls: ['/api/webhooks/*', '/api/health']
     },
     csp: {
       'default-src': ['\'self\''],
       'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
       'style-src': ['\'self\'', '\'unsafe-inline\'', 'https:'],
       'img-src': ['\'self\'', 'data:', 'https:'],
       'font-src': ['\'self\'', 'https:', 'data:'],
       'connect-src': ['\'self\''],
       'frame-src': ['\'none\'']
     },
     rateLimit: {
       max: 150,
       windowMs: 5 * 60 * 1000 // 5 minutes
     }
   }
   ```

**Quality Check**:
```bash
# Verify no TypeScript errors
pnpm type-check

# Verify ESLint passes
pnpm lint

# Check security headers in browser
curl -I http://localhost:3000
```

#### Step 2: CSRF Protection Implementation (3 hours)

**Create CSRF Test First**:
```typescript
import { $fetch, setup } from '@nuxt/test-utils'
// tests/unit/security/csrf.test.ts
import { describe, expect, test } from 'vitest'

describe('CSRF Protection', () => {
  test('should generate CSRF token endpoint', async () => {
    await setup({ server: true })
    const response = await $fetch('/api/csrf-token')
    expect(response.token).toBeDefined()
    expect(typeof response.token).toBe('string')
  })

  test('should reject POST without CSRF token', async () => {
    await setup({ server: true })
    try {
      await $fetch('/api/test-endpoint', {
        method: 'POST',
        body: { test: 'data' }
      })
      expect.fail('Should have thrown error')
    }
    catch (error: any) {
      expect(error.statusCode).toBe(403)
    }
  })
})
```

**Implement CSRF Protection**:

1. **Create CSRF Token API** (1 hour):
   ```bash
   mkdir -p server/api
   touch server/api/csrf-token.get.ts
   ```

   ```typescript
   // server/api/csrf-token.get.ts
   import jwt from 'jsonwebtoken'

   export default defineEventHandler(async (event) => {
     const secret = process.env.NUXT_CSRF_SECRET || 'default-dev-secret-change-in-production'

     const token = jwt.sign(
       {
         purpose: 'csrf',
         timestamp: Date.now(),
         sessionId: Math.random().toString(36)
       },
       secret,
       { expiresIn: '1h' }
     )

     // Set as HTTP-only cookie for additional security
     setCookie(event, 'csrf-token', token, {
       httpOnly: false, // Needs to be accessible to JavaScript
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       maxAge: 60 * 60 // 1 hour
     })

     return { token }
   })
   ```

2. **Create CSRF Middleware** (1.5 hours):
   ```bash
   mkdir -p server/middleware
   touch server/middleware/csrf.ts
   ```

   ```typescript
   // server/middleware/csrf.ts
   import jwt from 'jsonwebtoken'

   const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']
   const EXCLUDED_URLS = [
     '/api/csrf-token',
     '/api/health',
     '/api/webhooks'
   ]

   export default defineEventHandler(async (event) => {
     const method = getMethod(event)
     const url = getRequestURL(event)

     // Skip CSRF for safe methods
     if (!PROTECTED_METHODS.includes(method)) {
       return
     }

     // Skip for excluded URLs
     if (EXCLUDED_URLS.some(excluded => url.pathname.startsWith(excluded))) {
       return
     }

     const token = getCookie(event, 'csrf-token')
       || getHeader(event, 'x-csrf-token')
       || getHeader(event, 'csrf-token')

     if (!token) {
       throw createError({
         statusCode: 403,
         statusMessage: 'CSRF token missing'
       })
     }

     const secret = process.env.NUXT_CSRF_SECRET || 'default-dev-secret-change-in-production'

     try {
       jwt.verify(token, secret)
     }
     catch (error) {
       throw createError({
         statusCode: 403,
         statusMessage: 'Invalid CSRF token'
       })
     }
   })
   ```

3. **Create Client-side CSRF Composable** (30 minutes):
   ```bash
   mkdir -p composables
   touch composables/useCsrf.ts
   ```

   ```typescript
   // composables/useCsrf.ts
   export function useCsrf() {
     const csrfToken = ref<string>('')

     const fetchCsrfToken = async (): Promise<string> => {
       try {
         const { token } = await $fetch<{ token: string }>('/api/csrf-token')
         csrfToken.value = token
         return token
       }
       catch (error) {
         console.error('Failed to fetch CSRF token:', error)
         throw error
       }
     }

     const getHeaders = () => ({
       'x-csrf-token': csrfToken.value
     })

     const $fetchWithCsrf = async <T>(url: string, options: any = {}): Promise<T> => {
       if (!csrfToken.value) {
         await fetchCsrfToken()
       }

       return $fetch<T>(url, {
         ...options,
         headers: {
           ...options.headers,
           ...getHeaders()
         }
       })
     }

     return {
       csrfToken: readonly(csrfToken),
       fetchCsrfToken,
       getHeaders,
       $fetchWithCsrf
     }
   }
   ```

**Install Required Dependencies**:
```bash
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

#### Step 3: Content Security Policy Enhancement (2 hours)

**Create CSP Test**:
```typescript
// tests/e2e/security/csp.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Content Security Policy', () => {
  test('should include CSP headers', async ({ page }) => {
    const response = await page.goto('/')
    const cspHeader = response?.headers()['content-security-policy']

    expect(cspHeader).toBeTruthy()
    expect(cspHeader).toContain('default-src \'self\'')
    expect(cspHeader).toContain('frame-ancestors \'none\'')
  })

  test('should prevent inline script execution', async ({ page }) => {
    await page.goto('/')

    // Try to inject and execute malicious script
    const result = await page.evaluate(() => {
      try {
        const script = document.createElement('script')
        script.innerHTML = 'window.__XSS_TEST__ = true;'
        document.head.appendChild(script)
        return window.__XSS_TEST__ === true
      }
      catch {
        return false
      }
    })

    expect(result).toBe(false) // Script should be blocked
  })
})
```

**Enhanced CSP Configuration** (2 hours):
```typescript
// server/middleware/csp.ts
export default defineEventHandler(async (event) => {
  const nonce = generateNonce()

  // Store nonce in event context for use in templates
  event.context.cspNonce = nonce

  const cspDirectives = [
    'default-src \'self\'',
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    'style-src \'self\' \'unsafe-inline\' https:',
    'img-src \'self\' data: https:',
    'font-src \'self\' https: data:',
    'connect-src \'self\'',
    'frame-src \'none\'',
    'frame-ancestors \'none\'',
    'base-uri \'self\'',
    'form-action \'self\'',
    'upgrade-insecure-requests'
  ]

  setHeader(event, 'Content-Security-Policy', cspDirectives.join('; '))
})

function generateNonce(): string {
  // eslint-disable-next-line node/prefer-global/buffer
  return Buffer.from(crypto.randomUUID()).toString('base64')
}
```

### Day 3: Security Testing & Validation (0.0.0-beta)

**Create Security Test Suite** (4 hours):
```bash
mkdir -p tests/e2e/security
touch tests/e2e/security/headers.spec.ts
```

```typescript
// tests/e2e/security/headers.spec.ts
import { expect, test } from '@playwright/test'

test.describe('Security Headers', () => {
  test('should include all required security headers', async ({ page }) => {
    const response = await page.goto('/')
    const headers = response?.headers()

    // Test required security headers
    expect(headers?.['x-frame-options']).toBe('DENY')
    expect(headers?.['x-content-type-options']).toBe('nosniff')
    expect(headers?.['x-xss-protection']).toBe('1; mode=block')
    expect(headers?.['referrer-policy']).toBeTruthy()
    expect(headers?.['content-security-policy']).toBeTruthy()
  })

  test('should prevent clickjacking attacks', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.headers()['x-frame-options']).toBe('DENY')
  })

  test('should prevent MIME type sniffing', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.headers()['x-content-type-options']).toBe('nosniff')
  })
})
```

**Run Security Audit** (Add to package.json):
```json
{
  "scripts": {
    "security:audit": "pnpm audit --audit-level high",
    "security:headers": "node scripts/check-security-headers.js",
    "security:test": "playwright test tests/e2e/security/"
  }
}
```

---

## 🔍 Immediate Testing & Validation

After implementing the security features, run these commands to verify everything works:

```bash
# 1. Install all dependencies
pnpm install

# 2. Type checking
pnpm type-check

# 3. Linting
pnpm lint

# 4. Unit tests
pnpm test:unit

# 5. Start development server
pnpm dev

# 6. In another terminal, test security headers
curl -I http://localhost:3000

# 7. Run E2E security tests
pnpm test:e2e tests/e2e/security/

# 8. Security audit
pnpm audit --audit-level high
```

---

## 🎯 Expected Outcomes After Week 1

By the end of Week 1, you should have:

- ✅ **Security headers** implemented and tested
- ✅ **CSRF protection** for all state-changing requests
- ✅ **Content Security Policy** preventing XSS attacks
- ✅ **Automated security testing** in place
- ✅ **100% test coverage** for security features
- ✅ **No critical security vulnerabilities** detected

---

## 🚨 Troubleshooting Common Issues

### Issue: "Cannot find module '@nuxtjs/security'"
**Solution**:
```bash
pnpm add @nuxtjs/security
# Restart development server
```

### Issue: "CSRF token missing" errors in development
**Solution**:
- Check that `/api/csrf-token` endpoint is working
- Verify cookie is being set in browser dev tools
- Ensure middleware is not blocking the token endpoint

### Issue: CSP blocking legitimate scripts
**Solution**:
- Check browser console for CSP violations
- Add necessary domains to CSP whitelist
- Use nonces for inline scripts

---

## 📅 Next Steps: Week 2 Preview

Next week you'll implement:
- **Layered Architecture Foundation** (0.0.2)
- **Core Layer** with shared utilities
- **UI Layer** with atomic design system
- **API Layer** with typed contracts

This security foundation ensures your layered architecture is built on secure principles from day one.

---

**Ready to start? Begin with Step 1 and follow this guide exactly. Each step builds on the previous one, so don't skip ahead!**
