import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('useValidation composable - Strict Type Tests', () => {
  it('should validate correct email', async () => {
    // Import dynamically to handle the case where the file doesn't exist yet
    const { useValidation, commonSchemas } = await import('#layers/core/composables/useValidation')

    const { validate } = useValidation(commonSchemas.email)
    const result = validate('test@example.com')

    expect(result.success).toBe(true)
    expect(result.data).toBe('test@example.com')
    expect(result.errors).toBeUndefined()
  })

  it('should reject invalid email', async () => {
    const { useValidation, commonSchemas } = await import('#layers/core/composables/useValidation')

    const { validate } = useValidation(commonSchemas.email)
    const result = validate('invalid-email')

    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.errors).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors!.length).toBeGreaterThan(0)
    expect(result.errors![0].message).toContain('Invalid email format')
  })

  it('should handle async validation', async () => {
    const { useValidation } = await import('#layers/core/composables/useValidation')

    const asyncSchema = z.string().refine(async (val) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return val.length > 3
    }, 'Must be longer than 3 characters')

    const { validateAsync } = useValidation(asyncSchema)
    const result = await validateAsync('hello')

    expect(result.success).toBe(true)
  })

  it('should provide safe parse without throwing', async () => {
    const { useValidation } = await import('#layers/core/composables/useValidation')

    const { safeParse } = useValidation(z.number())
    const result = safeParse('not-a-number')

    expect(result.success).toBe(false)
    expect(() => safeParse('not-a-number')).not.toThrow()
  })

  it('should validate partial data', async () => {
    const { useValidation } = await import('#layers/core/composables/useValidation')

    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number(),
    })

    const { validatePartial } = useValidation(schema)
    const result = validatePartial({ name: 'John' })

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('John')
  })

  it('should preserve ValidationError.path as array, not string', async () => {
    const { useValidation } = await import('#layers/core/composables/useValidation')

    const nestedSchema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string().min(1, 'Name required'),
          email: z.string().email('Invalid email'),
        }),
        settings: z.array(z.object({
          key: z.string().min(1),
          value: z.string(),
        })),
      }),
    })

    const { validate } = useValidation(nestedSchema)
    const result = validate({
      user: {
        profile: {
          name: '',
          email: 'invalid-email',
        },
        settings: [
          { key: '', value: 'test' },
          { key: 'valid', value: '' },
        ],
      },
    })

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)

    // Check that paths are arrays, not strings
    for (const error of result.errors!) {
      expect(Array.isArray(error.path)).toBe(true)
      expect(typeof error.path).not.toBe('string')
    }

    // Check specific path structures
    const nameError = result.errors!.find(e =>
      Array.isArray(e.path)
      && e.path.length === 3
      && e.path[0] === 'user'
      && e.path[1] === 'profile'
      && e.path[2] === 'name',
    )
    expect(nameError).toBeDefined()
    expect(nameError!.path).toEqual(['user', 'profile', 'name'])

    // Check array index paths
    const arrayError = result.errors!.find(e =>
      Array.isArray(e.path)
      && e.path.includes('settings')
      && typeof e.path[2] === 'number',
    )
    expect(arrayError).toBeDefined()
    expect(typeof arrayError!.path[2]).toBe('number')
  })

  it('should provide helper for formatting paths to dot-strings', async () => {
    const { useValidation } = await import('#layers/core/composables/useValidation')

    const schema = z.object({
      user: z.object({
        email: z.string().email(),
        settings: z.array(z.string().min(1)),
      }),
    })

    const { validate, getFieldErrors } = useValidation(schema)
    const result = validate({
      user: {
        email: 'invalid',
        settings: ['', 'valid'],
      },
    })

    expect(result.success).toBe(false)

    // getFieldErrors should work with dot-notation for compatibility
    const emailErrors = getFieldErrors(result.errors!, 'user.email')
    expect(emailErrors.length).toBeGreaterThan(0)
  })

  it('should validate common schemas', async () => {
    const { commonSchemas } = await import('../../../layers/core/composables/useValidation')

    expect(commonSchemas.email.safeParse('test@example.com').success).toBe(true)
    expect(commonSchemas.password.safeParse('Password123').success).toBe(true)
    expect(commonSchemas.uuid.safeParse('123e4567-e89b-12d3-a456-426614174000').success).toBe(true)
    expect(commonSchemas.url.safeParse('https://example.com').success).toBe(true)
  })
})
