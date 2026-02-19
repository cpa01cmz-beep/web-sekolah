import { SecondaryIndex, Index, UserDateSortedIndex, type Env } from "./core-utils";
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity, WebhookConfigEntity, WebhookEventEntity, WebhookDeliveryEntity, DeadLetterQueueWebhookEntity, MessageEntity } from "./entities";
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
}

async function rebuildUserIndexes(env: Env): Promise<void> {
  const roleIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'role');
  const classIdIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'classId');
  const emailIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'email');
  
  await roleIndex.clear();
  await classIdIndex.clear();
  await emailIndex.clear();
  
  const { items: users } = await UserEntity.list(env);
  for (const user of users) {
    if (user.deletedAt) continue;
    await roleIndex.add(user.role, user.id);
    if (isStudent(user)) {
      await classIdIndex.add(user.classId, user.id);
    }
    await emailIndex.add(user.email, user.id);
  }
}

async function rebuildClassIndexes(env: Env): Promise<void> {
  const teacherIdIndex = new SecondaryIndex<string>(env, ClassEntity.entityName, 'teacherId');
  
  await teacherIdIndex.clear();
  
  const { items: classes } = await ClassEntity.list(env);
  for (const cls of classes) {
    if (cls.deletedAt) continue;
    await teacherIdIndex.add(cls.teacherId, cls.id);
  }
}

async function rebuildCourseIndexes(env: Env): Promise<void> {
  const teacherIdIndex = new SecondaryIndex<string>(env, CourseEntity.entityName, 'teacherId');
  
  await teacherIdIndex.clear();
  
  const { items: courses } = await CourseEntity.list(env);
  for (const course of courses) {
    if (course.deletedAt) continue;
    await teacherIdIndex.add(course.teacherId, course.id);
  }
}

async function rebuildGradeIndexes(env: Env): Promise<void> {
  const studentIdIndex = new SecondaryIndex<string>(env, GradeEntity.entityName, 'studentId');
  const courseIdIndex = new SecondaryIndex<string>(env, GradeEntity.entityName, 'courseId');
  const compoundIndex = new CompoundSecondaryIndex(env, GradeEntity.entityName, ['studentId', 'courseId']);

  await studentIdIndex.clear();
  await courseIdIndex.clear();
  await compoundIndex.clear();

  const { items: grades } = await GradeEntity.list(env);
  for (const grade of grades) {
    if (grade.deletedAt) continue;
    await studentIdIndex.add(grade.studentId, grade.id);
    await courseIdIndex.add(grade.courseId, grade.id);
    await compoundIndex.add([grade.studentId, grade.courseId], grade.id);
  }

  const gradesByStudent = new Map<string, typeof grades>();
  for (const grade of grades) {
    if (grade.deletedAt) continue;
    const studentGrades = gradesByStudent.get(grade.studentId) || [];
    studentGrades.push(grade);
    gradesByStudent.set(grade.studentId, studentGrades);
  }

  for (const [studentId, studentGrades] of gradesByStudent) {
    const studentDateIndex = new StudentDateSortedIndex(env, GradeEntity.entityName, studentId);
    await studentDateIndex.clear();
    for (const grade of studentGrades) {
      await studentDateIndex.add(grade.createdAt, grade.id);
    }
  }
}

async function rebuildAnnouncementIndexes(env: Env): Promise<void> {
  const authorIdIndex = new SecondaryIndex<string>(env, AnnouncementEntity.entityName, 'authorId');
  const targetRoleIndex = new SecondaryIndex<string>(env, AnnouncementEntity.entityName, 'targetRole');
  const dateIndex = new DateSortedSecondaryIndex(env, AnnouncementEntity.entityName);

  await authorIdIndex.clear();
  await targetRoleIndex.clear();
  await dateIndex.clear();

  const { items: announcements } = await AnnouncementEntity.list(env);
  for (const announcement of announcements) {
    if (announcement.deletedAt) continue;
    await authorIdIndex.add(announcement.authorId, announcement.id);
    await targetRoleIndex.add(announcement.targetRole, announcement.id);
    await dateIndex.add(announcement.date, announcement.id);
  }
}

async function rebuildWebhookConfigIndexes(env: Env): Promise<void> {
  const activeIndex = new SecondaryIndex<string>(env, WebhookConfigEntity.entityName, 'active');

  await activeIndex.clear();

  const { items: configs } = await WebhookConfigEntity.list(env);
  for (const config of configs) {
    if (config.deletedAt) continue;
    await activeIndex.add(config.active.toString(), config.id);
  }
}

async function rebuildWebhookEventIndexes(env: Env): Promise<void> {
  const processedIndex = new SecondaryIndex<string>(env, WebhookEventEntity.entityName, 'processed');
  const eventTypeIndex = new SecondaryIndex<string>(env, WebhookEventEntity.entityName, 'eventType');

  await processedIndex.clear();
  await eventTypeIndex.clear();

  const { items: events } = await WebhookEventEntity.list(env);
  for (const event of events) {
    if (event.deletedAt) continue;
    await processedIndex.add(event.processed.toString(), event.id);
    await eventTypeIndex.add(event.eventType, event.id);
  }
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
  for (const delivery of deliveries) {
    if (delivery.deletedAt) continue;
    await statusIndex.add(delivery.status, delivery.id);
    await eventIdIndex.add(delivery.eventId, delivery.id);
    await webhookConfigIdIndex.add(delivery.webhookConfigId, delivery.id);
    if (delivery.idempotencyKey) {
      await idempotencyKeyIndex.add(delivery.idempotencyKey, delivery.id);
    }
    await dateIndex.add(delivery.createdAt, delivery.id);
  }
}

async function rebuildDeadLetterQueueIndexes(env: Env): Promise<void> {
  const webhookConfigIdIndex = new SecondaryIndex<string>(env, DeadLetterQueueWebhookEntity.entityName, 'webhookConfigId');
  const eventTypeIndex = new SecondaryIndex<string>(env, DeadLetterQueueWebhookEntity.entityName, 'eventType');

  await webhookConfigIdIndex.clear();
  await eventTypeIndex.clear();

  const { items: dlqItems } = await DeadLetterQueueWebhookEntity.list(env);
  for (const item of dlqItems) {
    if (item.deletedAt) continue;
    await webhookConfigIdIndex.add(item.webhookConfigId, item.id);
    await eventTypeIndex.add(item.eventType, item.id);
  }
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
  
  const messagesBySender = new Map<string, typeof messages>();
  const messagesByRecipient = new Map<string, typeof messages>();
  
  for (const message of messages) {
    if (message.deletedAt) continue;
    await senderIdIndex.add(message.senderId, message.id);
    await recipientIdIndex.add(message.recipientId, message.id);
    if (message.parentMessageId) {
      await parentMessageIdIndex.add(message.parentMessageId, message.id);
    }
    await recipientIsReadCompoundIndex.add([message.recipientId, message.isRead.toString()], message.id);
    
    const senderMessages = messagesBySender.get(message.senderId) || [];
    senderMessages.push(message);
    messagesBySender.set(message.senderId, senderMessages);
    
    const recipientMessages = messagesByRecipient.get(message.recipientId) || [];
    recipientMessages.push(message);
    messagesByRecipient.set(message.recipientId, recipientMessages);
  }

  for (const [senderId, senderMessages] of messagesBySender) {
    const sentDateIndex = new UserDateSortedIndex(env, MessageEntity.entityName, senderId, 'sent');
    await sentDateIndex.clear();
    for (const message of senderMessages) {
      await sentDateIndex.add(message.createdAt, message.id);
    }
  }

  for (const [recipientId, recipientMessages] of messagesByRecipient) {
    const receivedDateIndex = new UserDateSortedIndex(env, MessageEntity.entityName, recipientId, 'received');
    await receivedDateIndex.clear();
    for (const message of recipientMessages) {
      await receivedDateIndex.add(message.createdAt, message.id);
    }
  }
}
