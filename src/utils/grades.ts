import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import {
  GRADE_A_THRESHOLD,
  GRADE_B_THRESHOLD,
  GRADE_C_THRESHOLD,
  PASSING_SCORE_THRESHOLD
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

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

export function getGradeDistribution(grades: { score: number }[]): GradeDistribution {
  const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  
  for (const grade of grades) {
    const letter = getGradeLetter(grade.score);
    distribution[letter]++;
  }
  
  return distribution;
}

export function getPassingGradeCount(distribution: GradeDistribution): number {
  return distribution.A + distribution.B + distribution.C + distribution.D;
}

export function getPassingRate(grades: { score: number }[]): string {
  if (grades.length === 0) return '0.00';
  const passingCount = grades.filter(g => g.score >= PASSING_SCORE_THRESHOLD).length;
  return ((passingCount / grades.length) * 100).toFixed(1);
}
