import { IndexedEntity, SecondaryIndex, type Env } from '../core-utils';
import type { Course } from '@shared/types';
import { seedData } from '../seed-data';

export class CourseEntity extends IndexedEntity<Course> {
  static readonly entityName = 'course';
  static readonly indexName = 'courses';
  static readonly initialState: Course = {
    id: '',
    name: '',
    teacherId: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };
  static seedData = seedData.courses;

  static readonly secondaryIndexes = [
    { fieldName: 'teacherId', getValue: (state: { id: string }) => (state as Course).teacherId },
  ];

  static async getByTeacherId(env: Env, teacherId: string): Promise<Course[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}
