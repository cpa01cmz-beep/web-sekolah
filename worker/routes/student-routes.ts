import { Hono } from 'hono'
import type { Env } from '../core-utils'
import { ok, notFound } from '../core-utils'
import type { StudentDashboardData, StudentCardData } from '@shared/types'
import {
  GradeService,
  CommonDataService,
  StudentDashboardService,
  AnalyticsService,
} from '../domain'
import { withUserValidation, withErrorHandler } from './route-utils'
import type { Context } from 'hono'

export function studentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get(
    '/api/students/:id/dashboard',
    ...withUserValidation('student', 'dashboard'),
    withErrorHandler('get student dashboard')(async (c: Context) => {
      const requestedStudentId = c.req.param('id')
      try {
        const dashboardData = await StudentDashboardService.getDashboardData(
          c.env,
          requestedStudentId
        )
        return ok(c, dashboardData)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('not found')) {
          return notFound(c, errorMessage)
        }
        throw error
      }
    })
  )

  app.get(
    '/api/students/:id/schedule',
    ...withUserValidation('student', 'schedule'),
    withErrorHandler('get student schedule')(async (c: Context) => {
      const requestedStudentId = c.req.param('id')
      const { student, classData, schedule } =
        await CommonDataService.getStudentWithClassAndSchedule(c.env, requestedStudentId)
      if (!student || !student.classId || !classData || !schedule) {
        return notFound(c, 'Student or class not found')
      }
      return ok(c, schedule?.items || [])
    })
  )

  app.get(
    '/api/students/:id/card',
    ...withUserValidation('student', 'card'),
    withErrorHandler('get student card')(async (c: Context) => {
      const requestedStudentId = c.req.param('id')
      const { student, classData } = await CommonDataService.getStudentForGrades(
        c.env,
        requestedStudentId
      )
      if (!student || student.role !== 'student') {
        return notFound(c, 'Student not found')
      }

      const grades = await GradeService.getStudentGrades(c.env, requestedStudentId)
      const stats = AnalyticsService.calculateGradeStatistics(grades)

      const cardData: StudentCardData = {
        studentId: student.id,
        name: student.name,
        email: student.email,
        avatarUrl: student.avatarUrl || '',
        className: classData?.name || 'N/A',
        averageScore: stats.averageScore,
        totalGrades: stats.totalGrades,
        gradeDistribution: stats.distribution,
        recentGrades: grades.slice(-5).reverse(),
      }

      return ok(c, cardData)
    })
  )
}
