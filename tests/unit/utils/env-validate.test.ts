import { validateEnvOrThrow } from '#layers/core/utils/env'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

describe('environment variable validation', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('passes when required secrets are present in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.JWT_SECRET = 'x'.repeat(32)
    process.env.NUXT_CSRF_SECRET = 'y'.repeat(32)

    expect(() => validateEnvOrThrow()).not.toThrow()
  })

  it('throws when NUXT_CSRF_SECRET is missing in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.JWT_SECRET = 'x'.repeat(32)
    delete (process.env as any).NUXT_CSRF_SECRET

    expect(() => validateEnvOrThrow()).toThrow(/NUXT_CSRF_SECRET/i)
  })
})
