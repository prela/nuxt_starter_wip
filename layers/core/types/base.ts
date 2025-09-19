/**
 * Base entity interface for all domain objects
 * Follows DDD principles for consistent entity structure
 */
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  version?: number
}

/**
 * Standard API response wrapper
 * Ensures consistent API response structure across all endpoints
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
 * Provides consistent error handling across the application
 */
export interface ApiError {
  code: string
  message: string
  status?: number
  field?: string
  details?: Record<string, any>
}

/**
 * Validation result wrapper
 * Type-safe validation results with Zod integration
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
 * Enterprise-grade session management
 */
export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
    permissions?: string[]
  }
  token: string
  refreshToken?: string
  expiresAt: Date
  issuedAt: Date
}

/**
 * Application configuration
 * Runtime configuration interface
 */
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  features: {
    analytics: boolean
    monitoring: boolean
    debugging: boolean
    maintenance: boolean
  }
  limits: {
    maxFileSize: number
    maxRequestSize: number
    rateLimitPerMinute: number
  }
}

/**
 * Domain events for DDD implementation
 */
export interface DomainEvent {
  id: string
  type: string
  aggregateId: string
  aggregateType: string
  data: Record<string, any>
  metadata: {
    timestamp: Date
    version: number
    userId?: string
    correlationId?: string
  }
}

/**
 * Generic repository interface for data access
 */
export interface Repository<T extends BaseEntity> {
  findById: (id: string) => Promise<T | null>
  findAll: (options?: QueryOptions) => Promise<T[]>
  create: (entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>
  update: (id: string, updates: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<boolean>
}

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, any>
  include?: string[]
}

/**
 * Service result wrapper for business logic operations
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: ServiceError
  warnings?: string[]
}

/**
 * Service error for business logic failures
 */
export interface ServiceError {
  code: string
  message: string
  details?: Record<string, any>
  userMessage?: string
}

/**
 * Event bus interface for domain events
 */
export interface EventBus {
  emit: <T = any>(event: string, payload: T) => void
  on: <T = any>(event: string, handler: (payload: T) => void) => void
  off: (event: string, handler?: (...args: any[]) => void) => void
  once: <T = any>(event: string, handler: (payload: T) => void) => void
}

/**
 * Cache interface for data caching
 */
export interface Cache {
  get: <T>(key: string) => Promise<T | null>
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>
  delete: (key: string) => Promise<boolean>
  clear: () => Promise<void>
  has: (key: string) => Promise<boolean>
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  debug: (message: string, meta?: Record<string, any>) => void
  info: (message: string, meta?: Record<string, any>) => void
  warn: (message: string, meta?: Record<string, any>) => void
  error: (message: string, error?: Error, meta?: Record<string, any>) => void
}
