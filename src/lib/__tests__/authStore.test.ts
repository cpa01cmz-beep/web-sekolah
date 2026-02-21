import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import { AuthService } from '../../services/authService';
import type { UserRole } from '@shared/types';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('initial state', () => {
    it('should have null user and token initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('login', () => {
    it('should successfully login and update state', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      };

      const loginSpy = vi.spyOn(AuthService, 'login').mockResolvedValue({
        user: {
          id: 'student-01',
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'test-token',
      });

      await useAuthStore
        .getState()
        .login(credentials.email, credentials.password, credentials.role);

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: 'student-01',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(state.token).toBe('test-token');
      expect(loginSpy).toHaveBeenCalledWith(credentials);
    });

    it('should store token in localStorage on successful login', async () => {
      const credentials = {
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher' as UserRole,
      };

      vi.spyOn(AuthService, 'login').mockResolvedValue({
        user: {
          id: 'teacher-01',
          name: 'Test Teacher',
          email: 'teacher@example.com',
          role: 'teacher',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'teacher-token',
      });

      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      await useAuthStore
        .getState()
        .login(credentials.email, credentials.password, credentials.role);

      expect(setItemSpy).toHaveBeenCalledWith('authToken', 'teacher-token');
    });

    it('should throw error and not update state on failed login', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'wrong-password',
        role: 'student' as UserRole,
      };

      vi.spyOn(AuthService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login(credentials.email, credentials.password, credentials.role)
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });

    it('should not update localStorage on failed login', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'wrong-password',
        role: 'student' as UserRole,
      };

      vi.spyOn(AuthService, 'login').mockRejectedValue(new Error('Invalid credentials'));

      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      try {
        await useAuthStore
          .getState()
          .login(credentials.email, credentials.password, credentials.role);
      } catch (error) {
        // Expected error
      }

      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear state', async () => {
      useAuthStore.setState({
        user: {
          id: 'student-01',
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'test-token',
      });

      const logoutSpy = vi.spyOn(AuthService, 'logout').mockResolvedValue(undefined);

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should clear state even if logout API call fails', async () => {
      useAuthStore.setState({
        user: {
          id: 'student-01',
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'test-token',
      });

      vi.spyOn(AuthService, 'logout').mockRejectedValue(new Error('Logout failed'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('should restore user state from valid stored token', async () => {
      const storedToken = 'mock-jwt-token-student-01-1234567890';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(storedToken);

      vi.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({
        id: 'student-01',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: 'student-01',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(state.token).toBe(storedToken);
    });

    it('should clear invalid token from localStorage', async () => {
      const invalidToken = 'invalid-token';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(invalidToken);

      vi.spyOn(AuthService, 'getCurrentUser').mockResolvedValue(null);

      const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(removeItemSpy).toHaveBeenCalledWith('authToken');
    });

    it('should do nothing when no token is stored', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const getCurrentUserSpy = vi.spyOn(AuthService, 'getCurrentUser');

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(getCurrentUserSpy).not.toHaveBeenCalled();
    });

    it('should handle API errors during initialization', async () => {
      const storedToken = 'mock-jwt-token-student-01-1234567890';

      vi.spyOn(localStorage, 'getItem').mockReturnValue(storedToken);

      vi.spyOn(AuthService, 'getCurrentUser').mockRejectedValue(new Error('Network error'));

      const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(removeItemSpy).toHaveBeenCalledWith('authToken');
    });

    it('should not clear state if getCurrentUser returns null without error', async () => {
      useAuthStore.setState({
        user: {
          id: 'student-01',
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'existing-token',
      });

      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.token).toBe('existing-token');
    });
  });
});
