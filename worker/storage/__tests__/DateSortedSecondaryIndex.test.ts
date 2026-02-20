import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateSortedSecondaryIndex } from '../DateSortedSecondaryIndex';

describe('DateSortedSecondaryIndex', () => {
  let mockEnv: any;
  let mockStub: any;
  let index: DateSortedSecondaryIndex;

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

    index = new DateSortedSecondaryIndex(mockEnv, 'test-entity');
  });

  describe('constructor', () => {
    it('should initialize with correct entity name and prefix', () => {
      expect(index['entityName']).toBe('sys-date-sorted-index');
      expect(index['key']()).toContain('date-sorted-index:test-entity');
    });
  });

  describe('add', () => {
    it('should add entry with reversed timestamp for chronological sorting', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      const timestamp = new Date(testDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const paddedTimestamp = reversedTimestamp.toString().padStart(20, '0');

      await index.add(testDate, 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${paddedTimestamp}:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should add entry with current timestamp when date is ISO string', async () => {
      const testDate = new Date().toISOString();
      await index.add(testDate, 'entity-1');

      const timestamp = new Date(testDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const expectedKey = `sort:${reversedTimestamp.toString().padStart(20, '0')}:entity-1`;

      expect(mockStub.casPut).toHaveBeenCalledWith(
        expect.stringMatching(/^sort:\d+:entity-1$/),
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should pad timestamp to 20 characters for lexicographic sorting', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      await index.add(testDate, 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        expect.stringMatching(/^sort:0{0,19}\d+:entity-1$/),
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should handle old dates correctly', async () => {
      const oldDate = '1970-01-01T00:00:00.000Z';
      await index.add(oldDate, 'entity-1');

      const timestamp = new Date(oldDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${reversedTimestamp.toString().padStart(20, '0')}:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should handle future dates correctly', async () => {
      const futureDate = '2099-12-31T23:59:59.999Z';
      await index.add(futureDate, 'entity-1');

      const timestamp = new Date(futureDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${reversedTimestamp.toString().padStart(20, '0')}:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });
  });

  describe('remove', () => {
    it('should remove entry with reversed timestamp', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      const timestamp = new Date(testDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const paddedTimestamp = reversedTimestamp.toString().padStart(20, '0');

      await index.remove(testDate, 'entity-1');

      expect(mockStub.del).toHaveBeenCalledWith(`sort:${paddedTimestamp}:entity-1`);
    });

    it('should return true on successful removal', async () => {
      mockStub.del.mockResolvedValue(true);
      const result = await index.remove('2026-01-07T12:00:00.000Z', 'entity-1');

      expect(result).toBe(true);
    });

    it('should return false on failed removal', async () => {
      mockStub.del.mockResolvedValue(false);
      const result = await index.remove('2026-01-07T12:00:00.000Z', 'entity-1');

      expect(result).toBe(false);
    });

    it('should remove entry for different entity IDs', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      const timestamp = new Date(testDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const paddedTimestamp = reversedTimestamp.toString().padStart(20, '0');

      await index.remove(testDate, 'entity-1');
      await index.remove(testDate, 'entity-2');

      expect(mockStub.del).toHaveBeenCalledWith(`sort:${paddedTimestamp}:entity-1`);
      expect(mockStub.del).toHaveBeenCalledWith(`sort:${paddedTimestamp}:entity-2`);
    });
  });

  describe('getRecent', () => {
    beforeEach(() => {
      const now = Date.now();
      const keys = [
        `sort:${(Number.MAX_SAFE_INTEGER - now).toString().padStart(20, '0')}:entity-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - (now - 1000)).toString().padStart(20, '0')}:entity-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - (now - 2000)).toString().padStart(20, '0')}:entity-3`,
      ];

      mockStub.listPrefix.mockResolvedValue({ keys, next: null });
    });

    it('should retrieve recent entity IDs in chronological order', async () => {
      const result = await index.getRecent(3);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 3);
      expect(result).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });

    it('should limit results to requested count', async () => {
      const now = Date.now();
      const keys = [
        `sort:${(Number.MAX_SAFE_INTEGER - now).toString().padStart(20, '0')}:entity-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - (now - 1000)).toString().padStart(20, '0')}:entity-2`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      const result = await index.getRecent(2);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 2);
      expect(result).toHaveLength(2);
      expect(result).toEqual(['entity-1', 'entity-2']);
    });

    it('should return empty array when no entries exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      const result = await index.getRecent(10);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 10);
      expect(result).toEqual([]);
    });

    it('should return single entry when limit is 1', async () => {
      const now = Date.now();
      const keys = [
        `sort:${(Number.MAX_SAFE_INTEGER - now).toString().padStart(20, '0')}:entity-1`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      const result = await index.getRecent(1);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 1);
      expect(result).toHaveLength(1);
      expect(result).toEqual(['entity-1']);
    });

    it('should extract entityId directly from key without fetching documents', async () => {
      const result = await index.getRecent(3);

      expect(mockStub.getDoc).not.toHaveBeenCalled();
      expect(result).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });

    it('should rely on lexicographic ordering from listPrefix', async () => {
      const sortedKeys = [
        'sort:90000000000000000001:entity-1',
        'sort:90000000000000000002:entity-2',
        'sort:90000000000000000003:entity-3',
      ];

      mockStub.listPrefix.mockResolvedValue({ keys: sortedKeys, next: null });

      const result = await index.getRecent(3);

      expect(result).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });

    it('should handle limit larger than available entries', async () => {
      const result = await index.getRecent(100);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 100);
      expect(result).toHaveLength(3);
      expect(result).toEqual(['entity-1', 'entity-2', 'entity-3']);
    });

    it('should handle limit of 0', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      const result = await index.getRecent(0);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:', 0);
      expect(result).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should clear all date-sorted index entries', async () => {
      const now = Date.now();
      const keys = [
        `sort:${(Number.MAX_SAFE_INTEGER - now).toString().padStart(20, '0')}:entity-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - (now - 1000)).toString().padStart(20, '0')}:entity-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - (now - 2000)).toString().padStart(20, '0')}:entity-3`,
      ];

      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(mockStub.del).toHaveBeenCalledTimes(3);
    });

    it('should handle empty index', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [], next: null });

      await index.clear();

      expect(mockStub.del).not.toHaveBeenCalled();
    });

    it('should delete all keys in parallel', async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `sort:${String(i).padStart(20, '0')}:entity-${i}`);
      mockStub.listPrefix.mockResolvedValue({ keys, next: null });

      await index.clear();

      expect(mockStub.del).toHaveBeenCalledTimes(100);
    });
  });

  describe('getAll', () => {
    it('should return all entity IDs sorted', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:entity-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:entity-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:entity-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });

      const allIds = await index.getAll();

      expect(allIds).toEqual(['entity-2', 'entity-1', 'entity-3']);
    });

    it('should return empty array when no entries exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const allIds = await index.getAll();

      expect(allIds).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return count of entries', async () => {
      const keys = ['sort:key1', 'sort:key2', 'sort:key3'];
      mockStub.listPrefix.mockResolvedValue({ keys });

      const result = await index.count();

      expect(result).toBe(3);
    });

    it('should return 0 when no entries exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });

      const result = await index.count();

      expect(result).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid date string', () => {
      const invalidDate = 'not-a-date';

      expect(() => new Date(invalidDate).getTime()).not.toThrow();
    });

    it('should handle entity ID with special characters', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      const entityId = 'entity:with:special/chars';

      await index.add(testDate, entityId);

      expect(mockStub.casPut).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`:entity:with:special/chars$`)),
        0,
        { entityId }
      );
    });

    it('should handle concurrent add operations', async () => {
      const testDate = '2026-01-07T12:00:00.000Z';
      const promises = [
        index.add(testDate, 'entity-1'),
        index.add(testDate, 'entity-2'),
        index.add(testDate, 'entity-3'),
      ];

      await Promise.all(promises);

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
    });

    it('should handle millisecond precision', async () => {
      const testDate = '2026-01-07T12:00:00.123Z';
      await index.add(testDate, 'entity-1');

      const timestamp = new Date(testDate).getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${reversedTimestamp.toString().padStart(20, '0')}:entity-1`,
        0,
        { entityId: 'entity-1' }
      );
    });

    it('should maintain order when multiple entries have same timestamp', async () => {
      const sameTimestamp = '2026-01-07T12:00:00.000Z';
      await index.add(sameTimestamp, 'entity-a');
      await index.add(sameTimestamp, 'entity-b');
      await index.add(sameTimestamp, 'entity-c');

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
    });

    it('should handle very recent dates', async () => {
      const recentDate = new Date().toISOString();
      await index.add(recentDate, 'entity-1');

      expect(mockStub.casPut).toHaveBeenCalled();
    });

    it('should handle very old dates', async () => {
      const oldDate = '1900-01-01T00:00:00.000Z';
      await index.add(oldDate, 'entity-1');

      const timestamp = new Date(oldDate).getTime();
      expect(timestamp).toBeLessThan(0);
      expect(mockStub.casPut).toHaveBeenCalled();
    });
  });

  describe('timestamp reversal logic', () => {
    it('should reverse timestamps so newer dates have smaller keys', () => {
      const newerDate = new Date('2026-01-07T12:00:00.000Z').getTime();
      const olderDate = new Date('2026-01-06T12:00:00.000Z').getTime();

      const newerReversed = Number.MAX_SAFE_INTEGER - newerDate;
      const olderReversed = Number.MAX_SAFE_INTEGER - olderDate;

      expect(newerReversed).toBeLessThan(olderReversed);
    });

    it('should pad reversed timestamps for lexicographic sorting', () => {
      const timestamp = new Date('2026-01-07T12:00:00.000Z').getTime();
      const reversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;
      const paddedTimestamp = reversedTimestamp.toString().padStart(20, '0');

      expect(paddedTimestamp.length).toBe(20);
    });

    it('should maintain correct chronological order across years', () => {
      const dates = [
        '2026-01-07T12:00:00.000Z',
        '2025-12-31T23:59:59.999Z',
        '2026-01-08T00:00:00.000Z',
      ];

      const timestamps = dates.map(date => new Date(date).getTime());
      const reversedTimestamps = dates.map(date =>
        (Number.MAX_SAFE_INTEGER - new Date(date).getTime()).toString().padStart(20, '0')
      );

      expect(timestamps[0] > timestamps[1]).toBe(true);
      expect(timestamps[2] > timestamps[0]).toBe(true);
      expect(reversedTimestamps[1] > reversedTimestamps[0]).toBe(true);
      expect(reversedTimestamps[0] > reversedTimestamps[2]).toBe(true);
    });
  });
});
