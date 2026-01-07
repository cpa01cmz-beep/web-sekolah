import type { Env } from './core-utils';
import { logger } from './logger';

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
 * Simple migration runner for applying and rolling back schema changes
 * Note: In production, migration state should be persisted. This is a simplified version
 * for demonstration. For production use, integrate with a persistence layer.
 */
export class MigrationRunner {
  private static appliedMigrations = new Set<string>();

  /**
   * Register and run pending migrations
   * @param env - Environment context
   * @param migrations - Array of migrations to apply
   */
  static async run(env: Env, migrations: Migration[]): Promise<void> {
    const pending = migrations.filter(m => !this.appliedMigrations.has(m.id));
    
    if (pending.length === 0) {
      logger.info('[Migration] No pending migrations to apply');
      return;
    }

    logger.info('[Migration] Found pending migrations', { count: pending.length });

    for (const migration of pending) {
      try {
        logger.info('[Migration] Applying', { id: migration.id, description: migration.description });
        await migration.up(env);
        this.appliedMigrations.add(migration.id);
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
    const migrationMap = new Map(migrations.map(m => [m.id, m]));
    const toRollback = migrations.filter(m => this.appliedMigrations.has(m.id)).slice(-count);
    
    if (toRollback.length === 0) {
      logger.info('[Migration] No migrations to rollback');
      return;
    }

    for (const migration of toRollback) {
      try {
        logger.info('[Migration] Rolling back', { id: migration.id, description: migration.description });
        await migration.down(env);
        this.appliedMigrations.delete(migration.id);
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
  static getCurrentVersion(): number {
    return this.appliedMigrations.size;
  }

  /**
   * Check if a specific migration has been applied
   */
  static isApplied(migrationId: string): boolean {
    return this.appliedMigrations.has(migrationId);
  }

  /**
   * Reset all migrations (USE WITH CAUTION - clears in-memory state)
   * This is useful for testing but should never be used in production
   */
  static reset(): void {
    this.appliedMigrations.clear();
    logger.warn('[Migration] Migration history has been reset');
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
  }
};

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

    const failed = results.filter(r => !r.passed);
    if (failed.length > 0) {
      throw new Error(`Migration integrity checks failed: ${failed.map(f => f.name).join(', ')}`);
    }
  }
};
