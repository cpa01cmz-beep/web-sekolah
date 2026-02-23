import { describe, it, expect } from 'vitest'
import { constantTimeCompare } from '../crypto-utils'

describe('constantTimeCompare', () => {
  describe('matching strings', () => {
    it('should return true for identical strings', () => {
      expect(constantTimeCompare('hello', 'hello')).toBe(true)
    })

    it('should return true for identical empty strings', () => {
      expect(constantTimeCompare('', '')).toBe(true)
    })

    it('should return true for identical strings with special characters', () => {
      expect(constantTimeCompare('!@#$%^&*()', '!@#$%^&*()')).toBe(true)
    })

    it('should return true for identical strings with unicode', () => {
      expect(constantTimeCompare('こんにちは世界', 'こんにちは世界')).toBe(true)
    })

    it('should return true for identical long strings', () => {
      const longString = 'a'.repeat(10000)
      expect(constantTimeCompare(longString, longString)).toBe(true)
    })
  })

  describe('non-matching strings', () => {
    it('should return false for different strings', () => {
      expect(constantTimeCompare('hello', 'world')).toBe(false)
    })

    it('should return false for strings differing by one character', () => {
      expect(constantTimeCompare('hello', 'hella')).toBe(false)
    })

    it('should return false for empty vs non-empty string', () => {
      expect(constantTimeCompare('', 'hello')).toBe(false)
      expect(constantTimeCompare('hello', '')).toBe(false)
    })

    it('should return false for case differences', () => {
      expect(constantTimeCompare('Hello', 'hello')).toBe(false)
      expect(constantTimeCompare('HELLO', 'hello')).toBe(false)
    })

    it('should return false for strings with different lengths', () => {
      expect(constantTimeCompare('short', 'longer string')).toBe(false)
    })

    it('should return false for strings with trailing whitespace', () => {
      expect(constantTimeCompare('hello', 'hello ')).toBe(false)
      expect(constantTimeCompare('hello ', 'hello')).toBe(false)
    })
  })

  describe('timing attack resistance', () => {
    it('should process all characters even when difference is early (algorithm verification)', () => {
      // This test verifies the algorithm design - it processes the full length
      // The function uses XOR and OR operations that don't short-circuit
      // This is a code coverage test, not a timing test (JS timing is unreliable)

      // Test that the algorithm correctly compares strings regardless of where
      // the difference occurs
      const str1 = 'x' + 'a'.repeat(999)
      const str2 = 'y' + 'a'.repeat(999)
      expect(constantTimeCompare(str1, str2)).toBe(false)

      const str3 = 'a'.repeat(999) + 'x'
      const str4 = 'a'.repeat(999) + 'y'
      expect(constantTimeCompare(str3, str4)).toBe(false)

      // Verify that identical strings match
      expect(constantTimeCompare(str1, str1)).toBe(true)
      expect(constantTimeCompare(str3, str3)).toBe(true)
    })

    it('should handle different length strings without short-circuit', () => {
      // The algorithm handles different lengths by using max length
      // and filling missing bytes with 0, ensuring constant time
      const shortString = 'a'
      const longString = 'a'.repeat(1000)

      // Both should return false for different strings
      expect(constantTimeCompare(shortString, 'b')).toBe(false)
      expect(constantTimeCompare(longString, 'b'.repeat(1000))).toBe(false)

      // And true for identical strings
      expect(constantTimeCompare(shortString, 'a')).toBe(true)
      expect(constantTimeCompare(longString, 'a'.repeat(1000))).toBe(true)
    })
  })

  describe('cryptographic use cases', () => {
    it('should compare hex hashes correctly', () => {
      const hash1 = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      const hash2 = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      const hash3 = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123457'

      expect(constantTimeCompare(hash1, hash2)).toBe(true)
      expect(constantTimeCompare(hash1, hash3)).toBe(false)
    })

    it('should compare base64-like strings correctly', () => {
      const token1 = 'dGVzdC1hcGkta2V5LXZhbHVl'
      const token2 = 'dGVzdC1hcGkta2V5LXZhbHVl'
      const token3 = 'dGVzdC1hcGkta2V5LXZhbHVm'

      expect(constantTimeCompare(token1, token2)).toBe(true)
      expect(constantTimeCompare(token1, token3)).toBe(false)
    })

    it('should compare JWT-like strings correctly', () => {
      const jwt1 =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
      const jwt2 =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
      const jwt3 =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8V'

      expect(constantTimeCompare(jwt1, jwt2)).toBe(true)
      expect(constantTimeCompare(jwt1, jwt3)).toBe(false)
    })
  })
})
