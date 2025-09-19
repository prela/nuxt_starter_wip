import type { Mock } from 'vitest'

// Ambient declarations without introducing runtime vars.
// Matching eslint rules by avoiding `var` and banned namespace usage.
declare global {
  // Vitest's global context type surface used in unit tests
  // Note: This augments the globalThis type which is safe and rule-compliant
  interface GlobalThis {
    fetch: Mock
    useRuntimeConfig: () => {
      public: {
        apiBaseUrl: string
        appName: string
        appVersion: string
        appUrl: string
      }
    }
  }
}

export { }
