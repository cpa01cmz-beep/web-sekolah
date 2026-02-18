import { THEME_COLORS } from '@/theme/colors';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

export type ChartColor = string;

export const CHART_COLORS = {
  primary: THEME_COLORS.PRIMARY,
  secondary: THEME_COLORS.SECONDARY,
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
} as const;

export const CHART_DEFAULTS = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  animationDuration: 300,
  responsiveHeight: 300,
} as const;
