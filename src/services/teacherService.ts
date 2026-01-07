import { apiClient } from '@/lib/api-client';
import type { TeacherService } from './serviceContracts';
import type {
  TeacherDashboardData,
  SchoolClass,
  Grade,
  Announcement,
  SubmitGradeData,
  CreateAnnouncementData
} from '@shared/types';

export const teacherService: TeacherService = {
  async getDashboard(teacherId: string): Promise<TeacherDashboardData> {
    return apiClient<TeacherDashboardData>(`/api/teachers/${teacherId}/dashboard`);
  },

  async getClasses(teacherId: string): Promise<SchoolClass[]> {
    return apiClient<SchoolClass[]>(`/api/teachers/${teacherId}/classes`);
  },

  async submitGrade(gradeData: SubmitGradeData): Promise<Grade> {
    return apiClient<Grade>(`/api/teachers/grades`, {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  },

  async getAnnouncements(teacherId: string): Promise<Announcement[]> {
    return apiClient<Announcement[]>(`/api/teachers/${teacherId}/announcements`);
  },

  async createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement> {
    return apiClient<Announcement>(`/api/teachers/announcements`, {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  }
};
