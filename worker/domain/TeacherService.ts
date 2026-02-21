import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, ScheduleEntity } from '../entities';
import type { Grade, SchoolClass, Teacher, ScheduleItem } from '@shared/types';
import { getUniqueIds, buildEntityMap } from './EntityMapUtils';

export class TeacherService {
  static async getClasses(env: Env, teacherId: string): Promise<SchoolClass[]> {
    return await ClassEntity.getByTeacherId(env, teacherId);
  }

  static async getClassStudentsWithGrades(
    env: Env,
    classId: string,
    teacherId: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      score: number | null;
      feedback: string;
      gradeId: string | null;
    }>
  > {
    const classEntity = new ClassEntity(env, classId);
    const classState = await classEntity.getState();

    if (!classState) {
      throw new Error('Class not found');
    }

    const teacher = (await new UserEntity(env, classState.teacherId).getState()) as Teacher;

    if (teacher.id !== teacherId) {
      throw new Error('Teacher not assigned to this class');
    }

    const teacherCourses = (await CourseEntity.getByTeacherId(env, teacher.id)).filter((course) =>
      teacher.classIds.includes(classId)
    );
    const teacherCourseIds = new Set(teacherCourses.map((c) => c.id));
    const students = await UserEntity.getByClassId(env, classId);

    const allCourseGrades = await Promise.all(
      Array.from(teacherCourseIds).map((courseId) => GradeEntity.getByCourseId(env, courseId))
    );
    const gradesMap = new Map<string, Grade>();
    allCourseGrades.flat().forEach((grade) => {
      const key = `${grade.studentId}:${grade.courseId}`;
      gradesMap.set(key, grade);
    });

    return students.map((s) => {
      const relevantGrade =
        Array.from(teacherCourseIds)
          .map((courseId) => gradesMap.get(`${s.id}:${courseId}`))
          .find((g) => g !== undefined) ?? null;
      return {
        id: s.id,
        name: s.name,
        score: relevantGrade?.score ?? null,
        feedback: relevantGrade?.feedback ?? '',
        gradeId: relevantGrade?.id ?? null,
      };
    });
  }

  static async getSchedule(
    env: Env,
    teacherId: string
  ): Promise<(ScheduleItem & { className: string; courseName: string })[]> {
    const teacherClasses = await ClassEntity.getByTeacherId(env, teacherId);
    const allScheduleItems: (ScheduleItem & { className: string; courseId: string })[] = [];

    for (const cls of teacherClasses) {
      const scheduleEntity = new ScheduleEntity(env, cls.id);
      const scheduleState = await scheduleEntity.getState();
      if (scheduleState && scheduleState.items) {
        for (const item of scheduleState.items) {
          allScheduleItems.push({
            ...item,
            className: cls.name,
            courseId: item.courseId,
          });
        }
      }
    }

    const uniqueCourseIds = getUniqueIds(allScheduleItems.map((item) => item.courseId));
    const courses = await Promise.all(
      uniqueCourseIds.map((id) => new CourseEntity(env, id).getState())
    );
    const coursesMap = buildEntityMap(courses);

    return allScheduleItems.map((item) => ({
      day: item.day,
      time: item.time,
      courseId: item.courseId,
      className: item.className,
      courseName: coursesMap.get(item.courseId)?.name || 'Unknown Course',
    }));
  }
}
