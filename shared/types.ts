export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
// --- Akademia Pro Types ---
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BaseUser extends TimestampedEntity {
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
export interface SchoolClass extends TimestampedEntity {
  id: string;
  name: string; // e.g., "11-A"
  teacherId: string;
}
export interface Course extends TimestampedEntity {
  id: string;
  name: string;
  teacherId: string;
}
export interface Grade extends TimestampedEntity {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  feedback: string;
}
export interface Announcement extends TimestampedEntity {
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

// --- Student Service Types ---
export interface StudentCardData {
  id: string;
  name: string;
  studentIdNumber: string;
  classId: string;
  className: string;
  photoUrl: string;
  validUntil: string;
}

// --- Teacher Service Types ---
export interface TeacherDashboardData {
  classes: (SchoolClass & { studentCount: number })[];
  recentSubmissions: Grade[];
  upcomingClasses: ScheduleItem[];
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
}

// --- Parent Service Types ---
export interface ParentDashboardData {
  child: Student & { className: string };
  childSchedule: (ScheduleItem & { courseName: string; teacherName: string })[];
  childGrades: (Grade & { courseName: string })[];
  announcements: (Announcement & { authorName: string })[];
}

// --- Admin Service Types ---
export interface AdminDashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  recentAnnouncements: Announcement[];
  systemStatus: string;
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
  classId?: string;
  studentIdNumber?: string;
  classIds?: string[];
  childId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
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

// --- Public Service Types ---
export interface SchoolProfile {
  name: string;
  description: string;
  vision: string;
  mission: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  image?: string;
  capacity?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  date: string;
  author: string;
  category?: string;
  image?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  date: string;
  category?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  author: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  date: string;
}

export interface WebhookConfig extends TimestampedEntity {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

export interface WebhookEvent extends TimestampedEntity {
  id: string;
  eventType: string;
  data: Record<string, unknown>;
  processed: boolean;
}

export interface WebhookDelivery extends TimestampedEntity {
  id: string;
  eventId: string;
  webhookConfigId: string;
  status: 'pending' | 'delivered' | 'failed';
  statusCode?: number;
  attempts: number;
  nextAttemptAt?: string;
  errorMessage?: string;
}

export type WebhookEventType =
  | 'grade.created'
  | 'grade.updated'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'announcement.created'
  | 'announcement.updated';