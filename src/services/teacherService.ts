import type { TeacherService, SendMessageData } from './serviceContracts';
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  Announcement,
  SubmitGradeData,
  CreateAnnouncementData,
  ClassStudentWithGrade,
  ScheduleItem,
  Message
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { createMessagingService } from './messagingService';

export function createTeacherService(repository: IRepository = apiRepository): TeacherService {
  return {
    async getDashboard(teacherId: string): Promise<TeacherDashboardData> {
      return repository.get<TeacherDashboardData>(API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId));
    },

    async getClasses(teacherId: string): Promise<SchoolClass[]> {
      return repository.get<SchoolClass[]>(API_ENDPOINTS.TEACHERS.CLASSES(teacherId));
    },

    async getSchedule(teacherId: string): Promise<(ScheduleItem & { className: string; courseName: string })[]> {
      return repository.get<(ScheduleItem & { className: string; courseName: string })[]>(API_ENDPOINTS.TEACHERS.SCHEDULE(teacherId));
    },

    async submitGrade(gradeData: SubmitGradeData): Promise<Grade> {
      return repository.post<Grade>(API_ENDPOINTS.TEACHERS.GRADES, gradeData);
    },

    async getAnnouncements(teacherId: string): Promise<Announcement[]> {
      return repository.get<Announcement[]>(API_ENDPOINTS.TEACHERS.ANNOUNCEMENTS(teacherId));
    },

    async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
      return repository.post<Announcement>(API_ENDPOINTS.TEACHERS.CREATE_ANNOUNCEMENT, announcement);
    },

    async getClassStudentsWithGrades(classId: string): Promise<ClassStudentWithGrade[]> {
      return repository.get<ClassStudentWithGrade[]>(API_ENDPOINTS.CLASSES.STUDENTS(classId));
    },

    async getMessages(teacherId: string, type: 'inbox' | 'sent' = 'inbox'): Promise<Message[]> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.TEACHERS.MESSAGES(teacherId));
      return messaging.getMessages(type);
    },

    async getUnreadCount(teacherId: string): Promise<number> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.TEACHERS.MESSAGES(teacherId));
      return messaging.getUnreadCount();
    },

    async getConversation(teacherId: string, parentId: string): Promise<Message[]> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.TEACHERS.MESSAGES(teacherId));
      return messaging.getConversation(parentId);
    },

    async sendMessage(teacherId: string, data: SendMessageData): Promise<Message> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.TEACHERS.MESSAGES(teacherId));
      return messaging.sendMessage(data);
    },

    async markAsRead(teacherId: string, messageId: string): Promise<Message> {
      const messaging = createMessagingService(repository, API_ENDPOINTS.TEACHERS.MESSAGES(teacherId));
      return messaging.markAsRead(messageId);
    }
  };
}

export const teacherService = createTeacherService();
