import { SecondaryIndex, Index, type Env } from "./core-utils";
import { UserEntity, ClassEntity, CourseEntity, GradeEntity, AnnouncementEntity } from "./entities";

export async function rebuildAllIndexes(env: Env): Promise<void> {
  await rebuildUserIndexes(env);
  await rebuildClassIndexes(env);
  await rebuildCourseIndexes(env);
  await rebuildGradeIndexes(env);
  await rebuildAnnouncementIndexes(env);
}

async function rebuildUserIndexes(env: Env): Promise<void> {
  const roleIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'role');
  const classIdIndex = new SecondaryIndex<string>(env, UserEntity.entityName, 'classId');
  
  await roleIndex.clear();
  await classIdIndex.clear();
  
  const { items: users } = await UserEntity.list(env);
  for (const user of users) {
    if (user.deletedAt) continue;
    await roleIndex.add(user.role, user.id);
    if (user.role === 'student') {
      await classIdIndex.add((user as any).classId, user.id);
    }
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
  
  await studentIdIndex.clear();
  await courseIdIndex.clear();
  
  const { items: grades } = await GradeEntity.list(env);
  for (const grade of grades) {
    if (grade.deletedAt) continue;
    await studentIdIndex.add(grade.studentId, grade.id);
    await courseIdIndex.add(grade.courseId, grade.id);
  }
}

async function rebuildAnnouncementIndexes(env: Env): Promise<void> {
  const authorIdIndex = new SecondaryIndex<string>(env, AnnouncementEntity.entityName, 'authorId');
  
  await authorIdIndex.clear();
  
  const { items: announcements } = await AnnouncementEntity.list(env);
  for (const announcement of announcements) {
    if (announcement.deletedAt) continue;
    await authorIdIndex.add(announcement.authorId, announcement.id);
  }
}
