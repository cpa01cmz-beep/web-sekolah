import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Entity, type EntityStatics } from '../Entity';
import type { Env } from '../../types';

type TestState = {
  id: string;
  name: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

class TestEntity extends Entity<TestState> {
  static readonly entityName = 'test';
  static readonly initialState: TestState = {
    id: '',
    name: '',
    value: 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };
}

describe('Entity', () => {
  let mockEnv: Env;
  let mockStub: any;
  let entity: TestEntity;

  beforeEach(() => {
    mockStub = {
      getDoc: vi.fn(),
      casPut: vi.fn(),
      del: vi.fn(),
      has: vi.fn(),
    };

    mockEnv = {
      GlobalDurableObject: {
        idFromName: vi.fn().mockReturnValue('test-do-id'),
        get: vi.fn().mockReturnValue(mockStub),
      },
    } as unknown as Env;

    entity = new TestEntity(mockEnv, 'test-id');
  });

  describe('constructor', () => {
    it('should initialize with correct entity name', () => {
      expect(entity['entityName']).toBe('test');
    });

    it('should initialize with correct ID', () => {
      expect(entity.id).toBe('test-id');
    });

    it('should create stub with correct instance name', () => {
      expect(mockEnv.GlobalDurableObject.idFromName).toHaveBeenCalledWith('test:test-id');
    });

    it('should initialize state as undefined', () => {
      expect(entity.state).toBe(undefined);
    });
  });

  describe('key()', () => {
    it('should return correct key format', () => {
      expect(entity['key']()).toBe('test:test-id');
    });

    it('should use entity name and ID', () => {
      const customEntity = new TestEntity(mockEnv, 'custom-id');
      expect(customEntity['key']()).toBe('test:custom-id');
    });
  });

  describe('save()', () => {
    it('should save new state when version is 0', async () => {
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });

      const newState: TestState = {
        id: 'test-id',
        name: 'Test',
        value: 42,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      await entity.save(newState);

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'test:test-id',
        0,
        newState
      );
      expect(entity.state).toEqual(newState);
      expect(entity['_version']).toBe(1);
    });

    it('should update existing state with correct version', async () => {
      mockStub.getDoc.mockResolvedValue({ v: 5, data: { id: 'test-id', name: 'Old' } });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 6 });

      const newState: TestState = {
        id: 'test-id',
        name: 'Updated',
        value: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
        deletedAt: null,
      };

      await entity.ensureState();
      await entity.save(newState);

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'test:test-id',
        5,
        newState
      );
      expect(entity.state).toEqual(newState);
      expect(entity['_version']).toBe(6);
    });

    it('should retry on concurrent modification (up to 4 times)', async () => {
      mockStub.getDoc.mockResolvedValue({ v: 5, data: { id: 'test-id', name: 'Old' } });
      mockStub.casPut
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, v: 6 });

      const newState: TestState = {
        id: 'test-id',
        name: 'Updated',
        value: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
        deletedAt: null,
      };

      await entity.save(newState);

      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
      expect(entity.state).toEqual(newState);
    });

    it('should throw error after 4 failed retry attempts', async () => {
      mockStub.getDoc.mockResolvedValue({ v: 5, data: { id: 'test-id', name: 'Old' } });
      mockStub.casPut.mockResolvedValue({ ok: false });

      const newState: TestState = {
        id: 'test-id',
        name: 'Updated',
        value: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
        deletedAt: null,
      };

      await expect(entity.save(newState)).rejects.toThrow('Concurrent modification detected');
    });

    it('should load state before saving if not loaded', async () => {
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });

      const newState: TestState = {
        id: 'test-id',
        name: 'Test',
        value: 42,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      await entity.save(newState);

      expect(mockStub.getDoc).toHaveBeenCalledWith('test:test-id');
    });
  });

  describe('ensureState()', () => {
    it('should load state from storage when not loaded', async () => {
      const storedState: TestState = {
        id: 'test-id',
        name: 'Stored',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 2, data: storedState });

      const state = await entity.ensureState();

      expect(state).toEqual(storedState);
      expect(entity.state).toEqual(storedState);
      expect(entity['_version']).toBe(2);
    });

    it('should return initial state when no document exists', async () => {
      mockStub.getDoc.mockResolvedValue(null);

      const state = await entity.ensureState();

      expect(state).toEqual(TestEntity.initialState);
      expect(entity['_version']).toBe(0);
    });

    it('should call getDoc on every call (no caching)', async () => {
      const storedState: TestState = {
        id: 'test-id',
        name: 'Stored',
        value: 20,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: storedState });
      await entity.ensureState();

      mockStub.getDoc.mockClear();
      mockStub.getDoc.mockResolvedValue({ v: 1, data: storedState });
      const state = await entity.ensureState();

      expect(state).toEqual(storedState);
      expect(mockStub.getDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('mutate()', () => {
    it('should apply updater function to state', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Before',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      const newState = await entity.mutate((current) => ({
        ...current,
        name: 'After',
        value: 20,
      }));

      expect(newState.name).toBe('After');
      expect(newState.value).toBe(20);
      expect(entity.state).toEqual(newState);
    });

    it('should update timestamps when mutating', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Before',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      vi.useFakeTimers().setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
      const newState = await entity.mutate((current) => current);
      vi.useRealTimers();

      expect(newState.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(newState.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should retry on concurrent modification (up to 4 times)', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Before',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, v: 3 });

      const newState = await entity.mutate((current) => ({
        ...current,
        name: 'After',
      }));

      expect(newState.name).toBe('After');
      expect(mockStub.casPut).toHaveBeenCalledTimes(3);
    });

    it('should throw error after 4 failed retry attempts', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Before',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: false });

      await expect(
        entity.mutate((current) => ({ ...current, name: 'After' }))
      ).rejects.toThrow('Concurrent modification detected');
    });
  });

  describe('applyTimestamps()', () => {
    it('should set createdAt when current state has no timestamps', async () => {
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });

      vi.useFakeTimers().setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
      const newState = await entity.mutate(() => TestEntity.initialState);
      vi.useRealTimers();

      expect(newState.createdAt).toBe('2024-01-01T12:00:00.000Z');
      expect(newState.updatedAt).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should preserve existing createdAt and update updatedAt', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Test',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      vi.useFakeTimers().setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
      const newState = await entity.mutate((current) => current);
      vi.useRealTimers();

      expect(newState.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(newState.updatedAt).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should not add timestamps if state does not have timestamp fields', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Test',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      const newState = await entity.mutate((current) => {
        const { createdAt, updatedAt, ...rest } = current as any;
        return rest as any;
      });

      expect(newState).not.toHaveProperty('createdAt');
      expect(newState).not.toHaveProperty('updatedAt');
    });
  });

  describe('getState()', () => {
    it('should return current state', async () => {
      const storedState: TestState = {
        id: 'test-id',
        name: 'Stored',
        value: 15,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: storedState });

      const state = await entity.getState();

      expect(state).toEqual(storedState);
    });
  });

  describe('patch()', () => {
    it('should merge partial updates with existing state', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Original',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      await entity.patch({ name: 'Patched', value: 20 });

      expect(entity.state.name).toBe('Patched');
      expect(entity.state.value).toBe(20);
      expect(entity.state.id).toBe('test-id');
      expect(entity.state.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('exists()', () => {
    it('should return true when document exists', async () => {
      mockStub.has.mockResolvedValue(true);

      const exists = await entity.exists();

      expect(exists).toBe(true);
      expect(mockStub.has).toHaveBeenCalledWith('test:test-id');
    });

    it('should return false when document does not exist', async () => {
      mockStub.has.mockResolvedValue(false);

      const exists = await entity.exists();

      expect(exists).toBe(false);
    });
  });

  describe('isSoftDeleted()', () => {
    it('should return true when deletedAt is set', async () => {
      const deletedState: TestState = {
        id: 'test-id',
        name: 'Deleted',
        value: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: '2024-01-02T00:00:00.000Z',
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: deletedState });

      const isDeleted = await entity.isSoftDeleted();

      expect(isDeleted).toBe(true);
    });

    it('should return false when deletedAt is null', async () => {
      const activeState: TestState = {
        id: 'test-id',
        name: 'Active',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: activeState });

      const isDeleted = await entity.isSoftDeleted();

      expect(isDeleted).toBe(false);
    });

    it('should return false when deletedAt is undefined', async () => {
      const stateWithoutDeleted: Omit<TestState, 'deletedAt'> = {
        id: 'test-id',
        name: 'NoDeleted',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      } as any;

      mockStub.getDoc.mockResolvedValue({ v: 1, data: stateWithoutDeleted });

      const isDeleted = await entity.isSoftDeleted();

      expect(isDeleted).toBe(false);
    });

    it('should return false when state does not have deletedAt property', async () => {
      const stateWithoutDeletedField = {
        id: 'test-id',
        name: 'NoField',
        value: 10,
      } as any;

      mockStub.getDoc.mockResolvedValue({ v: 1, data: stateWithoutDeletedField });

      const isDeleted = await entity.isSoftDeleted();

      expect(isDeleted).toBe(false);
    });
  });

  describe('softDelete()', () => {
    it('should set deletedAt timestamp', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Active',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      vi.useFakeTimers().setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
      const result = await entity.softDelete();
      vi.useRealTimers();

      expect(result).toBe(true);
      expect(entity.state.deletedAt).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should return false when already soft deleted', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Deleted',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: '2024-01-01T01:00:00.000Z',
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });

      const result = await entity.softDelete();

      expect(result).toBe(false);
      expect(mockStub.casPut).not.toHaveBeenCalled();
    });
  });

  describe('restore()', () => {
    it('should set deletedAt to null', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Deleted',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: '2024-01-02T00:00:00.000Z',
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.casPut.mockResolvedValue({ ok: true, v: 2 });

      const result = await entity.restore();

      expect(result).toBe(true);
      expect(entity.state.deletedAt).toBe(null);
    });

    it('should return false when not soft deleted', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Active',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });

      const result = await entity.restore();

      expect(result).toBe(false);
      expect(mockStub.casPut).not.toHaveBeenCalled();
    });
  });

  describe('delete()', () => {
    it('should delete document from storage', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'ToBeDeleted',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.del.mockResolvedValue(true);

      const result = await entity.delete();

      expect(result).toBe(true);
      expect(mockStub.del).toHaveBeenCalledWith('test:test-id');
      expect(entity['_version']).toBe(0);
    });

    it('should return false when deletion fails', async () => {
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.del.mockResolvedValue(false);

      const result = await entity.delete();

      expect(result).toBe(false);
    });

    it('should reset state to initial after deletion', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'ToBeDeleted',
        value: 10,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });
      mockStub.del.mockResolvedValue(true);

      await entity.delete();

      expect(entity.state).toEqual(TestEntity.initialState);
    });
  });

  describe('Edge Cases - Concurrent Modifications', () => {
    it('should handle rapid consecutive mutations', async () => {
      const currentState: TestState = {
        id: 'test-id',
        name: 'Start',
        value: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
      };

      mockStub.getDoc.mockResolvedValue({ v: 1, data: currentState });

      let callCount = 0;
      mockStub.casPut.mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
          return { ok: false };
        }
        return { ok: true, v: 1 + callCount };
      });

      const result = await entity.mutate((current) => ({
        ...current,
        value: current.value + 1,
      }));

      expect(result.value).toBe(1);
      expect(callCount).toBe(3);
    });
  });

  describe('Edge Cases - State without timestamps', () => {
    it('should work correctly with state that has no timestamp fields', async () => {
      type StateWithoutTimestamps = {
        id: string;
        data: string;
      };

      class NoTimestampsEntity extends Entity<StateWithoutTimestamps> {
        static readonly entityName = 'notimestamps';
        static readonly initialState: StateWithoutTimestamps = {
          id: '',
          data: '',
        };
      }

      const noTimestampsEntity = new NoTimestampsEntity(mockEnv, 'test-id');
      mockStub.getDoc.mockResolvedValue(null);
      mockStub.casPut.mockResolvedValue({ ok: true, v: 1 });

      const newState: StateWithoutTimestamps = {
        id: 'test-id',
        data: 'test',
      };

      await noTimestampsEntity.save(newState);

      expect(mockStub.casPut).toHaveBeenCalledWith(
        'notimestamps:test-id',
        0,
        newState
      );
    });
  });
});
