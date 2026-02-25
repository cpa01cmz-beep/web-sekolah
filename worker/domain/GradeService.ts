import type { Env } from '../core-utils'
import { GradeEntity, CourseEntity } from '../entities'
import type { Grade } from '@shared/types'
import { ReferentialIntegrity } from '../referential-integrity'
import { NotFoundError, ValidationError } from '../errors'

export class GradeService {
  static async createGrade(
    env: Env,
    gradeData: Partial<Grade> & { studentId: string; courseId: string }
  ): Promise<Grade> {
    if (!gradeData.studentId || !gradeData.courseId) {
      throw new ValidationError('studentId and courseId are required')
    }

    const now = new Date().toISOString()
    const newGrade: Grade = {
      id: crypto.randomUUID(),
      studentId: gradeData.studentId,
      courseId: gradeData.courseId,
      score: gradeData.score ?? 0,
      feedback: gradeData.feedback ?? '',
      createdAt: now,
      updatedAt: now,
    }

    const validation = await ReferentialIntegrity.validateGrade(env, newGrade)
    if (!validation.valid) {
      throw new ValidationError(validation.error)
    }

    await GradeEntity.createWithAllIndexes(env, newGrade)
    return newGrade
  }

  static async updateGrade(
    env: Env,
    gradeId: string,
    updates: { score: number; feedback: string }
  ): Promise<Grade> {
    if (gradeId === 'null' || !gradeId) {
      throw new ValidationError('Grade ID is required')
    }

    const gradeEntity = new GradeEntity(env, gradeId)

    if (!(await gradeEntity.exists())) {
      throw new NotFoundError('Grade not found')
    }

    await gradeEntity.patch(updates)
    const updatedGrade = await gradeEntity.getState()
    return updatedGrade!
  }

  static async getGradeByStudentAndCourse(
    env: Env,
    studentId: string,
    courseId: string
  ): Promise<Grade | null> {
    return await GradeEntity.getByStudentIdAndCourseId(env, studentId, courseId)
  }

  static async getStudentGrades(env: Env, studentId: string): Promise<Grade[]> {
    return await GradeEntity.getByStudentId(env, studentId)
  }

  static async getCourseGrades(env: Env, courseId: string): Promise<Grade[]> {
    return await GradeEntity.getByCourseId(env, courseId)
  }

  static async deleteGrade(env: Env, gradeId: string): Promise<boolean> {
    await GradeEntity.deleteWithAllIndexes(env, gradeId)
    return true
  }

  static async getGradeById(env: Env, gradeId: string): Promise<Grade | null> {
    const gradeEntity = new GradeEntity(env, gradeId)
    const grade = await gradeEntity.getState()
    return grade && !grade.deletedAt ? grade : null
  }

  static async verifyTeacherOwnership(
    env: Env,
    gradeId: string,
    teacherId: string
  ): Promise<{ valid: boolean; error?: string }> {
    const grade = await this.getGradeById(env, gradeId)
    if (!grade) {
      return { valid: false, error: 'Grade not found' }
    }

    const course = await new CourseEntity(env, grade.courseId).getState()
    if (!course) {
      return { valid: false, error: 'Course not found' }
    }

    if (course.teacherId !== teacherId) {
      return { valid: false, error: 'You can only modify grades for courses you teach' }
    }

    return { valid: true }
  }
}
