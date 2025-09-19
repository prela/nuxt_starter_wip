# API Layer

The API layer provides server-side functionality including API routes, middleware, and server utilities. It extends the core layer to leverage shared types and validation while implementing backend business logic and data access patterns.

## Architecture

The API layer follows a clean server architecture with clear separation of concerns:

- **Server API Routes**: RESTful endpoints with type safety
- **Server Middleware**: Request processing and authentication
- **Server Utilities**: Shared server-side functionality
- **Database Integration**: ORM/query layer abstractions
- **Validation**: Server-side input validation using core schemas

## Structure

```
layers/api/
├── server/
│   ├── api/                 # API route handlers
│   └── middleware/          # Server middleware
├── composables/             # Server-side composables
├── types/                   # API-specific types
└── nuxt.config.ts          # Layer configuration
```

## Server API Routes

### Route Structure

API routes follow RESTful conventions with proper HTTP methods:

```
server/api/
├── auth/
│   ├── login.post.ts        # POST /api/auth/login
│   ├── logout.post.ts       # POST /api/auth/logout
│   └── me.get.ts           # GET /api/auth/me
├── users/
│   ├── index.get.ts        # GET /api/users
│   ├── index.post.ts       # POST /api/users
│   └── [id]/
│       ├── index.get.ts    # GET /api/users/:id
│       ├── index.put.ts    # PUT /api/users/:id
│       └── index.delete.ts # DELETE /api/users/:id
└── health.get.ts           # GET /api/health
```

### Route Implementation Pattern

Each API route follows a consistent pattern with validation, error handling, and type safety:

```typescript
import type { ApiResponse, User } from '#layers/core/types'
import { useValidation } from '#layers/core/composables/useValidation'
// Example route (create this file to implement): server/api/users/index.post.ts
import { z } from 'zod'

// Define request schema
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export default defineEventHandler(async (event): Promise<ApiResponse<User>> => {
  try {
    // Validate request method
    assertMethod(event, 'POST')

    // Parse and validate request body
    const body = await readBody(event)
    const { validate } = useValidation(createUserSchema)
    const validation = validate(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: {
          errors: validation.errors?.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        }
      })
    }

    // Business logic
    const userData = validation.data
    const user = await UserService.create(userData)

    // Return typed response
    return {
      data: user,
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
      }
    }
  }
  catch (error) {
    // Handle errors with proper HTTP status codes
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})
```

### Authentication Routes

```typescript
// server/api/auth/login.post.ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { validate } = useValidation(loginSchema)
  const validation = validate(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid credentials format'
    })
  }

  const { email, password } = validation.data

  // Authenticate user (example service, implement as needed)
  const user = await AuthService.authenticate(email, password)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  // Generate JWT token
  const token = await AuthService.generateToken(user.id)

  // Set secure cookie
  setCookie(event, 'auth-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    },
    success: true
  }
})
```

### Resource Routes with Pagination

```typescript
// server/api/users/index.get.ts
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export default defineEventHandler(async (event) => {
  // Parse query parameters
  const query = getQuery(event)
  const { validate } = useValidation(querySchema)
  const validation = validate(query)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameters'
    })
  }

  const { page, limit, search, sortBy, sortOrder } = validation.data

  // Fetch users with pagination
  const result = await UserService.findMany({
    page,
    limit,
    search,
    sortBy,
    sortOrder
  })

  return {
    data: {
      items: result.items,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPreviousPage: page > 1
      }
    },
    success: true
  }
})
```

## Server Middleware

### Authentication Middleware

```typescript
// Example middleware (create this file to implement): server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Only apply to API routes requiring authentication
  if (!event.node.req.url?.startsWith('/api/protected')) {
    return
  }

  const token = getCookie(event, 'auth-token')
    || getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    const payload = await AuthService.verifyToken(token)

    // Add user context to event
    event.context.user = await UserService.findById(payload.userId)

    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }
})
```

### Rate Limiting Middleware

```typescript
// Example middleware (create this file to implement): server/middleware/rate-limit.ts
const rateLimitStore = new Map<string, { count: number, resetTime: number }>()

export default defineEventHandler(async (event) => {
  const clientIP = getClientIP(event)
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100

  const key = `${clientIP}`
  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return
  }

  if (current.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      }
    })
  }

  current.count++
})
```

### CORS Middleware

```typescript
// Example middleware (create this file to implement): server/middleware/cors.ts
export default defineEventHandler(async (event) => {
  const origin = getHeader(event, 'origin')
  const allowedOrigins = [
    'http://localhost:3000',
    'https://yourdomain.com'
  ]

  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
  }

  setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,Authorization')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
```

## Service Layer

### User Service

```typescript
import type { CreateUserInput, UpdateUserInput, User } from '#layers/core/types'
// Example service (create this file to implement): server/services/UserService.ts
import { z } from 'zod'

export class UserService {
  static async create(data: CreateUserInput): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user
  }

  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  static async findMany(options: {
    page: number
    limit: number
    search?: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }) {
    const { page, limit, search, sortBy, sortOrder } = options
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ])

    return { items, total }
  }

  static async update(id: string, data: UpdateUserInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }
}
```

## Database Integration

Database integration (e.g., Prisma) is not yet implemented in this starter. When you add a database, document the setup and usage here.

## Error Handling

### Global Error Handler

```typescript
// Example error helper (create this file to implement): server/utils/error-handler.ts
export function createApiError(
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, any>
) {
  return createError({
    statusCode,
    statusMessage: message,
    data: {
      code: code || 'API_ERROR',
      message,
      details,
      timestamp: new Date().toISOString()
    }
  })
}

// Common error responses
export const ApiErrors = {
  ValidationFailed: (errors: any[]) => createApiError(400, 'Validation failed', 'VALIDATION_ERROR', { errors }),
  Unauthorized: () => createApiError(401, 'Authentication required', 'UNAUTHORIZED'),
  Forbidden: () => createApiError(403, 'Access denied', 'FORBIDDEN'),
  NotFound: (resource: string) => createApiError(404, `${resource} not found`, 'NOT_FOUND'),
  Conflict: (message: string) => createApiError(409, message, 'CONFLICT'),
  RateLimit: () => createApiError(429, 'Too many requests', 'RATE_LIMIT'),
  InternalError: () => createApiError(500, 'Internal server error', 'INTERNAL_ERROR')
}
```

## Testing

### API Route Testing

```typescript
import { $fetch, setup } from '@nuxt/test-utils'
// tests/api/users.test.ts
import { describe, expect, it } from 'vitest'

describe('Users API', async () => {
  await setup()

  it('creates user successfully', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    }

    const response = await $fetch('/api/users', {
      method: 'POST',
      body: userData
    })

    expect(response.success).toBe(true)
    expect(response.data.email).toBe(userData.email)
    expect(response.data.password).toBeUndefined()
  })

  it('validates user input', async () => {
    const invalidData = {
      name: '',
      email: 'invalid-email',
      password: '123'
    }

    await expect($fetch('/api/users', {
      method: 'POST',
      body: invalidData
    })).rejects.toThrow('400')
  })

  it('requires authentication for protected routes', async () => {
    await expect($fetch('/api/protected/users')).rejects.toThrow('401')
  })
})
```

### Integration Testing

```typescript
// tests/integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  it('completes full auth flow', async () => {
    // Register user
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!'
    }

    const registerResponse = await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

    expect(registerResponse.success).toBe(true)

    // Login user
    const loginResponse = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: userData.email,
        password: userData.password
      }
    })

    expect(loginResponse.success).toBe(true)
    expect(loginResponse.data.token).toBeDefined()

    // Access protected route
    const profileResponse = await $fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    })

    expect(profileResponse.success).toBe(true)
    expect(profileResponse.data.email).toBe(userData.email)
  })
})
```

## Performance

### Caching Strategy

```typescript
// Example cache helper (create this file to implement): server/utils/cache.ts
export const apiCache = {
  get: async (key: string) => {
    // Implement Redis or in-memory cache
    return await redis.get(key)
  },

  set: async (key: string, value: any, ttl: number = 300) => {
    await redis.setex(key, ttl, JSON.stringify(value))
  },

  del: async (key: string) => {
    await redis.del(key)
  }
}

// Usage in API routes
export default defineEventHandler(async (event) => {
  const cacheKey = `users:${getQuery(event)}`

  // Try cache first
  const cached = await apiCache.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const result = await UserService.findMany(query)

  // Cache result
  await apiCache.set(cacheKey, result, 300)

  return result
})
```

## Security

### Input Sanitization

```typescript
// Example sanitizer helper (create this file to implement): server/utils/sanitize.ts
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '')
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }

  return input
}
```

### SQL Injection Prevention

- Use Prisma ORM for type-safe queries
- Validate all inputs with Zod schemas
- Parameterized queries only
- No dynamic SQL construction

## Deployment

### Environment Variables

```bash
# .env
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
JWT_SECRET="your-super-secret-jwt-key"
REDIS_URL="redis://localhost:6379"
API_BASE_URL="https://api.yourdomain.com"
```

### Health Check

```typescript
// Example health endpoint (create this file to implement): server/api/health.get.ts
export default defineEventHandler(async (event) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime()
  }
})
```
