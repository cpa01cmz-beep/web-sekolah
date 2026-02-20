import type { Env } from '../types';
import { BaseDateSortedIndex } from './BaseDateSortedIndex';

export class DateSortedSecondaryIndex extends BaseDateSortedIndex {
  static readonly entityName = "sys-date-sorted-index";

  constructor(env: Env, entityName: string) {
    super(env, `date-sorted-index:${entityName}`);
  }
}
