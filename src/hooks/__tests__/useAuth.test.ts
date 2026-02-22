import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/lib/authStore';
import { AuthService } from '@/services/authService';
import type { UserRole } from '@shared/types';

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return null user and token initially', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.userId).toBeUndefined();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('authenticated state', () => {
    it('should return user data when authenticated', () => {
      const mockUser = {
        id: 'student-01',
        name: 'Test Student',
        email: 'student@example.com',
        role: 'student' as UserRole,
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      useAuthStore.setState({ user: mockUser, token: 'test-token' });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('test-token');
      expect(result.current.userId).toBe('student-01');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return userId as undefined when user is null', () => {
      useAuthStore.setState({ user: null, token: null });

      const { result } = renderHook(() => useAuth());

      expect(result.current.userId).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should provide login function that updates store', async () => {
      const credentials = {
        email: 'student@example.com',
        password: 'password123',
        role: 'student' as UserRole,
      };

      vi.spyOn(AuthService, 'login').mockResolvedValue({
        user: {
          id: 'student-01',
          name: 'Test Student',
          email: 'student@example.com',
          role: 'student',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(
          credentials.email,
          credentials.password,
          credentials.role
        );
      });

      expect(result.current.user?.id).toBe('student-01');
      expect(result.current.token).toBe('test-token');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should provide logout function that clears store', async () => {
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

      vi.spyOn(AuthService, 'logout').mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should be true when token exists', () => {
      useAuthStore.setState({
        user: null,
        token: 'some-token',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should be false when token is null', () => {
      useAuthStore.setState({
        user: null,
        token: null,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('userId convenience', () => {
    it('should return userId when user exists', () => {
      useAuthStore.setState({
        user: {
          id: 'teacher-01',
          name: 'Test Teacher',
          email: 'teacher@example.com',
          role: 'teacher',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        token: 'test-token',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.userId).toBe('teacher-01');
    });

    it('should return undefined when user is null', () => {
      useAuthStore.setState({ user: null, token: null });

      const { result } = renderHook(() => useAuth());

      expect(result.current.userId).toBeUndefined();
    });
  });
});
