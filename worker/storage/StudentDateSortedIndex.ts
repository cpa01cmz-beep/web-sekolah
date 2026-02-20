import type { Env } from '../types';
import { BaseDateSortedIndex } from './BaseDateSortedIndex';

export class StudentDateSortedIndex extends BaseDateSortedIndex {
  static readonly entityName = "sys-student-date-sorted-index";

  constructor(env: Env, entityName: string, private studentId: string) {
    super(env, `student-date-sorted-index:${entityName}:${studentId}`);
  }
}
