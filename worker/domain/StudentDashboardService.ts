import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity, ScheduleEntity } from '../entities';
import type { StudentDashboardData, ScheduleItem, Grade, Announcement, Student } from '@shared/types';
import { getRoleSpecificFields } from '../type-guards';

export class StudentDashboardService {
  static async getDashboardData(env: Env, studentId: string): Promise<StudentDashboardData> {
    const student = new UserEntity(env, studentId);
    const studentState = await student.getState();
    
    if (!studentState || studentState.role !== 'student') {
      throw new Error('Student not found');
    }

    const roleFields = getRoleSpecificFields(studentState);
    
    const schedule = await this.getSchedule(env, roleFields.classId!);
    const recentGrades = await this.getRecentGrades(env, studentId, 5);
    const announcements = await this.getAnnouncements(env, 5);

    return { schedule, recentGrades, announcements };
  }

  private static async getSchedule(env: Env, classId: string): Promise<(ScheduleItem & { courseName: string; teacherName: string })[]> {
    const scheduleEntity = new ScheduleEntity(env, classId);
    const scheduleState = await scheduleEntity.getState();
    
    if (!scheduleState) {
      return [];
    }

    const courseIds = scheduleState.items.map(item => item.courseId);
    const courses = await Promise.all(courseIds.map(id => new CourseEntity(env, id).getState()));
    const teacherIds = courses.map(course => course.teacherId);
    const teachers = await Promise.all(teacherIds.map(id => new UserEntity(env, id).getState()));

    const coursesMap = new Map(courses.filter(c => c).map(c => [c!.id, c!]));
    const teachersMap = new Map(teachers.filter(t => t).map(t => [t!.id, t!]));

    return scheduleState.items.map(item => ({
      ...item,
      courseName: coursesMap.get(item.courseId)?.name || 'Unknown Course',
      teacherName: teachersMap.get(coursesMap.get(item.courseId)?.teacherId || '')?.name || 'Unknown Teacher',
    }));
  }

  private static async getRecentGrades(env: Env, studentId: string, limit: number): Promise<(Grade & { courseName: string })[]> {
    const studentGrades = await GradeEntity.getRecentForStudent(env, studentId, limit);

    if (studentGrades.length === 0) {
      return [];
    }

    const gradeCourseIds = studentGrades.map(g => g.courseId);
    const gradeCourses = await Promise.all(gradeCourseIds.map(id => new CourseEntity(env, id).getState()));
    const gradeCoursesMap = new Map(gradeCourses.filter(c => c).map(c => [c!.id, c!]));

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
    const authorsMap = new Map(announcementAuthors.filter(a => a).map(a => [a!.id, a!]));

    return recentAnnouncements.map(ann => ({
      ...ann,
      authorName: authorsMap.get(ann.authorId)?.name || 'Unknown Author',
    }));
  }
}
