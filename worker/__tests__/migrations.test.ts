import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MigrationRunner, MigrationRegistry, MigrationHelpers } from '../migrations'
import { logger } from '../logger'

vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('Migration System - Data Integrity', () => {
  let mockEnv: any
  let mockStub: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockStub = {
      casPut: vi.fn().mockResolvedValue({ ok: true, v: 1 }),
      del: vi.fn().mockResolvedValue(true),
      getDoc: vi.fn().mockResolvedValue({ v: 1, data: null }),
    }

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    }

    MigrationRegistry.migrations = []
  })

  describe('MigrationRegistry', () => {
    it('should register migrations', () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn(),
        down: vi.fn(),
      }

      MigrationRegistry.register(mockMigration)

      const migrations = MigrationRegistry.getAll()

      expect(migrations).toHaveLength(1)
      expect(migrations).toContain(mockMigration)
    })

    it('should register multiple migrations', () => {
      const mockMigration1 = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn(),
        down: vi.fn(),
      }

      const mockMigration2 = {
        id: '20260108_add_timestamps',
        description: 'Add timestamps',
        up: vi.fn(),
        down: vi.fn(),
      }

      MigrationRegistry.register(mockMigration1)
      MigrationRegistry.register(mockMigration2)

      const migrations = MigrationRegistry.getAll()

      expect(migrations).toHaveLength(2)
      expect(migrations).toContain(mockMigration1)
      expect(migrations).toContain(mockMigration2)
    })

    it('should return copy of migrations (not same reference)', () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn(),
        down: vi.fn(),
      }

      MigrationRegistry.register(mockMigration)
      const migrations1 = MigrationRegistry.getAll()
      const migrations2 = MigrationRegistry.getAll()

      expect(migrations1).not.toBe(migrations2)
      expect(migrations1).toEqual(migrations2)
      expect(migrations1).toContain(mockMigration)
    })
  })

  describe('MigrationHelpers', () => {
    it('should log migration steps', () => {
      MigrationHelpers.log('Starting migration process')

      expect(logger.info).toHaveBeenCalledWith('[Migration] Starting migration process')
    })

    it('should validate integrity with all passing checks', async () => {
      const checks = [
        { name: 'Check users table', check: vi.fn().mockResolvedValue(true) },
        { name: 'Check indexes', check: vi.fn().mockResolvedValue(true) },
      ]

      await expect(MigrationHelpers.validateIntegrity(checks)).resolves.not.toThrow()

      expect(checks[0].check).toHaveBeenCalled()
      expect(checks[1].check).toHaveBeenCalled()
      expect(logger.info).not.toHaveBeenCalled()
    })

    it('should log error when integrity check fails', async () => {
      const checks = [
        { name: 'Check users table', check: vi.fn().mockResolvedValue(true) },
        { name: 'Check indexes', check: vi.fn().mockRejectedValue(new Error('Index corrupted')) },
      ]

      await expect(MigrationHelpers.validateIntegrity(checks)).rejects.toThrow(
        'Migration integrity checks failed: Check indexes'
      )

      expect(logger.error).toHaveBeenCalledWith(
        '[Migration] Integrity check error',
        new Error('Index corrupted'),
        { name: 'Check indexes' }
      )
    })

    it('should handle all checks failing', async () => {
      const checks = [
        { name: 'Check 1', check: vi.fn().mockRejectedValue(new Error('Failed')) },
        { name: 'Check 2', check: vi.fn().mockRejectedValue(new Error('Failed')) },
        { name: 'Check 3', check: vi.fn().mockRejectedValue(new Error('Failed')) },
      ]

      await expect(MigrationHelpers.validateIntegrity(checks)).rejects.toThrow(
        'Migration integrity checks failed: Check 1, Check 2, Check 3'
      )

      expect(logger.error).toHaveBeenCalledTimes(3)
    })

    it('should log error when check throws', async () => {
      const checks = [
        { name: 'Check 1', check: vi.fn().mockRejectedValue(new Error('Unexpected error')) },
        { name: 'Check 2', check: vi.fn().mockResolvedValue(true) },
      ]

      await expect(MigrationHelpers.validateIntegrity(checks)).rejects.toThrow()

      expect(logger.error).toHaveBeenCalledWith(
        '[Migration] Integrity check error',
        new Error('Unexpected error'),
        { name: 'Check 1' }
      )
    })
  })

  describe('Integration Testing - Migration Flow', () => {
    it('should execute up migration', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)
      logger.info = vi.fn()

      await MigrationRunner.run(mockEnv, [mockMigration])

      expect(mockMigration.up).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Applying',
        expect.objectContaining({
          id: '20260107_add_password_hash',
          description: 'Add password hash',
        })
      )
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Successfully applied',
        expect.objectContaining({
          id: '20260107_add_password_hash',
        })
      )
      expect(logger.info).toHaveBeenCalledWith('[Migration] All migrations applied successfully')
    })

    it('should handle migration errors', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      await expect(MigrationRunner.run(mockEnv, [mockMigration])).rejects.toThrow(
        'Migration 20260107_add_password_hash failed: Error: Database connection failed'
      )

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to apply 20260107_add_password_hash'),
        expect.any(Error)
      )
    })

    it('should execute rollback migration', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)
      logger.info = vi.fn()

      mockStub.getDoc = vi.fn().mockResolvedValue({
        v: 1,
        data: { appliedMigrations: ['20260107_add_password_hash'], version: 1 },
      })

      await MigrationRunner.rollback(mockEnv, [mockMigration])

      expect(mockMigration.down).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Rolling back',
        expect.objectContaining({
          id: '20260107_add_password_hash',
        })
      )
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Successfully rolled back',
        expect.objectContaining({
          id: '20260107_add_password_hash',
        })
      )
    })

    it('should handle rollback errors', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockRejectedValue(new Error('Rollback failed')),
      }

      MigrationRegistry.register(mockMigration)

      mockStub.getDoc = vi.fn().mockResolvedValue({
        v: 1,
        data: { appliedMigrations: ['20260107_add_password_hash'], version: 1 },
      })

      await expect(MigrationRunner.rollback(mockEnv, [mockMigration])).rejects.toThrow(
        'Rollback of 20260107_add_password_hash failed: Error: Rollback failed'
      )

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to rollback'),
        expect.any(Error)
      )
    })

    it('should run multiple pending migrations', async () => {
      const mockMigration1 = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      const mockMigration2 = {
        id: '20260108_add_timestamps',
        description: 'Add timestamps',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration1)
      MigrationRegistry.register(mockMigration2)
      logger.info = vi.fn()

      await MigrationRunner.run(mockEnv, [mockMigration1, mockMigration2])

      expect(mockMigration1.up).toHaveBeenCalled()
      expect(mockMigration2.up).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('[Migration] Found pending migrations', { count: 2 })
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Successfully applied',
        expect.objectContaining({
          id: '20260107_add_password_hash',
        })
      )
      expect(logger.info).toHaveBeenCalledWith(
        '[Migration] Successfully applied',
        expect.objectContaining({
          id: '20260108_add_timestamps',
        })
      )
      expect(logger.info).toHaveBeenCalledWith('[Migration] All migrations applied successfully')
    })
  })

  describe('Production Safety', () => {
    it('should warn when no migrations in non-production', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      mockStub.getDoc = vi.fn().mockResolvedValue({
        v: 1,
        data: { appliedMigrations: ['20260107_add_password_hash'], version: 1 },
      })

      await MigrationRunner.run({ ...mockEnv, ENVIRONMENT: 'development' }, [mockMigration])

      expect(logger.info).toHaveBeenCalledWith('[Migration] No pending migrations to apply')
    })

    it('should throw when trying to set passwords in production', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockRejectedValue(new Error('Cannot set passwords in production')),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      await expect(
        MigrationRunner.run({ ...mockEnv, ENVIRONMENT: 'production' }, [mockMigration])
      ).rejects.toThrow(
        'Migration 20260107_add_password_hash failed: Error: Cannot set passwords in production'
      )

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to apply 20260107_add_password_hash'),
        expect.any(Error)
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty migration list gracefully', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      await MigrationRunner.run(mockEnv, [mockMigration])

      expect(mockMigration.up).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('[Migration] All migrations applied successfully')
    })

    it('should handle migration up returning void', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined as any),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      await MigrationRunner.run(mockEnv, [mockMigration])

      expect(mockMigration.up).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('[Migration] All migrations applied successfully')
    })

    it('should handle concurrent migration attempts safely', async () => {
      const mockMigration = {
        id: '20260107_add_password_hash',
        description: 'Add password hash',
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }

      MigrationRegistry.register(mockMigration)

      const promises = [
        MigrationRunner.run(mockEnv, [mockMigration]),
        MigrationRunner.run(mockEnv, [mockMigration]),
      ]

      await Promise.allSettled(promises)

      expect(logger.info).toHaveBeenCalledWith('[Migration] All migrations applied successfully')
      expect(mockMigration.up).toHaveBeenCalledTimes(2)
    })
  })
})
