import type { ValidationError, ValidationResult } from '../types/base'
import { z } from 'zod'

/**
 * Type-safe validation composable using Zod schemas
 * Provides comprehensive validation with error handling
 */
export function useValidation<T>(schema: z.ZodType<T>) {
  /**
   * Synchronous validation with comprehensive error handling
   */
  const validate = (data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data)
      return {
        success: true,
        data: validatedData,
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: undefined,
          errors: (error.issues || []).map((err): ValidationError => ({
            path: err.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number'),
            message: err.message,
            code: err.code,
          })),
        }
      }
      // Re-throw non-Zod errors
      throw error
    }
  }

  /**
   * Asynchronous validation for complex schemas with refinements
   */
  const validateAsync = async (data: unknown): Promise<ValidationResult<T>> => {
    try {
      const validatedData = await schema.parseAsync(data)
      return {
        success: true,
        data: validatedData,
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: undefined,
          errors: (error.issues || []).map((err): ValidationError => ({
            path: err.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number'),
            message: err.message,
            code: err.code,
          })),
        }
      }
      throw error
    }
  }

  /**
   * Safe parse that never throws exceptions
   * Ideal for user input validation
   */
  const safeParse = (data: unknown) => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true as const, data: result.data }
    }
    return {
      success: false as const,
      data: undefined,
      errors: (result.error.issues || []).map((err): ValidationError => ({
        path: err.path as (string | number)[],
        message: err.message,
        code: err.code,
      })),
    }
  }

  /**
   * Partial validation for form fields
   * Validates only provided fields
   */
  const validatePartial = (data: unknown) => {
    // Using .partial() instead of deepPartial
    const partialSchema = schema instanceof z.ZodObject ? schema.partial() : schema
    try {
      const validatedData = partialSchema.parse(data)
      return {
        success: true as const,
        data: validatedData,
        errors: [],
      }
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false as const,
          data: null,
          errors: (error.issues || []).map((err): ValidationError => ({
            path: err.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number'),
            message: err.message,
            code: err.code,
          })),
        }
      }
      throw error
    }
  }

  /**
   * Get field-specific error messages
   * Supports both dot-notation strings and array paths for compatibility
   */
  const getFieldErrors = (errors: ValidationError[], fieldPath: string): string[] => {
    return errors
      .filter((error) => {
        // Convert array path to dot notation for comparison
        const pathStr = Array.isArray(error.path) ? error.path.join('.') : error.path
        return pathStr === fieldPath
      })
      .map(error => error.message)
  }

  /**
   * Helper to format ValidationError paths as dot-notation strings
   */
  const formatPath = (errors: ValidationError[]): Array<ValidationError & { pathString: string }> => {
    return errors.map(error => ({
      ...error,
      pathString: Array.isArray(error.path) ? error.path.join('.') : String(error.path),
    }))
  }

  return {
    validate,
    validateAsync,
    safeParse,
    validatePartial,
    getFieldErrors,
    formatPath,
    schema,
  }
}

/**
 * Common validation schemas for reuse across the application
 * Following enterprise validation standards
 */
export const commonSchemas = {
  // Basic types
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  uuid: z.string().uuid('Invalid UUID format'),
  url: z.string().url('Invalid URL format'),

  // Numbers
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Must be non-negative'),

  // Strings
  nonEmptyString: z.string().min(1, 'Field is required').trim(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Must be lowercase letters, numbers, and hyphens only'),

  // Dates
  futureDate: z.date().refine(date => date > new Date(), 'Date must be in the future'),
  pastDate: z.date().refine(date => date < new Date(), 'Date must be in the past'),

  // Files
  imageFile: z.instanceof(File).refine(
    file => file.type.startsWith('image/'),
    'Must be an image file',
  ),

  // Business logic
  phoneNumber: z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number format',
  ),

  // Security
  safeHtml: z.string().refine(
    html => !/<script|javascript:|on\w+=/i.test(html),
    'HTML contains potentially unsafe content',
  ),
}

/**
 * Schema composition utilities
 */
export const schemaUtils = {
  /**
   * Create a paginated response schema
   */
  paginatedResponse: <T>(dataSchema: z.ZodType<T>) => z.object({
    data: z.array(dataSchema),
    meta: z.object({
      page: z.number().min(1),
      limit: z.number().min(1).max(100),
      total: z.number().min(0),
      totalPages: z.number().min(0),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
      timestamp: z.string().datetime(),
    }),
    success: z.literal(true),
  }),

  /**
   * Create an API error response schema
   */
  errorResponse: z.object({
    data: z.null(),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      field: z.string().optional(),
      details: z.record(z.string(), z.any()),
    })),
    success: z.literal(false),
    meta: z.object({
      timestamp: z.string().datetime(),
    }),
  }),
}
