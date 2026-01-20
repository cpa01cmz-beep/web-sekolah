import type { UserRole } from './common-types';
import type { SchoolUser, SchoolClass, Course, Grade, Announcement, ScheduleItem } from './entities.types';

export interface StudentCardData {
  id: string;
  name: string;
  studentIdNumber: string;
  classId: string;
  className: string;
  photoUrl: string;
  validUntil: string;
}

export interface SubmitGradeData {
  studentId: string;
  courseId: string;
  score: number;
  feedback: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  targetRole?: UserRole | 'all';
}

export interface UserFilters {
  role?: UserRole;
  classId?: string;
  search?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  classId?: string;
  studentIdNumber?: string;
  classIds?: string[];
  childId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  classId?: string;
  studentIdNumber?: string;
  classIds?: string[];
  childId?: string;
}

export interface Settings {
  schoolName: string;
  academicYear: string;
  semester: number;
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

export interface SchoolData {
  users: SchoolUser[];
  classes: SchoolClass[];
  courses: Course[];
  grades: Grade[];
  announcements: Announcement[];
  schedules: (ScheduleItem & { classId: string })[];
}
