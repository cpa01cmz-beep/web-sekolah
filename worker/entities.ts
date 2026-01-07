import { IndexedEntity, Index, SecondaryIndex, type Env } from "./core-utils";
import type { SchoolUser, SchoolClass, Course, Grade, Announcement, ScheduleItem, SchoolData, UserRole, Student } from "@shared/types";

const now = new Date().toISOString();

const seedData: SchoolData = {
  users: [
    {
      id: 'student-01',
      name: 'Budi Hartono',
      email: 'budi@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?u=student01',
      classId: '11-A',
      studentIdNumber: '12345',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'student-02',
      name: 'Ani Suryani',
      email: 'ani@example.com',
      role: 'student',
      avatarUrl: 'https://i.pravatar.cc/150?u=student02',
      classId: '11-A',
      studentIdNumber: '12346',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'teacher-01',
      name: 'Ibu Siti',
      email: 'siti@example.com',
      role: 'teacher',
      avatarUrl: 'https://i.pravatar.cc/150?u=teacher01',
      classIds: ['11-A'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'teacher-02',
      name: 'Bapak Agus',
      email: 'agus@example.com',
      role: 'teacher',
      avatarUrl: 'https://i.pravatar.cc/150?u=teacher02',
      classIds: ['12-B'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'parent-01',
      name: 'Ayah Budi',
      email: 'ayah.budi@example.com',
      role: 'parent',
      avatarUrl: 'https://i.pravatar.cc/150?u=parent01',
      childId: 'student-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'admin-01',
      name: 'Admin Sekolah',
      email: 'admin@example.com',
      role: 'admin',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin01',
      createdAt: now,
      updatedAt: now
    }
  ],

  classes: [
    {
      id: '11-A',
      name: 'Class 11-A',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: '12-B',
      name: 'Class 12-B',
      teacherId: 'teacher-02',
      createdAt: now,
      updatedAt: now
    }
  ],

  courses: [
    {
      id: 'math-11',
      name: 'Mathematics',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'phys-12',
      name: 'Physics',
      teacherId: 'teacher-02',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'hist-11',
      name: 'History',
      teacherId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    }
  ],

  grades: [
    {
      id: 'g-01',
      studentId: 'student-01',
      courseId: 'math-11',
      score: 95,
      feedback: 'Excellent work!',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'g-02',
      studentId: 'student-01',
      courseId: 'hist-11',
      score: 88,
      feedback: 'Good understanding of the material.',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'g-03',
      studentId: 'student-02',
      courseId: 'math-11',
      score: 82,
      feedback: 'Consistent effort.',
      createdAt: now,
      updatedAt: now
    }
  ],

  announcements: [
    {
      id: 'ann-01',
      title: 'Parent-Teacher Meeting',
      content: 'The meeting will be held next Saturday.',
      date: new Date().toISOString(),
      authorId: 'admin-01',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'ann-02',
      title: 'Math Project Deadline',
      content: 'The deadline for the math project is this Friday.',
      date: new Date().toISOString(),
      authorId: 'teacher-01',
      createdAt: now,
      updatedAt: now
    }
  ],

  schedules: [
    {
      classId: '11-A',
      day: 'Senin',
      time: '08:00 - 09:30',
      courseId: 'math-11'
    },
    {
      classId: '11-A',
      day: 'Selasa',
      time: '10:00 - 11:30',
      courseId: 'hist-11'
    },
    {
      classId: '12-B',
      day: 'Senin',
      time: '08:00 - 09:30',
      courseId: 'phys-12'
    }
  ]

};

export class UserEntity extends IndexedEntity<SchoolUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: SchoolUser = { id: "", name: "", email: "", role: 'student', avatarUrl: '', classId: '', studentIdNumber: '', createdAt: '', updatedAt: '', deletedAt: null };
  static seedData = seedData.users;

  static async getByRole(env: Env, role: UserRole): Promise<SchoolUser[]> {
    return this.getBySecondaryIndex(env, 'role', role);
  }

  static async getByClassId(env: Env, classId: string): Promise<Student[]> {
    const users = await this.getBySecondaryIndex(env, 'classId', classId);
    return users.filter((u): u is Student => u.role === 'student' && u.classId === classId);
  }
}
export class ClassEntity extends IndexedEntity<SchoolClass> {
  static readonly entityName = "class";
  static readonly indexName = "classes";
  static readonly initialState: SchoolClass = { id: "", name: "", teacherId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.classes;
  
  static async getByTeacherId(env: Env, teacherId: string): Promise<SchoolClass[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}
export class CourseEntity extends IndexedEntity<Course> {
  static readonly entityName = "course";
  static readonly indexName = "courses";
  static readonly initialState: Course = { id: "", name: "", teacherId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.courses;
  
  static async getByTeacherId(env: Env, teacherId: string): Promise<Course[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}
export class GradeEntity extends IndexedEntity<Grade> {
  static readonly entityName = "grade";
  static readonly indexName = "grades";
  static readonly initialState: Grade = { id: "", studentId: "", courseId: "", score: 0, feedback: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.grades;

  static async getByStudentId(env: Env, studentId: string): Promise<Grade[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'studentId');
    const gradeIds = await index.getByValue(studentId);
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async getByCourseId(env: Env, courseId: string): Promise<Grade[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'courseId');
    const gradeIds = await index.getByValue(courseId);
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async getByStudentIdAndCourseId(env: Env, studentId: string, courseId: string): Promise<Grade | null> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'studentId');
    const gradeIds = await index.getByValue(studentId);
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    return grades.find(g => g && !g.deletedAt && g.courseId === courseId) ?? null;
  }
}
export class AnnouncementEntity extends IndexedEntity<Announcement> {
  static readonly entityName = "announcement";
  static readonly indexName = "announcements";
  static readonly initialState: Announcement = { id: "", title: "", content: "", date: "", authorId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.announcements;

  static async getByAuthorId(env: Env, authorId: string): Promise<Announcement[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'authorId');
    const announcementIds = await index.getByValue(authorId);
    const announcements = await Promise.all(announcementIds.map(id => new this(env, id).getState()));
    return announcements.filter(a => a && !a.deletedAt) as Announcement[];
  }
}

export type ClassScheduleState = {id: string;items: ScheduleItem[];};
export class ScheduleEntity extends IndexedEntity<ClassScheduleState> {
  static readonly entityName = "schedule";
  static readonly indexName = "schedules";
  static readonly initialState: ClassScheduleState = { id: "", items: [] };
  static seedData = seedData.classes.map((c) => ({
    id: c.id,
    items: seedData.schedules.filter((s) => s.classId === c.id)
  }));
}

export async function ensureAllSeedData(env: Env) {
  await Promise.all([
  UserEntity.ensureSeed(env),
  ClassEntity.ensureSeed(env),
  CourseEntity.ensureSeed(env),
  GradeEntity.ensureSeed(env),
  AnnouncementEntity.ensureSeed(env),
  ScheduleEntity.ensureSeed(env)]
  );
}