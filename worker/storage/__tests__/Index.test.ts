import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Index } from '../Index';

describe('Index', () => {
  let mockEnv: any;
  let mockStub: any;
  let index: Index<string>;

  beforeEach(() => {
    mockStub = {
      indexAddBatch: vi.fn().mockResolvedValue(undefined),
      indexRemoveBatch: vi.fn().mockResolvedValue(1),
      indexDrop: vi.fn().mockResolvedValue(undefined),
      listPrefix: vi.fn().mockResolvedValue({
        keys: ['i:value1', 'i:value2', 'i:value3'],
        next: null
      }),
    };

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    };

    index = new Index(mockEnv, 'test-index');
  });

  describe('constructor', () => {
    it('should initialize with correct entity name', () => {
      expect(index['entityName']).toBe('sys-index-root');
    });

    it('should initialize with correct ID pattern', () => {
      expect(index['_id']).toBe('index:test-index');
    });

    it('should create stub with correct instance name', () => {
      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-index-root:index:test-index'
      );
    });

    it('should create stub with different index names', () => {
      const userIndex = new Index(mockEnv, 'user-index');
      expect(userIndex['_id']).toBe('index:user-index');
      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-index-root:index:user-index'
      );
    });
  });

  describe('add', () => {
    it('should add single item to index', async () => {
      await index.add('value1');

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['value1']);
    });

    it('should add item with empty string', async () => {
      await index.add('');

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['']);
    });

    it('should add item with special characters', async () => {
      await index.add('value:with:special:chars');

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['value:with:special:chars']);
    });

    it('should add item with numeric value', async () => {
      await index.add('12345');

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['12345']);
    });

    it('should delegate to addBatch', async () => {
      await index.add('value1');

      expect(mockStub.indexAddBatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('addBatch', () => {
    it('should add multiple items to index', async () => {
      await index.addBatch(['value1', 'value2', 'value3']);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['value1', 'value2', 'value3']);
    });

    it('should return without calling stub when array is empty', async () => {
      await index.addBatch([]);

      expect(mockStub.indexAddBatch).not.toHaveBeenCalled();
    });

    it('should handle single item in batch', async () => {
      await index.addBatch(['value1']);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['value1']);
    });

    it('should handle large batch of items', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => `value${i}`);

      await index.addBatch(items);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(items);
      expect(mockStub.indexAddBatch).toHaveBeenCalledTimes(1);
    });

    it('should handle items with duplicate values', async () => {
      await index.addBatch(['value1', 'value1', 'value1']);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['value1', 'value1', 'value1']);
    });
  });

  describe('remove', () => {
    it('should remove single item from index', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(1);

      const result = await index.remove('value1');

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(['value1']);
      expect(result).toBe(true);
    });

    it('should return false when no items removed', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(0);

      const result = await index.remove('value1');

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(['value1']);
      expect(result).toBe(false);
    });

    it('should return true when one item removed', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(1);

      const result = await index.remove('value1');

      expect(result).toBe(true);
    });

    it('should return true when multiple items removed', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(3);

      const result = await index.remove('value1');

      expect(result).toBe(true);
    });

    it('should delegate to removeBatch', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(1);

      await index.remove('value1');

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeBatch', () => {
    it('should remove multiple items from index', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(3);

      const result = await index.removeBatch(['value1', 'value2', 'value3']);

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(['value1', 'value2', 'value3']);
      expect(result).toBe(3);
    });

    it('should return 0 without calling stub when array is empty', async () => {
      const result = await index.removeBatch([]);

      expect(mockStub.indexRemoveBatch).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should handle single item in batch', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(1);

      const result = await index.removeBatch(['value1']);

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(['value1']);
      expect(result).toBe(1);
    });

    it('should handle large batch of items', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => `value${i}`);
      mockStub.indexRemoveBatch.mockResolvedValue(1000);

      const result = await index.removeBatch(items);

      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(items);
      expect(result).toBe(1000);
    });

    it('should handle partial removal (some items not in index)', async () => {
      mockStub.indexRemoveBatch.mockResolvedValue(2);

      const result = await index.removeBatch(['value1', 'value2', 'value3']);

      expect(result).toBe(2);
    });
  });

  describe('clear', () => {
    it('should clear all items from index', async () => {
      await index.clear();

      expect(mockStub.indexDrop).toHaveBeenCalledWith('sys-index-root:index:test-index');
    });

    it('should call stub indexDrop method', async () => {
      await index.clear();

      expect(mockStub.indexDrop).toHaveBeenCalledTimes(1);
    });

    it('should clear multiple times', async () => {
      await index.clear();
      await index.clear();

      expect(mockStub.indexDrop).toHaveBeenCalledTimes(2);
    });
  });

  describe('page', () => {
    beforeEach(() => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:value1', 'i:value2', 'i:value3'],
        next: 'next-cursor-1'
      });
    });

    it('should return paged items from index', async () => {
      const result = await index.page();

      expect(result.items).toEqual(['value1', 'value2', 'value3']);
      expect(result.next).toBe('next-cursor-1');
    });

    it('should strip prefix from keys', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:apple', 'i:banana', 'i:cherry'],
        next: null
      });

      const result = await index.page();

      expect(result.items).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should use provided cursor', async () => {
      await index.page('cursor-123', 10);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:', 'cursor-123', 10);
    });

    it('should use provided limit', async () => {
      await index.page(null, 5);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:', null, 5);
    });

    it('should use both cursor and limit', async () => {
      await index.page('cursor-456', 20);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:', 'cursor-456', 20);
    });

    it('should default to null cursor when not provided', async () => {
      await index.page();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:', null, undefined);
    });

    it('should handle empty result set', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [],
        next: null
      });

      const result = await index.page();

      expect(result.items).toEqual([]);
      expect(result.next).toBe(null);
    });

    it('should handle single item result', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:single-item'],
        next: null
      });

      const result = await index.page();

      expect(result.items).toEqual(['single-item']);
      expect(result.items).toHaveLength(1);
    });

    it('should handle next cursor being null (last page)', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:value1', 'i:value2'],
        next: null
      });

      const result = await index.page();

      expect(result.next).toBe(null);
    });

    it('should preserve original type', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:123', 'i:456'],
        next: null
      });

      const result = await index.page();

      expect(result.items).toEqual(['123', '456']);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:value1', 'i:value2', 'i:value3'],
        next: null
      });
    });

    it('should return all items from index', async () => {
      const result = await index.list();

      expect(result).toEqual(['value1', 'value2', 'value3']);
    });

    it('should strip prefix from all keys', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:a', 'i:b', 'i:c', 'i:d', 'i:e'],
        next: null
      });

      const result = await index.list();

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should handle empty result set', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: [],
        next: null
      });

      const result = await index.list();

      expect(result).toEqual([]);
    });

    it('should handle single item result', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:only-one'],
        next: null
      });

      const result = await index.list();

      expect(result).toEqual(['only-one']);
      expect(result).toHaveLength(1);
    });

    it('should handle large result set', async () => {
      const keys = Array.from({ length: 1000 }, (_, i) => `i:value${i}`);
      mockStub.listPrefix.mockResolvedValue({
        keys,
        next: null
      });

      const result = await index.list();

      expect(result).toHaveLength(1000);
    });

    it('should ignore next cursor from stub', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:value1', 'i:value2'],
        next: 'ignored-cursor'
      });

      const result = await index.list();

      expect(result).toEqual(['value1', 'value2']);
      expect(result).toHaveLength(2);
    });

    it('should preserve original type', async () => {
      mockStub.listPrefix.mockResolvedValue({
        keys: ['i:numeric', 'i:values'],
        next: null
      });

      const result = await index.list();

      expect(result).toEqual(['numeric', 'values']);
    });

    it('should call listPrefix with correct prefix', async () => {
      await index.list();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:');
    });
  });

  describe('Integration - Batch Operations', () => {
    it('should support add and remove batch operations', async () => {
      mockStub.indexAddBatch.mockResolvedValue(undefined);
      mockStub.indexRemoveBatch.mockResolvedValue(2);

      await index.addBatch(['item1', 'item2', 'item3']);
      const removed = await index.removeBatch(['item1', 'item2']);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['item1', 'item2', 'item3']);
      expect(mockStub.indexRemoveBatch).toHaveBeenCalledWith(['item1', 'item2']);
      expect(removed).toBe(2);
    });

    it('should support clear after batch operations', async () => {
      mockStub.indexAddBatch.mockResolvedValue(undefined);
      mockStub.indexDrop.mockResolvedValue(undefined);

      await index.addBatch(['item1', 'item2']);
      await index.clear();

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['item1', 'item2']);
      expect(mockStub.indexDrop).toHaveBeenCalled();
    });
  });

  describe('Integration - Pagination', () => {
    it('should support pagination through page method', async () => {
      mockStub.listPrefix
        .mockResolvedValueOnce({
          keys: ['i:page1-1', 'i:page1-2', 'i:page1-3'],
          next: 'cursor-page-2'
        })
        .mockResolvedValueOnce({
          keys: ['i:page2-1', 'i:page2-2'],
          next: 'cursor-page-3'
        })
        .mockResolvedValueOnce({
          keys: ['i:page3-1'],
          next: null
        });

      const page1 = await index.page(null, 3);
      const page2 = await index.page(page1.next, 3);
      const page3 = await index.page(page2.next, 3);

      expect(page1.items).toEqual(['page1-1', 'page1-2', 'page1-3']);
      expect(page1.next).toBe('cursor-page-2');

      expect(page2.items).toEqual(['page2-1', 'page2-2']);
      expect(page2.next).toBe('cursor-page-3');

      expect(page3.items).toEqual(['page3-1']);
      expect(page3.next).toBe(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', async () => {
      await index.add('');
      const result = await index.list();

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith(['']);
    });

    it('should handle values with special characters', async () => {
      await index.add('value:with:special:chars');
      await index.add('value/with/slashes');
      await index.add('value with spaces');

      expect(mockStub.indexAddBatch).toHaveBeenCalledTimes(3);
    });

    it('should handle very long values', async () => {
      const longValue = 'x'.repeat(10000);
      await index.add(longValue);

      expect(mockStub.indexAddBatch).toHaveBeenCalledWith([longValue]);
    });

    it('should handle Unicode values', async () => {
      await index.add('🚀 unicode value');
      await index.add('中文');

      expect(mockStub.indexAddBatch).toHaveBeenCalledTimes(2);
    });

    it('should handle null and undefined cursor in page', async () => {
      await index.page(null);
      await index.page(undefined as any);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('i:', null, undefined);
    });
  });
});
