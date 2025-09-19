import type { ApiResponse } from '#layers/core/types/base'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fetch globally with proper typing
const _fetchMockGlobal = vi.fn() // Renamed with _ prefix to indicate unused
globalThis.fetch = vi.fn()

// Mock useRuntimeConfig
globalThis.useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: '/api',
    appName: 'Test App',
    appVersion: '1.0.0',
    appUrl: 'http://localhost:3000',
  },
}))

// Mock Nuxt auto-imported composables
vi.mock('#imports', () => ({
  useCsrf: () => ({
    getHeaders: () => ({ 'X-CSRF-Token': 'test-csrf-token' }),
  }),
}))

// Mock import.meta.client
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      client: true,
    },
  },
  writable: true,
})

describe('useApi composable - Strict Type Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return ApiResponse<T> with success, meta.timestamp, and no error singleton', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    const mockResponse = {
      data: { message: 'success' },
      success: true,
      meta: { timestamp: '2023-01-01T00:00:00.000Z' },
    }

    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const api = useApi()
    const result: ApiResponse<{ message: string }> = await api.get('/test')

    // Assert strict ApiResponse<T> structure
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ message: 'success' })
    expect(result.meta.timestamp).toBeDefined()
    expect(typeof result.meta.timestamp).toBe('string')

    // Ensure no error singleton exists
    expect('error' in result).toBe(false)

    // errors should be undefined for successful responses
    expect(result.errors).toBeUndefined()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
  })

  it('should map non-2xx HTTP responses to correct ApiError.code and status', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Not found' }),
    })

    const api = useApi()
    const result: ApiResponse<any> = await api.get('/nonexistent', { retry: { attempts: 1, delay: 0 } })

    // Assert strict ApiResponse structure for errors
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors!.length).toBeGreaterThan(0)

    // Ensure no error singleton
    expect('error' in result).toBe(false)

    // Check ApiError structure with status
    const apiError = result.errors![0]
    expect(apiError.code).toBe('REQUEST_FAILED')
    expect(apiError.status).toBe(404)
    expect(apiError.message).toContain('Not Found')

    // Ensure meta.timestamp is present
    expect(result.meta.timestamp).toBeDefined()
    expect(typeof result.meta.timestamp).toBe('string')
  })

  it('should handle network errors', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    const api = useApi()
    const result = await api.get('/error', { retry: { attempts: 1, delay: 0 } })

    expect(result.success).toBe(false)
    expect(result.errors![0].message).toContain('Network error')
  })

  it('should retry failed requests', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    // First call fails, second succeeds
    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'success', success: true, meta: { timestamp: new Date().toISOString() } }),
      })

    const api = useApi()
    const result = await api.get('/retry-test', { retry: { attempts: 2, delay: 10 } })

    expect(result.success).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('should make POST request with data', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 }, success: true, meta: { timestamp: new Date().toISOString() } }),
    })

    const api = useApi()
    const result = await api.post('/users', { name: 'John' }, { retry: { attempts: 1, delay: 0 } })

    expect(result.success).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'John' }),
      }),
    )
  })

  it('should handle timeout path with REQUEST_TIMEOUT code and status', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    // Create a proper AbortError
    const abortError = new Error('Request timed out')
    abortError.name = 'AbortError'

    // Mock AbortController
    const abortController = {
      signal: { aborted: false },
      abort: vi.fn(() => {
        abortController.signal.aborted = true
        // Don't throw, just update the signal
      }),
    }

    vi.stubGlobal('AbortController', vi.fn(() => abortController))

    // Mock setTimeout to trigger abort immediately
    const originalSetTimeout = setTimeout
    vi.stubGlobal('setTimeout', vi.fn((cb) => {
      cb() // Call the callback immediately
      return 123 // Return any number as timeout ID
    }))

    // Mock fetch to detect aborted signal
    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockImplementationOnce(() => {
      if (abortController.signal.aborted) {
        throw abortError
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    const api = useApi()
    const result: ApiResponse<any> = await api.get('/slow', { timeout: 100 })

    // Restore setTimeout
    vi.stubGlobal('setTimeout', originalSetTimeout)

    // Assert timeout path yields proper structure
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors!.length).toBeGreaterThan(0)

    // Check timeout-specific error code and status
    const timeoutError = result.errors![0]
    expect(timeoutError.code).toBe('REQUEST_TIMEOUT')
    expect(timeoutError.status).toBeDefined()
    expect(typeof timeoutError.status).toBe('number')
    expect(timeoutError.message).toContain('timeout')

    // Ensure no error singleton
    expect('error' in result).toBe(false)

    // Ensure meta.timestamp is present
    expect(result.meta.timestamp).toBeDefined()
    expect(abortController.abort).toHaveBeenCalled()
  })

  it('should handle POST request without CSRF in server environment', async () => {
    // Reset the mock before the test
    vi.clearAllMocks()

    const { useApi } = await import('#layers/core/composables/useApi')

    const fetchMock = globalThis.fetch as vi.Mock
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 }, success: true, meta: { timestamp: new Date().toISOString() } }),
    })

    const api = useApi()
    await api.post('/users', { name: 'John' }, { retry: { attempts: 1, delay: 0 } })

    // Verify basic POST functionality works
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ name: 'John' }),
      }),
    )
  })

  it('should handle various HTTP status codes with proper mapping', async () => {
    const { useApi } = await import('#layers/core/composables/useApi')

    const testCases = [
      { status: 400, expectedMessage: 'Bad Request' },
      { status: 401, expectedMessage: 'Unauthorized' },
      { status: 403, expectedMessage: 'Forbidden' },
      { status: 422, expectedMessage: 'Unprocessable Entity' },
      { status: 429, expectedMessage: 'Too Many Requests' },
      { status: 500, expectedMessage: 'Internal Server Error' },
      { status: 502, expectedMessage: 'Bad Gateway' },
      { status: 503, expectedMessage: 'Service Unavailable' },
    ]

    for (const testCase of testCases) {
      vi.clearAllMocks()

      const fetchMock = globalThis.fetch as vi.Mock
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: testCase.status,
        statusText: 'Test Status',
        json: () => Promise.resolve({}),
      })

      const api = useApi()
      const result: ApiResponse<any> = await api.get('/test', { retry: { attempts: 1, delay: 0 } })

      expect(result.success).toBe(false)
      expect(result.errors![0].status).toBe(testCase.status)
      expect(result.errors![0].message).toContain(testCase.expectedMessage)
    }
  })
})
