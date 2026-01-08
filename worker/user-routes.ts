import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, forbidden } from './core-utils';
import {
  UserEntity,
  ClassEntity,
  AnnouncementEntity,
  ScheduleEntity,
  ensureAllSeedData
} from "./entities";
import { rebuildAllIndexes } from "./index-rebuilder";
import { authenticate, authorize } from './middleware/auth';
import type { 
  Grade, 
  CreateUserData, 
  UpdateUserData, 
  StudentDashboardData,
  StudentCardData,
  TeacherDashboardData,
  ParentDashboardData,
  AdminDashboardData,
  SchoolUser,
  UserFilters,
  Announcement,
  CreateAnnouncementData,
  Settings,
  SubmitGradeData
} from "@shared/types";
import { logger } from './logger';
import { WebhookService } from './webhook-service';
import { StudentDashboardService, TeacherService, GradeService, UserService, ParentDashboardService } from './domain';
import { getAuthUser, getRoleSpecificFields } from './type-guards';
import type { Context } from 'hono';

function validateUserAccess(
  c: Context,
  userId: string,
  requestedId: string,
  role: string,
  resourceType: string = 'data'
): boolean {
  if (userId !== requestedId) {
    logger.warn(`[AUTH] ${role} accessing another ${role} ${resourceType}`, { userId, requestedId });
    forbidden(c, `Access denied: Cannot access another ${role} ${resourceType}`);
    return false;
  }
  return true;
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/seed', async (c) => {
    await ensureAllSeedData(c.env);
    return ok(c, { message: 'Database seeded successfully.' });
  });

  app.get('/api/students/:id/grades', authenticate(), authorize('student'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'grades')) {
      return;
    }

    const grades = await GradeService.getStudentGrades(c.env, requestedStudentId);
    return ok(c, grades);
  });

  app.get('/api/students/:id/schedule', authenticate(), authorize('student'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'schedule')) {
      return;
    }

    const studentEntity = new UserEntity(c.env, requestedStudentId);
    const student = await studentEntity.getState();
    if (!student || !student.classId) {
      return notFound(c, 'Student or class not found');
    }

    const classEntity = new ClassEntity(c.env, student.classId);
    const classState = await classEntity.getState();
    if (!classState) {
      return notFound(c, 'Class not found');
    }

    const scheduleEntity = new ScheduleEntity(c.env, student.classId);
    const scheduleState = await scheduleEntity.getState();
    const schedule = scheduleState?.items || [];

    return ok(c, schedule);
  });

  app.get('/api/students/:id/card', authenticate(), authorize('student'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'card')) {
      return;
    }

    const studentEntity = new UserEntity(c.env, requestedStudentId);
    const student = await studentEntity.getState();
    if (!student || student.role !== 'student') {
      return notFound(c, 'Student not found');
    }

    const studentRoleFields = getRoleSpecificFields(student);
    const classEntity = studentRoleFields.classId ? new ClassEntity(c.env, studentRoleFields.classId) : null;
    const classState = classEntity ? await classEntity.getState() : null;

    const grades = await GradeService.getStudentGrades(c.env, requestedStudentId);
    const averageScore = grades.length > 0 
      ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length 
      : 0;

    const cardData: StudentCardData = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      avatarUrl: student.avatarUrl || '',
      className: classState?.name || 'N/A',
      averageScore: Math.round(averageScore * 10) / 10,
      totalGrades: grades.length,
      gradeDistribution: {
        A: grades.filter(g => g.score >= 90).length,
        B: grades.filter(g => g.score >= 80 && g.score < 90).length,
        C: grades.filter(g => g.score >= 70 && g.score < 80).length,
        D: grades.filter(g => g.score >= 60 && g.score < 70).length,
        F: grades.filter(g => g.score < 60).length,
      },
      recentGrades: grades.slice(-5).reverse()
    };

    return ok(c, cardData);
  });

  app.post('/api/admin/rebuild-indexes', authenticate(), authorize('admin'), async (c) => {
    await rebuildAllIndexes(c.env);
    return ok(c, { message: 'All secondary indexes rebuilt successfully.' });
  });

  app.get('/api/teachers/:id/dashboard', authenticate(), authorize('teacher'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedTeacherId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedTeacherId, 'teacher', 'dashboard')) {
      return;
    }

    const teacherEntity = new UserEntity(c.env, requestedTeacherId);
    const teacher = await teacherEntity.getState();
    if (!teacher) {
      return notFound(c, 'Teacher not found');
    }

    const classes = await TeacherService.getClasses(c.env, requestedTeacherId);
    const totalStudents = await Promise.all(
      classes.map(async (cls) => {
        const students = await UserEntity.getByClassId(c.env, cls.id);
        return students.length;
      })
    ).then(counts => counts.reduce((sum, count) => sum + count, 0));

    const recentGrades = await GradeService.getCourseGrades(c.env, classes[0]?.id || '');
    const recentAnnouncements = await AnnouncementEntity.list(c.env);
    const filteredAnnouncements = recentAnnouncements.items
      .filter(a => a.targetRole === 'teacher' || a.targetRole === 'all')
      .slice(-5)
      .reverse();

    const dashboardData: TeacherDashboardData = {
      teacherId: teacher.id,
      name: teacher.name,
      email: teacher.email,
      totalClasses: classes.length,
      totalStudents: totalStudents,
      recentGrades: recentGrades.slice(-5).reverse(),
      recentAnnouncements: filteredAnnouncements
    };

    return ok(c, dashboardData);
  });

  app.get('/api/teachers/:id/announcements', authenticate(), authorize('teacher'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedTeacherId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedTeacherId, 'teacher', 'announcements')) {
      return;
    }

    const { items: allAnnouncements } = await AnnouncementEntity.list(c.env);
    const filteredAnnouncements = allAnnouncements.filter(a => 
      a.targetRole === 'teacher' || a.targetRole === 'all'
    );

    return ok(c, filteredAnnouncements);
  });

  app.post('/api/teachers/grades', authenticate(), authorize('teacher'), async (c) => {
    const gradeData = await c.req.json<SubmitGradeData>();

    try {
      const newGrade = await GradeService.createGrade(c.env, gradeData);
      await WebhookService.triggerEvent(c.env, 'grade.created', newGrade as unknown as Record<string, unknown>);
      return ok(c, newGrade);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });

  app.post('/api/teachers/announcements', authenticate(), authorize('teacher'), async (c) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const user = getAuthUser(c);

    const now = new Date().toISOString();
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: announcementData.title,
      content: announcementData.content,
      date: now,
      targetRole: announcementData.targetRole || 'all',
      targetClassIds: announcementData.targetClassIds || [],
      createdBy: user!.id,
      createdAt: now,
      updatedAt: now
    };

    await AnnouncementEntity.create(c.env, newAnnouncement.id, newAnnouncement);
    await WebhookService.triggerEvent(c.env, 'announcement.created', newAnnouncement as unknown as Record<string, unknown>);

    return ok(c, newAnnouncement);
  });

  app.get('/api/students/:id/dashboard', authenticate(), authorize('student'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedStudentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedStudentId, 'student', 'dashboard')) {
      return;
    }

    try {
      const dashboardData = await StudentDashboardService.getDashboardData(c.env, requestedStudentId);
      return ok(c, dashboardData);
    } catch (error) {
      if (error instanceof Error && error.message === 'Student not found') {
        return notFound(c, 'Student not found');
      }
      throw error;
    }
  });

  app.get('/api/parents/:id/dashboard', authenticate(), authorize('parent'), async (c) => {
    const user = getAuthUser(c);
    const userId = user!.id;
    const requestedParentId = c.req.param('id');

    if (!validateUserAccess(c, userId, requestedParentId, 'parent', 'dashboard')) {
      return;
    }

    try {
      const dashboardData = await ParentDashboardService.getDashboardData(c.env, requestedParentId);
      return ok(c, dashboardData);
    } catch (error) {
      if (error instanceof Error && error.message === 'Parent not found') {
        return notFound(c, 'Parent not found');
      }
      if (error instanceof Error && error.message === 'Child not found') {
        return notFound(c, 'Child not found');
      }
      if (error instanceof Error && error.message === 'Parent has no associated child') {
        return notFound(c, 'Parent has no associated child');
      }
      throw error;
    }
  });

  app.put('/api/grades/:id', authenticate(), authorize('teacher'), async (c) => {
    const gradeId = c.req.param('id');
    const { score, feedback } = await c.req.json<{ score: number; feedback: string }>();

    try {
      const updatedGrade = await GradeService.updateGrade(c.env, gradeId, { score, feedback });

      await WebhookService.triggerEvent(c.env, 'grade.updated', updatedGrade as unknown as Record<string, unknown>);

      return ok(c, updatedGrade);
    } catch (error) {
      if (error instanceof Error && error.message === 'Grade not found') {
        return notFound(c, 'Grade not found');
      }
      throw error;
    }
  });

  app.post('/api/grades', authenticate(), authorize('teacher'), async (c) => {
    const gradeData = await c.req.json<Partial<Grade> & { studentId: string; courseId: string }>();

    try {
      const newGrade = await GradeService.createGrade(c.env, gradeData);

      await WebhookService.triggerEvent(c.env, 'grade.created', newGrade as unknown as Record<string, unknown>);

      return ok(c, newGrade);
    } catch (error) {
      if (error instanceof Error) {
        return bad(c, error.message);
      }
      throw error;
    }
  });

  app.get('/api/users', authenticate(), authorize('admin'), async (c) => {
    const users = await UserService.getAllUsers(c.env);
    return ok(c, users);
  });

  app.post('/api/users', authenticate(), authorize('admin'), async (c) => {
    const userData = await c.req.json<CreateUserData>();

    const newUser = await UserService.createUser(c.env, userData);

    await WebhookService.triggerEvent(c.env, 'user.created', newUser as unknown as Record<string, unknown>);

    return ok(c, newUser);
  });

  app.put('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');
    const userData = await c.req.json<UpdateUserData>();

    try {
      const updatedUser = await UserService.updateUser(c.env, userId, userData);

      await WebhookService.triggerEvent(c.env, 'user.updated', updatedUser as unknown as Record<string, unknown>);

      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      return ok(c, userWithoutPassword);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return notFound(c, 'User not found');
      }
      throw error;
    }
  });

  app.delete('/api/users/:id', authenticate(), authorize('admin'), async (c) => {
    const userId = c.req.param('id');

    const user = await new UserEntity(c.env, userId).getState();
    const result = await UserService.deleteUser(c.env, userId);

    if (result.deleted && user) {
      await WebhookService.triggerEvent(c.env, 'user.deleted', { id: userId, role: user.role } as Record<string, unknown>);
    }

    return ok(c, result);
  });

  app.get('/api/admin/dashboard', authenticate(), authorize('admin'), async (c) => {
    const { items: allUsers } = await UserEntity.list(c.env);
    const { items: allClasses } = await ClassEntity.list(c.env);
    const { items: allAnnouncements } = await AnnouncementEntity.list(c.env);

    const dashboardData: AdminDashboardData = {
      totalUsers: allUsers.length,
      totalStudents: allUsers.filter(u => u.role === 'student').length,
      totalTeachers: allUsers.filter(u => u.role === 'teacher').length,
      totalParents: allUsers.filter(u => u.role === 'parent').length,
      totalClasses: allClasses.length,
      recentAnnouncements: allAnnouncements.slice(-5).reverse(),
      userDistribution: {
        students: allUsers.filter(u => u.role === 'student').length,
        teachers: allUsers.filter(u => u.role === 'teacher').length,
        parents: allUsers.filter(u => u.role === 'parent').length,
        admins: allUsers.filter(u => u.role === 'admin').length
      }
    };

    return ok(c, dashboardData);
  });

  app.get('/api/admin/users', authenticate(), authorize('admin'), async (c) => {
    const role = c.req.query('role');
    const classId = c.req.query('classId');
    const search = c.req.query('search');

    const { items: allUsers } = await UserEntity.list(c.env);

    let filteredUsers = allUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (classId) {
      filteredUsers = filteredUsers.filter(u => u.role === 'student' && 'classId' in u && u.classId === classId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    const usersWithoutPasswords = filteredUsers.map(u => {
      const { passwordHash: _, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    return ok(c, usersWithoutPasswords);
  });

  app.get('/api/admin/announcements', authenticate(), authorize('admin'), async (c) => {
    const { items: announcements } = await AnnouncementEntity.list(c.env);
    return ok(c, announcements);
  });

  app.post('/api/admin/announcements', authenticate(), authorize('admin'), async (c) => {
    const announcementData = await c.req.json<CreateAnnouncementData>();
    const user = getAuthUser(c);

    const now = new Date().toISOString();
    const newAnnouncement: Announcement = {
      id: crypto.randomUUID(),
      title: announcementData.title,
      content: announcementData.content,
      date: now,
      targetRole: announcementData.targetRole || 'all',
      targetClassIds: announcementData.targetClassIds || [],
      createdBy: user!.id,
      createdAt: now,
      updatedAt: now
    };

    await AnnouncementEntity.create(c.env, newAnnouncement.id, newAnnouncement);
    await WebhookService.triggerEvent(c.env, 'announcement.created', newAnnouncement as unknown as Record<string, unknown>);

    return ok(c, newAnnouncement);
  });

  app.get('/api/admin/settings', authenticate(), authorize('admin'), async (c) => {
    const settings: Settings = {
      schoolName: c.env.SCHOOL_NAME || 'SMA Negeri 1 Jakarta',
      academicYear: c.env.ACADEMIC_YEAR || '2024-2025',
      semester: parseInt(c.env.SEMESTER || '1'),
      allowRegistration: c.env.ALLOW_REGISTRATION === 'true',
      maintenanceMode: c.env.MAINTENANCE_MODE === 'true'
    };

    return ok(c, settings);
  });

  app.put('/api/admin/settings', authenticate(), authorize('admin'), async (c) => {
    const updates = await c.req.json<Partial<Settings>>();
    const updatedSettings: Settings = {
      schoolName: updates.schoolName || c.env.SCHOOL_NAME || 'SMA Negeri 1 Jakarta',
      academicYear: updates.academicYear || c.env.ACADEMIC_YEAR || '2024-2025',
      semester: updates.semester ?? parseInt(c.env.SEMESTER || '1'),
      allowRegistration: updates.allowRegistration ?? c.env.ALLOW_REGISTRATION === 'true',
      maintenanceMode: updates.maintenanceMode ?? c.env.MAINTENANCE_MODE === 'true'
    };

    return ok(c, updatedSettings);
  });
}
