import type { Env } from "../core-utils";
import { UserEntity } from "./UserEntity";
import { ClassEntity } from "./ClassEntity";
import { CourseEntity } from "./CourseEntity";
import { GradeEntity } from "./GradeEntity";
import { AnnouncementEntity } from "./AnnouncementEntity";
import { ScheduleEntity } from "./ScheduleEntity";
import { hashPassword } from "../password-utils";

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
