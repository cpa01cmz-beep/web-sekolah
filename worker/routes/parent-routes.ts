import { Hono } from "hono";
import type { Env } from '../core-utils';
import { ok, notFound, bad } from '../core-utils';
import { ParentDashboardService, CommonDataService, getRoleSpecificFields } from '../domain';
import { withUserValidation, withErrorHandler, withAuth, triggerWebhookSafely } from './route-utils';
import { MessageEntity, CourseEntity } from '../entities';
import type { Context } from 'hono';
import type { Message, CreateMessageData } from '@shared/types';
import { getCurrentUserId } from '../type-guards';
import { validateBody } from '../middleware/validation';
import { createMessageSchema } from '../middleware/schemas';

export function parentRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/parents/:id/dashboard', ...withUserValidation('parent', 'dashboard'), withErrorHandler('get parent dashboard')(async (c: Context) => {
    const requestedParentId = c.req.param('id');
    try {
      const dashboardData = await ParentDashboardService.getDashboardData(c.env, requestedParentId);
      return ok(c, dashboardData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('no associated child')) {
        return notFound(c, errorMessage);
      }
      throw error;
    }
  }));

  app.get('/api/parents/:id/schedule', ...withUserValidation('parent', 'schedule'), withErrorHandler('get parent schedule')(async (c: Context) => {
    const requestedParentId = c.req.param('id');
    const parent = await CommonDataService.getUserById(c.env, requestedParentId);

    if (!parent) {
      return notFound(c, 'Parent not found');
    }

    if (parent.role !== 'parent') {
      return notFound(c, 'Parent not found');
    }

    const roleFields = getRoleSpecificFields(parent);

    if (!roleFields.childId) {
      return notFound(c, 'Parent has no associated child');
    }

    const { schedule } = await CommonDataService.getStudentWithClassAndSchedule(c.env, roleFields.childId);

    if (!schedule) {
      return ok(c, []);
    }

    return ok(c, schedule.items || []);
  }));

  app.get('/api/parents/:id/messages', ...withUserValidation('parent', 'messages'), withErrorHandler('get parent messages')(async (c: Context) => {
    const parentId = c.req.param('id');
    const type = c.req.query('type') || 'inbox';
    
    let messages: Message[];
    if (type === 'sent') {
      messages = await MessageEntity.getRecentForSender(c.env, parentId);
    } else {
      messages = await MessageEntity.getRecentForRecipient(c.env, parentId);
    }
    
    return ok(c, messages);
  }));

  app.get('/api/parents/:id/messages/unread-count', ...withUserValidation('parent', 'messages'), withErrorHandler('get parent unread count')(async (c: Context) => {
    const parentId = c.req.param('id');
    const count = await MessageEntity.countUnread(c.env, parentId);
    return ok(c, { count });
  }));

  app.get('/api/parents/:id/messages/:teacherId/conversation', ...withUserValidation('parent', 'messages'), withErrorHandler('get parent conversation')(async (c: Context) => {
    const parentId = c.req.param('id');
    const teacherId = c.req.param('teacherId');
    const conversation = await MessageEntity.getConversation(c.env, parentId, teacherId);
    return ok(c, conversation.filter(msg => !msg.deletedAt));
  }));

  app.post('/api/parents/:id/messages', ...withAuth('parent'), validateBody(createMessageSchema), withErrorHandler('send parent message')(async (c: Context) => {
    const parentId = getCurrentUserId(c);
    const body = c.get('validatedBody') as CreateMessageData;
    const { recipientId, subject, content, parentMessageId } = body;

    const recipient = await CommonDataService.getUserById(c.env, recipientId);
    if (!recipient || recipient.role !== 'teacher') {
      return bad(c, 'Invalid recipient. Parents can only message teachers.');
    }

    const message = await MessageEntity.createWithAllIndexes(c.env, {
      id: crypto.randomUUID(),
      senderId: parentId,
      senderRole: 'parent',
      recipientId,
      recipientRole: 'teacher',
      subject,
      content,
      isRead: false,
      parentMessageId: parentMessageId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    });

    triggerWebhookSafely(c.env, 'message.created', message, { messageId: message.id });

    return ok(c, message);
  }));

  app.post('/api/parents/:id/messages/:messageId/read', ...withAuth('parent'), withErrorHandler('mark parent message read')(async (c: Context) => {
    const messageId = c.req.param('messageId');
    const parentId = getCurrentUserId(c);
    const message = await MessageEntity.markAsRead(c.env, messageId);
    if (!message) {
      return notFound(c, 'Message not found');
    }
    triggerWebhookSafely(c.env, 'message.read', { id: message.id, readAt: message.updatedAt, readBy: parentId }, { messageId: message.id });
    return ok(c, message);
  }));

  app.get('/api/parents/:id/teachers', ...withUserValidation('parent', 'messages'), withErrorHandler('get child teachers')(async (c: Context) => {
    const parentId = c.req.param('id');
    const parent = await CommonDataService.getUserById(c.env, parentId);

    if (!parent || parent.role !== 'parent') {
      return notFound(c, 'Parent not found');
    }

    const roleFields = getRoleSpecificFields(parent);
    if (!roleFields.childId) {
      return notFound(c, 'Parent has no associated child');
    }

    const { classData, schedule } = await CommonDataService.getStudentWithClassAndSchedule(c.env, roleFields.childId);
    
    if (!classData) {
      return ok(c, []);
    }

    const teacherIds = new Set<string>();
    if (schedule && schedule.items) {
      for (const item of schedule.items) {
        const courseEntity = new CourseEntity(c.env, item.courseId);
        const course = await courseEntity.getState();
        if (course && course.teacherId) {
          teacherIds.add(course.teacherId);
        }
      }
    }

    const teachers = await Promise.all(
      Array.from(teacherIds).map(id => CommonDataService.getUserById(c.env, id))
    );

    return ok(c, teachers.filter(t => t !== null));
  }));
}
