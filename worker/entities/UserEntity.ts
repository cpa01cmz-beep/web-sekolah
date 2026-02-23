import { IndexedEntity, SecondaryIndex, type Env } from '../core-utils'
import type { SchoolUser, UserRole, Student } from '@shared/types'
import { seedData } from '../seed-data'

export class UserEntity extends IndexedEntity<SchoolUser> {
  static readonly entityName = 'user'
  static readonly indexName = 'users'
  static readonly initialState: SchoolUser = {
    id: '',
    name: '',
    email: '',
    role: 'admin',
    avatarUrl: '',
    passwordHash: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  }
  static seedData = seedData.users

  static readonly secondaryIndexes = [
    { fieldName: 'role', getValue: (state: { id: string }) => (state as SchoolUser).role },
    { fieldName: 'email', getValue: (state: { id: string }) => (state as SchoolUser).email },
    { fieldName: 'classId', getValue: (state: { id: string }) => (state as Student).classId || '' },
    {
      fieldName: 'parentId',
      getValue: (state: { id: string }) => (state as Student).parentId || '',
    },
  ]

  static async getByRole(env: Env, role: UserRole): Promise<SchoolUser[]> {
    return this.getBySecondaryIndex(env, 'role', role)
  }

  static async getByClassId(env: Env, classId: string): Promise<Student[]> {
    const users = await this.getBySecondaryIndex(env, 'classId', classId)
    return users.filter((u): u is Student => u.role === 'student' && u.classId === classId)
  }

  static async countByClassId(env: Env, classId: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'classId')
    return await index.countByValue(classId)
  }

  static async countByRole(env: Env, role: UserRole): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'role')
    return await index.countByValue(role)
  }

  static async getByEmail(env: Env, email: string): Promise<SchoolUser | null> {
    const users = await this.getBySecondaryIndex(env, 'email', email)
    return users.length > 0 ? users[0] : null
  }

  static async existsByEmail(env: Env, email: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'email', email)
  }

  static async existsByRole(env: Env, role: UserRole): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'role', role)
  }

  static async existsByClassId(env: Env, classId: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'classId', classId)
  }

  static async getByParentId(env: Env, parentId: string): Promise<Student[]> {
    const users = await this.getBySecondaryIndex(env, 'parentId', parentId)
    return users.filter(
      (u): u is Student => u.role === 'student' && 'parentId' in u && u.parentId === parentId
    )
  }

  static async countByParentId(env: Env, parentId: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'parentId')
    return await index.countByValue(parentId)
  }

  static async existsByParentId(env: Env, parentId: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'parentId', parentId)
  }
}
