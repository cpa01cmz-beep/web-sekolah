import type { ScheduleItem } from "@shared/types";
import { IndexedEntity } from "../core-utils";
import { seedData } from "../seed-data";

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
