import { UserRole } from '@shared/types'

export const THEME_COLORS = {
  PRIMARY: '#0D47A1',
  PRIMARY_HOVER: '#0b3a8a',
  SECONDARY: '#00ACC1',
  SECONDARY_HOVER: '#008a99',
  BACKGROUND: '#F5F7FA',
} as const

export const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#ef4444',
  F: '#dc2626',
} as const

export const CHART_COLORS = {
  primary: THEME_COLORS.PRIMARY,
  secondary: THEME_COLORS.SECONDARY,
  success: GRADE_COLORS.A,
  warning: GRADE_COLORS.C,
  error: GRADE_COLORS.D,
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
} as const

export const ROLE_COLORS: Record<UserRole, { color: string; label: string }> = {
  student: { color: 'bg-blue-500', label: 'Student' },
  teacher: { color: 'bg-green-500', label: 'Teacher' },
  parent: { color: 'bg-purple-500', label: 'Parent' },
  admin: { color: 'bg-red-500', label: 'Admin' },
}
