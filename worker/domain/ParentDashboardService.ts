import type { Env } from '../core-utils';
import { UserEntity, ClassEntity } from '../entities';
import type { ParentDashboardData, Student, ScheduleItem, SchoolUser } from '@shared/types';
import { getRoleSpecificFields } from '../type-guards';
import { CommonDataService } from './CommonDataService';

export class ParentDashboardService {
  static async getDashboardData(env: Env, parentId: string): Promise<ParentDashboardData> {
    const parent = new UserEntity(env, parentId);
    const parentState = await parent.getState();

    if (!parentState || parentState.role !== 'parent') {
      throw new Error('Parent not found');
    }

    const roleFields = getRoleSpecificFields(parentState);

    if (!roleFields.childId) {
      throw new Error('Parent has no associated child');
    }

    const childEntity = new UserEntity(env, roleFields.childId);
    const childState = await childEntity.getState();

    if (!childState || childState.role !== 'student') {
      throw new Error('Child not found');
    }

    const childRoleFields = getRoleSpecificFields(childState);

    const [child, childSchedule, childGrades, announcements] = await Promise.all([
      this.getChildWithClass(env, childState, childRoleFields.classId),
      childRoleFields.classId ? CommonDataService.getScheduleWithDetails(env, childRoleFields.classId) : Promise.resolve([]),
      CommonDataService.getRecentGradesWithCourseNames(env, roleFields.childId, 10),
      CommonDataService.getAnnouncementsWithAuthorNames(env, 5),
    ]);

    return { child, childSchedule, childGrades, announcements };
  }

  private static async getChildWithClass(env: Env, childState: SchoolUser, classId?: string): Promise<Student & { className: string }> {
    let className = 'N/A';
    if (classId) {
      const classEntity = new ClassEntity(env, classId);
      const classState = await classEntity.getState();
      className = classState?.name || 'N/A';
    }

    const { passwordHash: _, ...childWithoutPassword } = childState;
    return {
      ...childWithoutPassword,
      className
    } as Student & { className: string };
  }
}