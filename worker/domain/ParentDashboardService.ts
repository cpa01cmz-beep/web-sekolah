import type { Env } from '../core-utils';
import { UserEntity, ClassEntity } from '../entities';
import type { ParentDashboardData, Student, ScheduleItem } from '@shared/types';
import { getRoleSpecificFields } from '../type-guards';
import { CommonDataService } from './CommonDataService';
import { DisplayStrings } from '../constants';

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

    const child = await this.getChild(env, roleFields.childId);
    const childSchedule = await this.getChildSchedule(env, roleFields.childId);
    const childGrades = await CommonDataService.getRecentGradesWithCourseNames(env, roleFields.childId, 10);
    const announcements = await CommonDataService.getAnnouncementsWithAuthorNames(env, 5);

    return { child, childSchedule, childGrades, announcements };
  }

  private static async getChild(env: Env, childId: string): Promise<Student & { className: string }> {
    const childEntity = new UserEntity(env, childId);
    const childState = await childEntity.getState();

    if (!childState || childState.role !== 'student') {
      throw new Error('Child not found');
    }

    const childRoleFields = getRoleSpecificFields(childState);

    let className = DisplayStrings.NOT_AVAILABLE;
    if (childRoleFields.classId) {
      const classEntity = new ClassEntity(env, childRoleFields.classId);
      const classState = await classEntity.getState();
      className = classState?.name || DisplayStrings.NOT_AVAILABLE;
    }

    const { passwordHash: _, ...childWithoutPassword } = childState;
    return {
      ...childWithoutPassword,
      className
    } as Student & { className: string };
  }

  private static async getChildSchedule(env: Env, childId: string): Promise<(ScheduleItem & { courseName: string; teacherName: string })[]> {
    const childEntity = new UserEntity(env, childId);
    const childState = await childEntity.getState();

    if (!childState || childState.role !== 'student') {
      return [];
    }

    const childRoleFields = getRoleSpecificFields(childState);

    if (!childRoleFields.classId) {
      return [];
    }

    return CommonDataService.getScheduleWithDetails(env, childRoleFields.classId);
  }
}