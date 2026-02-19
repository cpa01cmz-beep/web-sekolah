import { useMemo, useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export function useChartData<T extends Record<string, unknown>>(
  data: T[] | undefined,
  isLoading: boolean,
  error: Error | null
) {
  return useMemo(() => {
    if (isLoading) return { status: 'loading' as const, data: null };
    if (error) return { status: 'error' as const, data: null };
    if (!data || data.length === 0) return { status: 'empty' as const, data: null };
    return { status: 'ready' as const, data };
  }, [data, isLoading, error]);
}

type ChartComponentType = 
  | 'LineChart' | 'BarChart' | 'PieChart' | 'AreaChart' | 'RadarChart' | 'ScatterChart'
  | 'Line' | 'Bar' | 'Pie' | 'Area' | 'Radar' | 'Scatter'
  | 'XAxis' | 'YAxis' | 'ZAxis' | 'CartesianGrid' | 'PolarGrid' | 'PolarAngleAxis' | 'PolarRadiusAxis'
  | 'Tooltip' | 'Legend' | 'ResponsiveContainer' | 'Cell'
  | 'ReferenceLine' | 'Brush' | 'ErrorBar';

type ChartComponentsMap = Partial<Record<ChartComponentType, React.ComponentType<Record<string, unknown>>>>;

export function useChartComponents<T extends ChartComponentType>(
  componentNames: readonly T[]
): {
  components: Pick<ChartComponentsMap, T> | null;
  isLoading: boolean;
} {
  const [components, setComponents] = useState<Pick<ChartComponentsMap, T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadComponents = useCallback(async () => {
    try {
      const imports = await Promise.all(
        componentNames.map(async (name) => {
          const module = await importComponent(name);
          return [name, module] as const;
        })
      );

      const loadedComponents = Object.fromEntries(imports) as Pick<ChartComponentsMap, T>;
      setComponents(loadedComponents);
    } catch (error) {
      logger.error('Failed to load chart components:', error);
      setComponents(null);
    } finally {
      setIsLoading(false);
    }
  }, [componentNames]);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  return { components, isLoading };
}

async function importComponent(name: ChartComponentType): Promise<React.ComponentType<Record<string, unknown>>> {
  const imports: Record<ChartComponentType, () => Promise<{ [key: string]: React.ComponentType<Record<string, unknown>> }>> = {
    LineChart: () => import('recharts/es6/chart/LineChart'),
    BarChart: () => import('recharts/es6/chart/BarChart'),
    PieChart: () => import('recharts/es6/chart/PieChart'),
    AreaChart: () => import('recharts/es6/chart/AreaChart'),
    RadarChart: () => import('recharts/es6/chart/RadarChart'),
    ScatterChart: () => import('recharts/es6/chart/ScatterChart'),
    Line: () => import('recharts/es6/cartesian/Line'),
    Bar: () => import('recharts/es6/cartesian/Bar'),
    Pie: () => import('recharts/es6/polar/Pie'),
    Area: () => import('recharts/es6/cartesian/Area'),
    Radar: () => import('recharts/es6/polar/Radar'),
    Scatter: () => import('recharts/es6/cartesian/Scatter'),
    XAxis: () => import('recharts/es6/cartesian/XAxis'),
    YAxis: () => import('recharts/es6/cartesian/YAxis'),
    ZAxis: () => import('recharts/es6/cartesian/ZAxis'),
    CartesianGrid: () => import('recharts/es6/cartesian/CartesianGrid'),
    PolarGrid: () => import('recharts/es6/polar/PolarGrid'),
    PolarAngleAxis: () => import('recharts/es6/polar/PolarAngleAxis'),
    PolarRadiusAxis: () => import('recharts/es6/polar/PolarRadiusAxis'),
    Tooltip: () => import('recharts/es6/component/Tooltip'),
    Legend: () => import('recharts/es6/component/Legend'),
    ResponsiveContainer: () => import('recharts/es6/component/ResponsiveContainer'),
    Cell: () => import('recharts/es6/component/Cell'),
    ReferenceLine: () => import('recharts/es6/cartesian/ReferenceLine'),
    Brush: () => import('recharts/es6/cartesian/Brush'),
    ErrorBar: () => import('recharts/es6/cartesian/ErrorBar'),
  };

  const module = await imports[name]();
  return module[name];
}
