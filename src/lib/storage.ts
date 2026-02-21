const isStorageAvailable = (storage: Storage): boolean => {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getStorage = (): Storage => {
  if (typeof window === 'undefined') {
    throw new Error('Storage is not available in server environment');
  }

  if (!isStorageAvailable(localStorage)) {
    throw new Error('Storage is not available');
  }

  return localStorage;
};

export const storage = {
  setItem: (key: string, value: string): void => {
    const storage = getStorage();
    storage.setItem(key, value);
  },

  getItem: (key: string): string | null => {
    const storage = getStorage();
    return storage.getItem(key);
  },

  removeItem: (key: string): void => {
    const storage = getStorage();
    storage.removeItem(key);
  },

  clear: (): void => {
    const storage = getStorage();
    storage.clear();
  },

  setObject: <T>(key: string, value: T): void => {
    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
  },

  getObject: <T>(key: string): T | null => {
    const item = storage.getItem(key);
    if (item === null) {
      return null;
    }
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },
};
