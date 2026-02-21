import { BaseSecondaryIndex } from './BaseSecondaryIndex';

export class SecondaryIndex<T extends string> extends BaseSecondaryIndex {
  static readonly entityName = 'sys-secondary-index';
  protected readonly keyPrefix = 'field:';

  constructor(env: Env, entityName: string, fieldName: string) {
    super(env, `secondary-index:${entityName}:${fieldName}`);
  }

  protected buildFieldKey(fieldValues: string[]): string {
    return `field:${fieldValues[0]}:entity:`;
  }

  protected buildFieldValueKey(fieldValues: string[], entityId: string): string {
    return `field:${fieldValues[0]}:entity:${entityId}`;
  }

  async add(fieldValue: string, entityId: T): Promise<void> {
    await super.add([fieldValue], entityId);
  }

  async addBatch(items: Array<{ fieldValue: string; entityId: T }>): Promise<void> {
    if (items.length === 0) return;
    await Promise.all(
      items.map(({ fieldValue, entityId }) => {
        const key = `field:${fieldValue}:entity:${entityId}`;
        return this.stub.casPut(key, 0, { entityId });
      })
    );
  }

  async remove(fieldValue: string, entityId: T): Promise<boolean> {
    return await super.remove([fieldValue], entityId);
  }

  async removeBatch(items: Array<{ fieldValue: string; entityId: T }>): Promise<number> {
    if (items.length === 0) return 0;
    const results = await Promise.all(
      items.map(({ fieldValue, entityId }) => {
        const key = `field:${fieldValue}:entity:${entityId}`;
        return this.stub.del(key);
      })
    );
    return results.filter(Boolean).length;
  }

  async getByValue(fieldValue: string): Promise<T[]> {
    return super.getByValues([fieldValue]) as Promise<T[]>;
  }

  async countByValue(fieldValue: string): Promise<number> {
    return super.countByValues([fieldValue]);
  }

  async existsByValue(fieldValue: string): Promise<boolean> {
    return super.existsByValues([fieldValue]);
  }

  async clearValue(fieldValue: string): Promise<void> {
    return super.clearValues([fieldValue]);
  }
}
