import { BaseUser, UserRole } from '@shared/types';

// In a real application, this would make actual API calls
// For now, we'll keep the mock implementation but with a proper service layer

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
  // Simulate API call delay
  private static async simulateApiCall<T>(data: T, delay = 500): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // In a real app, this would make an API call to authenticate the user
    const mockUsers: Record<UserRole, BaseUser> = {
      student: { 
        id: 'student-01', 
        name: 'Budi Hartono', 
        email: credentials.email || 'budi@example.com', 
        role: 'student', 
        avatarUrl: 'https://i.pravatar.cc/150?u=student01' 
      },
      teacher: { 
        id: 'teacher-01', 
        name: 'Ibu Siti', 
        email: credentials.email || 'siti@example.com', 
        role: 'teacher', 
        avatarUrl: 'https://i.pravatar.cc/150?u=teacher01' 
      },
      parent: { 
        id: 'parent-01', 
        name: 'Ayah Budi', 
        email: credentials.email || 'ayah.budi@example.com', 
        role: 'parent', 
        avatarUrl: 'https://i.pravatar.cc/150?u=parent01' 
      },
      admin: { 
        id: 'admin-01', 
        name: 'Admin Sekolah', 
        email: credentials.email || 'admin@example.com', 
        role: 'admin', 
        avatarUrl: 'https://i.pravatar.cc/150?u=admin01' 
      },
    };

    // Simulate authentication check
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const user = mockUsers[credentials.role];
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return this.simulateApiCall({ user, token });
  }

  static async logout(): Promise<void> {
    // In a real app, this would invalidate the token on the server
    return this.simulateApiCall(undefined);
  }

  static async getCurrentUser(token: string): Promise<BaseUser | null> {
    // In a real app, this would verify the token and fetch user data
    if (!token) return null;
    
    // Extract user role from token (simplified)
    const roleMatch = token.match(/mock-jwt-token-(\w+)-\d+-/);
    if (!roleMatch) return null;
    
    const userId = roleMatch[1];
    // Map user ID to role
    const roleMap: Record<string, UserRole> = {
      'student-01': 'student',
      'teacher-01': 'teacher', 
      'parent-01': 'parent',
      'admin-01': 'admin'
    };
    
    const role = roleMap[userId];
    if (!role) return null;
    const mockUsers: Record<UserRole, BaseUser> = {
      student: { 
        id: 'student-01', 
        name: 'Budi Hartono', 
        email: 'budi@example.com', 
        role: 'student', 
        avatarUrl: 'https://i.pravatar.cc/150?u=student01' 
      },
      teacher: { 
        id: 'teacher-01', 
        name: 'Ibu Siti', 
        email: 'siti@example.com', 
        role: 'teacher', 
        avatarUrl: 'https://i.pravatar.cc/150?u=teacher01' 
      },
      parent: { 
        id: 'parent-01', 
        name: 'Ayah Budi', 
        email: 'ayah.budi@example.com', 
        role: 'parent', 
        avatarUrl: 'https://i.pravatar.cc/150?u=parent01' 
      },
      admin: { 
        id: 'admin-01', 
        name: 'Admin Sekolah', 
        email: 'admin@example.com', 
        role: 'admin', 
        avatarUrl: 'https://i.pravatar.cc/150?u=admin01' 
      },
    };

    return this.simulateApiCall(mockUsers[role] || null);
  }
}