import { describe, it, expect } from 'vitest';
import { isStudent, isTeacher, isParent, isAdmin, getRoleSpecificFields } from '../type-guards';
import type { SchoolUser, Student, Teacher, Parent, Admin } from '@shared/types';

describe('Type Guards', () => {
  const studentUser: Student = {
    id: 'student-01',
    name: 'John Doe',
    email: 'student@example.com',
    role: 'student',
    avatarUrl: '',
    classId: 'class-01',
    studentIdNumber: '12345',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const teacherUser: Teacher = {
    id: 'teacher-01',
    name: 'Ms. Smith',
    email: 'teacher@example.com',
    role: 'teacher',
    avatarUrl: '',
    classIds: ['class-01', 'class-02'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const parentUser: Parent = {
    id: 'parent-01',
    name: 'Jane Doe',
    email: 'parent@example.com',
    role: 'parent',
    avatarUrl: '',
    childId: 'student-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adminUser: Admin = {
    id: 'admin-01',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatarUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('isStudent', () => {
    it('should return true for student user', () => {
      const result = isStudent(studentUser);

      expect(result).toBe(true);
    });

    it('should return false for teacher user', () => {
      const result = isStudent(teacherUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for parent user', () => {
      const result = isStudent(parentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for admin user', () => {
      const result = isStudent(adminUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should narrow type correctly to Student', () => {
      const user: SchoolUser = studentUser;

      if (isStudent(user)) {
        expect(user.classId).toBe('class-01');
        expect(user.studentIdNumber).toBe('12345');
      }
    });
  });

  describe('isTeacher', () => {
    it('should return true for teacher user', () => {
      const result = isTeacher(teacherUser);

      expect(result).toBe(true);
    });

    it('should return false for student user', () => {
      const result = isTeacher(studentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for parent user', () => {
      const result = isTeacher(parentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for admin user', () => {
      const result = isTeacher(adminUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should narrow type correctly to Teacher', () => {
      const user: SchoolUser = teacherUser;

      if (isTeacher(user)) {
        expect(user.classIds).toEqual(['class-01', 'class-02']);
      }
    });
  });

  describe('isParent', () => {
    it('should return true for parent user', () => {
      const result = isParent(parentUser);

      expect(result).toBe(true);
    });

    it('should return false for student user', () => {
      const result = isParent(studentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for teacher user', () => {
      const result = isParent(teacherUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for admin user', () => {
      const result = isParent(adminUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should narrow type correctly to Parent', () => {
      const user: SchoolUser = parentUser;

      if (isParent(user)) {
        expect(user.childId).toBe('student-01');
      }
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const result = isAdmin(adminUser);

      expect(result).toBe(true);
    });

    it('should return false for student user', () => {
      const result = isAdmin(studentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for teacher user', () => {
      const result = isAdmin(teacherUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should return false for parent user', () => {
      const result = isAdmin(parentUser as SchoolUser);

      expect(result).toBe(false);
    });

    it('should narrow type correctly to Admin', () => {
      const user: SchoolUser = adminUser;

      if (isAdmin(user)) {
        expect(user.id).toBe('admin-01');
      }
    });
  });

  describe('getRoleSpecificFields', () => {
    it('should return student specific fields for student', () => {
      const result = getRoleSpecificFields(studentUser);

      expect(result).toEqual({
        classId: 'class-01',
        studentIdNumber: '12345',
        classIds: undefined,
        childId: undefined,
      });
    });

    it('should return teacher specific fields for teacher', () => {
      const result = getRoleSpecificFields(teacherUser);

      expect(result).toEqual({
        classId: undefined,
        studentIdNumber: undefined,
        classIds: ['class-01', 'class-02'],
        childId: undefined,
      });
    });

    it('should return parent specific fields for parent', () => {
      const result = getRoleSpecificFields(parentUser);

      expect(result).toEqual({
        classId: undefined,
        studentIdNumber: undefined,
        classIds: undefined,
        childId: 'student-01',
      });
    });

    it('should return all undefined for admin', () => {
      const result = getRoleSpecificFields(adminUser);

      expect(result).toEqual({
        classId: undefined,
        studentIdNumber: undefined,
        classIds: undefined,
        childId: undefined,
      });
    });

    it('should work with SchoolUser union type', () => {
      const users: SchoolUser[] = [studentUser, teacherUser, parentUser, adminUser];

      const studentFields = getRoleSpecificFields(users[0]);
      const teacherFields = getRoleSpecificFields(users[1]);
      const parentFields = getRoleSpecificFields(users[2]);
      const adminFields = getRoleSpecificFields(users[3]);

      expect(studentFields.classId).toBe('class-01');
      expect(teacherFields.classIds).toEqual(['class-01', 'class-02']);
      expect(parentFields.childId).toBe('student-01');
      expect(adminFields.classId).toBeUndefined();
    });

    it('should handle student with empty classId', () => {
      const studentWithEmptyClass: Student = {
        ...studentUser,
        classId: '',
      };

      const result = getRoleSpecificFields(studentWithEmptyClass);

      expect(result.classId).toBe('');
    });

    it('should handle teacher with empty classIds array', () => {
      const teacherWithEmptyClasses: Teacher = {
        ...teacherUser,
        classIds: [],
      };

      const result = getRoleSpecificFields(teacherWithEmptyClasses);

      expect(result.classIds).toEqual([]);
    });

    it('should handle parent with empty childId', () => {
      const parentWithEmptyChild: Parent = {
        ...parentUser,
        childId: '',
      };

      const result = getRoleSpecificFields(parentWithEmptyChild);

      expect(result.childId).toBe('');
    });
  });
});
