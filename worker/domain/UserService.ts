import type { Env } from '../core-utils';
import { UserEntity } from '../entities';
import type { SchoolUser, Student, Teacher, Parent, Admin, CreateUserData, UpdateUserData } from '@shared/types';
import { hashPassword } from '../password-utils';

export class UserService {
  static async createUser(env: Env, userData: CreateUserData): Promise<SchoolUser> {
    const now = new Date().toISOString();
    const base = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, avatarUrl: '' };

    let passwordHash = null;
    if (userData.password) {
      const { hash } = await hashPassword(userData.password);
      passwordHash = hash;
    }

    let newUser: SchoolUser;
    if (userData.role === 'student') {
      newUser = { 
        ...base, 
        ...userData, 
        role: 'student', 
        classId: userData.classId ?? '', 
        studentIdNumber: userData.studentIdNumber ?? '', 
        passwordHash 
      } as Student;
    } else if (userData.role === 'teacher') {
      newUser = { 
        ...base, 
        ...userData, 
        role: 'teacher', 
        classIds: userData.classIds ?? [], 
        passwordHash 
      } as Teacher;
    } else if (userData.role === 'parent') {
      newUser = { 
        ...base, 
        ...userData, 
        role: 'parent', 
        childId: userData.childId ?? '', 
        passwordHash 
      } as Parent;
    } else {
      newUser = { 
        ...base, 
        ...userData, 
        role: 'admin', 
        passwordHash 
      } as Admin;
    }

    await UserEntity.create(env, newUser);
    return newUser;
  }

  static async updateUser(env: Env, userId: string, userData: UpdateUserData): Promise<SchoolUser> {
    const userEntity = new UserEntity(env, userId);
    
    if (!await userEntity.exists()) {
      throw new Error('User not found');
    }

    let updateData: Partial<SchoolUser> = userData;

    if (userData.password) {
      const { hash } = await hashPassword(userData.password);
      updateData = { ...userData, passwordHash: hash };
    }

    updateData.updatedAt = new Date().toISOString();

    await userEntity.patch(updateData);
    const updatedUser = await userEntity.getState();
    return updatedUser!;
  }

  static async deleteUser(env: Env, userId: string): Promise<{ id: string; deleted: boolean; warnings: string[] }> {
    const warnings = await this.checkDependents(env, userId);
    
    if (warnings.length > 0) {
      return { id: userId, deleted: false, warnings };
    }

    const deleted = await UserEntity.delete(env, userId);
    return { id: userId, deleted, warnings: [] };
  }

  static async checkDependents(env: Env, userId: string): Promise<string[]> {
    const { ReferentialIntegrity } = await import('../referential-integrity');
    return await ReferentialIntegrity.checkDependents(env, 'user', userId);
  }

  static async getAllUsers(env: Env): Promise<SchoolUser[]> {
    const { items: users } = await UserEntity.list(env);
    return users.map(({ passwordHash: _, ...rest }) => rest);
  }

  static async getUserById(env: Env, userId: string): Promise<SchoolUser | null> {
    const userEntity = new UserEntity(env, userId);
    const user = await userEntity.getState();
    
    if (!user) {
      return null;
    }
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserWithoutPassword(env: Env, userId: string): Promise<SchoolUser | null> {
    const user = await this.getUserById(env, userId);
    return user;
  }
}
