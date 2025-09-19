import { describe, expect, vi } from 'vitest'

// Mock console methods
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => { }),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
}

describe('useErrorHandler composable', () => {
  it('should handle API errors', async () => {
    const { useErrorHandler } = await import('../../../layers/core/composables/useErrorHandler')

    const { handleApiError } = useErrorHandler({ logToConsole: true, showToast: false })

    const apiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid email address',
      field: 'email',
    }

    handleApiError(apiError, 'User registration')

    expect(consoleSpy.error).toHaveBeenCalledWith(
      'API Error:',
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        message: 'User registration: Invalid email address',
        field: 'email',
      }),
    )
  })

  it('should handle validation errors', async () => {
    const { useErrorHandler } = await import('../../../layers/core/composables/useErrorHandler')

    const { handleValidationError } = useErrorHandler({ logToConsole: true, showToast: false })

    const validationErrors = [
      {
        path: ['email'],
        message: 'Invalid email format',
        code: 'invalid_format',
        value: 'invalid-email',
      },
      {
        path: ['age'],
        message: 'Must be at least 18',
        code: 'too_small',
        value: 16,
      },
    ]

    handleValidationError(validationErrors, 'Form validation')

    expect(consoleSpy.error).toHaveBeenCalledWith(
      'Validation Error:',
      expect.objectContaining({
        context: 'Form validation',
        errors: ['email: Invalid email format', 'age: Must be at least 18'],
      }),
    )
  })

  it('should handle unexpected errors', async () => {
    const { useErrorHandler } = await import('../../../layers/core/composables/useErrorHandler')

    const { handleUnexpectedError } = useErrorHandler({ logToConsole: true, showToast: false })

    const error = new Error('Database connection failed')
    error.stack = 'Error: Database connection failed\n    at test.js:1:1'

    handleUnexpectedError(error, 'Database operation')

    expect(consoleSpy.error).toHaveBeenCalledWith(
      'Unexpected Error:',
      expect.objectContaining({
        message: 'Database operation: Database connection failed',
        stack: expect.stringContaining('Database connection failed'),
      }),
    )
  })

  it('should handle multiple API errors', async () => {
    const { useErrorHandler } = await import('../../../layers/core/composables/useErrorHandler')

    consoleSpy.error.mockClear() // Clear previous calls

    const { handleApiError } = useErrorHandler({ logToConsole: true, showToast: false })

    const apiErrors = [
      { code: 'EMAIL_EXISTS', message: 'Email already exists' },
      { code: 'WEAK_PASSWORD', message: 'Password is too weak' },
    ]

    handleApiError(apiErrors)

    expect(consoleSpy.error).toHaveBeenCalledTimes(2)
  })

  it('should not log when logToConsole is false', async () => {
    const { useErrorHandler } = await import('../../../layers/core/composables/useErrorHandler')

    const { handleApiError } = useErrorHandler({ logToConsole: false, showToast: false })

    consoleSpy.error.mockClear()

    const apiError = {
      code: 'TEST_ERROR',
      message: 'Test error message',
    }

    handleApiError(apiError)

    expect(consoleSpy.error).not.toHaveBeenCalled()
  })
})
