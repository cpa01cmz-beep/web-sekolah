import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StudentDateSortedIndex } from '../StudentDateSortedIndex';

describe('StudentDateSortedIndex', () => {
  const mockEnv = {
    GlobalDurableObject: {
      get: vi.fn(),
      idFromName: vi.fn((name: string) => ({ name })),
    },
  } as any;

  const mockStub = {
    casPut: vi.fn(),
    del: vi.fn(),
    listPrefix: vi.fn(),
    getDoc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.GlobalDurableObject.get.mockReturnValue(mockStub as any);
  });

  describe('constructor', () => {
    it('should create index with correct ID', () => {
      mockEnv.GlobalDurableObject.idFromName.mockReturnValue({ name: 'test-doid' } as any);

      new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith('sys-student-date-sorted-index:student-date-sorted-index:grade:student-123');
      expect(mockEnv.GlobalDurableObject.get).toHaveBeenCalledWith({ name: 'test-doid' });
    });
  });

  describe('add', () => {
    it('should add grade ID to date-sorted index', async () => {
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');
      const timestamp = new Date('2026-01-08T10:00:00.000Z').getTime();
      const expectedReversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      await index.add('2026-01-08T10:00:00.000Z', 'grade-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${expectedReversedTimestamp.toString().padStart(20, '0')}:grade-123`,
        0,
        { entityId: 'grade-123' }
      );
    });

    it('should add multiple grade IDs with correct timestamps', async () => {
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      await index.add('2026-01-07T15:00:00.000Z', 'grade-3');
      await index.add('2026-01-08T10:00:00.000Z', 'grade-1');
      await index.add('2026-01-08T12:00:00.000Z', 'grade-2');

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
      const calls = mockStub.casPut.mock.calls as Array<[string, number, { entityId: string }]>;
      const keys = calls.map(call => call[0]);

      const ts3 = new Date('2026-01-07T15:00:00.000Z').getTime();
      const ts1 = new Date('2026-01-08T10:00:00.000Z').getTime();
      const ts2 = new Date('2026-01-08T12:00:00.000Z').getTime();

      const key2 = `sort:${(Number.MAX_SAFE_INTEGER - ts2).toString().padStart(20, '0')}:grade-2`;
      const key1 = `sort:${(Number.MAX_SAFE_INTEGER - ts1).toString().padStart(20, '0')}:grade-1`;
      const key3 = `sort:${(Number.MAX_SAFE_INTEGER - ts3).toString().padStart(20, '0')}:grade-3`;

      expect(keys).toContain(key2);
      expect(keys).toContain(key1);
      expect(keys).toContain(key3);
    });
  });

  describe('remove', () => {
    it('should remove grade ID from date-sorted index', async () => {
      mockStub.del.mockResolvedValue(true);
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');
      const timestamp = new Date('2026-01-08T10:00:00.000Z').getTime();
      const expectedReversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      const result = await index.remove('2026-01-08T10:00:00.000Z', 'grade-123');

      expect(result).toBe(true);
      expect(mockStub.del).toHaveBeenCalledWith(
        `sort:${expectedReversedTimestamp.toString().padStart(20, '0')}:grade-123`
      );
    });

    it('should return false when deletion fails', async () => {
      mockStub.del.mockResolvedValue(false);
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      const result = await index.remove('2026-01-08T10:00:00.000Z', 'grade-123');

      expect(result).toBe(false);
    });
  });

  describe('getRecent', () => {
    it('should return most recent grade IDs in correct order', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:grade-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:grade-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:grade-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      mockStub.getDoc.mockImplementation((key: string) => {
        const gradeId = key.split(':')[2];
        return Promise.resolve({ v: 1, data: { entityId: gradeId } });
      });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      const recentIds = await index.getRecent(2);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(recentIds).toEqual(['grade-2', 'grade-1']);
      expect(recentIds).toHaveLength(2);
    });

    it('should return all grade IDs when limit exceeds available', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:grade-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:grade-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:grade-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      mockStub.getDoc.mockImplementation((key: string) => {
        const gradeId = key.split(':')[2];
        return Promise.resolve({ v: 1, data: { entityId: gradeId } });
      });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      const recentIds = await index.getRecent(10);

      expect(recentIds).toHaveLength(3);
      expect(recentIds).toEqual(['grade-2', 'grade-1', 'grade-3']);
    });

    it('should return empty array when no grades exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      const recentIds = await index.getRecent(5);

      expect(recentIds).toEqual([]);
      expect(mockStub.getDoc).not.toHaveBeenCalled();
    });

    it('should skip invalid documents', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:grade-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:grade-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:grade-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      mockStub.getDoc.mockImplementation((key: string) => {
        const gradeId = key.split(':')[2];
        if (gradeId === 'grade-1') {
          return Promise.resolve({ v: 1, data: null });
        }
        return Promise.resolve({ v: 1, data: { entityId: gradeId } });
      });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      const recentIds = await index.getRecent(5);

      expect(recentIds).toEqual(['grade-2', 'grade-3']);
      expect(recentIds).toHaveLength(2);
    });
  });

  describe('clear', () => {
    it('should clear all grade IDs from date-sorted index', async () => {
      const mockKeys = ['sort:key1', 'sort:key2', 'sort:key3'];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      mockStub.del.mockResolvedValue(true);
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(mockStub.del).toHaveBeenCalledTimes(3);
      expect(mockStub.del).toHaveBeenCalledWith('sort:key1');
      expect(mockStub.del).toHaveBeenCalledWith('sort:key2');
      expect(mockStub.del).toHaveBeenCalledWith('sort:key3');
    });

    it('should handle empty index', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });
      const index = new StudentDateSortedIndex(mockEnv, 'grade', 'student-123');

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(mockStub.del).not.toHaveBeenCalled();
    });
  });
});
