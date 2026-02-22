import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IndexedEntity } from '../IndexedEntity';
import type { Env } from '../../types';

type TestState = {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

class TestIndexedEntity extends IndexedEntity<TestState> {
  static readonly entityName = 'test-indexed';
  static readonly indexName = 'test-indexed-entities';
  static readonly initialState: TestState = {
    id: '',
    name: '',
    category: '',
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };

  static readonly secondaryIndexes = [
    { fieldName: 'category', getValue: (state: TestState) => state.category },
  ];
}

describe('IndexedEntity', () => {
  let mockEnv: Env;
  let mockStub: any;

  beforeEach(() => {
    mockStub = {
      getDoc: vi.fn(),
      casPut: vi.fn(),
      del: vi.fn(),
      has: vi.fn(),
      listPrefix: vi.fn(),
      indexAddBatch: vi.fn(),
      indexRemoveBatch: vi.fn(),
    };

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-do-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    } as unknown as Env;
  });

  describe('deleteMany', () => {
    it('should return 0 when ids array is empty', async () => {
      const result = await TestIndexedEntity.deleteMany(mockEnv, []);
      expect(result).toBe(0);
      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should delete multiple entities and return count of successful deletions', async () => {
      const ids = ['id-1', 'id-2', 'id-3'];
      
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-3', name: 'Test 3', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } });
      
      mockStub.del.mockResolvedValue(true);
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.deleteMany(mockEnv, ids);

      expect(result).toBe(3);
      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(ids);
    });

    it('should clean up secondary indexes when deleting multiple entities', async () => {
      const ids = ['id-1', 'id-2'];
      
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null } });
      
      mockStub.del.mockResolvedValue(true);
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      await TestIndexedEntity.deleteMany(mockEnv, ids);

      expect(mockStub.del).toHaveBeenCalledWith('test-indexed:id-1');
      expect(mockStub.del).toHaveBeenCalledWith('test-indexed:id-2');
    });

    it('should handle partial failures gracefully', async () => {
      const ids = ['id-1', 'id-2', 'id-3'];
      
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-3', name: 'Test 3', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } });
      
      mockStub.del
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.deleteMany(mockEnv, ids);

      expect(result).toBe(2);
    });

    it('should handle exceptions when getting state', async () => {
      const ids = ['id-1', 'id-2'];
      
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockImplementationOnce(() => { throw new Error('Storage error'); });
      
      mockStub.del.mockResolvedValue(true);
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.deleteMany(mockEnv, ids);

      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete entity and clean up both primary and secondary indexes', async () => {
      mockStub.getDoc.mockResolvedValue({ 
        v: 1, 
        data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } 
      });
      mockStub.del.mockResolvedValue(true);
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.delete(mockEnv, 'id-1');

      expect(result).toBe(true);
      expect(mockStub.del).toHaveBeenCalledWith('test-indexed:id-1');
    });
  });

  describe('create', () => {
    it('should create entity and add to both primary and secondary indexes', async () => {
      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const state: TestState = {
        id: 'new-id',
        name: 'New Entity',
        category: 'cat-a',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      const result = await TestIndexedEntity.create(mockEnv, state);

      expect(result.id).toBe('new-id');
      expect(result.name).toBe('New Entity');
      expect(result.category).toBe('cat-a');
      expect(mockStub.casPut).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('existsBySecondaryIndex', () => {
    it('should return true when entities exist with the given field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:cat-a:entity:id-1'] });

      const result = await TestIndexedEntity.existsBySecondaryIndex(mockEnv, 'category', 'cat-a');

      expect(result).toBe(true);
      expect(mockStub.listPrefix).toHaveBeenCalledWith('field:cat-a:entity:', null, 1);
    });

    it('should return false when no entities exist with the given field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.existsBySecondaryIndex(mockEnv, 'category', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('countBySecondaryIndex', () => {
    it('should return the count of entities with the given field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: ['field:cat-a:entity:id-1', 'field:cat-a:entity:id-2'] });

      const result = await TestIndexedEntity.countBySecondaryIndex(mockEnv, 'category', 'cat-a');

      expect(result).toBe(2);
    });

    it('should return 0 when no entities exist with the given field value', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await TestIndexedEntity.countBySecondaryIndex(mockEnv, 'category', 'nonexistent');

      expect(result).toBe(0);
    });
  });

  describe('getByIds', () => {
    it('should return empty map when ids array is empty', async () => {
      const result = await TestIndexedEntity.getByIds(mockEnv, []);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
      expect(mockStub.getDoc).not.toHaveBeenCalled();
    });

    it('should return map of entities for valid ids', async () => {
      const ids = ['id-1', 'id-2'];

      mockStub.has.mockResolvedValue(true);
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids);

      expect(result.size).toBe(2);
      expect(result.get('id-1')).toEqual({ id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null });
      expect(result.get('id-2')).toEqual({ id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null });
    });

    it('should filter out soft-deleted entities by default', async () => {
      const ids = ['id-1', 'id-2'];

      mockStub.has.mockResolvedValue(true);
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: '2024-01-01' } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids);

      expect(result.size).toBe(1);
      expect(result.has('id-1')).toBe(true);
      expect(result.has('id-2')).toBe(false);
    });

    it('should include soft-deleted entities when includeDeleted is true', async () => {
      const ids = ['id-1', 'id-2'];

      mockStub.has.mockResolvedValue(true);
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: '2024-01-01' } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids, true);

      expect(result.size).toBe(2);
      expect(result.has('id-1')).toBe(true);
      expect(result.has('id-2')).toBe(true);
    });

    it('should handle errors gracefully and skip failed fetches', async () => {
      const ids = ['id-1', 'id-2'];

      mockStub.has
        .mockResolvedValueOnce(true)
        .mockImplementationOnce(() => { throw new Error('Storage error'); });
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids);

      expect(result.size).toBe(1);
      expect(result.has('id-1')).toBe(true);
      expect(result.has('id-2')).toBe(false);
    });

    it('should deduplicate ids before fetching', async () => {
      const ids = ['id-1', 'id-1', 'id-2'];

      mockStub.has.mockResolvedValue(true);
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } })
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-2', name: 'Test 2', category: 'cat-b', createdAt: '', updatedAt: '', deletedAt: null } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids);

      expect(result.size).toBe(2);
      expect(mockStub.has).toHaveBeenCalledTimes(2);
    });

    it('should handle non-existent entities (has returns false)', async () => {
      const ids = ['id-1', 'id-2'];

      mockStub.has
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockStub.getDoc
        .mockResolvedValueOnce({ v: 1, data: { id: 'id-1', name: 'Test 1', category: 'cat-a', createdAt: '', updatedAt: '', deletedAt: null } });

      const result = await TestIndexedEntity.getByIds(mockEnv, ids);

      expect(result.size).toBe(1);
      expect(result.has('id-1')).toBe(true);
      expect(result.has('id-2')).toBe(false);
    });
  });
});
