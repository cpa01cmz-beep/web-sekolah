import { create } from 'zustand';
import { BaseUser, UserRole } from '@shared/types';
interface AuthState {
  user: BaseUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
}
const mockUsers: Record<UserRole, BaseUser> = {
  student: { id: 'student-01', name: 'Budi Hartono', email: 'budi@example.com', role: 'student', avatarUrl: 'https://i.pravatar.cc/150?u=student01' },
  teacher: { id: 'teacher-01', name: 'Ibu Siti', email: 'siti@example.com', role: 'teacher', avatarUrl: 'https://i.pravatar.cc/150?u=teacher01' },
  parent: { id: 'parent-01', name: 'Ayah Budi', email: 'ayah.budi@example.com', role: 'parent', avatarUrl: 'https://i.pravatar.cc/150?u=parent01' },
  admin: { id: 'admin-01', name: 'Admin Sekolah', email: 'admin@example.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin01' },
};
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (role) => set({ user: mockUsers[role] }),
  logout: () => set({ user: null }),
}));