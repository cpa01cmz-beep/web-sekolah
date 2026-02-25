import type { TeacherService, SendMessageData } from './serviceContracts'
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  Announcement,
  SubmitGradeData,
  UpdateGradeData,
  CreateAnnouncementData,
  ClassStudentWithGrade,
  ScheduleItem,
  Message,
} from '@shared/types'
import type { IRepository } from '@/repositories/IRepository'
import { apiRepository } from '@/repositories/ApiRepository'
import { API_ENDPOINTS } from '@/config/api-endpoints'
import { createMessageService } from './messageService'
import { createAnnouncementService } from './announcementService'

const teacherMessageEndpoints = {
  messages: API_ENDPOINTS.TEACHERS.MESSAGES,
  messageRead: API_ENDPOINTS.TEACHERS.MESSAGE_READ,
  messageConversation: API_ENDPOINTS.TEACHERS.MESSAGE_CONVERSATION,
  unreadCount: API_ENDPOINTS.TEACHERS.UNREAD_COUNT,
  deleteMessage: API_ENDPOINTS.TEACHERS.DELETE_MESSAGE,
}

const teacherAnnouncementEndpoints = {
  list: () => API_ENDPOINTS.TEACHERS.CREATE_ANNOUNCEMENT,
  listByUser: API_ENDPOINTS.TEACHERS.ANNOUNCEMENTS,
  create: () => API_ENDPOINTS.TEACHERS.CREATE_ANNOUNCEMENT,
}

export function createTeacherService(repository: IRepository = apiRepository): TeacherService {
  const messageService = createMessageService(repository, teacherMessageEndpoints)
  const announcementService = createAnnouncementService(repository, teacherAnnouncementEndpoints)

  return {
    async getDashboard(teacherId: string): Promise<TeacherDashboardData> {
      return repository.get<TeacherDashboardData>(API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId))
    },

    async getClasses(teacherId: string): Promise<SchoolClass[]> {
      return repository.get<SchoolClass[]>(API_ENDPOINTS.TEACHERS.CLASSES(teacherId))
    },

    async getSchedule(
      teacherId: string
    ): Promise<(ScheduleItem & { className: string; courseName: string })[]> {
      return repository.get<(ScheduleItem & { className: string; courseName: string })[]>(
        API_ENDPOINTS.TEACHERS.SCHEDULE(teacherId)
      )
    },

    async submitGrade(gradeData: SubmitGradeData): Promise<Grade> {
      return repository.post<Grade>(API_ENDPOINTS.TEACHERS.GRADES, gradeData)
    },

    async updateGrade(gradeId: string, gradeData: UpdateGradeData): Promise<Grade> {
      return repository.put<Grade>(API_ENDPOINTS.TEACHERS.GRADE(gradeId), gradeData)
    },

    async deleteGrade(gradeId: string): Promise<void> {
      return repository.delete<void>(API_ENDPOINTS.TEACHERS.GRADE(gradeId))
    },

    getAnnouncements: (teacherId: string) => announcementService.getAnnouncements(teacherId),
    createAnnouncement: (announcement: CreateAnnouncementData) =>
      announcementService.createAnnouncement(announcement),

    async getClassStudentsWithGrades(classId: string): Promise<ClassStudentWithGrade[]> {
      return repository.get<ClassStudentWithGrade[]>(API_ENDPOINTS.CLASSES.STUDENTS(classId))
    },

    getMessages: (teacherId: string, type?: 'inbox' | 'sent') =>
      messageService.getMessages(teacherId, type),
    getUnreadCount: (teacherId: string) => messageService.getUnreadCount(teacherId),
    getConversation: (teacherId: string, parentId: string) =>
      messageService.getConversation(teacherId, parentId),
    sendMessage: (teacherId: string, data: SendMessageData) =>
      messageService.sendMessage(teacherId, data),
    markAsRead: (teacherId: string, messageId: string) =>
      messageService.markAsRead(teacherId, messageId),
    deleteMessage: (teacherId: string, messageId: string) =>
      messageService.deleteMessage(teacherId, messageId),
  }
}

export const teacherService = createTeacherService()
