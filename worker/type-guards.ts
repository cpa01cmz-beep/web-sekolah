import type { SchoolUser, Student, Teacher, Parent, Admin } from '@shared/types';
import type { Context } from 'hono';
import type { AuthUser } from './middleware/auth';

type ExtendedContext = Context & {
  set(key: string, value: unknown): void;
};

export function getAuthUser(c: Context): AuthUser | undefined {
  return c.get('user') as AuthUser | undefined;
}

export function getCurrentUserId(c: Context): string {
  const user = getAuthUser(c);
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

export function setAuthUser(c: Context, user: AuthUser): void {
  (c as ExtendedContext).set('user', user);
}

export function isStudent(user: SchoolUser): user is Student {
  return user.role === 'student';
}

export function isTeacher(user: SchoolUser): user is Teacher {
  return user.role === 'teacher';
}

export function isParent(user: SchoolUser): user is Parent {
  return user.role === 'parent';
}

export function isAdmin(user: SchoolUser): user is Admin {
  return user.role === 'admin';
}

export function getRoleSpecificFields(user: SchoolUser) {
  if (isStudent(user)) {
    return {
      classId: user.classId,
      studentIdNumber: user.studentIdNumber,
      classIds: undefined,
      childId: undefined,
    };
  }
  if (isTeacher(user)) {
    return {
      classId: undefined,
      studentIdNumber: undefined,
      classIds: user.classIds,
      childId: undefined,
    };
  }
  if (isParent(user)) {
    return {
      classId: undefined,
      studentIdNumber: undefined,
      classIds: undefined,
      childId: user.childId,
    };
  }
  return {
    classId: undefined,
    studentIdNumber: undefined,
    classIds: undefined,
    childId: undefined,
  };
}
