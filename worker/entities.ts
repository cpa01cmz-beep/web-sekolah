import { IndexedEntity, Index, SecondaryIndex, type Env } from "./core-utils";
import type { SchoolUser, SchoolClass, Course, Grade, Announcement, ScheduleItem, SchoolData, UserRole, Student, WebhookConfig, WebhookEvent, WebhookDelivery, DeadLetterQueueWebhook } from "@shared/types";
import { hashPassword } from "./password-utils";
import { CompoundSecondaryIndex } from "./storage/CompoundSecondaryIndex";
import { DateSortedSecondaryIndex } from "./storage/DateSortedSecondaryIndex";
import { seedData } from "./seed-data";
import { StudentDateSortedIndex } from "./storage/StudentDateSortedIndex";

// Entity Classes Documentation
// =============================
// This file defines all Durable Object entities with their query methods and indexing strategies.
//
// Indexing Strategies:
// 1. Primary Index: ID-based lookups (inherited from IndexedEntity)
// 2. Secondary Index: Field-based lookups for O(1) queries (e.g., getByEmail, getByRole)
// 3. CompoundSecondaryIndex: Multi-field composite keys for efficient joint queries (e.g., getByStudentIdAndCourseId)
// 4. DateSortedSecondaryIndex: Reverse chronological order for recent items (e.g., getRecent announcements)
// 5. StudentDateSortedIndex: Per-student date-sorted index for recent grades
//
// All entity methods automatically filter out soft-deleted records (deletedAt != null).
// Use createWith* and deleteWith* methods when compound/date indexes are involved.

export class UserEntity extends IndexedEntity<SchoolUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: SchoolUser = { id: "", name: "", email: "", role: 'admin', avatarUrl: '', passwordHash: null, createdAt: '', updatedAt: '', deletedAt: null };
  static seedData = seedData.users;

  static async getByRole(env: Env, role: UserRole): Promise<SchoolUser[]> {
    return this.getBySecondaryIndex(env, 'role', role);
  }

  static async getByClassId(env: Env, classId: string): Promise<Student[]> {
    const users = await this.getBySecondaryIndex(env, 'classId', classId);
    return users.filter((u): u is Student => u.role === 'student' && u.classId === classId);
  }

  static async getByEmail(env: Env, email: string): Promise<SchoolUser | null> {
    const users = await this.getBySecondaryIndex(env, 'email', email);
    return users.length > 0 ? users[0] : null;
  }
}

export class ClassEntity extends IndexedEntity<SchoolClass> {
  static readonly entityName = "class";
  static readonly indexName = "classes";
  static readonly initialState: SchoolClass = { id: "", name: "", teacherId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.classes;

  static async getByTeacherId(env: Env, teacherId: string): Promise<SchoolClass[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}

export class CourseEntity extends IndexedEntity<Course> {
  static readonly entityName = "course";
  static readonly indexName = "courses";
  static readonly initialState: Course = { id: "", name: "", teacherId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.courses;

  static async getByTeacherId(env: Env, teacherId: string): Promise<Course[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}

// Grade Entity with Compound and Date-Sorted Indexing
// =================================================
// GradeEntity uses advanced indexing patterns:
// - CompoundSecondaryIndex: O(1) lookups by (studentId, courseId)
// - StudentDateSortedIndex: Per-student chronological ordering for recent grades
// Use createWithAllIndexes/deleteWithAllIndexes to maintain both indexes.

export class GradeEntity extends IndexedEntity<Grade> {
  static readonly entityName = "grade";
  static readonly indexName = "grades";
  static readonly initialState: Grade = { id: "", studentId: "", courseId: "", score: 0, feedback: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.grades;

  static async getByStudentId(env: Env, studentId: string): Promise<Grade[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'studentId');
    const gradeIds = await index.getByValue(studentId);
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async getByCourseId(env: Env, courseId: string): Promise<Grade[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'courseId');
    const gradeIds = await index.getByValue(courseId);
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async getByStudentIdAndCourseId(env: Env, studentId: string, courseId: string): Promise<Grade | null> {
    // Use CompoundSecondaryIndex for O(1) lookup instead of O(n) filter
    const index = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    const gradeIds = await index.getByValues([studentId, courseId]);
    if (gradeIds.length === 0) {
      return null;
    }
    const grades = await Promise.all(gradeIds.map(id => new this(env, id).getState()));
    const validGrade = grades.find(g => g && !g.deletedAt);
    return validGrade || null;
  }

  static async createWithCompoundIndex(env: Env, state: Grade): Promise<Grade> {
    // Create grade and add to compound index for efficient studentId+courseId lookups
    const created = await super.create(env, state);
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.add([state.studentId, state.courseId], state.id);
    return created;
  }

  static async deleteWithCompoundIndex(env: Env, id: string): Promise<boolean> {
    // Delete grade and remove from compound index
    const inst = new this(env, id);
    const state = await inst.getState() as Grade | null;
    if (!state) return false;

    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.remove([state.studentId, state.courseId], id);
    return await super.delete(env, id);
  }

  static async getRecentForStudent(env: Env, studentId: string, limit: number): Promise<Grade[]> {
    // Use StudentDateSortedIndex to get N most recent grades for a student
    // Returns only 'limit' grades instead of loading all grades for the student
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, studentId);
    const recentGradeIds = await dateIndex.getRecent(limit);
    if (recentGradeIds.length === 0) {
      return [];
    }
    const grades = await Promise.all(recentGradeIds.map(id => new this(env, id).getState()));
    return grades.filter(g => g && !g.deletedAt) as Grade[];
  }

  static async createWithAllIndexes(env: Env, state: Grade): Promise<Grade> {
    // Create grade and add to both compound and date-sorted indexes
    // Use this method when both compound index and date-sorted index are needed
    const created = await super.create(env, state);
    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.add([state.studentId, state.courseId], state.id);
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, state.studentId);
    await dateIndex.add(state.createdAt, state.id);
    return created;
  }

  static async deleteWithAllIndexes(env: Env, id: string): Promise<boolean> {
    // Delete grade and remove from both compound and date-sorted indexes
    // Use this method when both indexes were used during creation
    const inst = new this(env, id);
    const state = await inst.getState() as Grade | null;
    if (!state) return false;

    const compoundIndex = new CompoundSecondaryIndex(env, this.entityName, ['studentId', 'courseId']);
    await compoundIndex.remove([state.studentId, state.courseId], id);
    const dateIndex = new StudentDateSortedIndex(env, this.entityName, state.studentId);
    await dateIndex.remove(state.createdAt, id);
    return await super.delete(env, id);
  }
}

// Announcement Entity with Date-Sorted Indexing
// ===========================================
// AnnouncementEntity uses DateSortedSecondaryIndex for chronological ordering.
// This enables efficient "recent N announcements" queries without sorting in memory.

export class AnnouncementEntity extends IndexedEntity<Announcement> {
  static readonly entityName = "announcement";
  static readonly indexName = "announcements";
  static readonly initialState: Announcement = { id: "", title: "", content: "", date: "", authorId: "", targetRole: "all", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.announcements;

  static async getByAuthorId(env: Env, authorId: string): Promise<Announcement[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'authorId');
    const announcementIds = await index.getByValue(authorId);
    const announcements = await Promise.all(announcementIds.map(id => new this(env, id).getState()));
    return announcements.filter(a => a && !a.deletedAt) as Announcement[];
  }

  static async getByTargetRole(env: Env, targetRole: string): Promise<Announcement[]> {
    // Returns both role-specific announcements AND global ('all') announcements
    // Teachers/admins post with targetRole='all' for global visibility
    const specificRoleAnnouncements = await this.getBySecondaryIndex(env, 'targetRole', targetRole);
    const allAnnouncements = await this.getBySecondaryIndex(env, 'targetRole', 'all');
    return [...specificRoleAnnouncements, ...allAnnouncements];
  }

  static async getRecent(env: Env, limit: number): Promise<Announcement[]> {
    // Use DateSortedSecondaryIndex to get N most recent announcements
    // O(n) retrieval instead of O(n log n) sorting all announcements
    const index = new DateSortedSecondaryIndex(env, this.entityName);
    const recentIds = await index.getRecent(limit);
    if (recentIds.length === 0) {
      return [];
    }
    const announcements = await Promise.all(recentIds.map(id => new this(env, id).getState()));
    return announcements.filter(a => a && !a.deletedAt) as Announcement[];
  }

  static async createWithDateIndex(env: Env, state: Announcement): Promise<Announcement> {
    // Create announcement and add to date-sorted index for chronological queries
    const created = await super.create(env, state);
    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.add(state.date, state.id);
    return created;
  }

  static async deleteWithDateIndex(env: Env, id: string): Promise<boolean> {
    // Delete announcement and remove from date-sorted index
    const inst = new this(env, id);
    const state = await inst.getState() as Announcement | null;
    if (!state) return false;

    const dateIndex = new DateSortedSecondaryIndex(env, this.entityName);
    await dateIndex.remove(state.date, id);
    return await super.delete(env, id);
  }
}

export type ClassScheduleState = {id: string;items: ScheduleItem[];};

export class ScheduleEntity extends IndexedEntity<ClassScheduleState> {
  static readonly entityName = "schedule";
  static readonly indexName = "schedules";
  static readonly initialState: ClassScheduleState = { id: "", items: [] };
  static seedData = seedData.classes.map((c) => ({
    id: c.id,
    items: seedData.schedules.filter((s) => s.classId === c.id)
  }));
}

// Seed Data Initialization
// ======================
// ensureAllSeedData initializes all entities and sets default passwords.
// Throws error in production environment to prevent default passwords in production.

export async function ensureAllSeedData(env: Env) {
  await UserEntity.ensureSeed(env);
  await ClassEntity.ensureSeed(env);
  await CourseEntity.ensureSeed(env);
  await GradeEntity.ensureSeed(env);
  await AnnouncementEntity.ensureSeed(env);
  await ScheduleEntity.ensureSeed(env);

  const { items: users } = await UserEntity.list(env);

  if (env.ENVIRONMENT === 'production') {
    throw new Error('Cannot set default passwords in production environment. Users must set passwords through password reset flow.');
  }

  const defaultPassword = 'password123';

  for (const user of users) {
    if (!user.passwordHash) {
      const { hash } = await hashPassword(defaultPassword);
      const entity = new UserEntity(env, user.id);
      await entity.patch({ passwordHash: hash });
    }
  }
}

// Webhook Entities for Event-Driven Architecture
// ==========================================
// Webhook entities implement a reliable webhook delivery system with:
// - WebhookConfigEntity: Configuration for webhook endpoints
// - WebhookEventEntity: Event queue for processing
// - WebhookDeliveryEntity: Delivery tracking with retry logic
// - DeadLetterQueueWebhookEntity: Failed webhook storage

export class WebhookConfigEntity extends IndexedEntity<WebhookConfig> {
  static readonly entityName = "webhookConfig";
  static readonly indexName = "webhookConfigs";
  static readonly initialState: WebhookConfig = {
    id: "",
    url: "",
    events: [],
    secret: "",
    active: false,
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static async getActive(env: Env): Promise<WebhookConfig[]> {
    return this.getBySecondaryIndex(env, 'active', 'true');
  }

  static async getByEventType(env: Env, eventType: string): Promise<WebhookConfig[]> {
    // Get all active webhooks that subscribe to a specific event type
    const activeConfigs = await this.getActive(env);
    return activeConfigs.filter(c => c.events.includes(eventType));
  }
}

export class WebhookEventEntity extends IndexedEntity<WebhookEvent> {
  static readonly entityName = "webhookEvent";
  static readonly indexName = "webhookEvents";
  static readonly initialState: WebhookEvent = {
    id: "",
    eventType: "",
    data: {},
    processed: false,
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static async getPending(env: Env): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'processed', 'false');
  }

  static async getByEventType(env: Env, eventType: string): Promise<WebhookEvent[]> {
    return this.getBySecondaryIndex(env, 'eventType', eventType);
  }
}

export class WebhookDeliveryEntity extends IndexedEntity<WebhookDelivery> {
  static readonly entityName = "webhookDelivery";
  static readonly indexName = "webhookDeliveries";
  static readonly initialState: WebhookDelivery = {
    id: "",
    eventId: "",
    webhookConfigId: "",
    status: "pending",
    attempts: 0,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    idempotencyKey: undefined
  };

  static async getPendingRetries(env: Env): Promise<WebhookDelivery[]> {
    // Get deliveries that are pending AND ready for retry (nextAttemptAt <= now)
    const pendingDeliveries = await this.getBySecondaryIndex(env, 'status', 'pending');
    const now = new Date().toISOString();
    return pendingDeliveries.filter(
      d => d.nextAttemptAt && d.nextAttemptAt <= now
    );
  }

  static async getByIdempotencyKey(env: Env, idempotencyKey: string): Promise<WebhookDelivery | null> {
    // Find existing delivery by idempotency key to prevent duplicate deliveries
    // Critical for ensuring exactly-once delivery semantics
    const index = new SecondaryIndex<string>(env, this.entityName, 'idempotencyKey');
    const deliveryIds = await index.getByValue(idempotencyKey);
    if (deliveryIds.length === 0) return null;
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    const validDelivery = deliveries.find(d => d && !d.deletedAt);
    return validDelivery || null;
  }

  static async getByEventId(env: Env, eventId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventId');
    const deliveryIds = await index.getByValue(eventId);
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    return deliveries.filter(d => d && !d.deletedAt) as WebhookDelivery[];
  }

  static async getByWebhookConfigId(env: Env, webhookConfigId: string): Promise<WebhookDelivery[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'webhookConfigId');
    const deliveryIds = await index.getByValue(webhookConfigId);
    const deliveries = await Promise.all(deliveryIds.map(id => new this(env, id).getState()));
    return deliveries.filter(d => d && !d.deletedAt) as WebhookDelivery[];
  }
}

export class DeadLetterQueueWebhookEntity extends IndexedEntity<DeadLetterQueueWebhook> {
  static readonly entityName = "deadLetterQueueWebhook";
  static readonly indexName = "deadLetterQueueWebhooks";
  static readonly initialState: DeadLetterQueueWebhook = {
    id: "",
    eventId: "",
    webhookConfigId: "",
    eventType: "",
    url: "",
    payload: {},
    status: 0,
    attempts: 0,
    errorMessage: "",
    failedAt: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: null
  };

  static async getAllFailed(env: Env): Promise<DeadLetterQueueWebhook[]> {
    const result = await this.list(env);
    return result.items;
  }

  static async getByWebhookConfigId(env: Env, webhookConfigId: string): Promise<DeadLetterQueueWebhook[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'webhookConfigId');
    const dlqIds = await index.getByValue(webhookConfigId);
    const dlqItems = await Promise.all(dlqIds.map(id => new this(env, id).getState()));
    return dlqItems.filter(d => d && !d.deletedAt) as DeadLetterQueueWebhook[];
  }

  static async getByEventType(env: Env, eventType: string): Promise<DeadLetterQueueWebhook[]> {
    const index = new SecondaryIndex<string>(env, this.entityName, 'eventType');
    const dlqIds = await index.getByValue(eventType);
    const dlqItems = await Promise.all(dlqIds.map(id => new this(env, id).getState()));
    return dlqItems.filter(d => d && !d.deletedAt) as DeadLetterQueueWebhook[];
  }
}
