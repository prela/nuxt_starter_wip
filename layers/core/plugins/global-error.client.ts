import { setupGlobalErrorHandler } from '../composables/useErrorHandler'

export default defineNuxtPlugin(() => {
  // Initialize global error handling on client
  // Uses core composable auto-import
  setupGlobalErrorHandler()
})
