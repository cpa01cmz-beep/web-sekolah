import type { Env } from '../core-utils';
import { UserEntity, ClassEntity, CourseEntity, GradeEntity } from '../entities';
import type { Grade, SchoolClass, Teacher } from '@shared/types';

export class TeacherService {
  static async getClasses(env: Env, teacherId: string): Promise<SchoolClass[]> {
    return await ClassEntity.getByTeacherId(env, teacherId);
  }

  static async getClassStudentsWithGrades(env: Env, classId: string, teacherId: string): Promise<Array<{
    id: string;
    name: string;
    score: number | null;
    feedback: string;
    gradeId: string | null;
  }>> {
    const classEntity = new ClassEntity(env, classId);
    const classState = await classEntity.getState();
    
    if (!classState) {
      throw new Error('Class not found');
    }

    const teacher = await new UserEntity(env, classState.teacherId).getState() as Teacher;
    
    if (teacher.id !== teacherId) {
      throw new Error('Teacher not assigned to this class');
    }

    const teacherCourses = (await CourseEntity.getByTeacherId(env, teacher.id))
      .filter(course => teacher.classIds.includes(classId));
    const teacherCourseIds = new Set(teacherCourses.map(c => c.id));
    const students = await UserEntity.getByClassId(env, classId);

    const allCourseGrades = await Promise.all(
      Array.from(teacherCourseIds).map(courseId => GradeEntity.getByCourseId(env, courseId))
    );
    const gradesMap = new Map<string, Grade>();
    allCourseGrades.flat().forEach(grade => {
      const key = `${grade.studentId}:${grade.courseId}`;
      gradesMap.set(key, grade);
    });

    return students.map(s => {
      const relevantGrade = Array.from(teacherCourseIds)
        .map(courseId => gradesMap.get(`${s.id}:${courseId}`))
        .find(g => g !== undefined) ?? null;
      return {
        id: s.id,
        name: s.name,
        score: relevantGrade?.score ?? null,
        feedback: relevantGrade?.feedback ?? '',
        gradeId: relevantGrade?.id ?? null,
      };
    });
  }
}
