import { IndexedEntity, SecondaryIndex, type Env } from "../core-utils";
import type { SchoolClass } from "@shared/types";
import { seedData } from "../seed-data";

export class ClassEntity extends IndexedEntity<SchoolClass> {
  static readonly entityName = "class";
  static readonly indexName = "classes";
  static readonly initialState: SchoolClass = { id: "", name: "", teacherId: "", createdAt: "", updatedAt: "", deletedAt: null };
  static seedData = seedData.classes;

  static readonly secondaryIndexes = [
    { fieldName: 'teacherId', getValue: (state: { id: string; }) => (state as SchoolClass).teacherId }
  ];

  static async getByTeacherId(env: Env, teacherId: string): Promise<SchoolClass[]> {
    return this.getBySecondaryIndex(env, 'teacherId', teacherId);
  }
}
