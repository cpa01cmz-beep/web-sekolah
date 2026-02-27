import { Hono } from 'hono'
import type { Env } from '../core-utils'
import { ok, bad, notFound, forbidden } from '../core-utils'
import type { CreateUserData, UpdateUserData, Grade, CreateAnnouncementData } from '@shared/types'
import { UserService, CommonDataService, GradeService, AnnouncementService } from '../domain'
import { withAuth, withErrorHandler, triggerWebhookSafely } from './route-utils'
import { validateBody, validateParams } from '../middleware/validation'
import {
  createUserSchema,
  updateUserSchema,
  updateGradeSchema,
  updateAnnouncementSchema,
  paramsSchema,
} from '../middleware/schemas'
import type { Context } from 'hono'
import { getCurrentUserId } from '../type-guards'

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get(
    '/api/users',
    ...withAuth('admin'),
    withErrorHandler('get users')(async (c: Context) => {
      const users = await UserService.getAllUsers(c.env)
      return ok(c, users)
    })
  )

  app.post(
    '/api/users',
    ...withAuth('admin'),
    validateBody(createUserSchema),
    withErrorHandler('create user')(async (c: Context) => {
      const userData = c.get('validatedBody') as CreateUserData
      const newUser = await UserService.createUser(c.env, userData)
      triggerWebhookSafely(c.env, 'user.created', newUser, { userId: newUser.id })
      return ok(c, newUser)
    })
  )

  app.put(
    '/api/users/:id',
    ...withAuth('admin'),
    validateParams(paramsSchema),
    validateBody(updateUserSchema),
    withErrorHandler('update user')(async (c: Context) => {
      const { id: userId } = c.get('validatedParams') as { id: string }
      const userData = c.get('validatedBody') as UpdateUserData
      const updatedUser = await UserService.updateUser(c.env, userId, userData)
      triggerWebhookSafely(c.env, 'user.updated', updatedUser, { userId })
      const { passwordHash: _, ...userWithoutPassword } = updatedUser
      return ok(c, userWithoutPassword)
    })
  )

  app.delete(
    '/api/users/:id',
    ...withAuth('admin'),
    validateParams(paramsSchema),
    withErrorHandler('delete user')(async (c: Context) => {
      const { id: userId } = c.get('validatedParams') as { id: string }
      const user = await CommonDataService.getUserById(c.env, userId)
      const result = await UserService.deleteUser(c.env, userId)
      if (result.deleted && user) {
        triggerWebhookSafely(c.env, 'user.deleted', { id: userId, role: user.role }, { userId })
      }
      return ok(c, result)
    })
  )

  app.put(
    '/api/grades/:id',
    ...withAuth('teacher'),
    validateParams(paramsSchema),
    validateBody(updateGradeSchema),
    withErrorHandler('update grade')(async (c: Context) => {
      const { id: gradeId } = c.get('validatedParams') as { id: string }
      const validatedData = c.get('validatedBody') as { score: number; feedback: string }
      const teacherId = getCurrentUserId(c)

      const ownership = await GradeService.verifyTeacherOwnership(c.env, gradeId, teacherId)
      if (!ownership.valid) {
        return forbidden(c, ownership.error!)
      }

      const updatedGrade = await GradeService.updateGrade(c.env, gradeId, {
        score: validatedData.score,
        feedback: validatedData.feedback,
      })
      triggerWebhookSafely(c.env, 'grade.updated', updatedGrade, { gradeId })
      return ok(c, updatedGrade)
    })
  )

  app.delete(
    '/api/grades/:id',
    ...withAuth('teacher'),
    validateParams(paramsSchema),
    withErrorHandler('delete grade')(async (c: Context) => {
      const { id: gradeId } = c.get('validatedParams') as { id: string }
      const teacherId = getCurrentUserId(c)

      const ownership = await GradeService.verifyTeacherOwnership(c.env, gradeId, teacherId)
      if (!ownership.valid) {
        return forbidden(c, ownership.error!)
      }

      const grade = await GradeService.getGradeById(c.env, gradeId)
      if (grade) {
        await GradeService.deleteGrade(c.env, gradeId)
        triggerWebhookSafely(
          c.env,
          'grade.deleted',
          { id: gradeId, studentId: grade.studentId, courseId: grade.courseId },
          { gradeId }
        )
      }
      return ok(c, { deleted: true, id: gradeId })
    })
  )

  app.put(
    '/api/announcements/:id',
    ...withAuth('teacher', 'admin'),
    validateParams(paramsSchema),
    validateBody(updateAnnouncementSchema),
    withErrorHandler('update announcement')(async (c: Context) => {
      const { id: announcementId } = c.get('validatedParams') as { id: string }
      const updates = c.get('validatedBody') as Partial<CreateAnnouncementData>
      const userId = getCurrentUserId(c)
      const user = await CommonDataService.getUserById(c.env, userId)

      const announcement = await AnnouncementService.getAnnouncementById(c.env, announcementId)
      if (!announcement) {
        return notFound(c, 'Announcement not found')
      }

      if (user?.role !== 'admin' && announcement.authorId !== userId) {
        return forbidden(c, 'You can only update your own announcements')
      }

      const updatedAnnouncement = await AnnouncementService.updateAnnouncement(
        c.env,
        announcementId,
        updates
      )
      triggerWebhookSafely(c.env, 'announcement.updated', updatedAnnouncement, {
        announcementId: updatedAnnouncement.id,
      })
      return ok(c, updatedAnnouncement)
    })
  )

  app.delete(
    '/api/announcements/:id',
    ...withAuth('teacher', 'admin'),
    validateParams(paramsSchema),
    withErrorHandler('delete announcement')(async (c: Context) => {
      const { id: announcementId } = c.get('validatedParams') as { id: string }
      const userId = getCurrentUserId(c)
      const user = await CommonDataService.getUserById(c.env, userId)

      const announcement = await AnnouncementService.getAnnouncementById(c.env, announcementId)
      if (!announcement) {
        return notFound(c, 'Announcement not found')
      }

      if (user?.role !== 'admin' && announcement.authorId !== userId) {
        return forbidden(c, 'You can only delete your own announcements')
      }

      await AnnouncementService.deleteAnnouncement(c.env, announcementId)
      triggerWebhookSafely(
        c.env,
        'announcement.deleted',
        { id: announcementId, title: announcement.title, authorId: announcement.authorId },
        { announcementId }
      )
      return ok(c, { deleted: true, id: announcementId })
    })
  )
}
