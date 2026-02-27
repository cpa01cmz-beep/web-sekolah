import { describe, it, expect } from 'vitest'
import { generateSignature, verifySignature } from '../webhook-crypto'

describe('webhook-crypto', () => {
  describe('generateSignature', () => {
    it('should generate consistent signature for same payload and secret', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'

      const signature1 = await generateSignature(payload, secret)
      const signature2 = await generateSignature(payload, secret)

      expect(signature1).toBe(signature2)
      expect(signature1).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should generate different signatures for same payload with different secrets', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret1 = 'webhook-secret-key-1'
      const secret2 = 'webhook-secret-key-2'

      const signature1 = await generateSignature(payload, secret1)
      const signature2 = await generateSignature(payload, secret2)

      expect(signature1).not.toBe(signature2)
    })

    it('should generate different signatures for different payloads with same secret', async () => {
      const payload1 = '{"event":"user.created","data":{"id":"user-123"}}'
      const payload2 = '{"event":"user.updated","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'

      const signature1 = await generateSignature(payload1, secret)
      const signature2 = await generateSignature(payload2, secret)

      expect(signature1).not.toBe(signature2)
    })

    it('should handle empty payload', async () => {
      const payload = ''
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should handle special characters in payload', async () => {
      const payload = '{"event":"test","data":"hello\\nworld\\t\\u0000"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should handle unicode characters in payload', async () => {
      const payload = '{"event":"test","data":"Héllo Wørld 你好"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should handle very long payloads', async () => {
      const largePayload = '{"event":"test","data":"' + 'x'.repeat(10000) + '"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(largePayload, secret)

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should handle secret with special characters', async () => {
      const payload = '{"event":"test"}'
      const secret = 'secret-with!@#$%^&*()special-chars'

      const signature = await generateSignature(payload, secret)

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/)
    })

    it('should use SHA-256 algorithm', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)

      const hexLength = signature.replace('sha256=', '').length
      expect(hexLength).toBe(64)
    })

    it('should return lowercase hex signature', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)
      const hexPart = signature.replace('sha256=', '')

      expect(hexPart).toBe(hexPart.toLowerCase())
    })
  })

  describe('verifySignature', () => {
    it('should return true for valid signature', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(payload, secret)

      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should return false for invalid signature', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'
      const invalidSignature =
        'sha256=invalidsignature00000000000000000000000000000000000000000000000000000000000000'

      const isValid = await verifySignature(payload, invalidSignature, secret)

      expect(isValid).toBe(false)
    })

    it('should return false for signature with wrong secret', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret1 = 'webhook-secret-key-1'
      const secret2 = 'webhook-secret-key-2'
      const signature = await generateSignature(payload, secret1)

      const isValid = await verifySignature(payload, signature, secret2)

      expect(isValid).toBe(false)
    })

    it('should return false for signature from different payload', async () => {
      const payload1 = '{"event":"user.created","data":{"id":"user-123"}}'
      const payload2 = '{"event":"user.updated","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'
      const signature1 = await generateSignature(payload1, secret)

      const isValid = await verifySignature(payload2, signature1, secret)

      expect(isValid).toBe(false)
    })

    it('should handle empty payload verification', async () => {
      const payload = ''
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(payload, secret)

      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should return false for malformed signature format', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'
      const malformedSignature = 'invalid-format'

      const isValid = await verifySignature(payload, malformedSignature, secret)

      expect(isValid).toBe(false)
    })

    it('should return false for signature with wrong hash length', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'
      const wrongLengthSignature = 'sha256=abc123'

      const isValid = await verifySignature(payload, wrongLengthSignature, secret)

      expect(isValid).toBe(false)
    })

    it('should return false for signature without sha256 prefix', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'
      const signatureWithoutPrefix = await generateSignature(payload, secret)
      const hexOnly = signatureWithoutPrefix.replace('sha256=', '')

      const isValid = await verifySignature(payload, hexOnly, secret)

      expect(isValid).toBe(false)
    })

    it('should return false for signature with uppercase SHA256', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(payload, secret)
      const uppercasePrefix = signature.replace('sha256=', 'SHA256=')

      const isValid = await verifySignature(payload, uppercasePrefix, secret)

      expect(isValid).toBe(false)
    })

    it('should handle unicode payload verification', async () => {
      const payload = '{"event":"test","data":"Héllo Wørld 你好"}'
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(payload, secret)

      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle special characters in secret verification', async () => {
      const payload = '{"event":"test"}'
      const secret = 'secret-with!@#$%^&*()special-chars'
      const signature = await generateSignature(payload, secret)

      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle very long payload verification', async () => {
      const largePayload = '{"event":"test","data":"' + 'x'.repeat(10000) + '"}'
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(largePayload, secret)

      const isValid = await verifySignature(largePayload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should be case-sensitive for hex characters', async () => {
      const payload = '{"event":"test"}'
      const secret = 'webhook-secret-key'
      const signature = await generateSignature(payload, secret)
      const uppercaseHex = signature.replace('sha256=', '').toUpperCase()
      const uppercaseSignature = 'sha256=' + uppercaseHex

      const isValid = await verifySignature(payload, uppercaseSignature, secret)

      expect(isValid).toBe(false)
    })
  })

  describe('Integration Scenarios', () => {
    it('should verify signature generated immediately after', async () => {
      const payload = '{"event":"user.created","data":{"id":"user-123"}}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should verify signature across multiple operations', async () => {
      const secret = 'webhook-secret-key'
      const payloads = [
        '{"event":"user.created","data":{"id":"user-123"}}',
        '{"event":"user.updated","data":{"id":"user-123"}}',
        '{"event":"user.deleted","data":{"id":"user-123"}}',
      ]

      for (const payload of payloads) {
        const signature = await generateSignature(payload, secret)
        const isValid = await verifySignature(payload, signature, secret)
        expect(isValid).toBe(true)
      }
    })

    it('should maintain signature consistency across different calls', async () => {
      const payload = '{"event":"test","data":"consistent"}'
      const secret = 'webhook-secret-key'

      const signatures = await Promise.all([
        generateSignature(payload, secret),
        generateSignature(payload, secret),
        generateSignature(payload, secret),
      ])

      const isValidations = await Promise.all(
        signatures.map(sig => verifySignature(payload, sig, secret))
      )

      expect(signatures.every(s => s === signatures[0])).toBe(true)
      expect(isValidations.every(v => v === true)).toBe(true)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle whitespace-only payload', async () => {
      const payload = '   '
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle payload with only brackets', async () => {
      const payload = '{}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle secret with only whitespace', async () => {
      const payload = '{"event":"test"}'
      const secret = '   '

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle very short secret', async () => {
      const payload = '{"event":"test"}'
      const secret = 'x'

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle very long secret', async () => {
      const payload = '{"event":"test"}'
      const secret = 'x'.repeat(1000)

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })

    it('should handle null byte in payload', async () => {
      const payload = '{"event":"test","data":"\u0000"}'
      const secret = 'webhook-secret-key'

      const signature = await generateSignature(payload, secret)
      const isValid = await verifySignature(payload, signature, secret)

      expect(isValid).toBe(true)
    })
  })
})
