import { apiClient } from '@/lib/api-client';
import type { StudentService } from './serviceContracts';
import type {
  StudentDashboardData,
  Grade,
  ScheduleItem,
  StudentCardData
} from '@shared/types';

export const studentService: StudentService = {
  async getDashboard(studentId: string): Promise<StudentDashboardData> {
    return apiClient<StudentDashboardData>(`/api/students/${studentId}/dashboard`);
  },

  async getGrades(studentId: string): Promise<Grade[]> {
    return apiClient<Grade[]>(`/api/students/${studentId}/grades`);
  },

  async getSchedule(studentId: string): Promise<ScheduleItem[]> {
    return apiClient<ScheduleItem[]>(`/api/students/${studentId}/schedule`);
  },

  async getCard(studentId: string): Promise<StudentCardData> {
    return apiClient<StudentCardData>(`/api/students/${studentId}/card`);
  }
};
