import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, isStr } from './core-utils';
import {
  UserEntity,
  ClassEntity,
  CourseEntity,
  GradeEntity,
  AnnouncementEntity,
  ScheduleEntity,
  ensureAllSeedData
} from "./entities";
import type { Grade, SchoolUser, Student, StudentDashboardData, Teacher } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- SEED ENDPOINT ---
  app.post('/api/seed', async (c) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  });
  // --- STUDENT PORTAL ---
  app.get('/api/students/:id/dashboard', async (c) => {
    const studentId = c.req.param('id');
    const student = new UserEntity(c.env, studentId);
    const studentState = await student.getState() as Student;
    if (!studentState || studentState.role !== 'student') {
      return notFound(c, 'Student not found');
    }
    // Fetch schedule
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
    // Fetch recent grades
    const allGrades = (await GradeEntity.list(c.env)).items;
    const studentGrades = allGrades.filter(g => g.studentId === studentId).slice(0, 5);
    const gradeCourseIds = studentGrades.map(g => g.courseId);
    const gradeCourses = await Promise.all(gradeCourseIds.map(id => new CourseEntity(c.env, id).getState()));
    const gradeCoursesMap = new Map(gradeCourses.map(c => [c.id, c]));
    const recentGrades = studentGrades.map(grade => ({
      ...grade,
      courseName: gradeCoursesMap.get(grade.courseId)?.name || 'Unknown Course',
    }));
    // Fetch announcements
    const allAnnouncements = (await AnnouncementEntity.list(c.env)).items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const announcementAuthors = await Promise.all(allAnnouncements.map(a => new UserEntity(c.env, a.authorId).getState()));
    const authorsMap = new Map(announcementAuthors.map(a => [a.id, a]));
    const announcements = allAnnouncements.slice(0, 5).map(ann => ({
      ...ann,
      authorName: authorsMap.get(ann.authorId)?.name || 'Unknown Author',
    }));
    const dashboardData: StudentDashboardData = { schedule, recentGrades, announcements };
    return ok(c, dashboardData);
  });
  // --- TEACHER PORTAL ---
  app.get('/api/teachers/:id/classes', async (c) => {
    const teacherId = c.req.param('id');
    const classes = (await ClassEntity.list(c.env)).items.filter(c => c.teacherId === teacherId);
    return ok(c, classes);
  });
  app.get('/api/classes/:id/students', async (c) => {
    const classId = c.req.param('id');
    const classEntity = new ClassEntity(c.env, classId);
    const classState = await classEntity.getState();
    if (!classState) return notFound(c, 'Class not found');
    const teacher = await new UserEntity(c.env, classState.teacherId).getState() as Teacher;
    const teacherCourses = (await CourseEntity.list(c.env)).items.filter(course => teacher.classIds.includes(classId) && course.teacherId === teacher.id);
    const teacherCourseIds = new Set(teacherCourses.map(c => c.id));
    const allUsers = (await UserEntity.list(c.env)).items;
    const students = allUsers.filter(u => u.role === 'student' && (u as Student).classId === classId);
    const allGrades = (await GradeEntity.list(c.env)).items;
    const studentsWithGrades = students.map(s => {
      const studentGrades = allGrades.filter(g => g.studentId === s.id && teacherCourseIds.has(g.courseId));
      // For simplicity, we'll just show the first grade found for a relevant course.
      const relevantGrade = studentGrades[0];
      return {
        id: s.id,
        name: s.name,
        score: relevantGrade?.score ?? null,
        feedback: relevantGrade?.feedback ?? '',
        gradeId: relevantGrade?.id ?? null, // Pass the gradeId to the frontend
      };
    });
    return ok(c, studentsWithGrades);
  });
  app.put('/api/grades/:id', async (c) => {
    const gradeId = c.req.param('id');
    const { score, feedback } = await c.req.json<{ score: number; feedback: string }>();
    if (gradeId === 'null' || !gradeId) return bad(c, 'Grade has not been created yet. Cannot update.');
    const gradeEntity = new GradeEntity(c.env, gradeId);
    if (!await gradeEntity.exists()) return notFound(c, 'Grade not found');
    await gradeEntity.patch({ score, feedback });
    return ok(c, await gradeEntity.getState());
  });
  app.post('/api/grades', async (c) => {
    const { studentId, courseId, score, feedback } = await c.req.json<Partial<Grade> & { studentId: string; courseId: string }>();
    if (!studentId || !courseId) return bad(c, 'studentId and courseId are required');
    const newGrade: Grade = {
      id: crypto.randomUUID(),
      studentId,
      courseId,
      score: score ?? 0,
      feedback: feedback ?? '',
    };
    await GradeEntity.create(c.env, newGrade);
    return ok(c, newGrade);
  });
  // --- ADMIN PORTAL ---
  app.get('/api/users', async (c) => {
    return ok(c, (await UserEntity.list(c.env)).items);
  });
  app.post('/api/users', async (c) => {
    const userData = await c.req.json<Omit<SchoolUser, 'id'>>();
    const newUser: SchoolUser = { ...userData, id: crypto.randomUUID() };
    await UserEntity.create(c.env, newUser);
    return ok(c, newUser);
  });
  app.put('/api/users/:id', async (c) => {
    const userId = c.req.param('id');
    const userData = await c.req.json<Partial<SchoolUser>>();
    const userEntity = new UserEntity(c.env, userId);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    await userEntity.patch(userData);
    return ok(c, await userEntity.getState());
  });
  app.delete('/api/users/:id', async (c) => {
    const userId = c.req.param('id');
    const deleted = await UserEntity.delete(c.env, userId);
    return ok(c, { id: userId, deleted });
  });
}