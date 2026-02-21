import type { Env } from './core-utils';
import { logger } from './logger';
import { UserEntity } from './entities';
import { hashPassword } from './password-utils';

function generateSecureRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint32Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}

const MIGRATION_STATE_KEY = 'sys:migration:state';

interface MigrationState {
  appliedMigrations: string[];
  version: number;
}

/**
 * Migration interface
 * All migrations must implement this interface
 */
export interface Migration {
  /** Unique migration identifier (e.g., "20250107_add_timestamps") */
  readonly id: string;
  /** Human-readable description of what the migration does */
  readonly description: string;
  /** Apply the migration */
  up(env: Env): Promise<void>;
  /** Rollback the migration - must be reversible */
  down(env: Env): Promise<void>;
}

/**
 * Migration runner for applying and rolling back schema changes
 * Uses persistent storage to track migration state across restarts
 */
export class MigrationRunner {
  private static async loadState(env: Env): Promise<Set<string>> {
    try {
      const stub = env.GlobalDurableObject.get(
        env.GlobalDurableObject.idFromName('sys-migration-state')
      );
      const doc = (await stub.getDoc(MIGRATION_STATE_KEY)) as {
        data: MigrationState | null;
      } | null;
      return new Set(doc?.data?.appliedMigrations ?? []);
    } catch (error) {
      logger.error('[Migration] Failed to load migration state', error);
      return new Set();
    }
  }

  private static async saveState(env: Env, appliedMigrations: Set<string>): Promise<void> {
    try {
      const stub = env.GlobalDurableObject.get(
        env.GlobalDurableObject.idFromName('sys-migration-state')
      );
      const state: MigrationState = {
        appliedMigrations: Array.from(appliedMigrations),
        version: appliedMigrations.size,
      };
      await stub.casPut(MIGRATION_STATE_KEY, 0, state);
    } catch (error) {
      logger.error('[Migration] Failed to save migration state', error);
      throw new Error(`Failed to save migration state: ${error}`);
    }
  }

  /**
   * Register and run pending migrations
   * @param env - Environment context
   * @param migrations - Array of migrations to apply
   */
  static async run(env: Env, migrations: Migration[]): Promise<void> {
    const appliedMigrations = await this.loadState(env);
    const pending = migrations.filter((m) => !appliedMigrations.has(m.id));

    if (pending.length === 0) {
      logger.info('[Migration] No pending migrations to apply');
      return;
    }

    logger.info('[Migration] Found pending migrations', { count: pending.length });

    for (const migration of pending) {
      try {
        logger.info('[Migration] Applying', {
          id: migration.id,
          description: migration.description,
        });
        await migration.up(env);
        appliedMigrations.add(migration.id);
        await this.saveState(env, appliedMigrations);
        logger.info('[Migration] Successfully applied', { id: migration.id });
      } catch (error) {
        logger.error(`[Migration] Failed to apply ${migration.id}`, error);
        throw new Error(`Migration ${migration.id} failed: ${error}`);
      }
    }

    logger.info('[Migration] All migrations applied successfully');
  }

  /**
   * Rollback the last N migrations
   * @param env - Environment context
   * @param migrations - All available migrations
   * @param count - Number of migrations to rollback (default: 1)
   */
  static async rollback(env: Env, migrations: Migration[], count = 1): Promise<void> {
    const appliedMigrations = await this.loadState(env);
    const toRollback = migrations.filter((m) => appliedMigrations.has(m.id)).slice(-count);

    if (toRollback.length === 0) {
      logger.info('[Migration] No migrations to rollback');
      return;
    }

    for (const migration of toRollback) {
      try {
        logger.info('[Migration] Rolling back', {
          id: migration.id,
          description: migration.description,
        });
        await migration.down(env);
        appliedMigrations.delete(migration.id);
        await this.saveState(env, appliedMigrations);
        logger.info('[Migration] Successfully rolled back', { id: migration.id });
      } catch (error) {
        logger.error(`[Migration] Failed to rollback ${migration.id}`, error);
        throw new Error(`Rollback of ${migration.id} failed: ${error}`);
      }
    }

    logger.info('[Migration] Rollback completed successfully');
  }

  /**
   * Get current migration version
   */
  static async getCurrentVersion(env: Env): Promise<number> {
    const appliedMigrations = await this.loadState(env);
    return appliedMigrations.size;
  }

  /**
   * Check if a specific migration has been applied
   */
  static async isApplied(env: Env, migrationId: string): Promise<boolean> {
    const appliedMigrations = await this.loadState(env);
    return appliedMigrations.has(migrationId);
  }

  /**
   * Reset all migrations (USE WITH CAUTION - clears persistent state)
   * This is useful for testing but should never be used in production
   */
  static async reset(env: Env): Promise<void> {
    try {
      const stub = env.GlobalDurableObject.get(
        env.GlobalDurableObject.idFromName('sys-migration-state')
      );
      await stub.del(MIGRATION_STATE_KEY);
      logger.warn('[Migration] Migration history has been reset');
    } catch (error) {
      logger.error('[Migration] Failed to reset migration state', error);
      throw new Error(`Failed to reset migration state: ${error}`);
    }
  }

  /**
   * Get list of applied migrations
   */
  static async getAppliedMigrations(env: Env): Promise<string[]> {
    const appliedMigrations = await this.loadState(env);
    return Array.from(appliedMigrations);
  }
}

/**
 * Migration registry - register all migrations here
 */
export const MigrationRegistry = {
  migrations: [] as Migration[],

  register(migration: Migration): void {
    this.migrations.push(migration);
  },

  getAll(): Migration[] {
    return [...this.migrations];
  },
};

/**
 * Migration: Add password hash field to users
 * This migration adds a passwordHash field to all existing users
 * and sets a default password hash for each user
 */
export const AddPasswordHashMigration: Migration = {
  id: '20260107_add_password_hash',
  description: 'Add passwordHash field to all user entities and set default password',

  async up(env: Env): Promise<void> {
    MigrationHelpers.log('Starting AddPasswordHashMigration');

    if (env.ENVIRONMENT === 'production') {
      throw new Error(
        'Cannot set default passwords in production environment. Users must set passwords through a secure password reset flow.'
      );
    }

    const { items: users } = await UserEntity.list(env);
    const defaultPassword = env.DEFAULT_PASSWORD || generateSecureRandomPassword();

    for (const user of users) {
      const userEntity = new UserEntity(env, user.id);

      if (!user.passwordHash) {
        const { hash } = await hashPassword(defaultPassword);
        await userEntity.patch({ passwordHash: hash });
        MigrationHelpers.log(`Set default password for user: ${user.email}`);
      }
    }

    MigrationHelpers.log('AddPasswordHashMigration completed successfully');
  },

  async down(env: Env): Promise<void> {
    MigrationHelpers.log('Rolling back AddPasswordHashMigration');

    const { items: users } = await UserEntity.list(env);

    for (const user of users) {
      const userEntity = new UserEntity(env, user.id);
      await userEntity.patch({ passwordHash: null });
    }

    MigrationHelpers.log('AddPasswordHashMigration rollback completed');
  },
};

MigrationRegistry.register(AddPasswordHashMigration);

/**
 * Helper utilities for common migration patterns
 */
export const MigrationHelpers = {
  /**
   * Log migration step
   */
  log(step: string): void {
    logger.info(`[Migration] ${step}`);
  },

  /**
   * Validate data integrity after migration
   */
  async validateIntegrity(
    checks: Array<{ name: string; check: () => Promise<boolean> }>
  ): Promise<void> {
    const results: Array<{ name: string; passed: boolean }> = [];

    for (const { name, check } of checks) {
      try {
        const passed = await check();
        results.push({ name, passed });
        if (!passed) {
          logger.error(`[Migration] Integrity check failed`, { name });
        }
      } catch (error) {
        logger.error(`[Migration] Integrity check error`, error, { name });
        results.push({ name, passed: false });
      }
    }

    const failed = results.filter((r) => !r.passed);
    if (failed.length > 0) {
      throw new Error(`Migration integrity checks failed: ${failed.map((f) => f.name).join(', ')}`);
    }
  },
};
