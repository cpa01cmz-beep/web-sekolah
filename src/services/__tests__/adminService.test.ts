import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAdminService } from '../adminService';
import { MockRepository } from '@/test/utils/mocks';

describe('AdminService', () => {
  let mockRepository: MockRepository;

  beforeEach(() => {
    mockRepository = new MockRepository();
  });

  afterEach(() => {
    mockRepository.reset();
  });

  describe('getDashboard', () => {
    it('should fetch admin dashboard data', async () => {
      const mockData = {
        totalStudents: 450,
        totalTeachers: 35,
        totalClasses: 15,
        recentAnnouncements: [
          {
            id: 'ann-01',
            title: 'Ujian Semester',
            content: 'Ujian akan dilaksanakan...',
            date: '2025-01-07',
            authorId: 'teacher-01',
          },
        ],
        systemStatus: 'Operational',
      };

      mockRepository.setMockData('/api/admin/dashboard', mockData);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.getDashboard();

      expect(result).toEqual(mockData);
      expect(result.totalStudents).toBe(450);
    });

    it('should handle errors when fetching dashboard', async () => {
      const mockError = new Error('Failed to fetch dashboard');
      mockError.name = 'ApiError';
      (mockError as any).status = 500;

      mockRepository.setMockError('/api/admin/dashboard', mockError);
      const adminService = createAdminService(mockRepository);

      await expect(adminService.getDashboard()).rejects.toThrow('Failed to fetch dashboard');
    });
  });

  describe('getUsers', () => {
    it('should fetch all users', async () => {
      const mockData = [
        {
          id: 'student-01',
          name: 'Budi Hartono',
          email: 'budi@example.com',
          role: 'student' as const,
          avatarUrl: 'https://example.com/avatar.jpg',
          classId: '11-A',
          studentIdNumber: '2025001',
        },
        {
          id: 'teacher-01',
          name: 'Ibu Siti',
          email: 'siti@example.com',
          role: 'teacher' as const,
          avatarUrl: 'https://example.com/avatar.jpg',
          classIds: ['class-01', 'class-02'],
        },
      ];

      mockRepository.setMockData('/api/admin/users', mockData);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.getUsers();

      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should fetch users with filters', async () => {
      const filters = { role: 'student' as const, search: 'Budi' };
      const mockData: any[] = [];

      mockRepository.setMockData('/api/admin/users?role=student&search=Budi', mockData);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.getUsers(filters);

      expect(result).toEqual([]);
    });

    it('should handle empty user list', async () => {
      const mockData: any[] = [];

      mockRepository.setMockData('/api/admin/users', mockData);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.getUsers();

      expect(result).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student' as const,
        classId: '11-A',
        studentIdNumber: '2025002',
      };
      const mockResult = {
        id: 'student-02',
        ...userData,
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      mockRepository.setMockData('/api/admin/users', mockResult);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.createUser(userData);

      expect(result).toEqual(mockResult);
      expect(result.name).toBe('John Doe');
    });

    it('should handle validation errors when creating user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        role: 'student' as const,
      };
      const mockError = new Error('Invalid email format');
      mockError.name = 'ApiError';
      (mockError as any).status = 400;

      mockRepository.setMockError('/api/admin/users', mockError);
      const adminService = createAdminService(mockRepository);

      await expect(adminService.createUser(userData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userId = 'student-01';
      const userData = {
        name: 'Budi Hartono Updated',
        email: 'budi.updated@example.com',
      };
      const mockResult = {
        id: userId,
        name: 'Budi Hartono Updated',
        email: 'budi.updated@example.com',
        role: 'student' as const,
        avatarUrl: 'https://example.com/avatar.jpg',
        classId: '11-A',
        studentIdNumber: '2025001',
      };

      mockRepository.setMockData(`/api/admin/users/${userId}`, mockResult);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.updateUser(userId, userData);

      expect(result).toEqual(mockResult);
      expect(result.name).toBe('Budi Hartono Updated');
    });

    it('should handle non-existent user when updating', async () => {
      const userId = 'non-existent';
      const userData = { name: 'Updated Name' };
      const mockError = new Error('User not found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/admin/users/${userId}`, mockError);
      const adminService = createAdminService(mockRepository);

      await expect(adminService.updateUser(userId, userData)).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'student-01';

      mockRepository.setMockData(`/api/admin/users/${userId}`, null);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.deleteUser(userId);

      expect(result).toBeNull();
    });

    it('should handle non-existent user', async () => {
      const userId = 'non-existent';
      const mockError = new Error('User not found');
      mockError.name = 'ApiError';
      (mockError as any).status = 404;

      mockRepository.setMockError(`/api/admin/users/${userId}`, mockError);
      const adminService = createAdminService(mockRepository);

      await expect(adminService.deleteUser(userId)).rejects.toThrow('User not found');
    });
  });

  describe('getSettings', () => {
    it('should fetch system settings', async () => {
      const mockData = {
        schoolName: 'SMA Harapan Bangsa',
        academicYear: '2025/2026',
        semester: 1,
        allowRegistration: true,
        maintenanceMode: false,
      };

      mockRepository.setMockData('/api/admin/settings', mockData);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.getSettings();

      expect(result).toEqual(mockData);
      expect(result.schoolName).toBe('SMA Harapan Bangsa');
    });

    it('should handle errors when fetching settings', async () => {
      const mockError = new Error('Failed to fetch settings');
      mockError.name = 'ApiError';
      (mockError as any).status = 500;

      mockRepository.setMockError('/api/admin/settings', mockError);
      const adminService = createAdminService(mockRepository);

      await expect(adminService.getSettings()).rejects.toThrow('Failed to fetch settings');
    });
  });

  describe('updateSettings', () => {
    it('should update system settings', async () => {
      const settings = {
        schoolName: 'SMA Harapan Bangsa',
        allowRegistration: false,
      };
      const mockResult = {
        schoolName: 'SMA Harapan Bangsa',
        academicYear: '2025/2026',
        semester: 1,
        allowRegistration: false,
        maintenanceMode: false,
      };

      mockRepository.setMockData('/api/admin/settings', mockResult);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.updateSettings(settings);

      expect(result).toEqual(mockResult);
      expect(result.allowRegistration).toBe(false);
    });

    it('should handle partial updates', async () => {
      const settings = {
        maintenanceMode: true,
      };
      const mockResult = {
        schoolName: 'SMA Harapan Bangsa',
        academicYear: '2025/2026',
        semester: 1,
        allowRegistration: true,
        maintenanceMode: true,
      };

      mockRepository.setMockData('/api/admin/settings', mockResult);
      const adminService = createAdminService(mockRepository);

      const result = await adminService.updateSettings(settings);

      expect(result).toEqual(mockResult);
    });
  });
});
