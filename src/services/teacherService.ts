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
      return repository.get<Message[]>(`${API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId).replace('/dashboard', '/messages')}?type=${type}`);
    },

    async getUnreadCount(teacherId: string): Promise<number> {
      const result = await repository.get<{ count: number }>(
        API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId).replace('/dashboard', '/messages/unread-count')
      );
      return result.count;
    },

    async getConversation(teacherId: string, parentId: string): Promise<Message[]> {
      return repository.get<Message[]>(
        `${API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId).replace('/dashboard', '/messages')}/${parentId}/conversation`
      );
    },

    async sendMessage(teacherId: string, data: SendMessageData): Promise<Message> {
      return repository.post<Message>(
        API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId).replace('/dashboard', '/messages'),
        data
      );
    },

    async markAsRead(teacherId: string, messageId: string): Promise<Message> {
      return repository.post<Message>(
        `${API_ENDPOINTS.TEACHERS.DASHBOARD(teacherId).replace('/dashboard', '/messages')}/${messageId}/read`,
        {}
      );
    }
  };
}

export const teacherService = createTeacherService();
