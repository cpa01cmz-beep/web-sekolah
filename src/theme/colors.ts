import { UserRole } from '@shared/types';

export const THEME_COLORS = {
  PRIMARY: '#0D47A1',
  PRIMARY_HOVER: '#0b3a8a',
  SECONDARY: '#00ACC1',
  SECONDARY_HOVER: '#008a99',
  BACKGROUND: '#F5F7FA',
} as const;

export const ROLE_COLORS: Record<UserRole, { color: string; label: string }> = {
  student: { color: 'bg-blue-500', label: 'Student' },
  teacher: { color: 'bg-green-500', label: 'Teacher' },
  parent: { color: 'bg-purple-500', label: 'Parent' },
  admin: { color: 'bg-red-500', label: 'Admin' },
};
