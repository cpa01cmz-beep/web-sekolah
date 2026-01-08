import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, AnnouncementEntity, ScheduleEntity, ClassScheduleState } from '../entities';
import type { SchoolUser, SchoolClass, Announcement, Student } from '@shared/types';

export class CommonDataService {
  static async getStudentWithClassAndSchedule(env: Env, studentId: string): Promise<{
    student: SchoolUser | null;
    classData: SchoolClass | null;
    schedule: ClassScheduleState | null;
  }> {
    const studentEntity = new UserEntity(env, studentId);
    const student = await studentEntity.getState() as SchoolUser | null;

    if (!student || student.role !== 'student') {
      return { student: null, classData: null, schedule: null };
    }

    const classEntity = new ClassEntity(env, (student as Student).classId);
    const classData = await classEntity.getState() as SchoolClass | null;

    const scheduleEntity = new ScheduleEntity(env, (student as Student).classId);
    const schedule = await scheduleEntity.getState() as ClassScheduleState | null;

    return { student, classData, schedule };
  }

  static async getStudentForGrades(env: Env, studentId: string): Promise<{
    student: SchoolUser | null;
    classData: SchoolClass | null;
  }> {
    const studentEntity = new UserEntity(env, studentId);
    const student = await studentEntity.getState() as SchoolUser | null;

    if (!student || student.role !== 'student') {
      return { student: null, classData: null };
    }

    const classId = (student as Student).classId;
    const classEntity = classId ? new ClassEntity(env, classId) : null;
    const classData = classEntity ? await classEntity.getState() as SchoolClass | null : null;

    return { student, classData };
  }

  static async getTeacherWithClasses(env: Env, teacherId: string): Promise<{
    teacher: SchoolUser | null;
    classes: SchoolClass[];
  }> {
    const teacherEntity = new UserEntity(env, teacherId);
    const teacher = await teacherEntity.getState() as SchoolUser | null;

    if (!teacher) {
      return { teacher: null, classes: [] };
    }

    const teacherClasses = await ClassEntity.getByTeacherId(env, teacherId);

    return { teacher, classes: teacherClasses };
  }

  static async getAllAnnouncements(env: Env): Promise<Announcement[]> {
    const { items: allAnnouncements } = await AnnouncementEntity.list(env);
    return allAnnouncements;
  }

  static async getAnnouncementsByRole(env: Env, targetRole: string): Promise<Announcement[]> {
    return await AnnouncementEntity.getByTargetRole(env, targetRole);
  }

  static async getRecentAnnouncementsByRole(env: Env, targetRole: string, limit: number): Promise<Announcement[]> {
    const allAnnouncements = await AnnouncementEntity.getRecent(env, limit);
    return allAnnouncements.filter(a => 
      a.targetRole === targetRole || a.targetRole === 'all'
    );
  }

  static async getClassStudents(env: Env, classId: string): Promise<SchoolUser[]> {
    return await UserEntity.getByClassId(env, classId);
  }

  static async getAllUsers(env: Env): Promise<SchoolUser[]> {
    const { items: allUsers } = await UserEntity.list(env);
    return allUsers;
  }

  static async getAllClasses(env: Env): Promise<SchoolClass[]> {
    const { items: allClasses } = await ClassEntity.list(env);
    return allClasses;
  }

  static async getUserById(env: Env, userId: string): Promise<SchoolUser | null> {
    const userEntity = new UserEntity(env, userId);
    return await userEntity.getState() as SchoolUser | null;
  }
}
