import type { Env } from '../types';
import { BaseDateSortedIndex } from './BaseDateSortedIndex';

export class UserDateSortedIndex extends BaseDateSortedIndex {
  static readonly entityName = 'sys-user-date-sorted-index';

  constructor(
    env: Env,
    entityName: string,
    private userId: string,
    private indexType: 'sent' | 'received'
  ) {
    super(env, `user-date-sorted-index:${entityName}:${userId}:${indexType}`);
  }
}
