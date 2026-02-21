import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import {
  GRADE_A_THRESHOLD,
  GRADE_B_THRESHOLD,
  GRADE_C_THRESHOLD,
  PASSING_SCORE_THRESHOLD,
} from '@/constants/grades';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export function getGradeLetter(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_A_THRESHOLD) return 'A';
  if (score >= GRADE_B_THRESHOLD) return 'B';
  if (score >= GRADE_C_THRESHOLD) return 'C';
  if (score >= PASSING_SCORE_THRESHOLD) return 'D';
  return 'F';
}

export function getGradeColorClass(score: number): string {
  if (score >= GRADE_A_THRESHOLD) return 'bg-green-500 hover:bg-green-600';
  if (score >= GRADE_B_THRESHOLD) return 'bg-blue-500 hover:bg-blue-600';
  if (score >= GRADE_C_THRESHOLD) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-red-500 hover:bg-red-600';
}

export function getGradeBadgeVariant(score: number): BadgeVariant {
  if (score >= GRADE_A_THRESHOLD) return 'default';
  if (score >= GRADE_B_THRESHOLD) return 'secondary';
  if (score >= GRADE_C_THRESHOLD) return 'outline';
  return 'destructive';
}

export function calculateAverageScore(grades: { score: number }[]): string {
  if (grades.length === 0) return '0.00';
  return (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(2);
}
