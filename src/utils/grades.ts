import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import { GradeThresholds } from '@shared/constants';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'F';

const GRADE_THRESHOLDS: readonly { min: number; grade: GradeLetter; colorClass: string; variant: BadgeVariant }[] = [
  { min: GradeThresholds.A, grade: 'A', colorClass: 'bg-green-500 hover:bg-green-600', variant: 'default' },
  { min: GradeThresholds.B, grade: 'B', colorClass: 'bg-blue-500 hover:bg-blue-600', variant: 'secondary' },
  { min: GradeThresholds.C, grade: 'C', colorClass: 'bg-yellow-500 hover:bg-yellow-600', variant: 'outline' },
  { min: GradeThresholds.D, grade: 'D', colorClass: 'bg-red-500 hover:bg-red-600', variant: 'destructive' },
  { min: 0, grade: 'F', colorClass: 'bg-red-500 hover:bg-red-600', variant: 'destructive' },
];

function getGradeInfo(score: number): { grade: GradeLetter; colorClass: string; variant: BadgeVariant } {
  const info = GRADE_THRESHOLDS.find(t => score >= t.min);
  return info ?? GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];
}

export function getGradeLetter(score: number): GradeLetter {
  return getGradeInfo(score).grade;
}

export function getGradeColorClass(score: number): string {
  return getGradeInfo(score).colorClass;
}

export function getGradeBadgeVariant(score: number): BadgeVariant {
  return getGradeInfo(score).variant;
}

export function calculateAverageScore(grades: { score: number }[]): string {
  if (grades.length === 0) return '0.00';
  const sum = grades.reduce((acc, curr) => acc + curr.score, 0);
  return (sum / grades.length).toFixed(2);
}
