import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserDateSortedIndex } from '../UserDateSortedIndex';

describe('UserDateSortedIndex', () => {
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
    it('should create index with correct ID for sent messages', () => {
      mockEnv.GlobalDurableObject.idFromName.mockReturnValue({ name: 'test-doid' } as any);

      new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-user-date-sorted-index:user-date-sorted-index:message:user-123:sent'
      );
      expect(mockEnv.GlobalDurableObject.get).toHaveBeenCalledWith({ name: 'test-doid' });
    });

    it('should create index with correct ID for received messages', () => {
      mockEnv.GlobalDurableObject.idFromName.mockReturnValue({ name: 'test-doid' } as any);

      new UserDateSortedIndex(mockEnv, 'message', 'user-456', 'received');

      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith(
        'sys-user-date-sorted-index:user-date-sorted-index:message:user-456:received'
      );
      expect(mockEnv.GlobalDurableObject.get).toHaveBeenCalledWith({ name: 'test-doid' });
    });
  });

  describe('add', () => {
    it('should add message ID to date-sorted index', async () => {
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');
      const timestamp = new Date('2026-01-08T10:00:00.000Z').getTime();
      const expectedReversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      await index.add('2026-01-08T10:00:00.000Z', 'message-123');

      expect(mockStub.casPut).toHaveBeenCalledWith(
        `sort:${expectedReversedTimestamp.toString().padStart(20, '0')}:message-123`,
        0,
        { entityId: 'message-123' }
      );
    });

    it('should add multiple message IDs with correct timestamps', async () => {
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      await index.add('2026-01-07T15:00:00.000Z', 'message-3');
      await index.add('2026-01-08T10:00:00.000Z', 'message-1');
      await index.add('2026-01-08T12:00:00.000Z', 'message-2');

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
      const calls = mockStub.casPut.mock.calls as Array<[string, number, { entityId: string }]>;
      const keys = calls.map((call) => call[0]);

      const ts3 = new Date('2026-01-07T15:00:00.000Z').getTime();
      const ts1 = new Date('2026-01-08T10:00:00.000Z').getTime();
      const ts2 = new Date('2026-01-08T12:00:00.000Z').getTime();

      const key2 = `sort:${(Number.MAX_SAFE_INTEGER - ts2).toString().padStart(20, '0')}:message-2`;
      const key1 = `sort:${(Number.MAX_SAFE_INTEGER - ts1).toString().padStart(20, '0')}:message-1`;
      const key3 = `sort:${(Number.MAX_SAFE_INTEGER - ts3).toString().padStart(20, '0')}:message-3`;

      expect(keys).toContain(key2);
      expect(keys).toContain(key1);
      expect(keys).toContain(key3);
    });
  });

  describe('remove', () => {
    it('should remove message ID from date-sorted index', async () => {
      mockStub.del.mockResolvedValue(true);
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');
      const timestamp = new Date('2026-01-08T10:00:00.000Z').getTime();
      const expectedReversedTimestamp = Number.MAX_SAFE_INTEGER - timestamp;

      const result = await index.remove('2026-01-08T10:00:00.000Z', 'message-123');

      expect(result).toBe(true);
      expect(mockStub.del).toHaveBeenCalledWith(
        `sort:${expectedReversedTimestamp.toString().padStart(20, '0')}:message-123`
      );
    });

    it('should return false when deletion fails', async () => {
      mockStub.del.mockResolvedValue(false);
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const result = await index.remove('2026-01-08T10:00:00.000Z', 'message-123');

      expect(result).toBe(false);
    });
  });

  describe('getRecent', () => {
    it('should return most recent message IDs in correct order', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:message-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:message-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:message-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const recentIds = await index.getRecent(2);

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(recentIds).toEqual(['message-2', 'message-1']);
      expect(recentIds).toHaveLength(2);
    });

    it('should return all message IDs when limit exceeds available', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:message-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:message-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:message-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const recentIds = await index.getRecent(10);

      expect(recentIds).toHaveLength(3);
      expect(recentIds).toEqual(['message-2', 'message-1', 'message-3']);
    });

    it('should return empty array when no messages exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const recentIds = await index.getRecent(5);

      expect(recentIds).toEqual([]);
    });

    it('should sort keys lexicographically', async () => {
      const mockKeys = [
        'sort:90000000000000000003:message-3',
        'sort:90000000000000000001:message-1',
        'sort:90000000000000000002:message-2',
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const recentIds = await index.getRecent(3);

      expect(recentIds).toEqual(['message-1', 'message-2', 'message-3']);
    });
  });

  describe('getAll', () => {
    it('should return all message IDs sorted', async () => {
      const tsNewest = new Date('2026-01-08T12:00:00.000Z').getTime();
      const tsMiddle = new Date('2026-01-08T10:00:00.000Z').getTime();
      const tsOldest = new Date('2026-01-07T15:00:00.000Z').getTime();

      const mockKeys = [
        `sort:${(Number.MAX_SAFE_INTEGER - tsNewest).toString().padStart(20, '0')}:message-2`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsMiddle).toString().padStart(20, '0')}:message-1`,
        `sort:${(Number.MAX_SAFE_INTEGER - tsOldest).toString().padStart(20, '0')}:message-3`,
      ];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const allIds = await index.getAll();

      expect(allIds).toEqual(['message-2', 'message-1', 'message-3']);
    });

    it('should return empty array when no messages exist', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      const allIds = await index.getAll();

      expect(allIds).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all message IDs from date-sorted index', async () => {
      const mockKeys = ['sort:key1', 'sort:key2', 'sort:key3'];
      mockStub.listPrefix.mockResolvedValue({ keys: mockKeys });
      mockStub.del.mockResolvedValue(true);
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(mockStub.del).toHaveBeenCalledTimes(3);
      expect(mockStub.del).toHaveBeenCalledWith('sort:key1');
      expect(mockStub.del).toHaveBeenCalledWith('sort:key2');
      expect(mockStub.del).toHaveBeenCalledWith('sort:key3');
    });

    it('should handle empty index', async () => {
      mockStub.listPrefix.mockResolvedValue({ keys: [] });
      const index = new UserDateSortedIndex(mockEnv, 'message', 'user-123', 'sent');

      await index.clear();

      expect(mockStub.listPrefix).toHaveBeenCalledWith('sort:');
      expect(mockStub.del).not.toHaveBeenCalled();
    });
  });
});
