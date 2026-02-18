import type {
  StudentDashboardData,
  Grade,
  ScheduleItem,
  StudentCardData,
  TeacherDashboardData,
  SchoolClass,
  SubmitGradeData,
  Announcement,
  CreateAnnouncementData,
  ParentDashboardData,
  AdminDashboardData,
  SchoolUser,
  UserRole,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  Settings,
  SchoolProfile,
  Service,
  Achievement,
  Facility,
  NewsItem,
  GalleryItem,
  WorkItem,
  LinkItem,
  DownloadItem
} from '@shared/types';

export interface StudentService {
  getDashboard(studentId: string): Promise<StudentDashboardData>;
  getGrades(studentId: string): Promise<Grade[]>;
  getSchedule(studentId: string): Promise<ScheduleItem[]>;
  getCard(studentId: string): Promise<StudentCardData>;
}

export interface TeacherService {
  getDashboard(teacherId: string): Promise<TeacherDashboardData>;
  getClasses(teacherId: string): Promise<SchoolClass[]>;
  submitGrade(gradeData: SubmitGradeData): Promise<Grade>;
  getAnnouncements(teacherId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement>;
  getClassStudentsWithGrades(classId: string): Promise<Array<{
    id: string;
    name: string;
    score: number | null;
    feedback: string;
    gradeId: string | null;
  }>>;
}

export interface ParentService {
  getDashboard(parentId: string): Promise<ParentDashboardData>;
  getChildSchedule(parentId: string): Promise<ScheduleItem[]>;
}

export interface AdminService {
  getDashboard(): Promise<AdminDashboardData>;
  getUsers(filters?: UserFilters): Promise<SchoolUser[]>;
  createUser(userData: CreateUserData): Promise<SchoolUser>;
  updateUser(userId: string, userData: UpdateUserData): Promise<SchoolUser>;
  deleteUser(userId: string): Promise<void>;
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

export interface PublicService {
  getSchoolProfile(): Promise<SchoolProfile>;
  getServices(): Promise<Service[]>;
  getAchievements(): Promise<Achievement[]>;
  getFacilities(): Promise<Facility[]>;
  getNews(limit?: number): Promise<NewsItem[]>;
  getNewsDetails(id: string): Promise<NewsItem>;
  getGallery(): Promise<GalleryItem[]>;
  getWorks(): Promise<WorkItem[]>;
  getLinks(): Promise<LinkItem[]>;
  getDownloads(): Promise<DownloadItem[]>;
}
