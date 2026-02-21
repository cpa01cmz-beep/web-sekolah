import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from '../storage';

describe('storage utility', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  afterEach(() => {
    // Clear localStorage after each test
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  describe('setItem', () => {
    it('should store a string value', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';

      // Act
      storage.setItem(key, value);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value);
    });

    it('should overwrite existing value', () => {
      // Arrange
      const key = 'test-key';
      const value1 = 'test-value-1';
      const value2 = 'test-value-2';

      // Act
      storage.setItem(key, value1);
      storage.setItem(key, value2);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value2);
    });

    it('should store empty string', () => {
      // Arrange
      const key = 'test-key';
      const value = '';

      // Act
      storage.setItem(key, value);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value);
    });

    it('should store special characters', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      // Act
      storage.setItem(key, value);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value);
    });

    it('should store unicode characters', () => {
      // Arrange
      const key = 'test-key';
      const value = 'Hello 世界 🌍';

      // Act
      storage.setItem(key, value);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBe(value);
    });

    it('should throw error in server environment', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';

      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.setItem(key, value)).toThrow(
          'Storage is not available in server environment'
        );
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });

    it('should throw error when localStorage is unavailable', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';

      // Mock localStorage to throw error
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage unavailable');
          },
        },
        writable: true,
      });

      try {
        // Act & Assert
        expect(() => storage.setItem(key, value)).toThrow('Storage is not available');
      } finally {
        // Restore localStorage
        global.localStorage = originalLocalStorage;
      }
    });
  });

  describe('getItem', () => {
    it('should retrieve stored value', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      localStorage.setItem(key, value);

      // Act
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(value);
    });

    it('should return null for non-existent key', () => {
      // Arrange
      const key = 'non-existent-key';

      // Act
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should return null for empty key', () => {
      // Arrange
      const key = '';

      // Act
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should return empty string when stored', () => {
      // Arrange
      const key = 'test-key';
      const value = '';
      localStorage.setItem(key, value);

      // Act
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(value);
    });

    it('should retrieve value with special characters', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      localStorage.setItem(key, value);

      // Act
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(value);
    });

    it('should throw error in server environment', () => {
      // Arrange
      const key = 'test-key';

      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.getItem(key)).toThrow(
          'Storage is not available in server environment'
        );
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });
  });

  describe('removeItem', () => {
    it('should remove stored value', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test-value';
      localStorage.setItem(key, value);

      // Act
      storage.removeItem(key);

      // Assert
      const retrieved = localStorage.getItem(key);
      expect(retrieved).toBeNull();
    });

    it('should not throw error for non-existent key', () => {
      // Arrange
      const key = 'non-existent-key';

      // Act
      storage.removeItem(key);

      // Assert - Should not throw
      expect(true).toBe(true);
    });

    it('should remove multiple keys independently', () => {
      // Arrange
      const key1 = 'test-key-1';
      const key2 = 'test-key-2';
      localStorage.setItem(key1, 'value1');
      localStorage.setItem(key2, 'value2');

      // Act
      storage.removeItem(key1);

      // Assert
      expect(localStorage.getItem(key1)).toBeNull();
      expect(localStorage.getItem(key2)).toBe('value2');
    });

    it('should throw error in server environment', () => {
      // Arrange
      const key = 'test-key';

      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.removeItem(key)).toThrow(
          'Storage is not available in server environment'
        );
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });
  });

  describe('clear', () => {
    it('should clear all stored values', () => {
      // Arrange
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      // Act
      storage.clear();

      // Assert
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
      expect(localStorage.getItem('key3')).toBeNull();
      expect(localStorage.length).toBe(0);
    });

    it('should work on empty storage', () => {
      // Arrange - Storage is already empty

      // Act
      storage.clear();

      // Assert - Should not throw
      expect(true).toBe(true);
    });

    it('should throw error in server environment', () => {
      // Arrange
      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.clear()).toThrow('Storage is not available in server environment');
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });
  });

  describe('setObject', () => {
    it('should store object', () => {
      // Arrange
      const key = 'test-key';
      const value = { name: 'John', age: 30 };

      // Act
      storage.setObject(key, value);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toEqual(value);
    });

    it('should store array', () => {
      // Arrange
      const key = 'test-key';
      const value = [1, 2, 3, 4, 5];

      // Act
      storage.setObject(key, value);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toEqual(value);
    });

    it('should store nested object', () => {
      // Arrange
      const key = 'test-key';
      const value = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      };

      // Act
      storage.setObject(key, value);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toEqual(value);
    });

    it('should store null', () => {
      // Arrange
      const key = 'test-key';
      const value = null;

      // Act
      storage.setObject(key, value);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toBeNull();
    });

    it('should overwrite existing object', () => {
      // Arrange
      const key = 'test-key';
      const value1 = { name: 'John', age: 30 };
      const value2 = { name: 'Jane', age: 25 };

      // Act
      storage.setObject(key, value1);
      storage.setObject(key, value2);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toEqual(value2);
    });

    it('should store object with special characters in values', () => {
      // Arrange
      const key = 'test-key';
      const value = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello! 你好 🌍',
      };

      // Act
      storage.setObject(key, value);

      // Assert
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(retrieved).toEqual(value);
    });

    it('should throw error in server environment', () => {
      // Arrange
      const key = 'test-key';
      const value = { name: 'John' };

      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.setObject(key, value)).toThrow(
          'Storage is not available in server environment'
        );
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });
  });

  describe('getObject', () => {
    it('should retrieve stored object', () => {
      // Arrange
      const key = 'test-key';
      const value = { name: 'John', age: 30 };
      localStorage.setItem(key, JSON.stringify(value));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(value);
    });

    it('should retrieve stored array', () => {
      // Arrange
      const key = 'test-key';
      const value = [1, 2, 3, 4, 5];
      localStorage.setItem(key, JSON.stringify(value));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(value);
    });

    it('should retrieve nested object', () => {
      // Arrange
      const key = 'test-key';
      const value = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      };
      localStorage.setItem(key, JSON.stringify(value));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      // Arrange
      const key = 'non-existent-key';

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      // Arrange
      const key = 'test-key';
      localStorage.setItem(key, 'invalid json');

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      // Arrange
      const key = 'test-key';
      localStorage.setItem(key, '{"name": "John"');

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should handle empty object', () => {
      // Arrange
      const key = 'test-key';
      const value = {};
      localStorage.setItem(key, JSON.stringify(value));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(value);
    });

    it('should retrieve null stored as JSON', () => {
      // Arrange
      const key = 'test-key';
      localStorage.setItem(key, JSON.stringify(null));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toBeNull();
    });

    it('should handle unicode characters in object', () => {
      // Arrange
      const key = 'test-key';
      const value = {
        message: 'Hello 世界 🌍',
        emoji: '😀',
      };
      localStorage.setItem(key, JSON.stringify(value));

      // Act
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(value);
    });

    it('should throw error in server environment', () => {
      // Arrange
      const key = 'test-key';

      // Mock window as undefined
      const originalWindow = global.window;
      delete (global as any).window;

      try {
        // Act & Assert
        expect(() => storage.getObject(key)).toThrow(
          'Storage is not available in server environment'
        );
      } finally {
        // Restore window
        global.window = originalWindow;
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should support auth token storage pattern', () => {
      // Arrange - Typical auth token usage
      const tokenKey = 'auth-token';
      const token = 'eyJhbGciOiJIUzI1NiIs...';

      // Act
      storage.setItem(tokenKey, token);
      const retrievedToken = storage.getItem(tokenKey);

      // Assert
      expect(retrievedToken).toBe(token);
    });

    it('should support user profile storage pattern', () => {
      // Arrange - Typical user profile usage
      const profileKey = 'user-profile';
      const profile = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
      };

      // Act
      storage.setObject(profileKey, profile);
      const retrievedProfile = storage.getObject(profileKey);

      // Assert
      expect(retrievedProfile).toEqual(profile);
    });

    it('should support theme preference pattern', () => {
      // Arrange - Typical theme usage
      const themeKey = 'theme';
      const theme = 'dark';

      // Act
      storage.setItem(themeKey, theme);
      const retrievedTheme = storage.getItem(themeKey);

      // Assert
      expect(retrievedTheme).toBe(theme);
    });

    it('should support session management pattern', () => {
      // Arrange - Typical session usage
      const sessionKey = 'session-data';
      const session = {
        userId: '123',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      // Act
      storage.setObject(sessionKey, session);
      const retrievedSession = storage.getObject(sessionKey);

      // Assert
      expect(retrievedSession).toEqual(session);
    });

    it('should support array data pattern', () => {
      // Arrange - Typical array usage (recent items, history, etc.)
      const historyKey = 'recent-items';
      const history = ['item1', 'item2', 'item3'];

      // Act
      storage.setObject(historyKey, history);
      const retrievedHistory = storage.getObject(historyKey);

      // Assert
      expect(retrievedHistory).toEqual(history);
    });

    it('should handle token removal on logout', () => {
      // Arrange - Simulate login
      const tokenKey = 'auth-token';
      const profileKey = 'user-profile';
      storage.setItem(tokenKey, 'token123');
      storage.setObject(profileKey, { id: '123', name: 'John' });

      // Act - Simulate logout
      storage.removeItem(tokenKey);
      storage.removeItem(profileKey);

      // Assert
      expect(storage.getItem(tokenKey)).toBeNull();
      expect(storage.getObject(profileKey)).toBeNull();
    });

    it('should handle multiple independent keys', () => {
      // Arrange

      // Act - Store multiple items
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.setObject('key3', { data: 'object1' });
      storage.setObject('key4', { data: 'object2' });

      // Assert - All items retrievable independently
      expect(storage.getItem('key1')).toBe('value1');
      expect(storage.getItem('key2')).toBe('value2');
      expect(storage.getObject('key3')).toEqual({ data: 'object1' });
      expect(storage.getObject('key4')).toEqual({ data: 'object2' });
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle very large strings', () => {
      // Arrange
      const key = 'test-key';
      const largeString = 'a'.repeat(100000);

      // Act
      storage.setItem(key, largeString);
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(largeString);
    });

    it('should handle very large objects', () => {
      // Arrange
      const key = 'test-key';
      const largeObject = { data: 'a'.repeat(100000) };

      // Act
      storage.setObject(key, largeObject);
      const retrieved = storage.getObject(key);

      // Assert
      expect(retrieved).toEqual(largeObject);
    });

    it('should handle empty key name', () => {
      // Arrange
      const key = '';
      const value = 'test-value';

      // Act
      storage.setItem(key, value);
      const retrieved = storage.getItem(key);

      // Assert - Empty key is valid in localStorage
      expect(retrieved).toBe(value);
    });

    it('should handle key with spaces', () => {
      // Arrange
      const key = 'test key with spaces';
      const value = 'test-value';

      // Act
      storage.setItem(key, value);
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(value);
    });

    it('should handle key with special characters', () => {
      // Arrange
      const key = 'test!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const value = 'test-value';

      // Act
      storage.setItem(key, value);
      const retrieved = storage.getItem(key);

      // Assert
      expect(retrieved).toBe(value);
    });

    it('should handle cyclic object gracefully', () => {
      // Arrange
      const key = 'test-key';
      const cyclicObject: any = { name: 'John' };
      cyclicObject.self = cyclicObject;

      // Act & Assert - Should throw error for cyclic objects
      expect(() => storage.setObject(key, cyclicObject)).toThrow(
        'Converting circular structure to JSON'
      );
    });
  });
});
