import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, AnnouncementEntity, ScheduleEntity, ClassScheduleState, CourseEntity, GradeEntity } from '../entities';
import type { SchoolUser, SchoolClass, Announcement, Student, ScheduleItem, Grade, Course, UserRole } from '@shared/types';
import { getUniqueIds, buildEntityMap, fetchAndMap } from './EntityMapUtils';

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
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
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

    const courseIds = getUniqueIds(scheduleState.items.map(item => item.courseId));
    const teacherIds: string[] = [];

    const coursesMap = await fetchAndMap(courseIds, id => new CourseEntity(env, id).getState());
    coursesMap.forEach(course => {
      if (course.teacherId) teacherIds.push(course.teacherId);
    });

    const uniqueTeacherIds = getUniqueIds(teacherIds);
    const teachersMap = await fetchAndMap(uniqueTeacherIds, id => new UserEntity(env, id).getState());

    return scheduleState.items.map(item => {
      const course = coursesMap.get(item.courseId);
      const teacher = course ? teachersMap.get(course.teacherId) : undefined;
      return {
        ...item,
        courseName: course?.name || 'Unknown Course',
        teacherName: teacher?.name || 'Unknown Teacher',
      };
    });
  }

  static async getAnnouncementsWithAuthorNames(env: Env, limit: number): Promise<(Announcement & { authorName: string })[]> {
    const recentAnnouncements = await AnnouncementEntity.getRecent(env, limit);

    if (recentAnnouncements.length === 0) {
      return [];
    }

    const uniqueAuthorIds = getUniqueIds(recentAnnouncements.map(a => a.authorId));
    const authorsMap = await fetchAndMap(uniqueAuthorIds, id => new UserEntity(env, id).getState());

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

    const uniqueCourseIds = getUniqueIds(studentGrades.map(g => g.courseId));
    const gradeCoursesMap = await fetchAndMap(uniqueCourseIds, id => new CourseEntity(env, id).getState());

    return studentGrades.map(grade => ({
      ...grade,
      courseName: gradeCoursesMap.get(grade.courseId)?.name || 'Unknown Course',
    }));
  }

  static async getTeacherRecentGradesWithDetails(env: Env, teacherId: string, limit: number = 5): Promise<(Grade & { courseName: string; studentName: string })[]> {
    const teacherCourses = await CourseEntity.getByTeacherId(env, teacherId);
    
    if (teacherCourses.length === 0) {
      return [];
    }

    const allGrades: Grade[] = [];
    for (const course of teacherCourses) {
      const courseGrades = await GradeEntity.getByCourseId(env, course.id);
      allGrades.push(...courseGrades);
    }

    const sortedGrades = allGrades.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recentGrades = sortedGrades.slice(0, limit);

    if (recentGrades.length === 0) {
      return [];
    }

    const uniqueCourseIds = getUniqueIds(recentGrades.map(g => g.courseId));
    const uniqueStudentIds = getUniqueIds(recentGrades.map(g => g.studentId));

    const [coursesMap, studentsMap] = await Promise.all([
      fetchAndMap(uniqueCourseIds, id => new CourseEntity(env, id).getState()),
      fetchAndMap(uniqueStudentIds, id => new UserEntity(env, id).getState())
    ]);

    return recentGrades.map(grade => ({
      ...grade,
      courseName: coursesMap.get(grade.courseId)?.name || 'Unknown Course',
      studentName: studentsMap.get(grade.studentId)?.name || 'Unknown Student',
    }));
  }
}
