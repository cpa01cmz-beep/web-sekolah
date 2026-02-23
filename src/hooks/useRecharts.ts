import { useState, useEffect, useMemo, useRef } from 'react'
import { logger } from '@/lib/logger'

type ChartType =
  | 'BarChart'
  | 'LineChart'
  | 'PieChart'
  | 'AreaChart'
  | 'RadarChart'
  | 'ScatterChart'
  | 'ComposedChart'

type CartesianType =
  | 'Bar'
  | 'Line'
  | 'Area'
  | 'XAxis'
  | 'YAxis'
  | 'ZAxis'
  | 'CartesianGrid'
  | 'Scatter'
  | 'Brush'

type PolarType = 'Radar' | 'PolarGrid' | 'PolarAngleAxis' | 'PolarRadiusAxis'

type ComponentType =
  | 'Tooltip'
  | 'Legend'
  | 'ResponsiveContainer'
  | 'Cell'
  | 'Label'
  | 'LabelList'
  | 'ReferenceLine'
  | 'ReferenceArea'
  | 'ReferenceDot'

type RechartsComponent = ChartType | CartesianType | PolarType | ComponentType

export type { RechartsComponent }

interface RechartsComponents {
  [key: string]: React.ComponentType<Record<string, unknown>>
}

interface UseRechartsOptions {
  components: RechartsComponent[]
}

interface UseRechartsResult {
  components: RechartsComponents | null
  isLoading: boolean
  error: Error | null
}

const componentPaths: Record<RechartsComponent, () => Promise<{ [key: string]: unknown }>> = {
  BarChart: () => import('recharts/es6/chart/BarChart'),
  LineChart: () => import('recharts/es6/chart/LineChart'),
  PieChart: () => import('recharts/es6/chart/PieChart'),
  AreaChart: () => import('recharts/es6/chart/AreaChart'),
  RadarChart: () => import('recharts/es6/chart/RadarChart'),
  ScatterChart: () => import('recharts/es6/chart/ScatterChart'),
  ComposedChart: () => import('recharts/es6/chart/ComposedChart'),
  Bar: () => import('recharts/es6/cartesian/Bar'),
  Line: () => import('recharts/es6/cartesian/Line'),
  Area: () => import('recharts/es6/cartesian/Area'),
  XAxis: () => import('recharts/es6/cartesian/XAxis'),
  YAxis: () => import('recharts/es6/cartesian/YAxis'),
  ZAxis: () => import('recharts/es6/cartesian/ZAxis'),
  CartesianGrid: () => import('recharts/es6/cartesian/CartesianGrid'),
  Scatter: () => import('recharts/es6/cartesian/Scatter'),
  Radar: () => import('recharts/es6/polar/Radar'),
  Tooltip: () => import('recharts/es6/component/Tooltip'),
  Legend: () => import('recharts/es6/component/Legend'),
  ResponsiveContainer: () => import('recharts/es6/component/ResponsiveContainer'),
  Cell: () => import('recharts/es6/component/Cell'),
  Label: () => import('recharts/es6/component/Label'),
  LabelList: () => import('recharts/es6/component/LabelList'),
  ReferenceLine: () => import('recharts/es6/cartesian/ReferenceLine'),
  ReferenceArea: () => import('recharts/es6/cartesian/ReferenceArea'),
  ReferenceDot: () => import('recharts/es6/cartesian/ReferenceDot'),
  Brush: () => import('recharts/es6/cartesian/Brush'),
  PolarGrid: () => import('recharts/es6/polar/PolarGrid'),
  PolarAngleAxis: () => import('recharts/es6/polar/PolarAngleAxis'),
  PolarRadiusAxis: () => import('recharts/es6/polar/PolarRadiusAxis'),
}

const globalComponentCache: Map<
  RechartsComponent,
  React.ComponentType<Record<string, unknown>>
> = new Map()
const pendingLoads: Map<RechartsComponent, Promise<void>> = new Map()

async function loadComponent(name: RechartsComponent): Promise<void> {
  if (globalComponentCache.has(name)) {
    return
  }

  if (pendingLoads.has(name)) {
    return pendingLoads.get(name)!
  }

  const loader = componentPaths[name]
  if (!loader) {
    throw new Error(`Unknown Recharts component: ${name}`)
  }

  const promise = loader().then(module => {
    const component = module[name] as React.ComponentType<Record<string, unknown>>
    globalComponentCache.set(name, component)
    pendingLoads.delete(name)
  })

  pendingLoads.set(name, promise)
  return promise
}

export function useRecharts({
  components: requiredComponents,
}: UseRechartsOptions): UseRechartsResult {
  const allLoaded = useMemo(
    () => requiredComponents.every(c => globalComponentCache.has(c)),
    [requiredComponents]
  )
  const [isLoading, setIsLoading] = useState(!allLoaded)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  const componentKey = useMemo(() => [...requiredComponents].sort().join(','), [requiredComponents])

  useEffect(() => {
    isMountedRef.current = true

    const componentsToLoad = componentKey.split(',').filter(Boolean) as RechartsComponent[]
    const currentAllLoaded = componentsToLoad.every(c => globalComponentCache.has(c))

    if (currentAllLoaded) {
      return
    }

    const loadAllComponents = async () => {
      setError(null)
      try {
        await Promise.all(componentsToLoad.map(loadComponent))

        if (!isMountedRef.current) return

        setIsLoading(false)
      } catch (err) {
        if (!isMountedRef.current) return
        const loadError =
          err instanceof Error ? err : new Error('Failed to load Recharts components')
        logger.error('Failed to load Recharts components:', loadError)
        setError(loadError)
        setIsLoading(false)
      }
    }

    loadAllComponents()

    return () => {
      isMountedRef.current = false
    }
  }, [componentKey])

  const loadedComponents = useMemo(() => {
    const result: RechartsComponents = {}
    for (const name of requiredComponents) {
      const cached = globalComponentCache.get(name)
      if (cached) {
        result[name] = cached
      }
    }
    return Object.keys(result).length === requiredComponents.length ? result : null
  }, [requiredComponents])

  return {
    components: loadedComponents,
    isLoading,
    error,
  }
}
