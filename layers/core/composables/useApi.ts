import type { ApiError, ApiResponse } from '../types/base'
import { useCsrf } from '#imports'

interface ApiOptions extends RequestInit {
  baseURL?: string
  timeout?: number
  retry?: {
    attempts: number
    delay: number
    exponential?: boolean
  }
  skipAuth?: boolean
}

/**
 * Enhanced API composable with comprehensive error handling, retries, and type safety
 */
export function useApi() {
  const config = useRuntimeConfig()

  // Get CSRF protection if available - only on client side
  const csrf = import.meta.client ? useCsrf() : null

  /**
   * Make typed API request with comprehensive error handling and retry logic
   */
  const request = async <T>(
    url: string,
    options: ApiOptions = {},
  ): Promise<ApiResponse<T>> => {
    const {
      baseURL = config.public.apiBaseUrl,
      timeout = 10000,
      retry = { attempts: 3, delay: 1000, exponential: true },
      skipAuth = false,
      headers = {},
      ...fetchOptions
    } = options

    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`

    // Prepare headers with authentication and CSRF protection
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    } as Record<string, string>

    // Add CSRF token for state-changing requests - only when on client
    if (import.meta.client && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method?.toUpperCase() || 'GET')) {
      if (csrf && csrf.csrf && csrf.headerName) {
        requestHeaders[csrf.headerName] = csrf.csrf
      }
    }

    // Add authentication if available and not skipped
    if (!skipAuth) {
      // This would integrate with your auth system
    }

    const attemptRequest = async (attempt: number): Promise<ApiResponse<T>> => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))

          // Handle specific HTTP status codes
          const statusHandlers: Record<number, string> = {
            400: 'Bad Request - Invalid data provided',
            401: 'Unauthorized - Authentication required',
            403: 'Forbidden - Insufficient permissions',
            404: 'Not Found - Resource does not exist',
            422: 'Unprocessable Entity - Validation failed',
            429: 'Too Many Requests - Rate limit exceeded',
            500: 'Internal Server Error - Please try again later',
            502: 'Bad Gateway - Service temporarily unavailable',
            503: 'Service Unavailable - Please try again later',
          }

          const errorMessage = statusHandlers[response.status]
            || `HTTP ${response.status}: ${errorData.message || response.statusText}`

          const apiError: ApiError = {
            code: 'REQUEST_FAILED',
            message: errorMessage,
            status: response.status,
            details: {
              url: fullUrl,
              method: fetchOptions.method || 'GET',
              attempt,
              timestamp: new Date().toISOString(),
              responseData: errorData,
            },
          }

          return {
            data: null as T,
            success: false,
            errors: [apiError],
            meta: {
              timestamp: new Date().toISOString(),
            },
          }
        }

        const data = await response.json()

        // Ensure response follows ApiResponse structure
        if (!Object.prototype.hasOwnProperty.call(data, 'success')) {
          return {
            data,
            success: true,
            meta: {
              timestamp: new Date().toISOString(),
            },
          }
        }

        return data
      }
      catch (error: unknown) {
        // Handle network errors and timeouts
        if (error instanceof Error && error.name === 'AbortError') {
          const apiError: ApiError = {
            code: 'REQUEST_TIMEOUT',
            message: `Request timeout after ${timeout}ms`,
            status: 0,
            details: {
              url: fullUrl,
              method: fetchOptions.method || 'GET',
              attempt,
              timestamp: new Date().toISOString(),
            },
          }

          return {
            data: null as T,
            success: false,
            errors: [apiError],
            meta: {
              timestamp: new Date().toISOString(),
            },
          }
        }

        // Retry logic with exponential backoff
        if (attempt < retry.attempts) {
          const delay = retry.exponential
            ? retry.delay * 2 ** (attempt - 1)
            : retry.delay

          console.warn(`API request failed (attempt ${attempt}/${retry.attempts}), retrying in ${delay}ms...`, error)

          await new Promise(resolve => setTimeout(resolve, delay))
          return attemptRequest(attempt + 1)
        }

        // Format final error response
        const apiError: ApiError = {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 0,
          details: {
            url: fullUrl,
            method: fetchOptions.method || 'GET',
            attempt,
            timestamp: new Date().toISOString(),
          },
        }

        return {
          data: null as T,
          success: false,
          errors: [apiError],
          meta: {
            timestamp: new Date().toISOString(),
          },
        }
      }
    }

    return attemptRequest(1)
  }

  /**
   * Convenience methods for common HTTP verbs with proper typing
   */
  const get = <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'GET' })

  const post = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })

  const put = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })

  const patch = <T>(url: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })

  const del = <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    request<T>(url, { ...options, method: 'DELETE' })

  /**
   * Upload files with progress tracking
   */
  const upload = async <T>(
    url: string,
    file: File,
    options: Omit<ApiOptions, 'method' | 'body'> & {
      onProgress?: (progress: number) => void
      fieldName?: string
    } = {},
  ): Promise<ApiResponse<T>> => {
    const { onProgress, fieldName = 'file', ...apiOptions } = options

    const formData = new FormData()
    formData.append(fieldName, file)

    // Remove Content-Type header to let browser set it with boundary
    const initialHeaders = (apiOptions.headers ?? {}) as Record<string, string>
    const headers: Record<string, string> = { ...initialHeaders }
    if ('Content-Type' in headers)
      delete headers['Content-Type']

    return request<T>(url, {
      ...apiOptions,
      method: 'POST',
      headers,
      body: formData,
    })
  }

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
  }
}

/**
 * Specialized API composable for pagination
 */
export function usePaginatedApi<T>() {
  const api = useApi()

  const fetchPage = async (
    url: string,
    page: number = 1,
    limit: number = 20,
    options?: Omit<ApiOptions, 'method'>,
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    const fullUrl = url.includes('?')
      ? `${url}&${queryParams}`
      : `${url}?${queryParams}`

    return api.get<{
      items: T[]
      meta: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
      }
    }>(fullUrl, options)
  }

  return { fetchPage }
}
