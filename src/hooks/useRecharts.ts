import { useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/logger';

type ChartType = 
  | 'BarChart'
  | 'LineChart'
  | 'PieChart'
  | 'AreaChart'
  | 'RadarChart'
  | 'ScatterChart'
  | 'ComposedChart';

type CartesianType = 
  | 'Bar'
  | 'Line'
  | 'Area'
  | 'XAxis'
  | 'YAxis'
  | 'ZAxis'
  | 'CartesianGrid'
  | 'Scatter'
  | 'Brush';

type PolarType =
  | 'Radar'
  | 'PolarGrid'
  | 'PolarAngleAxis'
  | 'PolarRadiusAxis';

type ComponentType = 
  | 'Tooltip'
  | 'Legend'
  | 'ResponsiveContainer'
  | 'Cell'
  | 'Label'
  | 'LabelList'
  | 'ReferenceLine'
  | 'ReferenceArea'
  | 'ReferenceDot';

type RechartsComponent = ChartType | CartesianType | PolarType | ComponentType;

export type { RechartsComponent };

interface RechartsComponents {
  [key: string]: React.ComponentType<Record<string, unknown>>;
}

interface UseRechartsOptions {
  components: RechartsComponent[];
}

interface UseRechartsResult {
  components: RechartsComponents | null;
  isLoading: boolean;
  error: Error | null;
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
};

export function useRecharts({ components: requiredComponents }: UseRechartsOptions): UseRechartsResult {
  const [loadedComponents, setLoadedComponents] = useState<RechartsComponents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const componentKey = useMemo(() => [...requiredComponents].sort().join(','), [requiredComponents]);

  useEffect(() => {
    let cancelled = false;

    const loadComponents = async () => {
      setIsLoading(true);
      setError(null);

      const componentsToLoad = componentKey.split(',').filter(Boolean) as RechartsComponent[];

      try {
        const imports = componentsToLoad.map(async (componentName) => {
          const moduleLoader = componentPaths[componentName];
          if (!moduleLoader) {
            throw new Error(`Unknown Recharts component: ${componentName}`);
          }
          const module = await moduleLoader();
          return [componentName, module[componentName]] as const;
        });

        const results = await Promise.all(imports);
        
        if (cancelled) return;

        const componentsMap: RechartsComponents = {};
        
        for (const [name, component] of results) {
          componentsMap[name] = component as React.ComponentType<Record<string, unknown>>;
        }

        setLoadedComponents(componentsMap);
      } catch (err) {
        if (cancelled) return;
        const loadError = err instanceof Error ? err : new Error('Failed to load Recharts components');
        logger.error('Failed to load Recharts components:', loadError);
        setError(loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadComponents();

    return () => {
      cancelled = true;
    };
  }, [componentKey]);

  return {
    components: loadedComponents,
    isLoading,
    error,
  };
}
