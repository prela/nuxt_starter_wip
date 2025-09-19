# Core Layer

The core layer provides essential foundational utilities, composables, and types that form the backbone of the application architecture. This layer implements Domain-Driven Design principles with comprehensive error handling and type safety.

## Architecture

The core layer follows a clean architecture pattern with clear separation of concerns:

- **Composables**: Reusable business logic and utilities
- **Types**: TypeScript interfaces and type definitions
- **Utils**: Pure utility functions
- **Middleware**: Application-level request processing
- **Plugins**: Global application setup and configuration

## Exports

### Composables

#### `useApi()`
Enhanced API client with retry logic, error handling, and type safety.

```typescript
const api = useApi()

// GET request with type safety
const { data, success, errors } = await api.get<User>('/api/users/123')

// POST with error handling
const result = await api.post<CreateUserResponse>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// Upload files with progress
const uploadResult = await api.upload<UploadResponse>('/api/files', file, {
  onProgress: progress => console.log(`${progress}% uploaded`)
})
```

**Features:**
- Automatic retry with exponential backoff
- CSRF protection integration
- Request/response interceptors
- Timeout handling
- Upload progress tracking

#### `useValidation(schema)`
Type-safe validation using Zod schemas with comprehensive error handling.

```typescript
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
})

const { validate, validateAsync, safeParse } = useValidation(userSchema)

// Synchronous validation
const result = validate(formData)
if (result.success) {
  // result.data is fully typed
  console.log(result.data.name)
}
else {
  // Handle validation errors
  result.errors.forEach((error) => {
    console.log(`${error.path}: ${error.message}`)
  })
}

// Get field-specific errors
const nameErrors = getFieldErrors(result.errors, 'name')
```

**Common Schemas:**
```typescript
// Note: Composables are auto-imported in app code.
// For explicit imports (e.g., in tests) use the layer alias:
import { commonSchemas } from '#layers/core/composables/useValidation'

// Pre-built validation schemas
commonSchemas.email // Email validation
commonSchemas.password // Strong password requirements
commonSchemas.uuid // UUID format validation
commonSchemas.phoneNumber // International phone numbers
commonSchemas.safeHtml // XSS-safe HTML content
```

#### `useErrorHandler()`
Centralized error handling with toast notifications and error reporting.

```typescript
const { handleApiError, handleValidationError, handleUnexpectedError } = useErrorHandler()

// Handle API errors
try {
  const response = await api.get('/api/data')
  if (!response.success) {
    handleApiError(response.errors, 'Data fetch')
  }
}
catch (error) {
  handleUnexpectedError(error, 'Data fetch')
}

// Handle validation errors
const validation = validate(formData)
if (!validation.success) {
  handleValidationError(validation.errors, 'Form submission')
}
```

**Configuration:**
```typescript
const errorHandler = useErrorHandler({
  showToast: true, // Show user notifications
  logToConsole: true, // Log to browser console
  reportToService: true // Send to monitoring service
})
```

#### `usePaginatedApi()`
Specialized composable for paginated API requests.

```typescript
const { fetchPage } = usePaginatedApi<User>()

const result = await fetchPage('/api/users', 1, 20)
if (result.success) {
  console.log(result.data.items) // User[]
  console.log(result.data.meta) // Pagination metadata
}
```

### Types

#### Core Base Types
```typescript
// API Response structure
interface ApiResponse<T> {
  data: T | null
  success: boolean
  errors?: ApiError[]
  meta?: ResponseMeta
}

// Validation result structure
interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

// Error structures
interface ApiError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}

interface ValidationError {
  path: (string | number)[]
  message: string
  code: string
}
```

#### Domain Types
```typescript
// Base entity pattern
interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Repository pattern
interface Repository<T extends BaseEntity> {
  findById: (id: string) => Promise<T | null>
  findMany: (options?: QueryOptions) => Promise<T[]>
  create: (data: Omit<T, keyof BaseEntity>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
}
```

## Usage Patterns

### Error Handling Flow
```typescript
// Complete error handling pattern
const { handleApiError } = useErrorHandler()
const api = useApi()

async function createUser(userData: CreateUserInput) {
  try {
    const response = await api.post<User>('/api/users', userData)

    if (response.success) {
      return response.data
    }
    else {
      handleApiError(response.errors, 'User creation')
      return null
    }
  }
  catch (error) {
    handleUnexpectedError(error, 'User creation')
    return null
  }
}
```

### Form Validation Pattern
```typescript
// Form with validation
const userSchema = z.object({
  name: commonSchemas.nonEmptyString,
  email: commonSchemas.email,
  password: commonSchemas.password
})

const { validate, getFieldErrors } = useValidation(userSchema)
const { handleValidationError } = useErrorHandler()

function validateForm(formData: unknown) {
  const result = validate(formData)

  if (!result.success) {
    handleValidationError(result.errors, 'Form validation')

    // Get specific field errors for UI
    const nameErrors = getFieldErrors(result.errors, 'name')
    const emailErrors = getFieldErrors(result.errors, 'email')

    return { isValid: false, nameErrors, emailErrors }
  }

  return { isValid: true, data: result.data }
}
```

### Service Layer Pattern
```typescript
// Domain service implementation
class UserService {
  private api = useApi()
  private { handleApiError } = useErrorHandler()

  async createUser(userData: CreateUserInput): Promise<ServiceResult<User>> {
    const response = await this.api.post<User>('/api/users', userData)

    if (response.success) {
      return { success: true, data: response.data }
    }

    this.handleApiError(response.errors, 'User creation')
    return {
      success: false,
      error: response.errors[0] || { code: 'UNKNOWN', message: 'Unknown error' }
    }
  }
}
```

## Integration

### Layer Dependencies
The core layer is dependency-free and can be used by:
- **UI Layer**: For form validation and API calls
- **API Layer**: For shared types and error handling
- **Content Layer**: For data validation and processing
- **Application**: For global error handling and services

### Auto-imports
All composables and types are automatically imported:

```typescript
// No imports needed - auto-imported
const api = useApi()
const validation = useValidation(schema)
const errorHandler = useErrorHandler()
```

### Global Setup
```typescript
// Optional plugin example (place under layers/core/plugins if you add it)
export default defineNuxtPlugin(() => {
  setupGlobalErrorHandler()
})
```

## Testing

### Unit Testing
```typescript
// In app code rely on auto-imports; for tests use explicit path
import { commonSchemas, useValidation } from '#layers/core/composables/useValidation'
import { describe, expect, it } from 'vitest'

describe('useValidation', () => {
  it('validates email correctly', () => {
    const { validate } = useValidation(commonSchemas.email)

    const result = validate('test@example.com')
    expect(result.success).toBe(true)
    expect(result.data).toBe('test@example.com')
  })
})
```

### Integration Testing
```typescript
import { mockApi } from '#tests/mocks/api'

describe('useApi integration', () => {
  it('handles API errors correctly', async () => {
    mockApi.get('/api/users').replyWithError(500, 'Server Error')

    const api = useApi()
    const result = await api.get('/api/users')

    expect(result.success).toBe(false)
    expect(result.errors[0].status).toBe(500)
  })
})
```

## Performance Considerations

- **Lazy Loading**: Composables are initialized only when used
- **Memory Management**: Automatic cleanup of event listeners and timers
- **Request Deduplication**: Built-in request caching and deduplication
- **Error Batching**: Multiple validation errors handled efficiently

## Security Features

- **CSRF Protection**: Automatic CSRF token handling
- **Input Sanitization**: XSS protection in validation schemas
- **Error Information**: Sensitive data filtered from error responses
- **Rate Limiting**: Built-in retry limits prevent abuse
