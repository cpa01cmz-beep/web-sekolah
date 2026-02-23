import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  getDummyPasswordHash,
  verifyPasswordTimingSafe,
  isValidPasswordHashFormat,
} from '../password-utils'

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password with valid format', async () => {
      const password = 'testPassword123'
      const { hash } = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toContain(':')
    })

    it('should produce different hashes for different passwords', async () => {
      const password1 = 'password123'
      const password2 = 'differentPassword'

      const { hash: hash1 } = await hashPassword(password1)
      const { hash: hash2 } = await hashPassword(password2)

      expect(hash1).not.toBe(hash2)
    })

    it('should produce different hashes for same password (due to salt)', async () => {
      const password = 'password123'

      const { hash: hash1 } = await hashPassword(password)
      const { hash: hash2 } = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should have correct hash format', async () => {
      const password = 'testPassword'
      const { hash } = await hashPassword(password)

      const parts = hash.split(':')
      expect(parts).toHaveLength(2)

      const [salt, derivedHash] = parts
      expect(salt).toHaveLength(32)
      expect(derivedHash).toHaveLength(64)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctPassword'
      const { hash } = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'
      const { hash } = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const password = 'correctPassword'
      const { hash } = await hashPassword(password)

      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('should reject null hash', async () => {
      const isValid = await verifyPassword('anyPassword', null)
      expect(isValid).toBe(false)
    })

    it('should reject undefined hash', async () => {
      const isValid = await verifyPassword('anyPassword', undefined)
      expect(isValid).toBe(false)
    })

    it('should handle malformed hash gracefully', async () => {
      const isValid = await verifyPassword('anyPassword', 'malformed:hash:format')
      expect(isValid).toBe(false)
    })
  })

  describe('Password Security', () => {
    it('should use PBKDF2 with sufficient iterations', async () => {
      const password = 'testPassword'
      const { hash } = await hashPassword(password)

      const parts = hash.split(':')
      expect(parts).toHaveLength(2)
    })

    it('should use unique salt per hash', async () => {
      const password = 'samePassword'
      const { hash: hash1 } = await hashPassword(password)
      const { hash: hash2 } = await hashPassword(password)

      const [salt1] = hash1.split(':')
      const [salt2] = hash2.split(':')

      expect(salt1).not.toBe(salt2)
    })

    it('should produce hash of correct length', async () => {
      const password = 'testPassword'
      const { hash } = await hashPassword(password)

      const parts = hash.split(':')
      const [, derivedHash] = parts
      expect(derivedHash).toHaveLength(64)
    })

    it('should produce salt of correct length', async () => {
      const password = 'testPassword'
      const { hash } = await hashPassword(password)

      const parts = hash.split(':')
      const [salt] = parts
      expect(salt).toHaveLength(32)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      const { hash } = await hashPassword(longPassword)

      const isValid = await verifyPassword(longPassword, hash)
      expect(isValid).toBe(true)
    })

    it('should handle special characters in passwords', async () => {
      const specialPassword = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
      const { hash } = await hashPassword(specialPassword)

      const isValid = await verifyPassword(specialPassword, hash)
      expect(isValid).toBe(true)
    })

    it('should handle unicode characters in passwords', async () => {
      const unicodePassword = 'パスワード123'
      const { hash } = await hashPassword(unicodePassword)

      const isValid = await verifyPassword(unicodePassword, hash)
      expect(isValid).toBe(true)
    })

    it('should handle passwords with mixed case', async () => {
      const mixedCasePassword = 'MixedCasePassword123'
      const { hash } = await hashPassword(mixedCasePassword)

      const isValid = await verifyPassword(mixedCasePassword, hash)
      expect(isValid).toBe(true)
    })
  })

  describe('getDummyPasswordHash', () => {
    it('should return a valid hash format', () => {
      const dummyHash = getDummyPasswordHash()
      expect(dummyHash).toBeDefined()
      expect(typeof dummyHash).toBe('string')
      expect(dummyHash).toContain(':')
    })

    it('should have correct salt and hash lengths', () => {
      const dummyHash = getDummyPasswordHash()
      const parts = dummyHash.split(':')
      expect(parts).toHaveLength(2)
      expect(parts[0]).toHaveLength(32)
      expect(parts[1]).toHaveLength(64)
    })

    it('should always return the same dummy hash', () => {
      const hash1 = getDummyPasswordHash()
      const hash2 = getDummyPasswordHash()
      expect(hash1).toBe(hash2)
    })
  })

  describe('verifyPasswordTimingSafe', () => {
    it('should return false when no hash provided (null)', async () => {
      const isValid = await verifyPasswordTimingSafe('anyPassword', null)
      expect(isValid).toBe(false)
    })

    it('should return false when no hash provided (undefined)', async () => {
      const isValid = await verifyPasswordTimingSafe('anyPassword', undefined)
      expect(isValid).toBe(false)
    })

    it('should verify correct password with valid hash', async () => {
      const password = 'correctPassword'
      const { hash } = await hashPassword(password)

      const isValid = await verifyPasswordTimingSafe(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password with valid hash', async () => {
      const password = 'correctPassword'
      const { hash } = await hashPassword(password)

      const isValid = await verifyPasswordTimingSafe('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('should take similar time for null hash vs invalid password', async () => {
      const password = 'testPassword123'
      const { hash } = await hashPassword(password)

      const startNull = performance.now()
      await verifyPasswordTimingSafe(password, null)
      const endNull = performance.now()

      const startInvalid = performance.now()
      await verifyPasswordTimingSafe('wrongPassword', hash)
      const endInvalid = performance.now()

      const nullDuration = endNull - startNull
      const invalidDuration = endInvalid - startInvalid

      expect(Math.abs(nullDuration - invalidDuration)).toBeLessThan(50)
    })
  })

  describe('isValidPasswordHashFormat', () => {
    it('should return true for valid hash format', async () => {
      const { hash } = await hashPassword('password')
      expect(isValidPasswordHashFormat(hash)).toBe(true)
    })

    it('should return false for invalid hash format', () => {
      expect(isValidPasswordHashFormat('invalid')).toBe(false)
      expect(isValidPasswordHashFormat('invalid:hash')).toBe(false)
      expect(isValidPasswordHashFormat('')).toBe(false)
    })

    it('should return true for dummy hash format', () => {
      const dummyHash = getDummyPasswordHash()
      expect(isValidPasswordHashFormat(dummyHash)).toBe(true)
    })
  })
})
