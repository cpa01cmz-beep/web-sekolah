import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { Grade } from "@shared/types";
import { seedData } from "../seed-data";
import { CompoundSecondaryIndex } from "../storage/CompoundSecondaryIndex";
import { StudentDateSortedIndex } from "../storage/StudentDateSortedIndex";

export class GradeEntity extends IndexedEntity<Grade> {
  static readonly entityName = "grade";
  static readonly indexName = "grades";
  static readonly initialState: Grade = { id: "", studentId: "", courseId: "", score: 0, feedback: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.grades;

  static readonly secondaryIndexes = [
    { fieldName: 'studentId', getValue: (state: { id: string; }) => (state as Grade).studentId },
    { fieldName: 'courseId', getValue: (state: { id: string; }) => (state as Grade).courseId }
  ];

  static async getByStudentId(env: Env, studentId: string): Promise<Grade[]> {
    return this.getBySecondaryIndex(env, 'studentId', studentId);
  }

  static async getByCourseId(env: Env, courseId: string): Promise<Grade[]> {
    return this.getBySecondaryIndex(env, 'courseId', courseId);
  }

  static async countByStudentId(env: Env, studentId: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'studentId');
    return await index.countByValue(studentId);
  }

  static async existsByStudentId(env: Env, studentId: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'studentId', studentId);
  }

  static async countByCourseId(env: Env, courseId: string): Promise<number> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'courseId');
    return await index.countByValue(courseId);
  }

  static async existsByCourseId(env: Env, courseId: string): Promise<boolean> {
    return this.existsBySecondaryIndex(env, 'courseId', courseId);
  }

  static async getByStudentIdAndCourseId(env: Env, studentId: string, courseId: string): Promise<Grade | null> {
    const index = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    const gradeIds = await index.getByValues([studentId, courseId]);
    if (gradeIds.length === 0) {
      return null;
    }
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    const validGrade = grades.find(g => g && !g.deletedAt);
    return validGrade || null;
  }

  static async getRecentForStudent(env: Env, studentId: string, limit: number): Promise<Grade[]> {
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, studentId);
    const recentGradeIds = await dateIndex.getRecent(limit);
    if (recentGradeIds.length === 0) {
      return [];
    }
    const grades = await Promise.all(recentGradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async createWithAllIndexes(env: Env, state: Grade): Promise<Grade> {
    const created = await super.create(env, state);
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.add([state.studentId, state.courseId], state.id);
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, state.studentId);
    await dateIndex.add(state.createdAt, state.id);
    return created;
  }

  static async deleteWithAllIndexes(env: Env, id: string): Promise<boolean> {
    const inst = new this(env, id);
    const state = await inst.getState() as Grade | null;
    if (!state) return false;

    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.remove([state.studentId, state.courseId], id);
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, state.studentId);
    await dateIndex.remove(state.createdAt, id);
    return await super.delete(env, id);
  }
}
