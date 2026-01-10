import { useQuery as useTanstackQuery, useMutation as useTanstackMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import type {
  AdminDashboardData,
  SchoolUser,
  UserFilters,
  CreateUserData,
  UpdateUserData,
  Announcement,
  CreateAnnouncementData,
  Settings
} from '@shared/types';
import { CachingTime } from '@/config/time';
import { createQueryOptions } from '@/config/query-config';

export function useAdminDashboard(options?: UseQueryOptions<AdminDashboardData>) {
  return useTanstackQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
    ...createQueryOptions<AdminDashboardData>({ staleTime: CachingTime.FIVE_MINUTES }),
    ...options,
  });
}

export function useUsers(filters?: UserFilters, options?: UseQueryOptions<SchoolUser[]>) {
  const queryKey = filters ? ['users', filters] : ['users'];

  return useTanstackQuery({
    queryKey,
    queryFn: () => adminService.getUsers(filters),
    ...createQueryOptions<SchoolUser[]>({ staleTime: CachingTime.FIVE_MINUTES }),
    ...options,
  });
}

export function useCreateUser(options?: UseMutationOptions<SchoolUser, Error, CreateUserData>) {
  return useTanstackMutation({
    mutationFn: (userData: CreateUserData) => adminService.createUser(userData),
    ...options,
  });
}

export function useUpdateUser(userId: string, options?: UseMutationOptions<SchoolUser, Error, UpdateUserData>) {
  return useTanstackMutation({
    mutationFn: (userData: UpdateUserData) => adminService.updateUser(userId, userData),
    ...options,
  });
}

export function useDeleteUser(userId: string, options?: UseMutationOptions<void, Error>) {
  return useTanstackMutation({
    mutationFn: () => adminService.deleteUser(userId),
    ...options,
  });
}

export function useAnnouncements(options?: UseQueryOptions<Announcement[]>) {
  return useTanstackQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => adminService.getAnnouncements(),
    ...createQueryOptions<Announcement[]>({ staleTime: CachingTime.FIVE_MINUTES }),
    ...options,
  });
}

export function useCreateAnnouncement(options?: UseMutationOptions<Announcement, Error, CreateAnnouncementData>) {
  return useTanstackMutation({
    mutationFn: (announcement: CreateAnnouncementData) => adminService.createAnnouncement(announcement),
    ...options,
  });
}

export function useSettings(options?: UseQueryOptions<Settings>) {
  return useTanstackQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminService.getSettings(),
    ...createQueryOptions<Settings>({ staleTime: CachingTime.THIRTY_MINUTES }),
    ...options,
  });
}

export function useUpdateSettings(options?: UseMutationOptions<Settings, Error, Partial<Settings>>) {
  return useTanstackMutation({
    mutationFn: (settings: Partial<Settings>) => adminService.updateSettings(settings),
    ...options,
  });
}
