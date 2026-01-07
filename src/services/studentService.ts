import type { StudentService } from './serviceContracts';
import type {
  StudentDashboardData,
  Grade,
  ScheduleItem,
  StudentCardData
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';

export function createStudentService(repository: IRepository = apiRepository): StudentService {
  return {
    async getDashboard(studentId: string): Promise<StudentDashboardData> {
      return repository.get<StudentDashboardData>(`/api/students/${studentId}/dashboard`);
    },

    async getGrades(studentId: string): Promise<Grade[]> {
      return repository.get<Grade[]>(`/api/students/${studentId}/grades`);
    },

    async getSchedule(studentId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(`/api/students/${studentId}/schedule`);
    },

    async getCard(studentId: string): Promise<StudentCardData> {
      return repository.get<StudentCardData>(`/api/students/${studentId}/card`);
    }
  };
}

export const studentService = createStudentService();
