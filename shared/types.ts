export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// --- Akademia Pro Types ---
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}
export interface Student extends BaseUser {
  role: 'student';
  classId: string;
  studentIdNumber: string;
}
export interface Teacher extends BaseUser {
  role: 'teacher';
  classIds: string[];
}
export interface Parent extends BaseUser {
  role: 'parent';
  childId: string;
}
export interface Admin extends BaseUser {
  role: 'admin';
}
export type SchoolUser = Student | Teacher | Parent | Admin;
export interface SchoolClass {
  id: string;
  name: string; // e.g., "11-A"
  teacherId: string;
}
export interface Course {
  id: string;
  name: string;
  teacherId: string;
}
export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  feedback: string;
}
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601 format
  authorId: string;
}
export interface ScheduleItem {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  time: string; // "07:30 - 09:00"
  courseId: string;
}
// --- API Payloads & Responses ---
export interface StudentDashboardData {
  schedule: (ScheduleItem & { courseName: string; teacherName: string })[];
  recentGrades: (Grade & { courseName: string })[];
  announcements: (Announcement & { authorName: string })[];
}
// For seeding
export interface SchoolData {
  users: SchoolUser[];
  classes: SchoolClass[];
  courses: Course[];
  grades: Grade[];
  announcements: Announcement[];
  schedules: (ScheduleItem & { classId: string })[];
}