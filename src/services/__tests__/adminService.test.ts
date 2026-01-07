import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminService } from '../adminService';
import type { ApiResponse } from '@shared/types';

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.getDashboard();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/admin/dashboard', {
        headers: { 'Content-Type': 'application/json' },
      });
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
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.getUsers();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/admin/users', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should fetch users with filters', async () => {
      const filters = { role: 'student' as const, search: 'Budi' };
      const mockData: any[] = [];
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.getUsers(filters);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/admin/users?role=student&search=Budi', {
        headers: { 'Content-Type': 'application/json' },
      });
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
      const mockResponse: ApiResponse<typeof mockResult> = {
        success: true,
        data: mockResult,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.createUser(userData);

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/users',
        {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
      const mockResponse: ApiResponse<typeof mockResult> = {
        success: true,
        data: mockResult,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.updateUser(userId, userData);

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/users/student-01',
        {
          method: 'PUT',
          body: JSON.stringify(userData),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'student-01';
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      await adminService.deleteUser(userId);

      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/users/student-01',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should handle non-existent user', async () => {
      const userId = 'non-existent';
      const mockResponse: ApiResponse<unknown> = {
        success: false,
        error: 'User not found',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

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
      const mockResponse: ApiResponse<typeof mockData> = {
        success: true,
        data: mockData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.getSettings();

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/admin/settings', {
        headers: { 'Content-Type': 'application/json' },
      });
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
      const mockResponse: ApiResponse<typeof mockResult> = {
        success: true,
        data: mockResult,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await adminService.updateSettings(settings);

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/settings',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });
  });
});
