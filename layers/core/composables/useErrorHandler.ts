import type { ApiError, ValidationError } from '../types/base'

// Use import.meta.client and process.env for environment checks

interface ErrorHandlerOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
}

/**
 * Centralized error handling composable
 * Provides consistent error handling across the application
 *
 * @example
 * ```typescript
 * const { handleApiError, handleValidationError } = useErrorHandler()
 *
 * // Handle API errors
 * if (!response.success) {
 *   handleApiError(response.errors, 'User creation')
 * }
 * ```
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logToConsole = true,
    reportToService = process.env.NODE_ENV === 'production',
  } = options

  /**
   * Report error to monitoring service
   */
  const reportError = async (error: ApiError, context?: string) => {
    // Implement your error reporting logic here
    // Example: Send to Sentry, LogRocket, or custom service
    try {
      // Mock implementation - replace with actual service
      // await $fetch('/api/errors/report', {
      //   method: 'POST',
      //   body: {
      //     error,
      //     context,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     url: window.location.href
      //   }
      // })

      if (logToConsole) {
        // eslint-disable-next-line no-console
        console.info('Error reported to monitoring service:', { error, context })
      }
    }
    catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  /**
   * Show browser notification as fallback
   */
  const showBrowserNotification = (title: string, message: string, type: 'error' | 'warning' | 'info') => {
    if (!import.meta.client)
      return

    // Create a simple notification element if no toast system is available
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#fee2e2' : type === 'warning' ? '#fef3c7' : '#dbeafe'};
      color: ${type === 'error' ? '#991b1b' : type === 'warning' ? '#92400e' : '#1e40af'};
      border: 1px solid ${type === 'error' ? '#fecaca' : type === 'warning' ? '#fde68a' : '#bfdbfe'};
      border-radius: 6px;
      padding: 12px 16px;
      max-width: 300px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      transition: opacity 0.3s ease;
    `

    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 14px;">${message}</div>
    `

    document.body.appendChild(notification)

    // Auto-remove after timeout
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }

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
          // Include optional field if provided by caller/tests
          field: (err as { field?: string }).field,
          details: err.details,
          timestamp: new Date().toISOString(),
        })
      }

      if (showToast && import.meta.client) {
        // Use Nuxt UI toast if available, fallback to custom implementation
        try {
          const toast = (window as any).useToast?.()
          if (toast?.add) {
            toast.add({
              title: 'Error',
              description: errorMessage,
              color: 'red',
              timeout: 5000,
            })
          }
          else {
            // Fallback notification
            showBrowserNotification('Error', errorMessage, 'error')
          }
        }
        catch (toastError) {
          console.warn('Toast notification failed:', toastError)
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
    const errorMessages = errors.map(err => `${(Array.isArray(err.path) ? err.path.join('.') : String(err.path))}: ${err.message}`)

    if (logToConsole) {
      console.error('Validation Error:', {
        context,
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      })
    }

    if (showToast && import.meta.client) {
      try {
        const toast = (window as any).useToast?.()
        if (toast?.add) {
          errorMessages.forEach((message) => {
            toast.add({
              title: 'Validation Error',
              description: message,
              color: 'orange',
              timeout: 4000,
            })
          })
        }
        else {
          // Fallback notification for first error
          showBrowserNotification('Validation Error', errorMessages[0] ?? 'Validation failed', 'warning')
        }
      }
      catch (toastError) {
        console.warn('Toast notification failed:', toastError)
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
        timestamp: new Date().toISOString(),
      })
    }

    if (showToast && import.meta.client) {
      try {
        const toast = (window as any).useToast?.()
        if (toast?.add) {
          toast.add({
            title: 'Unexpected Error',
            description: 'An unexpected error occurred. Please try again.',
            color: 'red',
            timeout: 5000,
          })
        }
        else {
          showBrowserNotification('Unexpected Error', 'An unexpected error occurred. Please try again.', 'error')
        }
      }
      catch (toastError) {
        console.warn('Toast notification failed:', toastError)
      }
    }

    if (reportToService) {
      reportError({
        code: 'UNEXPECTED_ERROR',
        message: errorMessage,
        status: 0,
        details: { stack: error.stack },
      }, context)
    }
  }

  /**
   * Handle business logic errors
   */
  const handleBusinessError = (code: string, message: string, context?: string) => {
    const businessError: ApiError = {
      code,
      message,
      status: 0,
      details: { context },
    }

    handleApiError(businessError, context)
  }

  /**
   * Clear all error states
   */
  const clearErrors = () => {
    // Clear any persisted error states if needed
    // This could integrate with a global error store
  }

  return {
    handleApiError,
    handleValidationError,
    handleUnexpectedError,
    handleBusinessError,
    reportError,
    clearErrors,
  }
}

/**
 * Global error handler for unhandled promise rejections and errors
 */
export function setupGlobalErrorHandler() {
  if (!import.meta.client)
    return

  const { handleUnexpectedError } = useErrorHandler({
    showToast: true,
    logToConsole: true,
    reportToService: true,
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleUnexpectedError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      'Global Promise Rejection',
    )
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    handleUnexpectedError(
      event.error || new Error(event.message),
      'Global Error Handler',
    )
  })
}
