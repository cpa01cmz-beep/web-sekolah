import type { Env } from '../core-utils'
import { UserEntity } from '../entities'
import type { SchoolUser, CreateUserData, UpdateUserData } from '@shared/types'
import { hashPassword } from '../password-utils'
import { ReferentialIntegrity } from '../referential-integrity'
import { UserCreationStrategyFactory, type BaseUserFields } from './UserCreationStrategy'
import { NotFoundError } from '../errors'

// UserService - Domain Service for User Business Logic
// ==================================================
// This service encapsulates all business logic for user operations.
// It handles:
// - User creation with role-specific fields (via Strategy Pattern)
// - Password hashing and updates
// - Referential integrity checking before deletion
// - Password removal from user data for security

export class UserService {
  /**
   * Creates a new user with role-specific fields and password hashing
   *
   * @param env - Cloudflare Workers environment with Durable Object bindings
   * @param userData - User data including role (student/teacher/parent/admin)
   * @returns Created user object (without passwordHash)
   *
   * Role-specific fields:
   * - student: classId, studentIdNumber
   * - teacher: classIds (array)
   * - parent: childId
   * - admin: no additional fields
   *
   * Password handling:
   * - If password provided, hashes using PBKDF2 with 100,000 iterations
   * - If no password provided, sets passwordHash to null (for OAuth/future auth methods)
   *
   * Architecture note: Uses Strategy Pattern for role-specific creation logic.
   * Adding new roles only requires creating a new strategy class (Open/Closed Principle).
   */
  static async createUser(env: Env, userData: CreateUserData): Promise<SchoolUser> {
    const now = new Date().toISOString()
    const base: BaseUserFields = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      avatarUrl: '',
    }

    let passwordHash = null
    if (userData.password) {
      const { hash } = await hashPassword(userData.password)
      passwordHash = hash
    }

    const strategy = UserCreationStrategyFactory.getStrategy(userData.role)
    const newUser = strategy.create(base, userData, passwordHash)

    await UserEntity.create(env, newUser)
    return newUser
  }

  /**
   * Updates an existing user with optional password change
   *
   * @param env - Cloudflare Workers environment
   * @param userId - User ID to update
   * @param userData - Partial user data (can include password for change)
   * @returns Updated user object (without passwordHash)
   * @throws Error if user not found
   *
   * Password change handling:
   * - If password field provided, hashes new password and updates passwordHash
   * - Always updates updatedAt timestamp
   */
  static async updateUser(env: Env, userId: string, userData: UpdateUserData): Promise<SchoolUser> {
    const userEntity = new UserEntity(env, userId)

    if (!(await userEntity.exists())) {
      throw new NotFoundError('User not found')
    }

    let updateData: Partial<SchoolUser> = userData

    if (userData.password) {
      const { hash } = await hashPassword(userData.password)
      updateData = { ...userData, passwordHash: hash }
    }

    updateData.updatedAt = new Date().toISOString()

    await userEntity.patch(updateData)
    const updatedUser = await userEntity.getState()
    return updatedUser!
  }

  /**
   * Deletes a user with referential integrity checking
   *
   * @param env - Cloudflare Workers environment
   * @param userId - User ID to delete
   * @returns Deletion result with { id, deleted, warnings }
   *
   * Referential integrity:
   * - Checks if user has dependent records (grades, classes, etc.)
   * - Returns warnings if dependents exist (prevents deletion)
   * - Only deletes if no dependents found
   *
   * Dependent checks (handled by ReferentialIntegrity.checkDependents):
   * - Student: No dependents (safe to delete)
   * - Teacher: Has dependent classes (cannot delete if teaching)
   * - Parent: Has dependent students (cannot delete if child exists)
   * - Admin: Has dependents (careful deletion required)
   */
  static async deleteUser(
    env: Env,
    userId: string
  ): Promise<{ id: string; deleted: boolean; warnings: string[] }> {
    const warnings = await this.checkDependents(env, userId)

    if (warnings.length > 0) {
      return { id: userId, deleted: false, warnings }
    }

    const deleted = await UserEntity.delete(env, userId)
    return { id: userId, deleted, warnings: [] }
  }

  /**
   * Checks for dependent records that would prevent user deletion
   *
   * @param env - Cloudflare Workers environment
   * @param userId - User ID to check
   * @returns Array of warning messages for each dependent relationship
   *
   * Delegates to ReferentialIntegrity module which checks:
   * - Grade records referencing this student
   * - Class records with this as teacher
   * - Student records with this as parent
   * - Other entity dependencies
   */
  static async checkDependents(env: Env, userId: string): Promise<string[]> {
    return await ReferentialIntegrity.checkDependents(env, 'user', userId)
  }

  /**
   * Gets all users with passwords removed for security
   *
   * @param env - Cloudflare Workers environment
   * @returns Array of all users without passwordHash field
   *
   * Security consideration:
   * - Passwords are NEVER included in list responses
   * - Destructuring: ({ passwordHash: _, ...rest }) => rest
   * - This prevents accidental password exposure in UI/queries
   */
  static async getAllUsers(env: Env): Promise<SchoolUser[]> {
    const { items: users } = await UserEntity.list(env)
    return users.map(({ passwordHash: _, ...rest }) => rest)
  }

  /**
   * Gets a single user by ID with password removed for security
   *
   * @param env - Cloudflare Workers environment
   * @param userId - User ID to fetch
   * @returns User object without passwordHash, or null if not found
   *
   * Security consideration:
   * - Passwords are NEVER included in individual user responses
   * - Use this for dashboard/profile display
   * - Use getUserWithoutPassword for token verification (alias to same function)
   */
  static async getUserById(env: Env, userId: string): Promise<SchoolUser | null> {
    const userEntity = new UserEntity(env, userId)
    const user = await userEntity.getState()

    if (!user) {
      return null
    }

    const { passwordHash: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Gets a user by ID without password (alias for getUserById)
   *
   * @param env - Cloudflare Workers environment
   * @param userId - User ID to fetch
   * @returns User object without passwordHash, or null if not found
   *
   * Purpose:
   * - Used in authentication flow to return user data after password verification
   * - Separates auth token generation from user data retrieval
   * - Consistent with getUserById behavior (passwords never exposed)
   */
  static async getUserWithoutPassword(env: Env, userId: string): Promise<SchoolUser | null> {
    const user = await this.getUserById(env, userId)
    return user
  }
}
