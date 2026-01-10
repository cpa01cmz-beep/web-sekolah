import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { SchoolUser, UserRole, Student } from "@shared/types";
import { seedData } from "../seed-data";

export class UserEntity extends IndexedEntity<SchoolUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: SchoolUser = { id: "", name: "", email: "", role: 'admin', avatarUrl: '', passwordHash: null, createdAt: '', updatedAt: '', deletedAt: null };
  static seedData = seedData.users;

  static async getByRole(env: Env, role: UserRole): Promise<SchoolUser[]> {
    return this.getBySecondaryIndex(env, 'role', role);
  }

  static async getByClassId(env: Env, classId: string): Promise<Student[]> {
    const users = await this.getBySecondaryIndex(env, 'classId', classId);
    return users.filter((u): u is Student => u.role === 'student' && u.classId === classId);
  }

  static async getByEmail(env: Env, email: string): Promise<SchoolUser | null> {
    const users = await this.getBySecondaryIndex(env, 'email', email);
    return users.length > 0 ? users[0] : null;
  }
}
