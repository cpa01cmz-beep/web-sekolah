import { BaseUser, UserRole } from '@shared/types';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config/api-endpoints';

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
      const response = await apiClient<{ token: string; user: BaseUser }>(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return {
        token: response.token,
        user: response.user,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && error.message ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  }

  static async logout(): Promise<void> {
    return Promise.resolve();
  }

  static async getCurrentUser(token: string): Promise<BaseUser | null> {
    if (!token) return null;

    try {
      const response = await apiClient<BaseUser>(API_ENDPOINTS.AUTH.VERIFY, {
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