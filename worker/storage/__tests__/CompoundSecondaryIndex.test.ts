import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompoundSecondaryIndex } from '../CompoundSecondaryIndex';

describe('CompoundSecondaryIndex', () => {
  let mockEnv: any;
  let mockStub: any;
  let index: CompoundSecondaryIndex;

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

    index = new CompoundSecondaryIndex(mockEnv, 'test-entity', ['field1', 'field2']);
  });

  describe('constructor', () => {
    it('should initialize with correct entity name and prefix', () => {
      expect(index['entityName']).toBe('sys-compound-secondary-index');
      expect(index['key']()).toContain('compound-index:test-entity:field1:field2');
    });

    it('should create compound key with multiple field names', () => {
      const multiFieldIndex = new CompoundSecondaryIndex(mockEnv, 'test-entity', ['field1', 'field2', 'field3']);
      expect(multiFieldIndex['key']()).toContain('compound-index:test-entity:field1:field2:field3');
    });

    it('should create compound key with single field name', () => {
      const singleFieldIndex = new CompoundSecondaryIndex(mockEnv, 'test-entity', ['field1']);
      expect(singleFieldIndex['key']()).toContain('compound-index:test-entity:field1');
    });
  });

  describe('add', () => {
    it('should add entry with compound key', async () => {
      await index.add(['value1', 'value2'], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound:value1:value2:entity:entity-1',
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should add entry with single field value', async () => {
      await index.add(['value1'], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound:value1:entity:entity-1',
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should add entry with empty field values', async () => {
      await index.add(['', ''], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound:::entity:entity-1',
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should add entry with special characters in field values', async () => {
      await index.add(['value:1', 'value/2'], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound:value:1:value/2:entity:entity-1',
        0,
        { entityId: 'entity-1' }
      );
    });
  });

  describe('remove', () => {
    it('should remove entry with compound key', async () => {
      await index.remove(['value1', 'value2'], 'entity-1');

      expect(mockStub.del).toHaveBeenCalledWith('compound:value1:value2:entity:entity-1');
    });

    it('should return true on successful removal', async () => {
      mockStub.del.mockResolvedValue(true);
      const result = await index.remove(['value1', 'value2'], 'entity-1');

      expect(result).toBe(true);
    });

    it('should return false on failed removal', async () => {
      mockStub.del.mockResolvedValue(false);
      const result = await index.remove(['value1', 'value2'], 'entity-1');

      expect(result).toBe(false);
    });
  });

  describe('getByValues', () => {
    beforeEach(() => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:value1:value2:entity:entity-1', 'compound:value1:value2:entity:entity-2'],
        next: null,
      });
    });

    it('should retrieve entity IDs by field values', async () => {
      const result = await index.getByValues(['value1', 'value2']);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('compound:value1:value2:entity:');
      expect(result).toEqual(['entity-1', 'entity-2']);
    });

    it('should return empty array when no matches found', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      const result = await index.getByValues(['value1', 'value2']);

      expect(result).toEqual([]);
    });

    it('should extract entityId directly from key without fetching documents', async () => {
      const result = await index.getByValues(['value1', 'value2']);

      expect(mockStub.getDoc).not.toHaveBeenCalled();
      expect(result).toEqual(['entity-1', 'entity-2']);
    });

    it('should handle keys with colons in field values', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:value:1:value:2:entity:entity-1'],
        next: null,
      });

      const result = await index.getByValues(['value:1', 'value:2']);

      expect(result).toEqual(['entity-1']);
    });

    it('should retrieve multiple entity IDs correctly', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [
          'compound:value1:value2:entity:entity-1',
          'compound:value1:value2:entity:entity-2',
          'compound:value1:value2:entity:entity-3',
        ],
        next: null,
      });

      const result = await index.getByValues(['value1', 'value2']);

      expect(result).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });
  });

  describe('clearValues', () => {
    it('should clear all entries for given field values', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['compound:value1:value2:entity:entity-1', 'compound:value1:value2:entity:entity-2'],
        next: null,
      });

      await index.clearValues(['value1', 'value2']);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('compound:value1:value2:entity:');
      expect(mockStub.del).toHaveBeenCalledTimes(2);
      expect(mockStub.del).toHaveBeenCalledWith('compound:value1:value2:entity:entity-1');
      expect(mockStub.del).toHaveBeenCalledWith('compound:value1:value2:entity:entity-2');
    });

    it('should handle empty key list', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      await index.clearValues(['value1', 'value2']);

      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should delete all keys in parallel', async () => {
      const keys = Array.from({ length: 10 }, (_, i) => `compound:value1:value2:entity:entity-${i}`);
      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      await index.clearValues(['value1', 'value2']);

      expect(mockStub.del).toHaveBeenCalledTimes(10);
    });
  });

  describe('clear', () => {
    it('should clear all compound index entries', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [
          'compound:value1:value2:entity:entity-1',
          'compound:value3:value4:entity:entity-2',
          'compound:value5:value6:entity:entity-3',
        ],
        next: null,
      });

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('compound:');
      expect(mockStub.del).toHaveBeenCalledTimes(3);
    });

    it('should handle empty index', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      await index.clear();

      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should clear all keys in parallel', async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `compound:key${i}:entity:${i}`);
      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      await index.clear();

      expect(mockStub.del).toHaveBeenCalledTimes(100);
    });
  });

  describe('edge cases', () => {
    it('should handle large field values', async () => {
      const largeValue = 'a'.repeat(1000);
      await index.add([largeValue], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `compound:${largeValue}:entity:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should handle unicode characters in field values', async () => {
      const unicodeValue = '日本語-한글-中文-العربية';
      await index.add([unicodeValue], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `compound:${unicodeValue}:entity:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should handle entityId with special characters', async () => {
      await index.add(['value1', 'value2'], 'entity:with:special/chars');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound:value1:value2:entity:entity:with:special/chars',
        0,
        { entityId: 'entity:with:special/chars' }
      );
    });

    it('should handle concurrent add operations', async () => {
      const promises = [
        index.add(['value1', 'value2'], 'entity-1'),
        index.add(['value1', 'value2'], 'entity-2'),
        index.add(['value3', 'value4'], 'entity-3'),
      ];

      await Promise.all(promises);

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
    });

    it('should handle empty field array', async () => {
      await index.add([], 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'compound::entity:entity-1',
        0,
        { entityId: 'entity-1' }
      );
    });
  });
});
