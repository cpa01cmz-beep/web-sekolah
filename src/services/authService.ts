import { BaseUser, UserRole } from '@shared/types';
import { apiClient } from '@/lib/api-client';

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface AuthResponse {
  user: BaseUser;
  token: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient<{ token: string; user: BaseUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  static async logout(): Promise<void> {
    return Promise.resolve();
  }

  static async getCurrentUser(token: string): Promise<BaseUser | null> {
    if (!token) return null;

    try {
      const response = await apiClient<BaseUser>('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      return null;
    }
  }
}