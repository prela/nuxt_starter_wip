# Enterprise Nuxt 4.1.0 Starter: Complete Work Breakdown Structure

## Project Overview

**Project Name**: Enterprise-Grade Nuxt 4.1.0 Starter with Layered Architecture
**Target Version**: 1.0.0
**Duration**: 12 weeks
**Start Date**: September 6, 2025
**Methodology**: Test-Driven Development (TDD) with Domain-Driven Design (DDD)
**WBS Principle**: 100% Rule - Each level represents complete scope of parent level

## WBS Level Structure

- **Level 1**: Project (1.0.0)
- **Level 2**: Phases (0.1.0, 0.2.0, 0.3.0, 0.4.0)
- **Level 3**: Deliverables (0.0.1, 0.0.2, etc.)
- **Level 4**: Tasks (0.0.0-alpha, 0.0.0-beta)
- **Level 5**: Activities/Work Packages (0.0.0-alpha.1, 0.0.0-alpha.2, etc.)

---

# PHASE 1: Foundation Security & Core Architecture (0.1.0)

**Duration**: 3 weeks (Weeks 1-3)
**Objective**: Establish secure, layered architecture foundation with enterprise-grade security
**Success Criteria**:
- ✅ All OWASP security headers implemented
- ✅ Nuxt layers architecture functional
- ✅ 100% test coverage for security modules
- ✅ TypeScript strict mode with zero errors
- ✅ CI/CD pipeline operational

## Deliverable 0.0.1: Security Infrastructure Implementation

**Duration**: Week 1
**Risk Level**: High
**Dependencies**: None
**Team Size**: 1-2 developers

### Task 0.0.0-alpha: Security Module Integration

**Duration**: 3 days
**TDD Approach**: Write security integration tests before implementation

#### Activity 0.0.0-alpha.1: Install and Configure nuxt-security

**Duration**: 4 hours
**Owner**: Senior Developer
**Prerequisites**: Node.js 22+, pnpm 10.15.0+

**Test Specifications (Write First)**:
```typescript
// tests/unit/security/module-integration.test.ts
describe('Security Module Integration', () => {
  test('should register security module correctly', async () => {
    const nuxt = await setupTest()
    expect(nuxt.options.modules).toContain('@nuxtjs/security')
  })

  test('should load security configuration', async () => {
    const config = await loadSecurityConfig()
    expect(config.csrf.enabled).toBe(true)
    expect(config.csp['default-src']).toBeDefined()
  })
})
```

**Implementation Steps**:

1. **Install Security Module** (1 hour)
   ```bash
   # Terminal commands
   npx nuxi@latest module add security
   pnpm install @nuxtjs/security
   ```

2. **Basic Configuration** (2 hours)
   ```typescript
   // nuxt.config.ts - Add to modules array
   export default defineNuxtConfig({
     modules: [
       '@nuxtjs/security',
       // ... other modules
     ],
     security: {
       csrf: {
         enabled: true,
         methodsToProtect: ['POST', 'PUT', 'DELETE'],
         excludedUrls: ['/api/webhooks/*']
       },
       headers: {
         crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
         contentSecurityPolicy: {
           'default-src': ['\'self\''],
           'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
           'style-src': ['\'self\'', '\'unsafe-inline\''],
           'img-src': ['\'self\'', 'data:', 'https:'],
           'font-src': ['\'self\''],
           'connect-src': ['\'self\''],
           'frame-src': ['\'none\'']
         }
       }
     }
   })
   ```

3. **Create Security Configuration File** (1 hour)
   ```typescript
   // config/security.config.ts
   export interface SecurityConfig {
     csp: CSPConfig
     csrf: CSRFConfig
     rateLimiter: RateLimiterConfig
     headers: SecurityHeadersConfig
   }

   export interface CSPConfig {
     'default-src': string[]
     'script-src': string[]
     'style-src': string[]
     'img-src': string[]
     'font-src': string[]
     'connect-src': string[]
     'frame-src': string[]
   }

   export const securityConfig: SecurityConfig = {
     csp: {
       'default-src': ['\'self\''],
       'script-src': ['\'self\'', '\'unsafe-inline\''],
       'style-src': ['\'self\'', '\'unsafe-inline\''],
       'img-src': ['\'self\'', 'data:', 'https:'],
       'font-src': ['\'self\''],
       'connect-src': ['\'self\''],
       'frame-src': ['\'none\'']
     },
     csrf: {
       enabled: true,
       secret: process.env.NUXT_CSRF_SECRET || 'default-dev-secret',
       methodsToProtect: ['POST', 'PUT', 'DELETE', 'PATCH']
     },
     rateLimiter: {
       enabled: true,
       max: 100,
       windowMs: 15 * 60 * 1000 // 15 minutes
     }
   }
   ```

**Quality Gates**:
- ✅ No TypeScript errors (`pnpm type-check`)
- ✅ Security headers visible in browser dev tools
- ✅ ESLint passes (`pnpm lint`)
- ✅ Module loads without console errors

**Testing Strategy**:
- Unit tests for configuration loading
- Integration tests for header presence
- E2E tests for security policy enforcement

#### Activity 0.0.0-alpha.2: CSRF Protection Implementation

**Duration**: 3 hours
**Complexity**: Medium
**Testing**: TDD with comprehensive coverage

**Test Specifications**:
```typescript
// tests/unit/security/csrf.test.ts
describe('CSRF Protection', () => {
  test('should generate valid CSRF token', async () => {
    const token = await generateCSRFToken()
    expect(token).toMatch(/^[a-z0-9+/]{32,}={0,2}$/i)
    expect(await validateCSRFToken(token)).toBe(true)
  })

  test('should reject invalid tokens', async () => {
    const invalidToken = 'invalid-token'
    expect(await validateCSRFToken(invalidToken)).toBe(false)
  })

  test('should handle token expiry', async () => {
    const expiredToken = await generateCSRFToken(-3600) // 1 hour ago
    expect(await validateCSRFToken(expiredToken)).toBe(false)
  })
})
```

**Implementation Steps**:

1. **Server Middleware for CSRF** (1.5 hours)
   ```typescript
   // server/middleware/csrf.ts
   import jwt from 'jsonwebtoken'

   export default defineEventHandler(async (event) => {
     const method = getMethod(event)
     const url = getRequestURL(event)

     // Skip CSRF for GET, HEAD, OPTIONS
     if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
       return
     }

     // Skip for excluded URLs
     if (isExcludedUrl(url.pathname)) {
       return
     }

     const token = getCookieValue(event, 'csrf-token')
       || getHeader(event, 'x-csrf-token')

     if (!token || !await validateCSRFToken(token)) {
       throw createError({
         statusCode: 403,
         statusMessage: 'Invalid CSRF token'
       })
     }
   })

   async function validateCSRFToken(token: string): Promise<boolean> {
     try {
       jwt.verify(token, process.env.NUXT_CSRF_SECRET || 'default-dev-secret')
       return true
     }
     catch {
       return false
     }
   }
   ```

2. **Client-Side Token Handling** (1 hour)
   ```typescript
   // composables/useCsrf.ts
   export function useCsrf() {
     const csrfToken = ref<string>('')

     const fetchCsrfToken = async () => {
       const { data } = await $fetch<{ token: string }>('/api/csrf-token')
       csrfToken.value = data.token
       return data.token
     }

     const getTokenHeaders = () => ({
       'x-csrf-token': csrfToken.value
     })

     return {
       csrfToken: readonly(csrfToken),
       fetchCsrfToken,
       getTokenHeaders
     }
   }
   ```

3. **API Endpoint for Token Generation** (30 minutes)
   ```typescript
   // server/api/csrf-token.get.ts
   import jwt from 'jsonwebtoken'

   export default defineEventHandler(async (event) => {
     const token = jwt.sign(
       {
         purpose: 'csrf',
         timestamp: Date.now()
       },
       process.env.NUXT_CSRF_SECRET || 'default-dev-secret',
       { expiresIn: '1h' }
     )

     setCookie(event, 'csrf-token', token, {
       httpOnly: false,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict'
     })

     return { token }
   })
   ```

**Quality Gates**:
- ✅ All CSRF tests pass (100% coverage)
- ✅ Form submission works with valid token
- ✅ Form submission fails with invalid token
- ✅ Token refresh mechanism functional

#### Activity 0.0.0-alpha.3: Content Security Policy Configuration

**Duration**: 2 hours
**Security Focus**: XSS prevention and script execution control

**Implementation Steps**:

1. **Enhanced CSP Configuration** (1 hour)
   ```typescript
   // server/middleware/csp.ts
   export default defineEventHandler(async (event) => {
     const nonce = generateNonce()

     setHeader(event, 'Content-Security-Policy', [
       `default-src 'self'`,
       `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
       `style-src 'self' 'unsafe-inline'`,
       `img-src 'self' data: https:`,
       `font-src 'self'`,
       `connect-src 'self'`,
       `frame-src 'none'`,
       `base-uri 'self'`,
       `form-action 'self'`
     ].join('; '))

     // Make nonce available for template usage
     event.context.cspNonce = nonce
   })

   function generateNonce(): string {
     return Buffer.from(crypto.randomUUID()).toString('base64')
   }
   ```

2. **CSP Violation Reporting** (1 hour)
   ```typescript
   // server/api/csp-report.post.ts
   export default defineEventHandler(async (event) => {
     const report = await readBody(event)

     // Log CSP violation for monitoring
     console.warn('CSP Violation:', {
       timestamp: new Date().toISOString(),
       report,
       userAgent: getHeader(event, 'user-agent'),
       ip: getClientIP(event)
     })

     // In production, send to monitoring service
     if (process.env.NODE_ENV === 'production') {
       await sendToMonitoringService(report)
     }

     return { status: 'reported' }
   })
   ```

**Quality Gates**:
- ✅ CSP headers present in all responses
- ✅ No CSP violations in browser console
- ✅ Nonce-based script execution working
- ✅ Violation reporting functional

### Task 0.0.0-beta: Security Testing & Validation

**Duration**: 2 days
**Focus**: Automated testing and documentation

#### Activity 0.0.0-beta.1: Automated Security Testing

**Duration**: 4 hours
**Tools**: Playwright, OWASP ZAP integration

**Implementation Steps**:

1. **Security Test Suite** (2 hours)
   ```typescript
   // tests/e2e/security/headers.spec.ts
   import { expect, test } from '@playwright/test'

   test.describe('Security Headers', () => {
     test('should include all required security headers', async ({ page }) => {
       const response = await page.goto('/')

       expect(response?.headers()['content-security-policy']).toBeTruthy()
       expect(response?.headers()['x-frame-options']).toBe('DENY')
       expect(response?.headers()['x-content-type-options']).toBe('nosniff')
       expect(response?.headers()['x-xss-protection']).toBe('1; mode=block')
       expect(response?.headers()['strict-transport-security']).toBeTruthy()
     })

     test('should prevent XSS attacks', async ({ page }) => {
       await page.goto('/')

       // Attempt script injection
       await page.fill('#test-input', '<script>alert("xss")</script>')
       await page.click('#submit-button')

       // Verify script didn't execute
       const alerts = []
       page.on('dialog', (dialog) => {
         alerts.push(dialog.message())
         dialog.dismiss()
       })

       expect(alerts).toHaveLength(0)
     })
   })
   ```

2. **CSRF Testing** (1 hour)
   ```typescript
   // tests/e2e/security/csrf.spec.ts
   test.describe('CSRF Protection', () => {
     test('should accept requests with valid CSRF token', async ({ page }) => {
       await page.goto('/')
       const csrfToken = await page.locator('[name="csrf-token"]').getAttribute('content')

       const response = await page.request.post('/api/test', {
         headers: { 'x-csrf-token': csrfToken },
         data: { test: 'data' }
       })

       expect(response.status()).toBe(200)
     })

     test('should reject requests without CSRF token', async ({ page }) => {
       const response = await page.request.post('/api/test', {
         data: { test: 'data' }
       })

       expect(response.status()).toBe(403)
     })
   })
   ```

3. **OWASP ZAP Integration** (1 hour)
   ```typescript
   // scripts/security-scan.ts
   import { spawn } from 'node:child_process'

   export async function runSecurityScan(): Promise<void> {
     return new Promise((resolve, reject) => {
       const zap = spawn('docker', [
         'run',
         '--rm',
         '-v',
         `${process.cwd()}/security-reports:/zap/wrk:rw`,
         'owasp/zap2docker-stable',
         'zap-baseline.py',
         '-t',
         'http://host.docker.internal:3000',
         '-J',
         '/zap/wrk/zap-report.json'
       ])

       zap.on('close', (code) => {
         if (code === 0 || code === 2) { // 2 = warnings only
           resolve()
         }
         else {
           reject(new Error(`Security scan failed with code ${code}`))
         }
       })
     })
   }
   ```

**Quality Gates**:
- ✅ All security tests pass
- ✅ OWASP ZAP scan shows no high/medium vulnerabilities
- ✅ 100% test coverage for security modules
- ✅ Performance impact < 5ms per request

---

## Deliverable 0.0.2: Layered Architecture Foundation

**Duration**: Week 2
**Risk Level**: Medium
**Dependencies**: 0.0.1 complete

### Task 0.0.0-alpha: Core Layer Implementation

**Duration**: 4 days
**Focus**: Domain-driven design with Nuxt layers

#### Activity 0.0.0-alpha.1: Create Base Layer Structure

**Duration**: 3 hours
**Architecture**: Clean Architecture principles

**Directory Structure Creation**:
```
layers/
├── core/                     # Shared utilities and base types
│   ├── nuxt.config.ts       # Core layer configuration
│   ├── types/               # Shared TypeScript interfaces
│   ├── composables/         # Reusable composition functions
│   ├── utils/               # Pure utility functions
│   ├── middleware/          # Shared middleware
│   └── plugins/             # Core plugins
├── ui/                      # Design system and components
│   ├── nuxt.config.ts
│   ├── components/          # Atomic design system
│   ├── assets/             # Design tokens, SCSS
│   └── types/              # UI-specific types
├── api/                     # Data access layer
│   ├── nuxt.config.ts
│   ├── server/             # API routes and middleware
│   ├── types/              # API contracts
│   └── composables/        # Data fetching composables
└── content/                 # Content management
    ├── nuxt.config.ts
    ├── components/         # Content-specific components
    └── types/              # Content types
```

**Implementation Steps**:

1. **Core Layer Setup** (1.5 hours)
   ```typescript
   // layers/core/nuxt.config.ts
   export default defineNuxtConfig({
     compatibilityDate: '2025-05-15',

     // Core layer specific configuration
     css: ['~/assets/css/core.css'],

     // Auto-imports for core functionality
     imports: {
       dirs: ['composables/**', 'utils/**']
     },

     // Type augmentation
     typescript: {
       includeWorkspace: true
     },

     // Runtime config for core
     runtimeConfig: {
       public: {
         appName: process.env.NUXT_PUBLIC_APP_NAME || 'Nuxt Enterprise App',
         apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api'
       }
     }
   })
   ```

2. **Base Types Definition** (1 hour)
   ```typescript
   // layers/core/types/base.ts
   export interface BaseEntity {
     id: string
     createdAt: Date
     updatedAt: Date
     version?: number
   }

   export interface ApiResponse<T> {
     data: T
     meta: ResponseMeta
     errors?: ApiError[]
   }

   export interface ResponseMeta {
     page?: number
     limit?: number
     total?: number
     hasNextPage?: boolean
     hasPreviousPage?: boolean
   }

   export interface ApiError {
     code: string
     message: string
     field?: string
     details?: Record<string, any>
   }

   export interface ValidationResult<T> {
     success: boolean
     data?: T
     errors?: ValidationError[]
   }

   export interface ValidationError {
     path: (string | number)[]
     message: string
     code: string
   }
   ```

3. **Core Composables** (30 minutes)
   ```typescript
   // layers/core/composables/useValidation.ts
   import { z } from 'zod'

   export function useValidation<T>(schema: z.ZodSchema<T>) {
     const validate = (data: unknown): ValidationResult<T> => {
       try {
         const validatedData = schema.parse(data)
         return { success: true, data: validatedData }
       }
       catch (error) {
         if (error instanceof z.ZodError) {
           return {
             success: false,
             errors: error.errors.map(err => ({
               path: err.path,
               message: err.message,
               code: err.code
             }))
           }
         }
         throw error
       }
     }

     const validateAsync = async (data: unknown): Promise<ValidationResult<T>> => {
       try {
         const validatedData = await schema.parseAsync(data)
         return { success: true, data: validatedData }
       }
       catch (error) {
         if (error instanceof z.ZodError) {
           return {
             success: false,
             errors: error.errors.map(err => ({
               path: err.path,
               message: err.message,
               code: err.code
             }))
           }
         }
         throw error
       }
     }

     return { validate, validateAsync }
   }
   ```

**Quality Gates**:
- ✅ All layers load without errors
- ✅ TypeScript resolves imports correctly
- ✅ No circular dependencies detected
- ✅ Layer configuration validates successfully

#### Activity 0.0.0-alpha.2: UI Layer Development

**Duration**: 5 hours
**Focus**: Atomic Design System implementation

**Implementation Steps**:

1. **UI Layer Configuration** (1 hour)
   ```typescript
   // layers/ui/nuxt.config.ts
   export default defineNuxtConfig({
     extends: ['../core'],

     modules: [
       '@nuxt/ui',
       '@nuxtjs/tailwindcss'
     ],

     css: [
       '~/assets/css/design-system.css'
     ],

     components: [
       {
         path: '~/components',
         extensions: ['.vue'],
         pathPrefix: false
       }
     ],

     ui: {
       global: true,
       icons: ['heroicons', 'simple-icons']
     }
   })
   ```

2. **Design System Foundation** (2 hours)
   ```scss
   // layers/ui/assets/css/design-system.css
   :root {
     /* Design Tokens */
     --color-primary-50: #eff6ff;
     --color-primary-500: #3b82f6;
     --color-primary-900: #1e3a8a;

     --spacing-xs: 0.25rem;
     --spacing-sm: 0.5rem;
     --spacing-md: 1rem;
     --spacing-lg: 1.5rem;
     --spacing-xl: 3rem;

     --border-radius-sm: 0.125rem;
     --border-radius-md: 0.375rem;
     --border-radius-lg: 0.5rem;

     --font-family-sans: ui-sans-serif, system-ui, sans-serif;
     --font-family-mono: ui-monospace, monospace;
   }

   .design-system {
     font-family: var(--font-family-sans);
   }
   ```

3. **Atomic Components** (2 hours)
   ```vue
   <!-- layers/ui/components/atoms/Button.vue -->
   <script setup lang="ts">
   interface Props {
     variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
     size?: 'sm' | 'md' | 'lg'
     disabled?: boolean
     loading?: boolean
     icon?: string
     type?: 'button' | 'submit' | 'reset'
   }

   const props = withDefaults(defineProps<Props>(), {
     variant: 'primary',
     size: 'md',
     type: 'button'
   })

   const emit = defineEmits<{
     click: [event: MouseEvent]
   }>()

   const buttonClasses = computed(() => {
     const base = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'

     const variants = {
       primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
       secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
       outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500',
       ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500'
     }

     const sizes = {
       sm: 'px-3 py-2 text-sm',
       md: 'px-4 py-2 text-sm',
       lg: 'px-6 py-3 text-base'
     }

     return [
       base,
       variants[props.variant],
       sizes[props.size],
       props.disabled && 'opacity-50 cursor-not-allowed'
     ].filter(Boolean).join(' ')
   })

   function handleClick(event: MouseEvent) {
     if (!props.disabled && !props.loading) {
       emit('click', event)
     }
   }
   </script>

   <template>
     <button
       :class="buttonClasses"
       :disabled="disabled || loading"
       :type="type"
       v-bind="$attrs"
       @click="handleClick"
     >
       <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin" />
       <Icon v-else-if="icon" :name="icon" />
       <slot />
     </button>
   </template>
   ```

**Testing Strategy**:
```typescript
// layers/ui/tests/components/Button.test.ts
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'
import Button from '~/components/atoms/Button.vue'

describe('Button Component', () => {
  test('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Click me' }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  test('emits click event when clicked', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  test('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
```

**Quality Gates**:
- ✅ All component tests pass with 100% coverage
- ✅ Design tokens are consistent across components
- ✅ Accessibility standards met (WCAG 2.1 AA)
- ✅ Performance budget maintained (<10kb per component)

---

# PHASE 2: Feature Enhancement & Integration (0.2.0)

**Duration**: 3 weeks (Weeks 4-6)
**Objective**: Implement advanced features including i18n, PWA, and performance optimization

## Deliverable 0.0.3: Internationalization & Accessibility

**Duration**: 2 weeks (Weeks 4-5)
**Focus**: Multi-language support and WCAG 2.1 AA compliance

### Task 0.0.0-alpha: i18n Implementation

**Duration**: 5 days
**Complexity**: High

#### Activity 0.0.0-alpha.1: @nuxtjs/i18n Module Setup

**Duration**: 4 hours
**Test-First Approach**: Locale detection and switching tests

**Test Specifications**:
```typescript
// tests/unit/i18n/locale-detection.test.ts
describe('Locale Detection', () => {
  test('should detect browser locale', () => {
    const mockNavigator = { language: 'fr-FR', languages: ['fr-FR', 'en-US'] }
    const detectedLocale = detectBrowserLocale(mockNavigator)
    expect(detectedLocale).toBe('fr')
  })

  test('should fallback to default locale', () => {
    const mockNavigator = { language: 'unsupported', languages: [] }
    const detectedLocale = detectBrowserLocale(mockNavigator)
    expect(detectedLocale).toBe('en')
  })
})
```

**Implementation Steps**:

1. **Module Installation and Configuration** (2 hours)
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: [
       '@nuxtjs/i18n'
     ],

     i18n: {
       locales: [
         { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
         { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' },
         { code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr.json' },
         { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' }
       ],
       defaultLocale: 'en',
       lazy: true,
       langDir: 'locales/',
       strategy: 'prefix_except_default',
       detectBrowserLanguage: {
         useCookie: true,
         cookieKey: 'i18n_redirected',
         redirectOn: 'root'
       },
       seo: true,
       baseUrl: process.env.NUXT_PUBLIC_SITE_URL
     }
   })
   ```

2. **Locale Files Structure** (1.5 hours)
   ```json
   // locales/en.json
   {
     "common": {
       "loading": "Loading...",
       "error": "An error occurred",
       "save": "Save",
       "cancel": "Cancel",
       "delete": "Delete",
       "edit": "Edit",
       "close": "Close",
       "search": "Search",
       "filter": "Filter"
     },
     "navigation": {
       "home": "Home",
       "about": "About",
       "contact": "Contact",
       "blog": "Blog",
       "products": "Products",
       "services": "Services"
     },
     "auth": {
       "login": "Sign In",
       "logout": "Sign Out",
       "register": "Sign Up",
       "email": "Email",
       "password": "Password",
       "forgot_password": "Forgot Password?",
       "remember_me": "Remember me"
     },
     "validation": {
       "required": "This field is required",
       "email": "Please enter a valid email address",
       "min_length": "Must be at least {count} characters",
       "max_length": "Must be no more than {count} characters",
       "password_mismatch": "Passwords do not match"
     },
     "errors": {
       "404": {
         "title": "Page Not Found",
         "description": "The page you're looking for doesn't exist.",
         "go_home": "Go Home"
       },
       "500": {
         "title": "Server Error",
         "description": "Something went wrong on our end.",
         "try_again": "Try Again"
       }
     }
   }
   ```

3. **Type-Safe Translation Composable** (30 minutes)
   ```typescript
   // composables/useI18nTyped.ts
   import type { LocaleMessages } from '@nuxtjs/i18n'
   import en from '~/locales/en.json'

   type MessageKey = DeepKeyOf<typeof en>

   export function useI18nTyped() {
     const { t, locale, locales, setLocale } = useI18n()

     const typedT = (key: MessageKey, values?: Record<string, any>) => {
       return t(key, values)
     }

     return {
       t: typedT,
       locale,
       locales,
       setLocale
     }
   }

   type DeepKeyOf<T> = (
     T extends Record<string, any>
       ? {
           [K in keyof T]: K extends string
             ? T[K] extends Record<string, any>
               ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
               : `${K}`
             : never
         }[keyof T]
       : never
   ) & string
   ```

**Quality Gates**:
- ✅ All locales load without errors
- ✅ Locale switching works correctly
- ✅ SEO meta tags updated per locale
- ✅ Type safety maintained in translations

#### Activity 0.0.0-alpha.2: RTL Support Implementation

**Duration**: 3 hours
**Focus**: Right-to-left language support (Arabic, Hebrew)

**Implementation Steps**:

1. **RTL Detection and CSS** (2 hours)
   ```typescript
   // composables/useRTL.ts
   export function useRTL() {
     const { locale } = useI18n()

     const rtlLocales = ['ar', 'he', 'fa', 'ur']

     const isRTL = computed(() =>
       rtlLocales.includes(locale.value)
     )

     const direction = computed(() =>
       isRTL.value ? 'rtl' : 'ltr'
     )

     return { isRTL, direction }
   }
   ```

   ```css
   /* assets/css/rtl.css */
   .rtl {
     direction: rtl;
   }

   .rtl .text-left { text-align: right; }
   .rtl .text-right { text-align: left; }
   .rtl .ml-4 { margin-left: 0; margin-right: 1rem; }
   .rtl .mr-4 { margin-right: 0; margin-left: 1rem; }
   ```

2. **RTL-Aware Components** (1 hour)
   ```vue
   <!-- components/organisms/Navbar.vue -->
   <script setup lang="ts">
   const { isRTL, direction } = useRTL()
   </script>

   <template>
     <nav :class="{ rtl: isRTL }" :dir="direction">
       <div class="flex items-center justify-between">
         <Logo />
         <div :class="isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'">
           <NuxtLink to="/">
             {{ $t('navigation.home') }}
           </NuxtLink>
           <NuxtLink to="/about">
             {{ $t('navigation.about') }}
           </NuxtLink>
         </div>
       </div>
     </nav>
   </template>
   ```

**Quality Gates**:
- ✅ RTL layouts render correctly
- ✅ Navigation flows correctly in RTL
- ✅ Text alignment adapts to direction
- ✅ Icons and images positioned correctly

### Task 0.0.0-beta: Accessibility Implementation

**Duration**: 3 days
**Target**: WCAG 2.1 AA compliance

#### Activity 0.0.0-beta.1: Keyboard Navigation & Screen Readers

**Duration**: 6 hours
**Testing**: Automated accessibility testing with axe-core

**Implementation Steps**:

1. **Accessibility Testing Setup** (2 hours)
   ```typescript
   import AxeBuilder from '@axe-core/playwright'
   // tests/e2e/accessibility/a11y.spec.ts
   import { expect, test } from '@playwright/test'

   test.describe('Accessibility Tests', () => {
     test('should not have any automatically detectable accessibility issues', async ({ page }) => {
       await page.goto('/')

       const accessibilityScanResults = await new AxeBuilder({ page })
         .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
         .analyze()

       expect(accessibilityScanResults.violations).toEqual([])
     })

     test('should support keyboard navigation', async ({ page }) => {
       await page.goto('/')

       // Tab through navigation
       await page.keyboard.press('Tab')
       const firstLink = page.locator('a:focus')
       await expect(firstLink).toBeVisible()

       await page.keyboard.press('Tab')
       const secondLink = page.locator('a:focus')
       await expect(secondLink).toBeVisible()

       // Test Enter key activation
       await page.keyboard.press('Enter')
       await expect(page).toHaveURL(/.*/)
     })
   })
   ```

2. **Keyboard Navigation Enhancement** (2 hours)
   ```vue
   <!-- components/molecules/DropdownMenu.vue -->
   <script setup lang="ts">
   interface MenuItem {
     id: string
     label: string
     href: string
   }

   const props = defineProps<{
     trigger: string
     items: MenuItem[]
   }>()

   const isOpen = ref(false)
   const triggerRef = ref<HTMLButtonElement>()
   const menuRef = ref<HTMLUListElement>()
   const menuItems = ref<HTMLAnchorElement[]>([])
   const triggerId = `dropdown-${Math.random().toString(36).substr(2, 9)}`

   function toggle() {
     isOpen.value = !isOpen.value
   }

   function close() {
     isOpen.value = false
     triggerRef.value?.focus()
   }

   function focusNext(currentIndex: number) {
     const nextIndex = (currentIndex + 1) % menuItems.value.length
     menuItems.value[nextIndex]?.focus()
   }

   function focusPrevious(currentIndex: number) {
     const previousIndex = currentIndex === 0 ? menuItems.value.length - 1 : currentIndex - 1
     menuItems.value[previousIndex]?.focus()
   }

   function selectItem(item: MenuItem) {
     // Handle selection
     close()
   }
   </script>

   <template>
     <div class="relative" @keydown="handleKeydown">
       <button
         ref="triggerRef"
         :aria-expanded="isOpen"
         aria-haspopup="true"
         @click="toggle"
         @keydown.enter.space="toggle"
         @keydown.down="openAndFocusFirst"
         @keydown.up="openAndFocusLast"
       >
         {{ trigger }}
       </button>

       <ul
         v-show="isOpen"
         ref="menuRef"
         role="menu"
         :aria-labelledby="triggerId"
         class="absolute z-10 bg-white border rounded shadow-lg"
       >
         <li
           v-for="(item, index) in items"
           :key="item.id"
           role="none"
         >
           <a
             :ref="el => menuItems[index] = el"
             :href="item.href"
             role="menuitem"
             :tabindex="isOpen ? 0 : -1"
             @click="selectItem(item)"
             @keydown.enter.space.prevent="selectItem(item)"
             @keydown.down="focusNext(index)"
             @keydown.up="focusPrevious(index)"
             @keydown.escape="close"
           >
             {{ item.label }}
           </a>
         </li>
       </ul>
     </div>
   </template>
   ```

3. **Screen Reader Support** (2 hours)
   ```vue
   <!-- components/molecules/FormField.vue -->
   <script setup lang="ts">
   const props = defineProps<{
     label: string
     modelValue: string
     type?: string
     required?: boolean
     disabled?: boolean
     error?: string
     helpText?: string
     hideLabel?: boolean
   }>()

   const emit = defineEmits<{
     'update:modelValue': [value: string]
   }>()

   const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`
   const errorId = `error-${fieldId}`
   const hasError = computed(() => !!props.error)
   </script>

   <template>
     <div class="form-field">
       <label
         :for="fieldId"
         class="block text-sm font-medium text-gray-700"
         :class="{ 'sr-only': hideLabel }"
       >
         {{ label }}
         <span v-if="required" aria-label="required" class="text-red-500">*</span>
       </label>

       <div class="mt-1 relative">
         <input
           :id="fieldId"
           ref="inputRef"
           v-model="modelValue"
           :type="type"
           :required="required"
           :disabled="disabled"
           :aria-invalid="hasError"
           :aria-describedby="errorId"
           class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
           :class="{
             'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500': hasError,
           }"
           v-bind="$attrs"
         >

         <div
           v-if="hasError"
           class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
         >
           <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-500" />
         </div>
       </div>

       <p
         v-if="hasError"
         :id="errorId"
         class="mt-2 text-sm text-red-600"
         role="alert"
         aria-live="polite"
       >
         {{ error }}
       </p>

       <p
         v-else-if="helpText"
         class="mt-2 text-sm text-gray-500"
       >
         {{ helpText }}
       </p>
     </div>
   </template>
   ```

**Quality Gates**:
- ✅ No axe-core violations (WCAG 2.1 AA)
- ✅ Full keyboard navigation support
- ✅ Screen reader compatibility verified
- ✅ Color contrast ratios meet AA standards
- ✅ Focus management implemented correctly

---

## Deliverable 0.0.4: PWA & Performance Optimization

**Duration**: Week 6
**Focus**: Progressive Web App capabilities and Core Web Vitals optimization

### Task 0.0.0-alpha: PWA Implementation

**Duration**: 3 days
**Tools**: Workbox, PWA module

#### Activity 0.0.0-alpha.1: Service Worker Setup

**Duration**: 4 hours
**Focus**: Offline capabilities and caching strategies

**Implementation Steps**:

1. **PWA Module Installation** (1 hour)
   ```bash
   pnpm add @nuxtjs/pwa
   ```

   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['@nuxtjs/pwa'],

     pwa: {
       registerType: 'autoUpdate',
       workbox: {
         navigateFallback: '/',
         globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
         runtimeCaching: [
           {
             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
             handler: 'CacheFirst',
             options: {
               cacheName: 'google-fonts-cache',
               expiration: {
                 maxEntries: 10,
                 maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
               }
             }
           },
           {
             urlPattern: /^https:\/\/api\./.*/i,
             handler: 'NetworkFirst',
             options: {
               cacheName: 'api-cache',
               expiration: {
                 maxEntries: 50,
                 maxAgeSeconds: 60 * 5 // 5 minutes
               }
             }
           }
         ]
       },

       manifest: {
         name: 'Nuxt Enterprise App',
         short_name: 'NuxtApp',
         description: 'Enterprise-grade Nuxt application',
         theme_color: '#3b82f6',
         background_color: '#ffffff',
         display: 'standalone',
         orientation: 'portrait',
         scope: '/',
         start_url: '/',
         icons: [
           {
             src: 'icons/icon-72x72.png',
             sizes: '72x72',
             type: 'image/png'
           },
           {
             src: 'icons/icon-96x96.png',
             sizes: '96x96',
             type: 'image/png'
           },
           {
             src: 'icons/icon-128x128.png',
             sizes: '128x128',
             type: 'image/png'
           },
           {
             src: 'icons/icon-144x144.png',
             sizes: '144x144',
             type: 'image/png'
           },
           {
             src: 'icons/icon-152x152.png',
             sizes: '152x152',
             type: 'image/png'
           },
           {
             src: 'icons/icon-192x192.png',
             sizes: '192x192',
             type: 'image/png'
           },
           {
             src: 'icons/icon-384x384.png',
             sizes: '384x384',
             type: 'image/png'
           },
           {
             src: 'icons/icon-512x512.png',
             sizes: '512x512',
             type: 'image/png'
           }
         ]
       }
     }
   })
   ```

2. **Offline Page Implementation** (2 hours)
   ```vue
   <!-- pages/offline.vue -->
   <script setup lang="ts">
   const { $t } = useI18n()
   const isChecking = ref(false)

   const cachedPages = ref([
     { url: '/', title: $t('navigation.home') },
     { url: '/about', title: $t('navigation.about') },
     { url: '/contact', title: $t('navigation.contact') }
   ])

   async function checkConnection() {
     isChecking.value = true

     try {
       const response = await fetch('/', { method: 'HEAD' })
       if (response.ok) {
         await navigateTo('/')
       }
     }
     catch {
       // Still offline
     }
     finally {
       isChecking.value = false
     }
   }

   // Meta tags for offline page
   useHead({
     title: $t('offline.title'),
     meta: [
       { name: 'robots', content: 'noindex' }
     ]
   })
   </script>

   <template>
     <div class="min-h-screen flex items-center justify-center bg-gray-50">
       <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
         <Icon name="heroicons:wifi-slash" class="mx-auto h-12 w-12 text-gray-400" />

         <h1 class="mt-4 text-xl font-semibold text-gray-900">
           {{ $t('offline.title') }}
         </h1>

         <p class="mt-2 text-sm text-gray-600">
           {{ $t('offline.description') }}
         </p>

         <div class="mt-6">
           <button
             :disabled="isChecking"
             class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
             @click="checkConnection"
           >
             <Icon v-if="isChecking" name="heroicons:arrow-path" class="animate-spin inline mr-2" />
             {{ $t('offline.try_again') }}
           </button>
         </div>

         <div class="mt-4">
           <h3 class="text-sm font-medium text-gray-900">
             {{ $t('offline.cached_pages') }}
           </h3>
           <ul class="mt-2 space-y-1">
             <li v-for="page in cachedPages" :key="page.url">
               <NuxtLink
                 :to="page.url"
                 class="text-indigo-600 hover:text-indigo-500 text-sm"
               >
                 {{ page.title }}
               </NuxtLink>
             </li>
           </ul>
         </div>
       </div>
     </div>
   </template>
   ```

3. **Update Notification Component** (1 hour)
   ```vue
   <!-- components/organisms/UpdateNotification.vue -->
   <script setup lang="ts">
   const showUpdateNotification = ref(false)
   const { $pwa } = useNuxtApp()

   onMounted(() => {
     if ($pwa?.updateAvailable) {
       showUpdateNotification.value = true
     }
   })

   async function updateApp() {
     await $pwa.update()
     showUpdateNotification.value = false
   }

   function dismissUpdate() {
     showUpdateNotification.value = false
   }

   function updateLater() {
     showUpdateNotification.value = false
     // Set reminder for later
     setTimeout(() => {
       showUpdateNotification.value = true
     }, 60 * 60 * 1000) // 1 hour
   }
   </script>

   <template>
     <div
       v-if="showUpdateNotification"
       class="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-indigo-600 text-white p-4 rounded-lg shadow-lg z-50"
     >
       <div class="flex items-start">
         <Icon name="heroicons:arrow-down-circle" class="h-6 w-6 mt-0.5 mr-3 flex-shrink-0" />
         <div class="flex-1">
           <p class="text-sm font-medium">
             {{ $t('pwa.update_available') }}
           </p>
           <p class="text-sm opacity-90 mt-1">
             {{ $t('pwa.update_description') }}
           </p>
         </div>
         <button
           class="ml-3 text-indigo-200 hover:text-white"
           @click="dismissUpdate"
         >
           <Icon name="heroicons:x-mark" class="h-5 w-5" />
         </button>
       </div>

       <div class="mt-4 flex space-x-3">
         <button
           class="bg-white text-indigo-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100"
           @click="updateApp"
         >
           {{ $t('pwa.update_now') }}
         </button>
         <button
           class="text-indigo-200 hover:text-white px-4 py-2 rounded text-sm font-medium"
           @click="updateLater"
         >
           {{ $t('pwa.update_later') }}
         </button>
       </div>
     </div>
   </template>
   ```

**Quality Gates**:
- ✅ Service worker registers successfully
- ✅ Offline page loads without network
- ✅ Update notifications work correctly
- ✅ Lighthouse PWA score ≥ 90

---

This comprehensive WBS continues with detailed implementation plans for all remaining phases, including Performance Optimization, Production Monitoring, and Final Documentation phases. Each activity includes specific test specifications, TypeScript interfaces, quality gates, and step-by-step implementation guidance following TDD principles.

Would you like me to continue with the complete breakdown of Phase 3 (Production Optimization) and Phase 4 (Documentation & Deployment), including detailed implementation guides for performance monitoring, SEO optimization, and comprehensive documentation systems?
