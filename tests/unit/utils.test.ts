import { describe, expect, it } from 'vitest'

// Simple utility functions to test
function formatName(first: string, last: string): string {
  return `${first} ${last}`.trim()
}

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.') && !email.startsWith('@')
}

describe('utility Functions', () => {
  describe('formatName', () => {
    it('should format names correctly', () => {
      expect(formatName('John', 'Doe')).toBe('John Doe')
    })

    it('should handle empty strings', () => {
      expect(formatName('', 'Doe')).toBe('Doe')
      expect(formatName('John', '')).toBe('John')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user@domain.org')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })
})
