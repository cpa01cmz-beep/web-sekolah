import type { TeacherService } from './serviceContracts';
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  Announcement,
  SubmitGradeData,
  CreateAnnouncementData,
  ClassStudentWithGrade
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';

export function createTeacherService(repository: IRepository = apiRepository): TeacherService {
  return {
    async getDashboard(teacherId: string): Promise<TeacherDashboardData> {
      return repository.get<TeacherDashboardData>(`/api/teachers/${teacherId}/dashboard`);
    },

    async getClasses(teacherId: string): Promise<SchoolClass[]> {
      return repository.get<SchoolClass[]>(`/api/teachers/${teacherId}/classes`);
    },

    async submitGrade(gradeData: SubmitGradeData): Promise<Grade> {
      return repository.post<Grade>(`/api/teachers/grades`, gradeData);
    },

    async getAnnouncements(teacherId: string): Promise<Announcement[]> {
      return repository.get<Announcement[]>(`/api/teachers/${teacherId}/announcements`);
    },

    async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
      return repository.post<Announcement>(`/api/teachers/announcements`, announcement);
    },

    async getClassStudentsWithGrades(classId: string): Promise<ClassStudentWithGrade[]> {
      return repository.get<ClassStudentWithGrade[]>(`/api/classes/${classId}/students`);
    }
  };
}

export const teacherService = createTeacherService();
