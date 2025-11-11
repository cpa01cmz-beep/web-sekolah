// ====================
// Authentication Store
// ====================

import { create } from 'zustand';
import { BaseUser, UserRole } from '@shared/types';
import { AuthService } from '@/services/authService';

// ====================
// Types
// ====================

interface AuthState {
  user: BaseUser | null;
  token: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// ====================
// Store Implementation
// ====================

/**
 * Zustand store for authentication state management
 * Handles user login, logout, and authentication initialization
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  /**
   * Authenticate user with email, password, and role
   * @param email - User's email address
   * @param password - User's password
   * @param role - User's role in the system
   * @throws Error if authentication fails
   */
  login: async (email, password, role) => {
    try {
      const authResponse = await AuthService.login({ email, password, role });
      localStorage.setItem('authToken', authResponse.token);
      set({ user: authResponse.user, token: authResponse.token });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user and clear authentication state
   * Clears both in-memory state and any stored tokens
   */
  logout: async () => {
    try {
      await AuthService.logout();
      set({ user: null, token: null });
    } catch (error) {
      console.error('Logout failed:', error);
      set({ user: null, token: null }); // Clear state anyway
    }
  },
  
  /**
   * Initialize authentication state from stored token
   * Checks for a stored token and validates it to restore session
   */
  initializeAuth: async () => {
    // Check for stored token and validate it
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const user = await AuthService.getCurrentUser(storedToken);
        if (user) {
          set({ user, token: storedToken });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('authToken');
      }
    }
  },
}));