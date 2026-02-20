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
  DownloadItem,
  ClassStudentWithGrade,
  Message
} from '@shared/types';

export interface SendMessageData {
  recipientId: string;
  subject: string;
  content: string;
  parentMessageId?: string;
}

export interface MessagingService {
  getMessages(type?: 'inbox' | 'sent'): Promise<Message[]>;
  getUnreadCount(): Promise<number>;
  getConversation(otherUserId: string): Promise<Message[]>;
  sendMessage(data: SendMessageData): Promise<Message>;
  markAsRead(messageId: string): Promise<Message>;
}

export interface StudentService {
  getDashboard(studentId: string): Promise<StudentDashboardData>;
  getGrades(studentId: string): Promise<Grade[]>;
  getSchedule(studentId: string): Promise<ScheduleItem[]>;
  getCard(studentId: string): Promise<StudentCardData>;
}

export interface TeacherService {
  getDashboard(teacherId: string): Promise<TeacherDashboardData>;
  getClasses(teacherId: string): Promise<SchoolClass[]>;
  getSchedule(teacherId: string): Promise<(ScheduleItem & { className: string; courseName: string })[]>;
  submitGrade(gradeData: SubmitGradeData): Promise<Grade>;
  getAnnouncements(teacherId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement>;
  getClassStudentsWithGrades(classId: string): Promise<ClassStudentWithGrade[]>;
  getMessages(teacherId: string, type?: 'inbox' | 'sent'): Promise<Message[]>;
  getUnreadCount(teacherId: string): Promise<number>;
  getConversation(teacherId: string, parentId: string): Promise<Message[]>;
  sendMessage(teacherId: string, data: SendMessageData): Promise<Message>;
  markAsRead(teacherId: string, messageId: string): Promise<Message>;
}

export interface ParentService {
  getDashboard(parentId: string): Promise<ParentDashboardData>;
  getChildSchedule(parentId: string): Promise<ScheduleItem[]>;
  getMessages(parentId: string, type?: 'inbox' | 'sent'): Promise<Message[]>;
  getUnreadCount(parentId: string): Promise<number>;
  getConversation(parentId: string, teacherId: string): Promise<Message[]>;
  sendMessage(parentId: string, data: SendMessageData): Promise<Message>;
  markAsRead(parentId: string, messageId: string): Promise<Message>;
  getChildTeachers(parentId: string): Promise<SchoolUser[]>;
}

export interface AdminService {
  getDashboard(): Promise<AdminDashboardData>;
  getUsers(filters?: UserFilters): Promise<SchoolUser[]>;
  createUser(userData: CreateUserData): Promise<SchoolUser>;
  updateUser(userId: string, userData: UpdateUserData): Promise<SchoolUser>;
  deleteUser(userId: string): Promise<void>;
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: CreateAnnouncementData): Promise<Announcement>;
  deleteAnnouncement(announcementId: string): Promise<void>;
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
