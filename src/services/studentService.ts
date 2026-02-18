import type { StudentService } from './serviceContracts';
import type {
  StudentDashboardData,
  Grade,
  ScheduleItem,
  StudentCardData
} from '@shared/types';
import type { IRepository } from '@/repositories/IRepository';
import { apiRepository } from '@/repositories/ApiRepository';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export function createStudentService(repository: IRepository = apiRepository): StudentService {
  return {
    async getDashboard(studentId: string): Promise<StudentDashboardData> {
      return repository.get<StudentDashboardData>(API_ENDPOINTS.STUDENTS.DASHBOARD(studentId));
    },

    async getGrades(studentId: string): Promise<Grade[]> {
      return repository.get<Grade[]>(API_ENDPOINTS.STUDENTS.GRADES(studentId));
    },

    async getSchedule(studentId: string): Promise<ScheduleItem[]> {
      return repository.get<ScheduleItem[]>(API_ENDPOINTS.STUDENTS.SCHEDULE(studentId));
    },

    async getCard(studentId: string): Promise<StudentCardData> {
      return repository.get<StudentCardData>(API_ENDPOINTS.STUDENTS.CARD(studentId));
    }
  };
}

export const studentService = createStudentService();
