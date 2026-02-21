import type { SchoolUser, Student, Teacher, Parent, Admin, CreateUserData } from '@shared/types';

/**
 * UserCreationStrategy - Strategy Interface for Role-Specific User Creation
 *
 * Defines the contract for creating users with different roles.
 * Each strategy knows how to construct its specific user type.
 */
export interface UserCreationStrategy {
  /**
   * Creates a user object with role-specific fields
   *
   * @param base - Base user fields (id, createdAt, updatedAt, avatarUrl)
   * @param userData - User creation data from API request
   * @param passwordHash - Hashed password (or null if not provided)
   * @returns Complete user object for the specific role
   */
  create(base: BaseUserFields, userData: CreateUserData, passwordHash: string | null): SchoolUser;
}

/**
 * BaseUserFields - Common fields shared across all user types
 */
export interface BaseUserFields {
  id: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
}

/**
 * StudentCreationStrategy - Creates Student users
 */
export class StudentCreationStrategy implements UserCreationStrategy {
  create(base: BaseUserFields, userData: CreateUserData, passwordHash: string | null): SchoolUser {
    return {
      ...base,
      ...userData,
      role: 'student',
      classId: userData.classId ?? '',
      studentIdNumber: userData.studentIdNumber ?? '',
      passwordHash,
    } as Student;
  }
}

/**
 * TeacherCreationStrategy - Creates Teacher users
 */
export class TeacherCreationStrategy implements UserCreationStrategy {
  create(base: BaseUserFields, userData: CreateUserData, passwordHash: string | null): SchoolUser {
    return {
      ...base,
      ...userData,
      role: 'teacher',
      classIds: userData.classIds ?? [],
      passwordHash,
    } as Teacher;
  }
}

/**
 * ParentCreationStrategy - Creates Parent users
 */
export class ParentCreationStrategy implements UserCreationStrategy {
  create(base: BaseUserFields, userData: CreateUserData, passwordHash: string | null): SchoolUser {
    return {
      ...base,
      ...userData,
      role: 'parent',
      childId: userData.childId ?? '',
      passwordHash,
    } as Parent;
  }
}

/**
 * AdminCreationStrategy - Creates Admin users
 */
export class AdminCreationStrategy implements UserCreationStrategy {
  create(base: BaseUserFields, userData: CreateUserData, passwordHash: string | null): SchoolUser {
    return {
      ...base,
      ...userData,
      role: 'admin',
      passwordHash,
    } as Admin;
  }
}

/**
 * UserCreationStrategyFactory - Factory for retrieving appropriate strategy
 */
export class UserCreationStrategyFactory {
  private static strategies: Record<string, UserCreationStrategy> = {
    student: new StudentCreationStrategy(),
    teacher: new TeacherCreationStrategy(),
    parent: new ParentCreationStrategy(),
    admin: new AdminCreationStrategy(),
  };

  static getStrategy(role: string): UserCreationStrategy {
    const strategy = this.strategies[role];
    if (!strategy) {
      throw new Error(`Invalid user role: ${role}`);
    }
    return strategy;
  }
}
