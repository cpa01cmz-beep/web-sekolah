import { THEME_COLORS } from '@/theme/colors'

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface MultiSeriesDataPoint {
  name: string
  [key: string]: string | number
}

export type ChartColor = string

export { CHART_COLORS } from '@/theme/colors'

export const CHART_DEFAULTS = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  animationDuration: 300,
  responsiveHeight: 300,
} as const
