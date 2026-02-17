import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, AnnouncementEntity, ScheduleEntity, ClassScheduleState, CourseEntity, GradeEntity } from '../entities';
import type { SchoolUser, SchoolClass, Announcement, Student, ScheduleItem, Grade, Course, UserRole } from '@shared/types';

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
    const recentAnnouncements = await AnnouncementEntity.getRecent(env, limit * 2);
    const roleAnnouncements = recentAnnouncements.filter(ann => ann.targetRole === targetRole || ann.targetRole === 'all');
    return roleAnnouncements.slice(0, limit);
  }

  static async getClassStudents(env: Env, classId: string): Promise<SchoolUser[]> {
    return await UserEntity.getByClassId(env, classId);
  }

  static async getClassStudentsCount(env: Env, classId: string): Promise<number> {
    return await UserEntity.countByClassId(env, classId);
  }

  static async getUserCountByRole(env: Env, role: UserRole): Promise<number> {
    return await UserEntity.countByRole(env, role);
  }

  static async getByRole(env: Env, role: UserRole): Promise<SchoolUser[]> {
    return await UserEntity.getByRole(env, role);
  }

  static async getAllUsers(env: Env): Promise<SchoolUser[]> {
    const { items: allUsers } = await UserEntity.list(env);
    return allUsers.map(({ passwordHash: _, ...rest }) => rest);
  }

  static async getUsersWithFilters(env: Env, filters: { role?: UserRole; classId?: string; search?: string }): Promise<SchoolUser[]> {
    const { role, classId, search } = filters;

    let users: SchoolUser[];

    if (role && !search) {
      const validRoles: UserRole[] = ['student', 'teacher', 'parent', 'admin'];
      const typedRole = role as UserRole;
      if (validRoles.includes(typedRole)) {
        users = await UserEntity.getByRole(env, typedRole);
      } else {
        users = await this.getAllUsers(env);
      }
    } else if (classId && role === 'student' && !search) {
      users = await UserEntity.getByClassId(env, classId);
    } else {
      users = await this.getAllUsers(env);
    }

    let filteredUsers = users;

    if (role && search) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (classId && !search) {
      filteredUsers = filteredUsers.filter(u => u.role === 'student' && 'classId' in u && u.classId === classId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    }

    return filteredUsers;
  }

  static async getAllClasses(env: Env): Promise<SchoolClass[]> {
    const { items: allClasses } = await ClassEntity.list(env);
    return allClasses;
  }

  static async getUserById(env: Env, userId: string): Promise<SchoolUser | null> {
    const userEntity = new UserEntity(env, userId);
    const user = await userEntity.getState() as SchoolUser | null;
    if (!user) {
      return null;
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getScheduleWithDetails(env: Env, classId: string): Promise<(ScheduleItem & { courseName: string; teacherName: string })[]> {
    const scheduleEntity = new ScheduleEntity(env, classId);
    const scheduleState = await scheduleEntity.getState();

    if (!scheduleState) {
      return [];
    }

    const courseIds = scheduleState.items.map(item => item.courseId);
    const uniqueCourseIds = Array.from(new Set(courseIds));
    const courses = await Promise.all(uniqueCourseIds.map(id => new CourseEntity(env, id).getState()));
    const teacherIds = courses.map(course => course?.teacherId).filter((id): id is string => id !== undefined);
    const uniqueTeacherIds = Array.from(new Set(teacherIds));
    const teachers = await Promise.all(uniqueTeacherIds.map(id => new UserEntity(env, id).getState()));

    const coursesMap = new Map(courses.filter(c => c).map(c => [c!.id, c!]));
    const teachersMap = new Map(teachers.filter(t => t).map(t => [t!.id, t!]));

    return scheduleState.items.map(item => {
      const course = coursesMap.get(item.courseId);
      const teacherName = course?.teacherId ? teachersMap.get(course.teacherId)?.name : undefined;
      return {
        ...item,
        courseName: course?.name || 'Unknown Course',
        teacherName: teacherName || 'Unknown Teacher',
      };
    });
  }

  static async getAnnouncementsWithAuthorNames(env: Env, limit: number): Promise<(Announcement & { authorName: string })[]> {
    const recentAnnouncements = await AnnouncementEntity.getRecent(env, limit);

    if (recentAnnouncements.length === 0) {
      return [];
    }

    const uniqueAuthorIds = Array.from(new Set(recentAnnouncements.map(a => a.authorId)));
    const announcementAuthors = await Promise.all(uniqueAuthorIds.map(id => new UserEntity(env, id).getState()));
    const authorsMap = new Map(announcementAuthors.filter(a => a).map(a => [a!.id, a!]));

    return recentAnnouncements.map(ann => ({
      ...ann,
      authorName: authorsMap.get(ann.authorId)?.name || 'Unknown Author',
    }));
  }

  static async getRecentGradesWithCourseNames(env: Env, studentId: string, limit: number = 10): Promise<(Grade & { courseName: string })[]> {
    const studentGrades = await GradeEntity.getRecentForStudent(env, studentId, limit);

    if (studentGrades.length === 0) {
      return [];
    }

    const gradeCourseIds = studentGrades.map(g => g.courseId);
    const uniqueCourseIds = Array.from(new Set(gradeCourseIds));
    const gradeCourses = await Promise.all(uniqueCourseIds.map(id => new CourseEntity(env, id).getState()));
    const gradeCoursesMap = new Map(gradeCourses.filter(c => c).map(c => [c!.id, c!]));

    return studentGrades.map(grade => ({
      ...grade,
      courseName: gradeCoursesMap.get(grade.courseId)?.name || 'Unknown Course',
    }));
  }
}
