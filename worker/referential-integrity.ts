import type { Env } from './core-utils';
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity } from './entities';
import type { Grade, SchoolClass, SchoolUser, Announcement } from '@shared/types';

/**
 * Referential integrity utilities
 * Ensures that entity relationships remain valid
 */

export class ReferentialIntegrity {
  /**
   * Validate that a grade references valid entities
   */
  static async validateGrade(env: Env, grade: Partial<Grade>): Promise<{ valid: boolean; error?: string }> {
    if (!grade.studentId) {
      return { valid: false, error: 'Grade must reference a valid student' };
    }
    if (!grade.courseId) {
      return { valid: false, error: 'Grade must reference a valid course' };
    }

    const student = await new UserEntity(env, grade.studentId).getState();
    if (!student) {
      return { valid: false, error: `Student with id ${grade.studentId} does not exist` };
    }
    if (student.role !== 'student') {
      return { valid: false, error: `User ${grade.studentId} is not a student` };
    }
    if (student.deletedAt) {
      return { valid: false, error: `Student ${grade.studentId} has been deleted` };
    }

    const course = await new CourseEntity(env, grade.courseId).getState();
    if (!course) {
      return { valid: false, error: `Course with id ${grade.courseId} does not exist` };
    }
    if (course.deletedAt) {
      return { valid: false, error: `Course ${grade.courseId} has been deleted` };
    }

    const studentUser = student as SchoolUser & { classId: string };
    const classEntity = await new ClassEntity(env, studentUser.classId).getState();
    if (classEntity) {
      if (classEntity.deletedAt) {
        return { valid: false, error: `Student's class ${studentUser.classId} has been deleted` };
      }
      const classCourses = await CourseEntity.getByTeacherId(env, classEntity.teacherId);
      if (!classCourses.some(c => c.id === grade.courseId)) {
        return { valid: false, error: 'Student is not enrolled in a class that offers this course' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate that a class references a valid teacher
   */
  static async validateClass(env: Env, classData: Partial<SchoolClass>): Promise<{ valid: boolean; error?: string }> {
    if (!classData.teacherId) {
      return { valid: false, error: 'Class must reference a valid teacher' };
    }

    const teacher = await new UserEntity(env, classData.teacherId).getState();
    if (!teacher) {
      return { valid: false, error: `Teacher with id ${classData.teacherId} does not exist` };
    }
    if (teacher.role !== 'teacher') {
      return { valid: false, error: `User ${classData.teacherId} is not a teacher` };
    }
    if (teacher.deletedAt) {
      return { valid: false, error: `Teacher ${classData.teacherId} has been deleted` };
    }

    return { valid: true };
  }

  /**
   * Validate that a course references a valid teacher
   */
  static async validateCourse(env: Env, courseData: { teacherId: string }): Promise<{ valid: boolean; error?: string }> {
    if (!courseData.teacherId) {
      return { valid: false, error: 'Course must reference a valid teacher' };
    }

    const teacher = await new UserEntity(env, courseData.teacherId).getState();
    if (!teacher) {
      return { valid: false, error: `Teacher with id ${courseData.teacherId} does not exist` };
    }
    if (teacher.role !== 'teacher') {
      return { valid: false, error: `User ${courseData.teacherId} is not a teacher` };
    }
    if (teacher.deletedAt) {
      return { valid: false, error: `Teacher ${courseData.teacherId} has been deleted` };
    }

    return { valid: true };
  }

  /**
   * Validate that a student references a valid parent
   */
  static async validateStudent(env: Env, studentData: { classId: string; parentId?: string }): Promise<{ valid: boolean; error?: string }> {
    if (!studentData.classId) {
      return { valid: false, error: 'Student must belong to a class' };
    }

    const classEntity = await new ClassEntity(env, studentData.classId).getState();
    if (!classEntity) {
      return { valid: false, error: `Class with id ${studentData.classId} does not exist` };
    }
    if (classEntity.deletedAt) {
      return { valid: false, error: `Class ${studentData.classId} has been deleted` };
    }

    if (studentData.parentId) {
      const parent = await new UserEntity(env, studentData.parentId).getState();
      if (!parent) {
        return { valid: false, error: `Parent with id ${studentData.parentId} does not exist` };
      }
      if (parent.role !== 'parent') {
        return { valid: false, error: `User ${studentData.parentId} is not a parent` };
      }
      if (parent.deletedAt) {
        return { valid: false, error: `Parent ${studentData.parentId} has been deleted` };
      }
    }

    return { valid: true };
  }

  /**
   * Validate that an announcement references a valid author
   */
  static async validateAnnouncement(env: Env, announcement: Partial<Announcement>): Promise<{ valid: boolean; error?: string }> {
    if (!announcement.authorId) {
      return { valid: false, error: 'Announcement must reference a valid author' };
    }

    const author = await new UserEntity(env, announcement.authorId).getState();
    if (!author) {
      return { valid: false, error: `Author with id ${announcement.authorId} does not exist` };
    }

    if (author.role !== 'teacher' && author.role !== 'admin') {
      return { valid: false, error: 'Only teachers and admins can create announcements' };
    }

    if (author.deletedAt) {
      return { valid: false, error: `Author ${announcement.authorId} has been deleted` };
    }

    return { valid: true };
  }

  /**
   * Check for orphaned records before deleting an entity
   * Returns list of warnings about related records that will be affected
   */
  static async checkDependents(env: Env, entity: 'user' | 'class' | 'course', id: string): Promise<string[]> {
    const warnings: string[] = [];

    if (entity === 'user') {
      const user = await new UserEntity(env, id).getState();
      if (!user) return warnings;

      if (user.role === 'student') {
        const grades = await GradeEntity.getByStudentId(env, id);
        if (grades.length > 0) {
          warnings.push(`This student has ${grades.length} grade(s) that will be orphaned`);
        }
      }

      if (user.role === 'teacher') {
        const classes = await ClassEntity.getByTeacherId(env, id);
        if (classes.length > 0) {
          warnings.push(`This teacher is assigned to ${classes.length} class(es)`);
        }

        const courses = await CourseEntity.getByTeacherId(env, id);
        if (courses.length > 0) {
          warnings.push(`This teacher teaches ${courses.length} course(s)`);
        }

        const announcements = await AnnouncementEntity.getByAuthorId(env, id);
        if (announcements.length > 0) {
          warnings.push(`This teacher created ${announcements.length} announcement(s)`);
        }
      }

      if (user.role === 'parent') {
        const students = await UserEntity.getByRole(env, 'student');
        const children = students.filter((s): s is typeof s & { parentId: string } => 'parentId' in s && s.parentId === id);
        if (children.length > 0) {
          warnings.push(`This parent has ${children.length} child(ren) linked`);
        }
      }
    }

    if (entity === 'class') {
      const students = await UserEntity.getByClassId(env, id);
      if (students.length > 0) {
        warnings.push(`This class has ${students.length} student(s) enrolled`);
      }
    }

    if (entity === 'course') {
      const grades = await GradeEntity.getByCourseId(env, id);
      if (grades.length > 0) {
        warnings.push(`This course has ${grades.length} grade(s) associated`);
      }
    }

    return warnings;
  }
}
