import { IndexedEntity } from "./core-utils";
import type { SchoolUser, SchoolClass, Course, Grade, Announcement, ScheduleItem, SchoolData } from "@shared/types";
// --- SEED DATA ---
const seedData: SchoolData = {
  users: [
    { id: 'student-01', name: 'Budi Hartono', email: 'budi@example.com', role: 'student', avatarUrl: 'https://i.pravatar.cc/150?u=student01', classId: '11-A', studentIdNumber: '12345' },
    { id: 'student-02', name: 'Ani Suryani', email: 'ani@example.com', role: 'student', avatarUrl: 'https://i.pravatar.cc/150?u=student02', classId: '11-A', studentIdNumber: '12346' },
    { id: 'teacher-01', name: 'Ibu Siti', email: 'siti@example.com', role: 'teacher', avatarUrl: 'https://i.pravatar.cc/150?u=teacher01', classIds: ['11-A'] },
    { id: 'teacher-02', name: 'Bapak Agus', email: 'agus@example.com', role: 'teacher', avatarUrl: 'https://i.pravatar.cc/150?u=teacher02', classIds: ['12-B'] },
    { id: 'parent-01', name: 'Ayah Budi', email: 'ayah.budi@example.com', role: 'parent', avatarUrl: 'https://i.pravatar.cc/150?u=parent01', childId: 'student-01' },
    { id: 'admin-01', name: 'Admin Sekolah', email: 'admin@example.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin01' },
  ],
  classes: [
    { id: '11-A', name: 'Class 11-A', teacherId: 'teacher-01' },
    { id: '12-B', name: 'Class 12-B', teacherId: 'teacher-02' },
  ],
  courses: [
    { id: 'math-11', name: 'Mathematics', teacherId: 'teacher-01' },
    { id: 'phys-12', name: 'Physics', teacherId: 'teacher-02' },
    { id: 'hist-11', name: 'History', teacherId: 'teacher-01' },
  ],
  grades: [
    { id: 'g-01', studentId: 'student-01', courseId: 'math-11', score: 95, feedback: 'Excellent work!' },
    { id: 'g-02', studentId: 'student-01', courseId: 'hist-11', score: 88, feedback: 'Good understanding of the material.' },
    { id: 'g-03', studentId: 'student-02', courseId: 'math-11', score: 82, feedback: 'Consistent effort.' },
  ],
  announcements: [
    { id: 'ann-01', title: 'Parent-Teacher Meeting', content: 'The meeting will be held next Saturday.', date: new Date().toISOString(), authorId: 'admin-01' },
    { id: 'ann-02', title: 'Math Project Deadline', content: 'The deadline for the math project is this Friday.', date: new Date().toISOString(), authorId: 'teacher-01' },
  ],
  schedules: [
    { classId: '11-A', day: 'Senin', time: '08:00 - 09:30', courseId: 'math-11' },
    { classId: '11-A', day: 'Selasa', time: '10:00 - 11:30', courseId: 'hist-11' },
    { classId: '12-B', day: 'Senin', time: '08:00 - 09:30', courseId: 'phys-12' },
  ]
};
// --- ENTITY DEFINITIONS ---
export class UserEntity extends IndexedEntity<SchoolUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: SchoolUser = { id: "", name: "", email: "", role: 'student', avatarUrl: '', classId: '', studentIdNumber: '' };
  static seedData = seedData.users;
}
export class ClassEntity extends IndexedEntity<SchoolClass> {
  static readonly entityName = "class";
  static readonly indexName = "classes";
  static readonly initialState: SchoolClass = { id: "", name: "", teacherId: "" };
  static seedData = seedData.classes;
}
export class CourseEntity extends IndexedEntity<Course> {
  static readonly entityName = "course";
  static readonly indexName = "courses";
  static readonly initialState: Course = { id: "", name: "", teacherId: "" };
  static seedData = seedData.courses;
}
export class GradeEntity extends IndexedEntity<Grade> {
  static readonly entityName = "grade";
  static readonly indexName = "grades";
  static readonly initialState: Grade = { id: "", studentId: "", courseId: "", score: 0, feedback: "" };
  static seedData = seedData.grades;
}
export class AnnouncementEntity extends IndexedEntity<Announcement> {
  static readonly entityName = "announcement";
  static readonly indexName = "announcements";
  static readonly initialState: Announcement = { id: "", title: "", content: "", date: "", authorId: "" };
  static seedData = seedData.announcements;
}
// Schedule is stored as a single entity per class for simplicity
export type ClassScheduleState = { id: string; items: ScheduleItem[] };
export class ScheduleEntity extends IndexedEntity<ClassScheduleState> {
  static readonly entityName = "schedule";
  static readonly indexName = "schedules";
  static readonly initialState: ClassScheduleState = { id: "", items: [] };
  static seedData = seedData.classes.map(c => ({
    id: c.id,
    items: seedData.schedules.filter(s => s.classId === c.id)
  }));
}
// Helper to seed all data
export async function ensureAllSeedData(env: Env) {
  await Promise.all([
    UserEntity.ensureSeed(env),
    ClassEntity.ensureSeed(env),
    CourseEntity.ensureSeed(env),
    GradeEntity.ensureSeed(env),
    AnnouncementEntity.ensureSeed(env),
    ScheduleEntity.ensureSeed(env),
  ]);
}