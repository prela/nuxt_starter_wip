import { z } from 'zod'

/**
 * Zod schema describing environment variables we care about.
 * Secrets are validated for type/shape; production-only requirement is enforced at runtime.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').optional(),
  NUXT_CSRF_SECRET: z.string().min(16, 'NUXT_CSRF_SECRET must be at least 16 characters').optional(),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').optional(),
})

export type EnvVars = z.infer<typeof envSchema>

/**
 * Validates process.env using Zod and fails fast in production when required secrets are missing.
 * Throws a descriptive Error in production if any required variables are missing or invalid.
 * Returns the parsed and typed env object otherwise.
 */
export function validateEnvOrThrow(): EnvVars {
  const parsed = envSchema.safeParse(process.env)

  // If schema-level validation fails (e.g. invalid URL or min length), surface that directly
  if (!parsed.success) {
    // Aggregate Zod issues into a concise message
    const message = parsed.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')

    // In production, treat schema issues as fatal
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${message}`)
    }

    // In non-production, log a warning to aid local development while not blocking startup
    console.warn(`[env] Non-fatal environment issues: ${message}`)
  }

  const env = (parsed.success ? parsed.data : (process.env as unknown)) as EnvVars

  const isProduction = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production'

  // Required in production
  const requiredKeys: Array<keyof EnvVars> = ['JWT_SECRET', 'NUXT_CSRF_SECRET']
  const missing: string[] = []

  for (const key of requiredKeys) {
    const value = (env as Record<string, unknown>)[key]
    if (typeof value !== 'string' || value.trim().length === 0) {
      missing.push(key)
    }
  }

  if (isProduction && missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }

  // Additional hardening: discourage defaults in production for security-sensitive values
  if (isProduction) {
    const insecureDefaults: Array<[keyof EnvVars, string[]]> = [
      ['JWT_SECRET', ['default', 'changeme', 'secret']],
      ['NUXT_CSRF_SECRET', ['default', 'changeme', 'secret']],
    ]

    const bad: string[] = []
    for (const [key, forbidden] of insecureDefaults) {
      const val = (env as Record<string, string | undefined>)[key]
      if (val && forbidden.includes(val.toLowerCase())) {
        bad.push(key)
      }
    }
    if (bad.length > 0) {
      throw new Error(`Insecure default values detected for: ${bad.join(', ')}`)
    }
  }

  return env
}
