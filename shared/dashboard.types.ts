import type { Grade, Announcement, ScheduleItem, Student } from './entities.types';

export interface ClassStudentWithGrade {
  id: string;
  name: string;
  score: number | null;
  feedback: string;
  gradeId: string | null;
}

export interface StudentDashboardData {
  schedule: (ScheduleItem & { courseName: string; teacherName: string })[];
  recentGrades: (Grade & { courseName: string })[];
  announcements: (Announcement & { authorName: string })[];
}

export interface TeacherDashboardData {
  teacherId: string;
  name: string;
  email: string;
  totalClasses: number;
  totalStudents: number;
  recentGrades: (Grade & { courseName: string; studentName: string })[];
  recentAnnouncements: Announcement[];
}

export interface ParentDashboardData {
  child: Student & { className: string };
  childSchedule: (ScheduleItem & { courseName: string; teacherName: string })[];
  childGrades: (Grade & { courseName: string })[];
  announcements: (Announcement & { authorName: string })[];
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  recentAnnouncements: Announcement[];
  userDistribution: {
    students: number;
    teachers: number;
    parents: number;
    admins: number;
  };
}
