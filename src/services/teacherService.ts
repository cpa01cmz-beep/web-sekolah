import type { TeacherService } from './serviceContracts';
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  Announcement,
  SubmitGradeData,
  CreateAnnouncementData,
  ClassStudentWithGrade,
  ScheduleItem
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
    }
  };
}

export const teacherService = createTeacherService();
