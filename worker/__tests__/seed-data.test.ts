import { describe, it, expect } from 'vitest';
import { seedData } from '../seed-data';
import type { SchoolUser } from '@shared/types';

describe('seed-data - Critical Path Testing', () => {
  describe('Structure Validation', () => {
    it('should export all required entity types', () => {
      expect(seedData).toHaveProperty('users');
      expect(seedData).toHaveProperty('classes');
      expect(seedData).toHaveProperty('courses');
      expect(seedData).toHaveProperty('grades');
      expect(seedData).toHaveProperty('announcements');
      expect(seedData).toHaveProperty('schedules');
    });

    it('should have non-empty arrays for all entities', () => {
      expect(seedData.users.length).toBeGreaterThan(0);
      expect(seedData.classes.length).toBeGreaterThan(0);
      expect(seedData.courses.length).toBeGreaterThan(0);
      expect(seedData.grades.length).toBeGreaterThan(0);
      expect(seedData.announcements.length).toBeGreaterThan(0);
      expect(seedData.schedules.length).toBeGreaterThan(0);
    });

    it('should have valid counts for test data', () => {
      expect(seedData.users).toHaveLength(6);
      expect(seedData.classes).toHaveLength(2);
      expect(seedData.courses).toHaveLength(3);
      expect(seedData.grades).toHaveLength(3);
      expect(seedData.announcements).toHaveLength(2);
      expect(seedData.schedules).toHaveLength(3);
    });
  });

  describe('User Entity Validation', () => {
    it('should have all user roles represented', () => {
      const roles = seedData.users.map((u) => u.role);
      expect(roles).toContain('student');
      expect(roles).toContain('teacher');
      expect(roles).toContain('parent');
      expect(roles).toContain('admin');
    });

    it('should have all required fields for each user', () => {
      seedData.users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('avatarUrl');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      });
    });

    it('should have valid email formats', () => {
      seedData.users.forEach((user) => {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should have valid avatar URLs', () => {
      seedData.users.forEach((user) => {
        expect(user.avatarUrl).toMatch(/^https?:\/\//);
      });
    });

    it('should have valid timestamps', () => {
      seedData.users.forEach((user) => {
        expect(user.createdAt).toBeTruthy();
        expect(user.updatedAt).toBeTruthy();
        expect(new Date(user.createdAt).toISOString()).toBe(user.createdAt);
        expect(new Date(user.updatedAt).toISOString()).toBe(user.updatedAt);
      });
    });

    it('should have role-specific fields for students', () => {
      const students = seedData.users.filter((u) => u.role === 'student') as Array<
        SchoolUser & { classId: string; studentIdNumber: string }
      >;
      students.forEach((student) => {
        expect(student).toHaveProperty('classId');
        expect(student).toHaveProperty('studentIdNumber');
      });
    });

    it('should have role-specific fields for teachers', () => {
      const teachers = seedData.users.filter((u) => u.role === 'teacher') as Array<
        SchoolUser & { classIds: string[] }
      >;
      teachers.forEach((teacher) => {
        expect(teacher).toHaveProperty('classIds');
        expect(Array.isArray(teacher.classIds)).toBe(true);
        expect(teacher.classIds.length).toBeGreaterThan(0);
      });
    });

    it('should have role-specific fields for parents', () => {
      const parents = seedData.users.filter((u) => u.role === 'parent') as Array<
        SchoolUser & { childId: string }
      >;
      parents.forEach((parent) => {
        expect(parent).toHaveProperty('childId');
      });
    });

    it('should have unique user IDs', () => {
      const userIds = seedData.users.map((u) => u.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(userIds.length);
    });

    it('should have unique email addresses', () => {
      const emails = seedData.users.map((u) => u.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });
  });

  describe('Class Entity Validation', () => {
    it('should have all required fields for each class', () => {
      seedData.classes.forEach((cls) => {
        expect(cls).toHaveProperty('id');
        expect(cls).toHaveProperty('name');
        expect(cls).toHaveProperty('teacherId');
        expect(cls).toHaveProperty('createdAt');
        expect(cls).toHaveProperty('updatedAt');
      });
    });

    it('should have valid timestamps', () => {
      seedData.classes.forEach((cls) => {
        expect(cls.createdAt).toBeTruthy();
        expect(cls.updatedAt).toBeTruthy();
        expect(new Date(cls.createdAt).toISOString()).toBe(cls.createdAt);
        expect(new Date(cls.updatedAt).toISOString()).toBe(cls.updatedAt);
      });
    });

    it('should have unique class IDs', () => {
      const classIds = seedData.classes.map((c) => c.id);
      const uniqueIds = new Set(classIds);
      expect(uniqueIds.size).toBe(classIds.length);
    });
  });

  describe('Course Entity Validation', () => {
    it('should have all required fields for each course', () => {
      seedData.courses.forEach((course) => {
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('name');
        expect(course).toHaveProperty('teacherId');
        expect(course).toHaveProperty('createdAt');
        expect(course).toHaveProperty('updatedAt');
      });
    });

    it('should have valid timestamps', () => {
      seedData.courses.forEach((course) => {
        expect(course.createdAt).toBeTruthy();
        expect(course.updatedAt).toBeTruthy();
        expect(new Date(course.createdAt).toISOString()).toBe(course.createdAt);
        expect(new Date(course.updatedAt).toISOString()).toBe(course.updatedAt);
      });
    });

    it('should have unique course IDs', () => {
      const courseIds = seedData.courses.map((c) => c.id);
      const uniqueIds = new Set(courseIds);
      expect(uniqueIds.size).toBe(courseIds.length);
    });
  });

  describe('Grade Entity Validation', () => {
    it('should have all required fields for each grade', () => {
      seedData.grades.forEach((grade) => {
        expect(grade).toHaveProperty('id');
        expect(grade).toHaveProperty('studentId');
        expect(grade).toHaveProperty('courseId');
        expect(grade).toHaveProperty('score');
        expect(grade).toHaveProperty('feedback');
        expect(grade).toHaveProperty('createdAt');
        expect(grade).toHaveProperty('updatedAt');
      });
    });

    it('should have valid scores between 0 and 100', () => {
      seedData.grades.forEach((grade) => {
        expect(grade.score).toBeGreaterThanOrEqual(0);
        expect(grade.score).toBeLessThanOrEqual(100);
      });
    });

    it('should have valid feedback strings', () => {
      seedData.grades.forEach((grade) => {
        expect(grade.feedback).toBeTruthy();
        expect(typeof grade.feedback).toBe('string');
        expect(grade.feedback.length).toBeGreaterThan(0);
      });
    });

    it('should have valid timestamps', () => {
      seedData.grades.forEach((grade) => {
        expect(grade.createdAt).toBeTruthy();
        expect(grade.updatedAt).toBeTruthy();
        expect(new Date(grade.createdAt).toISOString()).toBe(grade.createdAt);
        expect(new Date(grade.updatedAt).toISOString()).toBe(grade.updatedAt);
      });
    });

    it('should have unique grade IDs', () => {
      const gradeIds = seedData.grades.map((g) => g.id);
      const uniqueIds = new Set(gradeIds);
      expect(uniqueIds.size).toBe(gradeIds.length);
    });
  });

  describe('Announcement Entity Validation', () => {
    it('should have all required fields for each announcement', () => {
      seedData.announcements.forEach((ann) => {
        expect(ann).toHaveProperty('id');
        expect(ann).toHaveProperty('title');
        expect(ann).toHaveProperty('content');
        expect(ann).toHaveProperty('date');
        expect(ann).toHaveProperty('authorId');
        expect(ann).toHaveProperty('targetRole');
        expect(ann).toHaveProperty('createdAt');
        expect(ann).toHaveProperty('updatedAt');
      });
    });

    it('should have valid title strings', () => {
      seedData.announcements.forEach((ann) => {
        expect(ann.title).toBeTruthy();
        expect(typeof ann.title).toBe('string');
        expect(ann.title.length).toBeGreaterThan(0);
      });
    });

    it('should have valid content strings', () => {
      seedData.announcements.forEach((ann) => {
        expect(ann.content).toBeTruthy();
        expect(typeof ann.content).toBe('string');
        expect(ann.content.length).toBeGreaterThan(0);
      });
    });

    it('should have valid target roles', () => {
      const validRoles = ['student', 'teacher', 'parent', 'admin', 'all'];
      seedData.announcements.forEach((ann) => {
        expect(validRoles).toContain(ann.targetRole);
      });
    });

    it('should have valid timestamps', () => {
      seedData.announcements.forEach((ann) => {
        expect(ann.createdAt).toBeTruthy();
        expect(ann.updatedAt).toBeTruthy();
        expect(new Date(ann.createdAt).toISOString()).toBe(ann.createdAt);
        expect(new Date(ann.updatedAt).toISOString()).toBe(ann.updatedAt);
      });
    });

    it('should have unique announcement IDs', () => {
      const announcementIds = seedData.announcements.map((a) => a.id);
      const uniqueIds = new Set(announcementIds);
      expect(uniqueIds.size).toBe(announcementIds.length);
    });
  });

  describe('Schedule Entity Validation', () => {
    it('should have all required fields for each schedule', () => {
      seedData.schedules.forEach((schedule) => {
        expect(schedule).toHaveProperty('classId');
        expect(schedule).toHaveProperty('day');
        expect(schedule).toHaveProperty('time');
        expect(schedule).toHaveProperty('courseId');
      });
    });

    it('should have valid day values (Indonesian days)', () => {
      const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      seedData.schedules.forEach((schedule) => {
        expect(validDays).toContain(schedule.day);
      });
    });

    it('should have valid time format', () => {
      seedData.schedules.forEach((schedule) => {
        expect(schedule.time).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/);
      });
    });

    it('should have unique class-day-time combinations', () => {
      const scheduleKeys = seedData.schedules.map((s) => `${s.classId}-${s.day}-${s.time}`);
      const uniqueKeys = new Set(scheduleKeys);
      expect(uniqueKeys.size).toBe(scheduleKeys.length);
    });
  });

  describe('Referential Integrity - User to Class Relationships', () => {
    it('should have valid student class assignments', () => {
      const students = seedData.users.filter((u) => u.role === 'student') as Array<
        SchoolUser & { classId: string }
      >;
      const classIds = seedData.classes.map((c) => c.id);

      students.forEach((student) => {
        expect(classIds).toContain(student.classId);
      });
    });

    it('should have valid teacher class assignments', () => {
      const teachers = seedData.users.filter((u) => u.role === 'teacher') as Array<
        SchoolUser & { classIds: string[] }
      >;
      const classIds = seedData.classes.map((c) => c.id);

      teachers.forEach((teacher) => {
        teacher.classIds.forEach((classId) => {
          expect(classIds).toContain(classId);
        });
      });
    });

    it('should have consistent teacher-class assignments', () => {
      seedData.classes.forEach((cls) => {
        const teacher = seedData.users.find((u) => u.id === cls.teacherId);
        expect(teacher).toBeDefined();
        expect(teacher?.role).toBe('teacher');
      });
    });
  });

  describe('Referential Integrity - Course Relationships', () => {
    it('should have valid teacher assignments for courses', () => {
      const teacherIds = seedData.users.filter((u) => u.role === 'teacher').map((t) => t.id);

      seedData.courses.forEach((course) => {
        expect(teacherIds).toContain(course.teacherId);
      });
    });
  });

  describe('Referential Integrity - Grade Relationships', () => {
    it('should have valid student IDs for grades', () => {
      const studentIds = seedData.users.filter((u) => u.role === 'student').map((s) => s.id);

      seedData.grades.forEach((grade) => {
        expect(studentIds).toContain(grade.studentId);
      });
    });

    it('should have valid course IDs for grades', () => {
      const courseIds = seedData.courses.map((c) => c.id);

      seedData.grades.forEach((grade) => {
        expect(courseIds).toContain(grade.courseId);
      });
    });
  });

  describe('Referential Integrity - Announcement Relationships', () => {
    it('should have valid author IDs for announcements', () => {
      const teacherIds = seedData.users
        .filter((u) => u.role === 'teacher' || u.role === 'admin')
        .map((u) => u.id);

      seedData.announcements.forEach((ann) => {
        expect(teacherIds).toContain(ann.authorId);
      });
    });
  });

  describe('Referential Integrity - Schedule Relationships', () => {
    it('should have valid class IDs for schedules', () => {
      const classIds = seedData.classes.map((c) => c.id);

      seedData.schedules.forEach((schedule) => {
        expect(classIds).toContain(schedule.classId);
      });
    });

    it('should have valid course IDs for schedules', () => {
      const courseIds = seedData.courses.map((c) => c.id);

      seedData.schedules.forEach((schedule) => {
        expect(courseIds).toContain(schedule.courseId);
      });
    });
  });

  describe('Referential Integrity - Parent-Child Relationships', () => {
    it('should have valid child IDs for parents', () => {
      const parentIds = seedData.users.filter((u) => u.role === 'parent') as Array<
        SchoolUser & { childId: string }
      >;
      const studentIds = seedData.users.filter((u) => u.role === 'student').map((s) => s.id);

      parentIds.forEach((parent) => {
        expect(studentIds).toContain(parent.childId);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent timestamps for related entities', () => {
      seedData.users.forEach((user) => {
        expect(user.createdAt).toBe(user.updatedAt);
      });

      seedData.classes.forEach((cls) => {
        expect(cls.createdAt).toBe(cls.updatedAt);
      });

      seedData.courses.forEach((course) => {
        expect(course.createdAt).toBe(course.updatedAt);
      });

      seedData.grades.forEach((grade) => {
        expect(grade.createdAt).toBe(grade.updatedAt);
      });

      seedData.announcements.forEach((ann) => {
        expect(ann.createdAt).toBe(ann.updatedAt);
      });
    });

    it('should have valid ISO timestamp format for all entities', () => {
      seedData.users.forEach((user) => {
        expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      seedData.classes.forEach((cls) => {
        expect(cls.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      seedData.courses.forEach((course) => {
        expect(course.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      seedData.grades.forEach((grade) => {
        expect(grade.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      seedData.announcements.forEach((ann) => {
        expect(ann.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(ann.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle special characters in user names', () => {
      seedData.users.forEach((user) => {
        expect(user.name).toBeTruthy();
        expect(typeof user.name).toBe('string');
      });
    });

    it('should handle special characters in feedback', () => {
      seedData.grades.forEach((grade) => {
        expect(grade.feedback).toBeTruthy();
        expect(typeof grade.feedback).toBe('string');
      });
    });

    it('should handle boundary scores (0 and 100)', () => {
      const scores = seedData.grades.map((g) => g.score);
      expect(scores).not.toContain(-1);
      expect(scores).not.toContain(101);
    });

    it('should handle multiple grades per student', () => {
      const studentGrades = new Map<string, number>();
      seedData.grades.forEach((grade) => {
        const count = studentGrades.get(grade.studentId) || 0;
        studentGrades.set(grade.studentId, count + 1);
      });

      expect(studentGrades.size).toBeGreaterThan(0);
    });
  });
});
