import type { Env } from '../core-utils'
import { UserEntity } from '../entities'
import type { StudentDashboardData, Student } from '@shared/types'
import { getRoleSpecificFields } from '../type-guards'
import { CommonDataService } from './CommonDataService'

export class StudentDashboardService {
  static async getDashboardData(env: Env, studentId: string): Promise<StudentDashboardData> {
    const student = new UserEntity(env, studentId)
    const studentState = await student.getState()

    if (!studentState || studentState.role !== 'student') {
      throw new Error('Student not found')
    }

    const roleFields = getRoleSpecificFields(studentState)

    const [schedule, recentGrades, announcements] = await Promise.all([
      CommonDataService.getScheduleWithDetails(env, roleFields.classId!),
      CommonDataService.getRecentGradesWithCourseNames(env, studentId, 5),
      CommonDataService.getAnnouncementsWithAuthorNames(env, 5),
    ])

    return { schedule, recentGrades, announcements }
  }
}
