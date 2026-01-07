import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, forbidden, isStr } from './core-utils';
import {
  UserEntity,
  ClassEntity,
  CourseEntity,
  GradeEntity,
  AnnouncementEntity,
  ScheduleEntity,
  ensureAllSeedData
} from "./entities";
import { ReferentialIntegrity } from "./referential-integrity";
import { rebuildAllIndexes } from "./index-rebuilder";
import { authenticate, authorize } from './middleware/auth';
import type { Grade, SchoolUser, Student, StudentDashboardData, Teacher, CreateUserData, UpdateUserData } from "@shared/types";
import { logger } from './logger';
import { WebhookService } from './webhook-service';
import { hashPassword } from './password-utils';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/seed', async (c) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  });

  app.post('/api/admin/rebuild-indexes', authenticate(), authorize('admin'), async (c) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  });

  app.get('/api/students/:id/dashboard', authenticate(), authorize('student'), async (c) => {
    const context = c as any;
    const userId = context.get('user').id;
    const requestedStudentId = c.req.param('id');

    if (userId !== requestedStudentId) {
      logger.warn('[AUTH] Student accessing another student dashboard', { userId, requestedStudentId });
      return forbidden(c, 'Access denied: Cannot access another student data');
    }

    const studentId = c.req.param('id');
    const student = new UserEntity(c.env, studentId);
    const studentState = await student.getState() as Student;
    if (!studentState || studentState.role !== 'student') {
      return notFound(c, 'Student not found');
    }
    const scheduleEntity = new ScheduleEntity(c.env, studentState.classId);
    const scheduleState = await scheduleEntity.getState();
    const courseIds = scheduleState.items.map(item => item.courseId);
    const courses = await Promise.all(courseIds.map(id => new CourseEntity(c.env, id).getState()));
    const teacherIds = courses.map(course => course.teacherId);
    const teachers = await Promise.all(teacherIds.map(id => new UserEntity(c.env, id).getState()));
    const coursesMap = new Map(courses.map(c => [c.id, c]));
    const teachersMap = new Map(teachers.map(t => [t.id, t]));
    const schedule = scheduleState.items.map(item => ({
      ...item,
      courseName: coursesMap.get(item.courseId)?.name || 'Unknown Course',
      teacherName: teachersMap.get(coursesMap.get(item.courseId)?.teacherId || '')?.name || 'Unknown Teacher',
    }));
    const studentGrades = (await GradeEntity.getByStudentId(c.env, studentId)).slice(0, 5);
    const gradeCourseIds = studentGrades.map(g => g.courseId);
    const gradeCourses = await Promise.all(gradeCourseIds.map(id => new CourseEntity(c.env, id).getState()));
    const gradeCoursesMap = new Map(gradeCourses.map(c => [c.id, c]));
    const recentGrades = studentGrades.map(grade => ({
      ...grade,
      courseName: gradeCoursesMap.get(grade.courseId)?.name || 'Unknown Course',
    }));
    const allAnnouncements = (await AnnouncementEntity.list(c.env)).items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const uniqueAuthorIds = Array.from(new Set(allAnnouncements.map(a => a.authorId)));
    const announcementAuthors = await Promise.all(uniqueAuthorIds.map(id => new UserEntity(c.env, id).getState()));
    const authorsMap = new Map(announcementAuthors.filter(a => a !== null).map(a => [a!.id, a!]));
    const announcements = allAnnouncements.slice(0, 5).map(ann => ({
      ...ann,
      authorName: authorsMap.get(ann.authorId)?.name || 'Unknown Author',
    }));
    const dashboardData: StudentDashboardData = { schedule, recentGrades, announcements };
    return ok(c, dashboardData);
  });

  app.get('/api/teachers/:id/classes', authenticate(), authorize('teacher'), async (c) => {
    const context = c as any;
    const userId = context.get('user').id;
    const requestedTeacherId = c.req.param('id');

    if (userId !== requestedTeacherId) {
      logger.warn('[AUTH] Teacher accessing another teacher data', { userId, requestedTeacherId });
      return forbidden(c, 'Access denied: Cannot access another teacher data');
    }

    const teacherId = c.req.param('id');
    const classes = await ClassEntity.getByTeacherId(c.env, teacherId);
    return ok(c, classes);
  });

  app.get('/api/classes/:id/students', authenticate(), authorize('teacher'), async (c) => {
    const classId = c.req.param('id');
    const classEntity = new ClassEntity(c.env, classId);
    const classState = await classEntity.getState();
    if (!classState) return notFound(c, 'Class not found');
    const teacher = await new UserEntity(c.env, classState.teacherId).getState() as Teacher;
    const teacherCourses = (await CourseEntity.getByTeacherId(c.env, teacher.id)).filter(course => teacher.classIds.includes(classId));
    const teacherCourseIds = new Set(teacherCourses.map(c => c.id));
    const students = await UserEntity.getByClassId(c.env, classId);

    const allStudentGrades = await Promise.all(
      students.map(s => GradeEntity.getByStudentId(c.env, s.id))
    );
    const gradesMap = new Map<string, Grade>();
    allStudentGrades.flat().forEach(grade => {
      const key = `${grade.studentId}:${grade.courseId}`;
      gradesMap.set(key, grade);
    });

    const studentsWithGrades = students.map(s => {
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

    return ok(c, studentsWithGrades);
  });

  app.put('/api/grades/:id', authenticate(), authorize('teacher'), async (c) => {
    const gradeId = c.req.param('id');
    const { score, feedback } = await c.req.json<{ score: number; feedback: string }>();
    if (gradeId === 'null' || !gradeId) return bad(c, 'Grade ID is required');
    const gradeEntity = new GradeEntity(c.env, gradeId);
    if (!await gradeEntity.exists()) return notFound(c, 'Grade not found');
    await gradeEntity.patch({ score, feedback });
    const updatedGrade = await gradeEntity.getState();

    await WebhookService.triggerEvent(c.env, 'grade.updated', updatedGrade as unknown as Record<string, unknown>);

    return ok(c, updatedGrade);
  });

  app.post('/api/grades', authenticate(), authorize('teacher'), async (c) => {
    const { studentId, courseId, score, feedback } = await c.req.json<Partial<Grade> & { studentId: string; courseId: string }>();
    if (!studentId || !courseId) return bad(c, 'studentId and courseId are required');

    const now = new Date().toISOString();
    const newGrade: Partial<Grade> & { id: string; createdAt: string; updatedAt: string } = {
      id: crypto.randomUUID(),
      studentId,
      courseId,
      score: score ?? 0,
      feedback: feedback ?? '',
      createdAt: now,
      updatedAt: now,
    };

    const validation = await ReferentialIntegrity.validateGrade(c.env, newGrade);
    if (!validation.valid) {
      return bad(c, validation.error!);
    }

    await GradeEntity.create(c.env, newGrade as Grade);

    await WebhookService.triggerEvent(c.env, 'grade.created', newGrade);

    return ok(c, newGrade);
  });

  app.get('/api/users', authenticate(), authorize('admin'), async (c) => {
    const { items: users } = await UserEntity.list(c.env);
    const usersWithoutPasswords = users.map(({ passwordHash: _, ...rest }) => rest);
    return ok(c, usersWithoutPasswords);
  });

  app.post('/api/users', authenticate(), authorize('admin'), async (c) => {
    const userData = await c.req.json<CreateUserData>();
    const now = new Date().toISOString();
    const base = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, avatarUrl: '' };

    let passwordHash = null;
    if (userData.password) {
      const { hash } = await hashPassword(userData.password);
      passwordHash = hash;
    }

    let newUser: SchoolUser;
    if (userData.role === 'student') {
      newUser = { ...base, ...userData, role: 'student', classId: userData.classId ?? '', studentIdNumber: userData.studentIdNumber ?? '', passwordHash };
    } else if (userData.role === 'teacher') {
      newUser = { ...base, ...userData, role: 'teacher', classIds: userData.classIds ?? [], passwordHash };
    } else if (userData.role === 'parent') {
      newUser = { ...base, ...userData, role: 'parent', childId: userData.childId ?? '', passwordHash };
    } else {
      newUser = { ...base, ...userData, role: 'admin', passwordHash };
    }

    await UserEntity.create(c.env, newUser);

    await WebhookService.triggerEvent(c.env, 'user.created', newUser as unknown as Record<string, unknown>);

    return ok(c, newUser);
  });

  app.put('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');
    const userData = await c.req.json<UpdateUserData>();
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'User not found');

    let updateData: Partial<SchoolUser> = userData;

    if (userData.password) {
      const { hash } = await hashPassword(userData.password);
      updateData = { ...userData, passwordHash: hash };
      delete (updateData as any).password;
    }

    await userEntity.patch(updateData);
    const updatedUser = await userEntity.getState();

    await WebhookService.triggerEvent(c.env, 'user.updated', updatedUser as unknown as Record<string, unknown>);

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return ok(c, userWithoutPassword);
  });

  app.delete('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');
    const warnings = await ReferentialIntegrity.checkDependents(c.env, 'user', userId);
    if (warnings.length > 0) {
      return ok(c, { id: userId, deleted: false, warnings });
    }
    const user = await new UserEntity(c.env, userId).getState();
    const deleted = await UserEntity.delete(c.env, userId);

    if (deleted && user) {
      await WebhookService.triggerEvent(c.env, 'user.deleted', { id: userId, role: user.role } as Record<string, unknown>);
    }

    return ok(c, { id: userId, deleted, warnings: [] });
  });
}