import type { Env } from '../core-utils'
import { UserEntity } from '../entities'
import type { StudentDashboardData, Student } from '@shared/types'
import { getRoleSpecificFields } from '../type-guards'
import { CommonDataService } from './CommonDataService'
import { NotFoundError } from '../errors'

export class StudentDashboardService {
  static async getDashboardData(env: Env, studentId: string): Promise<StudentDashboardData> {
    const student = new UserEntity(env, studentId)
    const studentState = await student.getState()

    if (!studentState || studentState.role !== 'student') {
      throw new NotFoundError('Student not found')
    }

    const roleFields = getRoleSpecificFields(studentState)

    const schedule = await CommonDataService.getScheduleWithDetails(env, roleFields.classId!)
    const recentGrades = await CommonDataService.getRecentGradesWithCourseNames(env, studentId, 5)
    const announcements = await CommonDataService.getAnnouncementsWithAuthorNames(env, 5)

    return { schedule, recentGrades, announcements }
  }
}
