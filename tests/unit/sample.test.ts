import { describe, expect, it } from 'vitest'

describe('sample Tests', () => {
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })
})
