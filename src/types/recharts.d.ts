import type { 
  BarChartProps, 
  BarProps, 
  XAxisProps, 
  YAxisProps, 
  CartesianGridProps,
  TooltipProps,
  LegendProps,
  ResponsiveContainerProps 
} from 'recharts';

declare module 'recharts/es6/chart/BarChart' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  export const BarChart: ForwardRefExoticComponent<BarChartProps & RefAttributes<SVGSVGElement>>;
}

declare module 'recharts/es6/cartesian/Bar' {
  import { FC } from 'react';
  export const Bar: FC<BarProps>;
}

declare module 'recharts/es6/cartesian/XAxis' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  export const XAxis: ForwardRefExoticComponent<XAxisProps & RefAttributes<SVGSVGElement>>;
}

declare module 'recharts/es6/cartesian/YAxis' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  export const YAxis: ForwardRefExoticComponent<YAxisProps & RefAttributes<SVGSVGElement>>;
}

declare module 'recharts/es6/cartesian/CartesianGrid' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  export const CartesianGrid: ForwardRefExoticComponent<CartesianGridProps & RefAttributes<SVGSVGElement>>;
}

declare module 'recharts/es6/component/Tooltip' {
  import { FC } from 'react';
  export const Tooltip: FC<TooltipProps<number, string>>;
}

declare module 'recharts/es6/component/Legend' {
  import { FC } from 'react';
  export const Legend: FC<LegendProps>;
}

declare module 'recharts/es6/component/ResponsiveContainer' {
  import { FC } from 'react';
  export const ResponsiveContainer: FC<ResponsiveContainerProps>;
}
