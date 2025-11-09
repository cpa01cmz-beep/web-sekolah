export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// --- Akademia Pro Types ---
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';
export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}
export interface Student {
  id: string;
  name: string;
  class: string; // e.g., "10-A"
  photoUrl: string;
}
export interface Course {
  id: string;
  name: string;
  teacherName: string;
  time: string; // e.g., "08:00 - 09:30"
}
export interface Grade {
  courseName: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  teacherFeedback: string;
}
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO 8601 format
  author: string;
}
// --- Original Template Types (for reference, can be removed later) ---
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}