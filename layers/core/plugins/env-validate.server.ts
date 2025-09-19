import { validateEnvOrThrow } from '#layers/core/utils/env'

export default defineNuxtPlugin(() => {
  // Validate environment eagerly on server startup.
  // This will throw in production if required secrets are missing or invalid.
  if (import.meta.server) {
    validateEnvOrThrow()
  }
})
