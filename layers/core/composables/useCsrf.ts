/**
 * Provides CSRF token utilities for client-side requests.
 * - On client: ensures a token cookie exists by calling `/api/csrf-token` as needed
 *   and exposes a header name + token to attach to state-changing requests.
 * - On server: returns a safe placeholder without performing network calls.
 */
export function useCsrf() {
  const headerName = 'X-CSRF-Token'

  // Server-side: do not attempt to access cookies or fetch
  if (import.meta.server) {
    return {
      csrf: null as string | null,
      headerName,
      async refresh() { /* no-op on server */ },
      getHeaders(): Record<string, string> { return {} },
    }
  }

  // Client-side implementation
  const cookie = useCookie<string | null>('csrf-token', { sameSite: 'strict' })
  const csrf = computed(() => cookie.value ?? null)

  const ensureToken = async () => {
    if (!cookie.value) {
      try {
        const res = await fetch('/api/csrf-token', { method: 'GET', credentials: 'same-origin' })
        // Endpoint sets cookie; response body contains token too
        const data = await res.json().catch(() => ({})) as { token?: string }
        if (data && typeof data.token === 'string') {
          cookie.value = data.token
        }
      }
      catch (e) {
        // Non-fatal: CSRF header will simply be omitted
        console.warn('[csrf] Failed to ensure CSRF token:', e)
      }
    }
  }

  const refresh = async () => {
    // Force refresh from server
    try {
      const res = await fetch('/api/csrf-token', { method: 'GET', credentials: 'same-origin' })
      const data = await res.json().catch(() => ({})) as { token?: string }
      if (data && typeof data.token === 'string') {
        cookie.value = data.token
      }
    }
    catch (e) {
      console.warn('[csrf] Failed to refresh CSRF token:', e)
    }
  }

  const getHeaders = (): Record<string, string> => {
    return csrf.value ? { [headerName]: csrf.value } : {}
  }

  // Lazy-initialize token
  ensureToken()

  return {
    csrf: csrf.value,
    headerName,
    refresh,
    getHeaders,
  }
}
