export const MIN_SCORE = 0;

export const MAX_SCORE = 100;

export function isValidScore(score: number | null | undefined): score is number {
  if (score === null || score === undefined) return false;
  return !isNaN(score) && score >= MIN_SCORE && score <= MAX_SCORE;
}
