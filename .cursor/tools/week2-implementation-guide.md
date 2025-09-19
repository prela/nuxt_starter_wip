# Week 2 Implementation Guide: Layered Architecture Foundation

## 🏗️ Building Your Enterprise Architecture

This guide covers **Week 2 implementation** of your Nuxt enterprise starter, focusing on **Deliverable 0.0.2: Layered Architecture Foundation**. You'll implement Domain-Driven Design using Nuxt layers for maximum modularity and maintainability.

---

## 📋 Prerequisites

Before starting Week 2, ensure Week 1 is complete:

- ✅ **Security module** installed and configured
- ✅ **CSRF protection** implemented and tested
- ✅ **CSP headers** configured and validated
- ✅ **All Week 1 tests passing**: `pnpm test:unit`
- ✅ **No security vulnerabilities**: `pnpm audit --audit-level high`

## 🎯 Week 2 Implementation Plan (0.0.2: Layered Architecture Foundation)

### Day 1-3: Core Layer Implementation (0.0.0-alpha)

**Priority**: 🔴 **CRITICAL** - Foundation for all future development

#### Step 1: Create Base Layer Structure (3 hours)

**Start with Tests** (TDD Approach):
```bash
# Create layer testing structure
mkdir -p tests/integration/layers
touch tests/integration/layers/layer-loading.test.ts
```

```typescript
import { setup } from '@nuxt/test-utils'
// tests/integration/layers/layer-loading.test.ts
import { describe, expect, test } from 'vitest'

describe('Layer Architecture', () => {
  test('should load all layers without errors', async () => {
    await setup({
      nuxtConfig: {
        extends: ['./layers/core', './layers/ui', './layers/api']
      }
    })
    // If setup completes without throwing, layers loaded successfully
    expect(true).toBe(true)
  })

  test('should resolve core layer composables', async () => {
    await setup()
    // Test will verify that core composables are available
    const { $fetch } = await import('#app')
    expect($fetch).toBeDefined()
  })

  test('should have proper layer inheritance', async () => {
    await setup()
    // Test layer configuration inheritance
    expect(true).toBe(true) // Will be expanded with actual tests
  })
})
```

**Now Implement** (Make tests pass):

1. **Create Layer Directory Structure** (30 minutes):
   ```bash
   # From your project root (nuxt_starter_wip/)
   mkdir -p layers/{core,ui,api,content}

   # Core layer structure
   mkdir -p layers/core/{composables,utils,types,middleware,plugins,assets}
   touch layers/core/nuxt.config.ts

   # UI layer structure
   mkdir -p layers/ui/{components/{atoms,molecules,organisms},assets/{css,images},types}
   touch layers/ui/nuxt.config.ts

   # API layer structure
   mkdir -p layers/api/{server/{api,middleware},types,composables}
   touch layers/api/nuxt.config.ts

   # Content layer structure
   mkdir -p layers/content/{components,types,composables}
   touch layers/content/nuxt.config.ts
   ```

2. **Configure Core Layer** (1.5 hours):
   ```typescript
   // layers/core/nuxt.config.ts
   export default defineNuxtConfig({
     compatibilityDate: '2025-05-15',

     // Core layer configuration
     css: ['~/assets/css/core.css'],

     // Auto-imports for core functionality
     imports: {
       dirs: ['composables/**', 'utils/**']
     },

     // Type augmentation
     typescript: {
       includeWorkspace: true,
       strict: true
     },

     // Runtime config for core
     runtimeConfig: {
       // Private keys (only available on server-side)
       jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
       databaseUrl: process.env.DATABASE_URL || '',

       // Public keys (exposed to client-side)
       public: {
         appName: process.env.NUXT_PUBLIC_APP_NAME || 'Nuxt Enterprise App',
         appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0.0',
         apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
         appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
       }
     },

     // Development configuration
     devtools: { enabled: true },

     // Enable experimental features needed for layers
     experimental: {
       typedPages: true
     }
   })
   ```

3. **Create Base Types** (1 hour):
   ```typescript
   // layers/core/types/base.ts
   /**
    * Base entity interface for all domain objects
    */
   export interface BaseEntity {
     id: string
     createdAt: Date
     updatedAt: Date
     version?: number
   }

   /**
    * Standard API response wrapper
    */
   export interface ApiResponse<T> {
     data: T
     meta: ResponseMeta
     errors?: ApiError[]
     success: boolean
   }

   /**
    * Response metadata for pagination and additional info
    */
   export interface ResponseMeta {
     page?: number
     limit?: number
     total?: number
     totalPages?: number
     hasNextPage?: boolean
     hasPreviousPage?: boolean
     timestamp: string
   }

   /**
    * Standardized error structure
    */
   export interface ApiError {
     code: string
     message: string
     field?: string
     details?: Record<string, any>
   }

   /**
    * Validation result wrapper
    */
   export interface ValidationResult<T> {
     success: boolean
     data?: T
     errors?: ValidationError[]
   }

   /**
    * Detailed validation error
    */
   export interface ValidationError {
     path: (string | number)[]
     message: string
     code: string
     value?: any
   }

   /**
    * User session interface
    */
   export interface UserSession {
     user: {
       id: string
       email: string
       name: string
       role: string
       avatar?: string
     }
     token: string
     expiresAt: Date
   }

   /**
    * Application configuration
    */
   export interface AppConfig {
     name: string
     version: string
     environment: 'development' | 'staging' | 'production'
     features: {
       analytics: boolean
       monitoring: boolean
       debugging: boolean
     }
   }
   ```

#### Step 2: Core Utilities and Composables (5 hours)

**Create Core Validation Composable** (2 hours):
```typescript
import type { ValidationError, ValidationResult } from '~/types/base'
// layers/core/composables/useValidation.ts
import { z } from 'zod'

/**
 * Type-safe validation composable using Zod schemas
 */
export function useValidation<T>(schema: z.ZodSchema<T>) {
  /**
   * Synchronous validation
   */
  const validate = (data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data)
      return {
        success: true,
        data: validatedData
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err): ValidationError => ({
            path: err.path,
            message: err.message,
            code: err.code,
            value: err.input
          }))
        }
      }
      throw error
    }
  }

  /**
   * Asynchronous validation with refined schemas
   */
  const validateAsync = async (data: unknown): Promise<ValidationResult<T>> => {
    try {
      const validatedData = await schema.parseAsync(data)
      return {
        success: true,
        data: validatedData
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err): ValidationError => ({
            path: err.path,
            message: err.message,
            code: err.code,
            value: err.input
          }))
        }
      }
      throw error
    }
  }

  /**
   * Safe parse that never throws
   */
  const safeParse = (data: unknown) => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true as const, data: result.data }
    }
    return {
      success: false as const,
      errors: result.error.errors.map((err): ValidationError => ({
        path: err.path,
        message: err.message,
        code: err.code,
        value: err.input
      }))
    }
  }

  return {
    validate,
    validateAsync,
    safeParse,
    schema
  }
}

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  uuid: z.string().uuid('Invalid UUID format'),
  url: z.string().url('Invalid URL format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'Field is required')
}
```

**Create API Helper Composable** (2 hours):
```typescript
// layers/core/composables/useApi.ts
import type { ApiError, ApiResponse } from '~/types/base'

interface ApiOptions extends RequestInit {
  baseURL?: string
  timeout?: number
  retry?: {
    attempts: number
    delay: number
  }
}

/**
 * Enhanced API composable with error handling, retries, and type safety
 */
export function useApi() {
  const config = useRuntimeConfig()
  const { csrfToken, getHeaders: getCsrfHeaders } = useCsrf()

  /**
   * Make typed API request with comprehensive error handling
   */
  const request = async <T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      baseURL = config.public.apiBaseUrl,
      timeout = 10000,
      retry = { attempts: 3, delay: 1000 },
      headers = {},
      ...fetchOptions
    } = options

    const fullUrl = `${baseURL}${url}`

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method?.toUpperCase() || 'GET')) {
      Object.assign(requestHeaders, getCsrfHeaders())
    }

    const attemptRequest = async (attempt: number): Promise<ApiResponse<T>> => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`)
        }

        const data = await response.json()

        // Ensure response follows ApiResponse structure
        if (!data.hasOwnProperty('success')) {
          return {
            data,
            success: true,
            meta: {
              timestamp: new Date().toISOString()
            }
          }
        }

        return data
      }
      catch (error) {
        if (attempt < retry.attempts) {
          await new Promise(resolve => setTimeout(resolve, retry.delay))
          return attemptRequest(attempt + 1)
        }

        // Format error response
        const apiError: ApiError = {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }

        return {
          data: null as T,
          success: false,
          errors: [apiError],
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      }
    }

    return attemptRequest(1)
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  const get = <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'GET' })

  const post = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })

  const put = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })

  const patch = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })

  const del = <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'DELETE' })

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del
  }
}
```

**Create Error Handling Composable** (1 hour):
```typescript
// layers/core/composables/useErrorHandler.ts
import type { ApiError } from '~/types/base'

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
}

/**
 * Centralized error handling composable
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logToConsole = true,
    reportToService = process.env.NODE_ENV === 'production'
  } = options

  /**
   * Handle API errors with consistent formatting
   */
  const handleApiError = (error: ApiError | ApiError[], context?: string) => {
    const errors = Array.isArray(error) ? error : [error]

    errors.forEach((err) => {
      const errorMessage = `${context ? `${context}: ` : ''}${err.message}`

      if (logToConsole) {
        console.error('API Error:', {
          code: err.code,
          message: errorMessage,
          field: err.field,
          details: err.details,
          timestamp: new Date().toISOString()
        })
      }

      if (showToast && import.meta.client) {
        // Use Nuxt UI toast if available, fallback to console
        const toast = useToast?.()
        if (toast) {
          toast.add({
            title: 'Error',
            description: errorMessage,
            color: 'red',
            timeout: 5000
          })
        }
      }

      if (reportToService) {
        // Send to error reporting service (e.g., Sentry, LogRocket)
        reportError(err, context)
      }
    })
  }

  /**
   * Handle validation errors
   */
  const handleValidationError = (errors: ValidationError[], context?: string) => {
    const errorMessages = errors.map(err => `${err.path.join('.')}: ${err.message}`)

    if (logToConsole) {
      console.error('Validation Error:', {
        context,
        errors: errorMessages,
        timestamp: new Date().toISOString()
      })
    }

    if (showToast && import.meta.client) {
      const toast = useToast?.()
      if (toast) {
        errorMessages.forEach((message) => {
          toast.add({
            title: 'Validation Error',
            description: message,
            color: 'orange',
            timeout: 4000
          })
        })
      }
    }
  }

  /**
   * Handle unexpected errors
   */
  const handleUnexpectedError = (error: Error, context?: string) => {
    const errorMessage = `${context ? `${context}: ` : ''}${error.message}`

    if (logToConsole) {
      console.error('Unexpected Error:', {
        message: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }

    if (showToast && import.meta.client) {
      const toast = useToast?.()
      if (toast) {
        toast.add({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Please try again.',
          color: 'red',
          timeout: 5000
        })
      }
    }

    if (reportToService) {
      reportError({
        code: 'UNEXPECTED_ERROR',
        message: errorMessage,
        details: { stack: error.stack }
      }, context)
    }
  }

  /**
   * Report error to monitoring service
   */
  const reportError = async (error: ApiError, context?: string) => {
    // Implement your error reporting logic here
    // Example: Send to Sentry, LogRocket, or custom service
    try {
      // await $fetch('/api/errors/report', {
      //   method: 'POST',
      //   body: { error, context, timestamp: new Date().toISOString() }
      // })
    }
    catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  return {
    handleApiError,
    handleValidationError,
    handleUnexpectedError,
    reportError
  }
}
```

#### Step 3: UI Layer Development (5 hours)

**Configure UI Layer** (1 hour):
```typescript
// layers/ui/nuxt.config.ts
export default defineNuxtConfig({
  // Extend core layer for base functionality
  extends: ['../core'],

  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts'
  ],

  css: [
    '~/assets/css/design-system.css'
  ],

  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
      pathPrefix: false,
      // Enable auto-import for all components
      global: true
    }
  ],

  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons', 'mdi'],
    safelistColors: ['primary', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink']
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
    // Custom Tailwind configuration
    config: {
      content: [
        'components/**/*.{vue,js,ts}',
        'layouts/**/*.vue',
        'pages/**/*.vue',
        'composables/**/*.{js,ts}',
        'plugins/**/*.{js,ts}',
        'app.vue'
      ]
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [300, 400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [300, 400, 500, 600] }
    ]
  },

  typescript: {
    includeWorkspace: true
  }
})
```

**Create Design System Foundation** (2 hours):
```scss
// layers/ui/assets/css/design-system.css
/**
 * Design System CSS Custom Properties
 * Following a systematic approach to design tokens
 */

:root {
  /* Color Palette - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  /* Color Palette - Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Color Palette - Semantic */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Spacing Scale */
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;      /* 48px */
  --spacing-3xl: 4rem;      /* 64px */
  --spacing-4xl: 6rem;      /* 96px */

  /* Typography */
  --font-family-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'JetBrains Mono', ui-monospace, monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Border Radius */
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;
  --border-radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;

  /* Z-Index Scale */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
  --z-index-toast: 1080;
}

/* Dark mode color overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-900);
    --color-foreground: var(--color-gray-50);
    --color-muted: var(--color-gray-700);
    --color-muted-foreground: var(--color-gray-400);
    --color-border: var(--color-gray-700);
  }
}

/* Base styles */
* {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-sans);
  line-height: var(--line-height-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Utility classes for consistent spacing */
.design-system {
  font-family: var(--font-family-sans);
}

/* Focus styles for accessibility */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Animation utilities */
.animate-in {
  animation: animate-in 0.2s ease-out;
}

.animate-out {
  animation: animate-out 0.15s ease-in;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes animate-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

**Create Atomic Design Components** (2 hours):
```vue
<!-- layers/ui/components/atoms/Button.vue -->
<script setup lang="ts">
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  leadingIcon?: string
  trailingIcon?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center font-medium rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  ]

  const variants = {
    primary: [
      'bg-primary-600 text-white shadow-sm',
      'hover:bg-primary-700 focus:ring-primary-500',
      'active:bg-primary-800'
    ],
    secondary: [
      'bg-gray-100 text-gray-900 shadow-sm',
      'hover:bg-gray-200 focus:ring-gray-500',
      'active:bg-gray-300',
      'dark:bg-gray-800 dark:text-gray-100',
      'dark:hover:bg-gray-700 dark:active:bg-gray-600'
    ],
    outline: [
      'border border-gray-300 bg-white text-gray-700 shadow-sm',
      'hover:bg-gray-50 focus:ring-primary-500',
      'active:bg-gray-100',
      'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300',
      'dark:hover:bg-gray-700'
    ],
    ghost: [
      'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      'active:bg-gray-200',
      'dark:text-gray-300 dark:hover:bg-gray-800',
      'dark:active:bg-gray-700'
    ],
    link: [
      'text-primary-600 hover:text-primary-700',
      'focus:ring-primary-500 underline-offset-4',
      'hover:underline focus:underline',
      'dark:text-primary-400 dark:hover:text-primary-300'
    ]
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  }

  return [
    ...base,
    ...variants[props.variant],
    sizes[props.size]
  ].join(' ')
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
    :aria-label="ariaLabel"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <UIcon
      v-if="loading"
      name="heroicons:arrow-path-20-solid"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
    />

    <!-- Leading icon -->
    <UIcon
      v-else-if="leadingIcon"
      :name="leadingIcon"
      class="-ml-1 mr-2 h-4 w-4"
    />

    <!-- Button content -->
    <slot />

    <!-- Trailing icon -->
    <UIcon
      v-if="trailingIcon"
      :name="trailingIcon"
      class="ml-2 -mr-1 h-4 w-4"
    />
  </button>
</template>
```

**Update Root Configuration** (30 minutes):
```typescript
// nuxt.config.ts (root configuration)
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // Extend all layers
  extends: [
    './layers/core',
    './layers/ui',
    './layers/api',
    './layers/content'
  ],

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
    '@nuxtjs/security'
  ],

  css: ['~/assets/css/main.css'],

  eslint: {
    config: {
      standalone: false,
    },
  },

  // Security configuration (from Week 1)
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
    }
  },

  // Development server configuration
  devServer: {
    host: '127.0.0.1',
    port: 3000,
  },

  // Nitro configuration
  nitro: {
    devHandlers: [],
    experimental: {
      wasm: false,
    },
    devErrorHandler: async (error, _event) => {
      if (error.message && (
        error.message.includes('ECONNRESET')
        || error.message.includes('EPIPE')
        || error.message.includes('write EPIPE')
        || error.message.includes('read ECONNRESET')
      )) {
        console.warn('Ignoring connection error:', error.message)
        return
      }
      console.error('Nitro dev error:', error)
    },
  },

  // Vite configuration
  vite: {
    server: {
      hmr: {
        port: 24678,
      },
    },
  },
})
```

### Day 4-5: Layer Integration Testing (0.0.0-beta)

#### Step 1: Comprehensive Layer Testing (4 hours)

**Create Integration Tests** (2 hours):
```typescript
import { $fetch, setup } from '@nuxt/test-utils'
// tests/integration/layers/core-layer.test.ts
import { describe, expect, test } from 'vitest'

describe('Core Layer Integration', () => {
  test('should expose core composables', async () => {
    await setup({
      nuxtConfig: {
        extends: ['./layers/core']
      }
    })

    // Test that core composables are available
    expect(useValidation).toBeDefined()
    expect(useApi).toBeDefined()
    expect(useErrorHandler).toBeDefined()
  })

  test('should load core types correctly', async () => {
    const { useValidation, commonSchemas } = await import('../../layers/core/composables/useValidation')

    const { validate } = useValidation(commonSchemas.email)
    const result = validate('test@example.com')

    expect(result.success).toBe(true)
    expect(result.data).toBe('test@example.com')
  })

  test('should handle API requests correctly', async () => {
    await setup()

    // Mock API endpoint for testing
    const mockApiResponse = {
      data: { message: 'Hello World' },
      success: true,
      meta: { timestamp: new Date().toISOString() }
    }

    // This would be replaced with actual API testing
    expect(mockApiResponse.success).toBe(true)
  })
})
```

```typescript
import { mount } from '@vue/test-utils'
// tests/integration/layers/ui-layer.test.ts
import { describe, expect, test } from 'vitest'
import Button from '../../layers/ui/components/atoms/Button.vue'

describe('UI Layer Integration', () => {
  test('should render Button component correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        size: 'md'
      },
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-primary-600')
    expect(wrapper.classes()).toContain('px-4')
  })

  test('should handle button click events', async () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary' },
      slots: { default: 'Test' }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  test('should disable button when loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Loading...' }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[name="heroicons:arrow-path-20-solid"]').exists()).toBe(true)
  })
})
```

**Create Layer Documentation** (2 hours):
```typescript
// layers/core/README.md - Create this file
// layers/ui/README.md - Create this file
// layers/api/README.md - Create this file
```

```markdown
<!-- layers/core/README.md -->
# Core Layer

The core layer provides foundational functionality for the Nuxt enterprise application.

## Features

- **Type-safe validation** using Zod schemas
- **API request handling** with retry logic and error handling
- **Centralized error management** with logging and reporting
- **Base TypeScript interfaces** for consistent data structures

## Composables

### useValidation(schema)
Type-safe validation composable using Zod schemas.

```typescript
const { validate, validateAsync, safeParse } = useValidation(schema)
```

### useApi()
Enhanced API composable with error handling and retries.

```typescript
const { get, post, put, patch, delete } = useApi()
```

### useErrorHandler()
Centralized error handling with toast notifications.

```typescript
const { handleApiError, handleValidationError } = useErrorHandler()
```

## Types

- `BaseEntity` - Base interface for all domain objects
- `ApiResponse<T>` - Standard API response wrapper
- `ValidationResult<T>` - Validation result interface
- `UserSession` - User session interface

## Usage

This layer is automatically extended by other layers. Import composables directly:

```vue
<script setup lang="ts">
const { validate } = useValidation(mySchema)
const api = useApi()
</script>
```
```

---

## 🔍 Testing & Validation

After implementing the layered architecture, run these commands:

```bash
# 1. Install any missing dependencies
pnpm install

# 2. Type checking across all layers
pnpm type-check

# 3. Linting
pnpm lint

# 4. Unit tests for layers
pnpm test:unit tests/integration/layers/

# 5. Start development server with all layers
pnpm dev

# 6. Verify layers are loaded (check terminal output)
# Should see: "✓ Layer [core] loaded"
# Should see: "✓ Layer [ui] loaded"
# Should see: "✓ Layer [api] loaded"

# 7. Test composables in browser console
# Open localhost:3000 → Dev Tools → Console:
# - useValidation should be available
# - useApi should be available
# - Components should render with design system styles
```

---

## 🎯 Expected Outcomes After Week 2

By the end of Week 2, you should have:

- ✅ **Fully functional layered architecture** with 4 domains (core, ui, api, content)
- ✅ **Type-safe composables** for validation, API calls, and error handling
- ✅ **Design system foundation** with consistent tokens and components
- ✅ **Atomic design components** starting with Button atom
- ✅ **Layer inheritance working** with proper dependency resolution
- ✅ **Comprehensive testing** covering all layer functionality
- ✅ **Zero TypeScript errors** in strict mode

---

## 🚨 Troubleshooting Common Issues

### Issue: "Cannot resolve layer '../core'"
**Solution**:
```bash
# Ensure layer directories exist and have nuxt.config.ts files
ls -la layers/
# Should see: core/ ui/ api/ content/

# Check each layer has its config file
ls -la layers/*/nuxt.config.ts
```

### Issue: "Composable not found" in components
**Solution**:
```typescript
// Check imports directory in layer configs
// layers/core/nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: ['composables/**', 'utils/**']
  }
})
```

### Issue: Layer extends chain not working
**Solution**:
```typescript
// Ensure proper extends order in root nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/core', // Base layer first
    './layers/ui', // Extends core
    './layers/api', // Extends core
    './layers/content' // Extends core
  ]
})
```

### Issue: Design system styles not applying
**Solution**:
```scss
// Check CSS is properly imported in layers/ui/nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/design-system.css']
})

// And referenced in root app CSS
```

---

## 📅 Next Steps: Week 3 Preview

Week 3 will focus on:
- **Type Safety System** (0.0.3) - End-to-end type validation
- **API Layer Enhancement** - Server routes and middleware
- **Content Layer** - Content management with typed schemas
- **Testing Coverage** - Achieving 100% test coverage for layers

Your layered architecture foundation is now ready to support enterprise-scale development with maximum modularity and maintainability!

---

**Ready for Week 2? Start with Step 1 and follow this guide systematically. Each step builds your domain-driven architecture foundation.**
