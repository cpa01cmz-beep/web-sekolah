import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecondaryIndex } from '../SecondaryIndex';

describe('SecondaryIndex', () => {
  let mockEnv: any;
  let mockStub: any;
  let index: SecondaryIndex<string>;

  beforeEach(() => {
    mockStub = {
      casPut: vi.fn().mockResolvedValue({ ok: true, v: 1 }),
      del: vi.fn().mockResolvedValue(true),
      listPrefix: vi.fn().mockResolvedValue({ keys: [], next: null }),
      getDoc: vi.fn().mockResolvedValue({ v: 1, data: { entityId: 'entity-1' } }),
    };

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    };

    index = new SecondaryIndex(mockEnv, 'test-entity', 'testField');
  });

  describe('constructor', () => {
    it('should initialize with correct entity name', () => {
      expect(index['entityName']).toBe('sys-secondary-index');
    });

    it('should initialize with correct ID pattern', () => {
      expect(index['_id']).toBe('secondary-index:test-entity:testField');
    });

    it('should create stub with correct instance name', () => {
      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-secondary-index:secondary-index:test-entity:testField'
      );
    });

    it('should create stub with different entity names', () => {
      const userIndex = new SecondaryIndex(mockEnv, 'UserEntity', 'role');
      expect(userIndex['_id']).toBe('secondary-index:UserEntity:role');
      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-secondary-index:secondary-index:UserEntity:role'
      );
    });
  });

  describe('add', () => {
    it('should add entry with correct key pattern', async () => {
      await index.add('field-value', 'entity-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'field:field-value:entity:entity-123',
        0,
        { entityId: 'entity-123' }
      );
    });

    it('should add entry with empty field value', async () => {
      await index.add('', 'entity-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'field::entity:entity-123',
        0,
        { entityId: 'entity-123' }
      );
    });

    it('should add entry with special characters in field value', async () => {
      await index.add('value:with:colons', 'entity-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'field:value:with:colons:entity:entity-123',
        0,
        { entityId: 'entity-123' }
      );
    });

    it('should add entry with numeric field value', async () => {
      await index.add('12345', 'entity-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'field:12345:entity:entity-123',
        0,
        { entityId: 'entity-123' }
      );
    });

    it('should add multiple entries with different field values', async () => {
      await index.add('value1', 'entity-1');
      await index.add('value2', 'entity-2');
      await index.add('value3', 'entity-3');

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
      expect(mockStub.casPut).toHaveBeenNthCalledWith(1,
        'field:value1:entity:entity-1', 0, { entityId: 'entity-1' });
      expect(mockStub.casPut).toHaveBeenNthCalledWith(2,
        'field:value2:entity:entity-2', 0, { entityId: 'entity-2' });
      expect(mockStub.casPut).toHaveBeenNthCalledWith(3,
        'field:value3:entity:entity-3', 0, { entityId: 'entity-3' });
    });
  });

  describe('remove', () => {
    it('should remove entry with correct key', async () => {
      await index.remove('field-value', 'entity-123');

      expect(mockStub.del).toHaveBeenCalledWith(
        'field:field-value:entity:entity-123'
      );
    });

    it('should return true when removal succeeds', async () => {
      mockStub.del.mockResolvedValue(true);
      const result = await index.remove('field-value', 'entity-123');

      expect(result).toBe(true);
    });

    it('should return false when removal fails', async () => {
      mockStub.del.mockResolvedValue(false);
      const result = await index.remove('field-value', 'entity-123');

      expect(result).toBe(false);
    });

    it('should remove entry with empty field value', async () => {
      await index.remove('', 'entity-123');

      expect(mockStub.del).toHaveBeenCalledWith(
        'field::entity:entity-123'
      );
    });

    it('should remove multiple entries', async () => {
      await index.remove('value1', 'entity-1');
      await index.remove('value2', 'entity-2');

      expect(mockStub.del).toHaveBeenCalledTimes(2);
      expect(mockStub.del).toHaveBeenNthCalledWith(1, 'field:value1:entity:entity-1');
      expect(mockStub.del).toHaveBeenNthCalledWith(2, 'field:value2:entity:entity-2');
    });
  });

  describe('getByValue', () => {
    beforeEach(() => {
      mockStub.listPrefix = vi.fn().mockResolvedValue({
        keys: ['field:testValue:entity:entity-1', 'field:testValue:entity:entity-2'],
        next: null
      });
      mockStub.getDoc = vi.fn()
        .mockResolvedValueOnce({ v: 1, data: { entityId: 'entity-1' } })
        .mockResolvedValueOnce({ v: 1, data: { entityId: 'entity-2' } });
    });

    it('should return array of entity IDs for given field value', async () => {
      const result = await index.getByValue('testValue');

      expect(result).toEqual(['entity-1', 'entity-2']);
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:testValue:entity:');
    });

    it('should return empty array when no entries exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      const result = await index.getByValue('nonexistent-value');

      expect(result).toEqual([]);
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:nonexistent-value:entity:');
    });

    it('should handle single entry', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:single:entity:entity-1'],
        next: null
      });
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: { entityId: 'entity-1' } });

      const result = await index.getByValue('single');

      expect(result).toEqual(['entity-1']);
    });

    it('should filter out documents without entityId', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:test:entity:entity-1', 'field:test:entity:entity-2'],
        next: null
      });
      mockStub.getDoc = vi.fn()
        .mockResolvedValueOnce({ v: 1, data: { entityId: 'entity-1' } })
        .mockResolvedValueOnce({ v: 1, data: { otherField: 'value' } });

      const result = await index.getByValue('test');

      expect(result).toEqual(['entity-1']);
    });

    it('should handle null document', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:test:entity:entity-1', 'field:test:entity:entity-2'],
        next: null
      });
      mockStub.getDoc = vi.fn()
        .mockResolvedValueOnce({ v: 1, data: { entityId: 'entity-1' } })
        .mockResolvedValueOnce(null);

      const result = await index.getByValue('test');

      expect(result).toEqual(['entity-1']);
    });
  });

  describe('clearValue', () => {
    beforeEach(() => {
      mockStub.listPrefix = vi.fn().mockResolvedValue({
        keys: [
          'field:testValue:entity:entity-1',
          'field:testValue:entity:entity-2',
          'field:testValue:entity:entity-3'
        ],
        next: null
      });
    });

    it('should clear all entries for a given field value', async () => {
      await index.clearValue('testValue');

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:testValue:entity:');
      expect(mockStub.del).toHaveBeenCalledTimes(3);
      expect(mockStub.del).toHaveBeenNthCalledWith(1, 'field:testValue:entity:entity-1');
      expect(mockStub.del).toHaveBeenNthCalledWith(2, 'field:testValue:entity:entity-2');
      expect(mockStub.del).toHaveBeenNthCalledWith(3, 'field:testValue:entity:entity-3');
    });

    it('should handle empty field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field::entity:entity-1'], next: null });

      await index.clearValue('');

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field::entity:');
      expect(mockStub.del).toHaveBeenCalledTimes(1);
    });

    it('should handle no entries for field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      await index.clearValue('nonexistent-value');

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:nonexistent-value:entity:');
      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should clear all deletions concurrently', async () => {
      await index.clearValue('testValue');

      expect(mockStub.del).toHaveBeenCalledTimes(3);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      mockStub.listPrefix = vi.fn().mockResolvedValue({
        keys: [
          'field:value1:entity:entity-1',
          'field:value2:entity:entity-2',
          'field:value3:entity:entity-3',
          'field:value4:entity:entity-4',
          'field:value5:entity:entity-5'
        ],
        next: null
      });
    });

    it('should clear all entries in the index', async () => {
      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:');
      expect(mockStub.del).toHaveBeenCalledTimes(5);
    });

    it('should handle empty index', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:');
      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should handle single entry index', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['field:value1:entity:entity-1'],
        next: null
      });

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:');
      expect(mockStub.del).toHaveBeenCalledTimes(1);
    });

    it('should clear all deletions concurrently', async () => {
      await index.clear();

      expect(mockStub.del).toHaveBeenCalledTimes(5);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockStub = {
        casPut: vi.fn().mockResolvedValue({ ok: true, v: 1 }),
        del: vi.fn().mockResolvedValue(true),
        listPrefix: vi.fn().mockResolvedValue({ keys: [], next: null }),
        getDoc: vi.fn().mockResolvedValue({ v: 1, data: { entityId: 'entity-1' } }),
      };
      mockEnv.GlobalDurableObject.get = vi.fn().mockReturnValue(mockStub);
      index = new SecondaryIndex(mockEnv, 'test-entity', 'testField');
    });

    it('should support complete add-query-remove lifecycle', async () => {
      mockStub.listPrefix = vi.fn().mockResolvedValue({
        keys: ['field:role:student:entity:student-1'],
        next: null
      });
      mockStub.getDoc.mockResolvedValueOnce({ v: 1, data: { entityId: 'student-1' } });

      await index.add('role:student', 'student-1');
      const results = await index.getByValue('role:student');
      expect(results).toEqual(['student-1']);

      const removed = await index.remove('role:student', 'student-1');
      expect(removed).toBe(true);
    });

    it('should handle multiple concurrent operations', async () => {
      const operations = [
        index.add('value1', 'entity-1'),
        index.add('value2', 'entity-2'),
        index.add('value3', 'entity-3')
      ];

      await Promise.all(operations);

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
    });
  });
});
