import { describe, it, expect } from 'vitest'
import { validateEnv, validateEnvStrict, isProductionEnv, isDevelopmentEnv } from '../env-validator'

describe('Environment Validator', () => {
  describe('validateEnv', () => {
    it('should return success for valid development environment', () => {
      const env = {
        ENVIRONMENT: 'development',
        JWT_SECRET: 'a'.repeat(64),
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
      expect(result.data?.ENVIRONMENT).toBe('development')
    })

    it('should return success for valid production environment', () => {
      const env = {
        ENVIRONMENT: 'production',
        JWT_SECRET: 'a'.repeat(64),
        ALLOWED_ORIGINS: 'https://example.com',
        SITE_URL: 'https://example.com',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
      expect(result.data?.ENVIRONMENT).toBe('production')
    })

    it('should return success for valid staging environment', () => {
      const env = {
        ENVIRONMENT: 'staging',
        JWT_SECRET: 'a'.repeat(64),
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
      expect(result.data?.ENVIRONMENT).toBe('staging')
    })

    it('should default ENVIRONMENT to development when not provided', () => {
      const env = {}
      const result = validateEnv(env)
      expect(result.success).toBe(true)
      expect(result.data?.ENVIRONMENT).toBe('development')
    })

    it('should return success for optional ALLOWED_ORIGINS', () => {
      const env = {
        ALLOWED_ORIGINS: 'https://example.com,https://test.com',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
    })

    it('should return success for optional SITE_URL', () => {
      const env = {
        SITE_URL: 'https://example.com',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
    })

    it('should return failure for invalid ENVIRONMENT value', () => {
      const env = {
        ENVIRONMENT: 'invalid',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return failure for JWT_SECRET less than 64 characters', () => {
      const env = {
        JWT_SECRET: 'short',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return failure for invalid SITE_URL', () => {
      const env = {
        SITE_URL: 'not-a-url',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return success with all optional fields provided', () => {
      const env = {
        ENVIRONMENT: 'production',
        JWT_SECRET: 'a'.repeat(64),
        ALLOWED_ORIGINS: 'https://example.com',
        SITE_URL: 'https://example.com',
        DEFAULT_PASSWORD: 'securepass123',
      }
      const result = validateEnv(env)
      expect(result.success).toBe(true)
    })
  })

  describe('validateEnvStrict', () => {
    it('should return validated data for valid environment', () => {
      const env = {
        ENVIRONMENT: 'production',
        JWT_SECRET: 'a'.repeat(64),
      }
      const result = validateEnvStrict(env)
      expect(result.ENVIRONMENT).toBe('production')
    })

    it('should throw error for invalid environment', () => {
      const env = {
        ENVIRONMENT: 'invalid',
      }
      expect(() => validateEnvStrict(env)).toThrow()
    })

    it('should throw error with descriptive message for invalid JWT_SECRET', () => {
      const env = {
        JWT_SECRET: 'short',
      }
      expect(() => validateEnvStrict(env)).toThrow('Invalid environment configuration')
    })
  })

  describe('isProductionEnv', () => {
    it('should return true for production environment', () => {
      expect(isProductionEnv({ ENVIRONMENT: 'production' })).toBe(true)
    })

    it('should return false for development environment', () => {
      expect(isProductionEnv({ ENVIRONMENT: 'development' })).toBe(false)
    })

    it('should return false for staging environment', () => {
      expect(isProductionEnv({ ENVIRONMENT: 'staging' })).toBe(false)
    })

    it('should return false when ENVIRONMENT is undefined', () => {
      expect(isProductionEnv({})).toBe(false)
    })
  })

  describe('isDevelopmentEnv', () => {
    it('should return true for development environment', () => {
      expect(isDevelopmentEnv({ ENVIRONMENT: 'development' })).toBe(true)
    })

    it('should return true when ENVIRONMENT is undefined', () => {
      expect(isDevelopmentEnv({})).toBe(true)
    })

    it('should return false for production environment', () => {
      expect(isDevelopmentEnv({ ENVIRONMENT: 'production' })).toBe(false)
    })

    it('should return false for staging environment', () => {
      expect(isDevelopmentEnv({ ENVIRONMENT: 'staging' })).toBe(false)
    })
  })
})
