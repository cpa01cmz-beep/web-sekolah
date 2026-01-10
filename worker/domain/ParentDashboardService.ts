import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity, ScheduleEntity } from '../entities';
import type { ParentDashboardData, ScheduleItem, Grade, Announcement, Student, SchoolUser, Course } from '@shared/types';
import { getRoleSpecificFields } from '../type-guards';

export class ParentDashboardService {
  static async getDashboardData(env: Env, parentId: string): Promise<ParentDashboardData> {
    const parent = new UserEntity(env, parentId);
    const parentState = await parent.getState();
    
    if (!parentState || parentState.role !== 'parent') {
      throw new Error('Parent not found');
    }

    const roleFields = getRoleSpecificFields(parentState);
    
    if (!roleFields.childId) {
      throw new Error('Parent has no associated child');
    }

    const child = await this.getChild(env, roleFields.childId);
    const childSchedule = await this.getChildSchedule(env, roleFields.childId);
    const childGrades = await this.getChildGrades(env, roleFields.childId);
    const announcements = await this.getAnnouncements(env, 5);

    return { child, childSchedule, childGrades, announcements };
  }

  private static async getChild(env: Env, childId: string): Promise<Student & { className: string }> {
    const childEntity = new UserEntity(env, childId);
    const childState = await childEntity.getState();

    if (!childState || childState.role !== 'student') {
      throw new Error('Child not found');
    }

    const childRoleFields = getRoleSpecificFields(childState);

    let className = 'N/A';
    if (childRoleFields.classId) {
      const classEntity = new ClassEntity(env, childRoleFields.classId);
      const classState = await classEntity.getState();
      className = classState?.name || 'N/A';
    }

    const { passwordHash: _, ...childWithoutPassword } = childState;
    return {
      ...childWithoutPassword,
      className
    } as Student & { className: string };
  }

  private static async getChildSchedule(env: Env, childId: string): Promise<(ScheduleItem & { courseName: string; teacherName: string })[]> {
    const childEntity = new UserEntity(env, childId);
    const childState = await childEntity.getState();
    
    if (!childState || childState.role !== 'student') {
      return [];
    }

    const childRoleFields = getRoleSpecificFields(childState);
    
    if (!childRoleFields.classId) {
      return [];
    }

    return this.getSchedule(env, childRoleFields.classId);
  }

  private static async getSchedule(env: Env, classId: string): Promise<(ScheduleItem & { courseName: string; teacherName: string })[]> {
    const scheduleEntity = new ScheduleEntity(env, classId);
    const scheduleState = await scheduleEntity.getState();
    
    if (!scheduleState) {
      return [];
    }

    const courseIds = scheduleState.items.map(item => item.courseId);
    const courses = await Promise.all(courseIds.map(id => new CourseEntity(env, id).getState()));
    const teacherIds = courses.map(course => course?.teacherId).filter((id): id is string => id !== undefined);
    const teachers = await Promise.all(teacherIds.map(id => new UserEntity(env, id).getState()));

    const coursesMap = new Map(courses.filter((c): c is Course => c !== null).map(c => [c.id, c]));
    const teachersMap = new Map(teachers.filter((t): t is SchoolUser => t !== null).map(t => [t.id, t]));

    return scheduleState.items.map(item => ({
      ...item,
      courseName: coursesMap.get(item.courseId)?.name || 'Unknown Course',
      teacherName: teachersMap.get(coursesMap.get(item.courseId)?.teacherId || '')?.name || 'Unknown Teacher',
    }));
  }

  private static async getChildGrades(env: Env, childId: string): Promise<(Grade & { courseName: string })[]> {
    const studentGrades = await GradeEntity.getByStudentId(env, childId);
    
    if (studentGrades.length === 0) {
      return [];
    }

    const gradeCourseIds = studentGrades.map(g => g.courseId);
    const gradeCourses = await Promise.all(gradeCourseIds.map(id => new CourseEntity(env, id).getState()));
    const gradeCoursesMap = new Map(gradeCourses.filter((c): c is Course => c !== null).map(c => [c.id, c]));

    return studentGrades.map(grade => ({
      ...grade,
      courseName: gradeCoursesMap.get(grade.courseId)?.name || 'Unknown Course',
    }));
  }

  private static async getAnnouncements(env: Env, limit: number): Promise<(Announcement & { authorName: string })[]> {
    const recentAnnouncements = await AnnouncementEntity.getRecent(env, limit);

    if (recentAnnouncements.length === 0) {
      return [];
    }

    const uniqueAuthorIds = Array.from(new Set(recentAnnouncements.map(a => a.authorId)));
    const announcementAuthors = await Promise.all(uniqueAuthorIds.map(id => new UserEntity(env, id).getState()));
    const authorsMap = new Map(announcementAuthors.filter((a): a is SchoolUser => a !== null).map(a => [a.id, a]));

    return recentAnnouncements.map(ann => ({
      ...ann,
      authorName: authorsMap.get(ann.authorId)?.name || 'Unknown Author',
    }));
  }
}