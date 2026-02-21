import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

const GRADE_THRESHOLDS: readonly [threshold: number, letter: 'A' | 'B' | 'C' | 'D' | 'F'][] = [
  [90, 'A'],
  [80, 'B'],
  [70, 'C'],
  [60, 'D'],
] as const;

export function getGradeLetter(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  for (const [threshold, letter] of GRADE_THRESHOLDS) {
    if (score >= threshold) return letter;
  }
  return 'F';
}

const GRADE_COLOR_CLASSES: readonly [threshold: number, className: string][] = [
  [90, 'bg-green-500 hover:bg-green-600'],
  [80, 'bg-blue-500 hover:bg-blue-600'],
  [70, 'bg-yellow-500 hover:bg-yellow-600'],
  [0, 'bg-red-500 hover:bg-red-600'],
] as const;

export function getGradeColorClass(score: number): string {
  for (const [threshold, className] of GRADE_COLOR_CLASSES) {
    if (score >= threshold) return className;
  }
  return 'bg-red-500 hover:bg-red-600';
}

const GRADE_BADGE_VARIANTS: readonly [threshold: number, variant: BadgeVariant][] = [
  [90, 'default'],
  [80, 'secondary'],
  [70, 'outline'],
  [0, 'destructive'],
] as const;

export function getGradeBadgeVariant(score: number): BadgeVariant {
  for (const [threshold, variant] of GRADE_BADGE_VARIANTS) {
    if (score >= threshold) return variant;
  }
  return 'destructive';
}

export function calculateAverageScore(grades: { score: number }[]): string {
  if (grades.length === 0) return '0.00';
  return (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(2);
}
