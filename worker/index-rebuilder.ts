import { SecondaryIndex, Index, UserDateSortedIndex, type Env } from "./core-utils";
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity, WebhookConfigEntity, WebhookEventEntity, WebhookDeliveryEntity, DeadLetterQueueWebhookEntity, MessageEntity } from "./entities";
import { NewsEntity } from "./entities/PublicContentEntity";
import { isStudent } from './type-guards';
import { CompoundSecondaryIndex } from "./storage/CompoundSecondaryIndex";
import { DateSortedSecondaryIndex } from "./storage/DateSortedSecondaryIndex";
import { StudentDateSortedIndex } from "./storage/StudentDateSortedIndex";

export async function rebuildAllIndexes(env: Env): Promise<void> {
  await rebuildUserIndexes(env);
  await rebuildClassIndexes(env);
  await rebuildCourseIndexes(env);
  await rebuildGradeIndexes(env);
  await rebuildAnnouncementIndexes(env);
  await rebuildWebhookConfigIndexes(env);
  await rebuildWebhookEventIndexes(env);
  await rebuildWebhookDeliveryIndexes(env);
  await rebuildDeadLetterQueueIndexes(env);
  await rebuildMessageIndexes(env);
  await rebuildPublicContentIndexes(env);
}

async function rebuildUserIndexes(env: Env): Promise<void> {
  const roleIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'role');
  const classIdIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'classId');
  const emailIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'email');
  
  await roleIndex.clear();
  await classIdIndex.clear();
  await emailIndex.clear();
  
  const { items: users } = await UserEntity.list(env);
  const validUsers = users.filter(u => !u.deletedAt);
  
  await roleIndex.addBatch(validUsers.map(u => ({ fieldValue: u.role, entityId: u.id })));
  await emailIndex.addBatch(validUsers.map(u => ({ fieldValue: u.email, entityId: u.id })));
  
  const classIdItems = validUsers
    .filter(u => isStudent(u))
    .map(u => ({ fieldValue: u.classId, entityId: u.id }));
  if (classIdItems.length > 0) {
    await classIdIndex.addBatch(classIdItems);
  }
}

async function rebuildClassIndexes(env: Env): Promise<void> {
  const teacherIdIndex = new SecondaryIndex<string>(env, ClassEntity.entityName, 'teacherId');
  
  await teacherIdIndex.clear();
  
  const { items: classes } = await ClassEntity.list(env);
  const validClasses = classes.filter(c => !c.deletedAt);
  await teacherIdIndex.addBatch(validClasses.map(c => ({ fieldValue: c.teacherId, entityId: c.id })));
}

async function rebuildCourseIndexes(env: Env): Promise<void> {
  const teacherIdIndex = new SecondaryIndex<string>(env, CourseEntity.entityName, 'teacherId');
  
  await teacherIdIndex.clear();
  
  const { items: courses } = await CourseEntity.list(env);
  const validCourses = courses.filter(c => !c.deletedAt);
  await teacherIdIndex.addBatch(validCourses.map(c => ({ fieldValue: c.teacherId, entityId: c.id })));
}

async function rebuildGradeIndexes(env: Env): Promise<void> {
  const studentIdIndex = new SecondaryIndex<string>(env, GradeEntity.entityName, 'studentId');
  const courseIdIndex = new SecondaryIndex<string>(env, GradeEntity.entityName, 'courseId');
  const compoundIndex = new CompoundSecondaryIndex(env, GradeEntity.entityName, ['studentId', 'courseId']);

  await studentIdIndex.clear();
  await courseIdIndex.clear();
  await compoundIndex.clear();

  const { items: grades } = await GradeEntity.list(env);
  const validGrades = grades.filter(g => !g.deletedAt);
  
  await studentIdIndex.addBatch(validGrades.map(g => ({ fieldValue: g.studentId, entityId: g.id })));
  await courseIdIndex.addBatch(validGrades.map(g => ({ fieldValue: g.courseId, entityId: g.id })));
  await compoundIndex.addBatch(validGrades.map(g => ({ fieldValues: [g.studentId, g.courseId], entityId: g.id })));

  const gradesByStudent = new Map<string, typeof grades>();
  for (const grade of validGrades) {
    const studentGrades = gradesByStudent.get(grade.studentId) || [];
    studentGrades.push(grade);
    gradesByStudent.set(grade.studentId, studentGrades);
  }

  await Promise.all(
    Array.from(gradesByStudent.entries()).map(async ([studentId, studentGrades]) => {
      const studentDateIndex = new StudentDateSortedIndex(env, GradeEntity.entityName, studentId);
      await studentDateIndex.clear();
      await studentDateIndex.addBatch(studentGrades.map(g => ({ date: g.createdAt, entityId: g.id })));
    })
  );
}

async function rebuildAnnouncementIndexes(env: Env): Promise<void> {
  const authorIdIndex = new SecondaryIndex<string>(env, AnnouncementEntity.entityName, 'authorId');
  const targetRoleIndex = new SecondaryIndex<string>(env, AnnouncementEntity.entityName, 'targetRole');
  const dateIndex = new DateSortedSecondaryIndex(env, AnnouncementEntity.entityName);

  await authorIdIndex.clear();
  await targetRoleIndex.clear();
  await dateIndex.clear();

  const { items: announcements } = await AnnouncementEntity.list(env);
  const validAnnouncements = announcements.filter(a => !a.deletedAt);
  
  await authorIdIndex.addBatch(validAnnouncements.map(a => ({ fieldValue: a.authorId, entityId: a.id })));
  await targetRoleIndex.addBatch(validAnnouncements.map(a => ({ fieldValue: a.targetRole, entityId: a.id })));
  await dateIndex.addBatch(validAnnouncements.map(a => ({ date: a.date, entityId: a.id })));
}

async function rebuildWebhookConfigIndexes(env: Env): Promise<void> {
  const activeIndex = new SecondaryIndex<string>(env, WebhookConfigEntity.entityName, 'active');

  await activeIndex.clear();

  const { items: configs } = await WebhookConfigEntity.list(env);
  const validConfigs = configs.filter(c => !c.deletedAt);
  await activeIndex.addBatch(validConfigs.map(c => ({ fieldValue: c.active.toString(), entityId: c.id })));
}

async function rebuildWebhookEventIndexes(env: Env): Promise<void> {
  const processedIndex = new SecondaryIndex<string>(env, WebhookEventEntity.entityName, 'processed');
  const eventTypeIndex = new SecondaryIndex<string>(env, WebhookEventEntity.entityName, 'eventType');

  await processedIndex.clear();
  await eventTypeIndex.clear();

  const { items: events } = await WebhookEventEntity.list(env);
  const validEvents = events.filter(e => !e.deletedAt);
  
  await processedIndex.addBatch(validEvents.map(e => ({ fieldValue: e.processed.toString(), entityId: e.id })));
  await eventTypeIndex.addBatch(validEvents.map(e => ({ fieldValue: e.eventType, entityId: e.id })));
}

async function rebuildWebhookDeliveryIndexes(env: Env): Promise<void> {
  const statusIndex = new SecondaryIndex<string>(env, WebhookDeliveryEntity.entityName, 'status');
  const eventIdIndex = new SecondaryIndex<string>(env, WebhookDeliveryEntity.entityName, 'eventId');
  const webhookConfigIdIndex = new SecondaryIndex<string>(env, WebhookDeliveryEntity.entityName, 'webhookConfigId');
  const idempotencyKeyIndex = new SecondaryIndex<string>(env, WebhookDeliveryEntity.entityName, 'idempotencyKey');
  const dateIndex = new DateSortedSecondaryIndex(env, WebhookDeliveryEntity.entityName);

  await statusIndex.clear();
  await eventIdIndex.clear();
  await webhookConfigIdIndex.clear();
  await idempotencyKeyIndex.clear();
  await dateIndex.clear();

  const { items: deliveries } = await WebhookDeliveryEntity.list(env);
  const validDeliveries = deliveries.filter(d => !d.deletedAt);
  
  await statusIndex.addBatch(validDeliveries.map(d => ({ fieldValue: d.status, entityId: d.id })));
  await eventIdIndex.addBatch(validDeliveries.map(d => ({ fieldValue: d.eventId, entityId: d.id })));
  await webhookConfigIdIndex.addBatch(validDeliveries.map(d => ({ fieldValue: d.webhookConfigId, entityId: d.id })));
  
  const idempotencyItems = validDeliveries
    .filter(d => d.idempotencyKey)
    .map(d => ({ fieldValue: d.idempotencyKey!, entityId: d.id }));
  if (idempotencyItems.length > 0) {
    await idempotencyKeyIndex.addBatch(idempotencyItems);
  }
  
  await dateIndex.addBatch(validDeliveries.map(d => ({ date: d.createdAt, entityId: d.id })));
}

async function rebuildDeadLetterQueueIndexes(env: Env): Promise<void> {
  const webhookConfigIdIndex = new SecondaryIndex<string>(env, DeadLetterQueueWebhookEntity.entityName, 'webhookConfigId');
  const eventTypeIndex = new SecondaryIndex<string>(env, DeadLetterQueueWebhookEntity.entityName, 'eventType');

  await webhookConfigIdIndex.clear();
  await eventTypeIndex.clear();

  const { items: dlqItems } = await DeadLetterQueueWebhookEntity.list(env);
  const validItems = dlqItems.filter(i => !i.deletedAt);
  
  await webhookConfigIdIndex.addBatch(validItems.map(i => ({ fieldValue: i.webhookConfigId, entityId: i.id })));
  await eventTypeIndex.addBatch(validItems.map(i => ({ fieldValue: i.eventType, entityId: i.id })));
}

async function rebuildMessageIndexes(env: Env): Promise<void> {
  const senderIdIndex = new SecondaryIndex<string>(env, MessageEntity.entityName, 'senderId');
  const recipientIdIndex = new SecondaryIndex<string>(env, MessageEntity.entityName, 'recipientId');
  const parentMessageIdIndex = new SecondaryIndex<string>(env, MessageEntity.entityName, 'parentMessageId');
  const recipientIsReadCompoundIndex = new CompoundSecondaryIndex(env, MessageEntity.entityName, ['recipientId', 'isRead']);

  await senderIdIndex.clear();
  await recipientIdIndex.clear();
  await parentMessageIdIndex.clear();
  await recipientIsReadCompoundIndex.clear();

  const { items: messages } = await MessageEntity.list(env, undefined, undefined, true);
  const validMessages = messages.filter(m => !m.deletedAt);
  
  await senderIdIndex.addBatch(validMessages.map(m => ({ fieldValue: m.senderId, entityId: m.id })));
  await recipientIdIndex.addBatch(validMessages.map(m => ({ fieldValue: m.recipientId, entityId: m.id })));
  
  const parentMessageItems = validMessages
    .filter(m => m.parentMessageId)
    .map(m => ({ fieldValue: m.parentMessageId!, entityId: m.id }));
  if (parentMessageItems.length > 0) {
    await parentMessageIdIndex.addBatch(parentMessageItems);
  }
  
  await recipientIsReadCompoundIndex.addBatch(validMessages.map(m => ({ fieldValues: [m.recipientId, m.isRead.toString()], entityId: m.id })));
  
  const messagesBySender = new Map<string, typeof validMessages>();
  const messagesByRecipient = new Map<string, typeof validMessages>();
  
  for (const message of validMessages) {
    const senderMessages = messagesBySender.get(message.senderId) || [];
    senderMessages.push(message);
    messagesBySender.set(message.senderId, senderMessages);
    
    const recipientMessages = messagesByRecipient.get(message.recipientId) || [];
    recipientMessages.push(message);
    messagesByRecipient.set(message.recipientId, recipientMessages);
  }

  await Promise.all([
    ...Array.from(messagesBySender.entries()).map(async ([senderId, senderMessages]) => {
      const sentDateIndex = new UserDateSortedIndex(env, MessageEntity.entityName, senderId, 'sent');
      await sentDateIndex.clear();
      await sentDateIndex.addBatch(senderMessages.map(m => ({ date: m.createdAt, entityId: m.id })));
    }),
    ...Array.from(messagesByRecipient.entries()).map(async ([recipientId, recipientMessages]) => {
      const receivedDateIndex = new UserDateSortedIndex(env, MessageEntity.entityName, recipientId, 'received');
      await receivedDateIndex.clear();
      await receivedDateIndex.addBatch(recipientMessages.map(m => ({ date: m.createdAt, entityId: m.id })));
    })
  ]);
}

async function rebuildPublicContentIndexes(env: Env): Promise<void> {
  const newsDateIndex = new DateSortedSecondaryIndex(env, NewsEntity.entityName);

  await newsDateIndex.clear();

  const { items: newsItems } = await NewsEntity.list(env);
  const validNewsItems = newsItems.filter(n => !n.deletedAt && n.date);
  
  await newsDateIndex.addBatch(validNewsItems.map(n => ({ date: n.date, entityId: n.id })));
}
