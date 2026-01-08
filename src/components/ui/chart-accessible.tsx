import { memo } from 'react';

interface AccessibleChartProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleChart = memo(function AccessibleChart({ 
  title, 
  description, 
  children, 
  className 
}: AccessibleChartProps) {
  return (
    <div 
      className={className}
      role="img"
      aria-label={title}
      aria-describedby={description ? 'chart-description' : undefined}
    >
      {description && (
        <p id="chart-description" className="sr-only">
          {description}
        </p>
      )}
      {children}
    </div>
  );
});
AccessibleChart.displayName = 'AccessibleChart';

interface ChartDataFallbackProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

export const ChartDataFallback = memo(function ChartDataFallback({ 
  data, 
  title 
}: ChartDataFallbackProps) {
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      <h3>Chart Data: {title}</h3>
      <table role="table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
ChartDataFallback.displayName = 'ChartDataFallback';

interface ChartLegendProps {
  items: Array<{ name: string; color: string; value?: number }>;
  className?: string;
}

export const ChartLegend = memo(function ChartLegend({ 
  items, 
  className 
}: ChartLegendProps) {
  return (
    <div className={className} role="list" aria-label="Chart legend">
      <div className="flex flex-wrap gap-4 justify-center">
        {items.map((item) => (
          <div 
            key={item.name} 
            className="flex items-center gap-2"
            role="listitem"
          >
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground">
              {item.name}
              {item.value !== undefined && ` (${item.value})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
ChartLegend.displayName = 'ChartLegend';

interface BarChartWrapperProps {
  data: Array<{ name: string; students: number }>;
  title: string;
  description?: string;
  className?: string;
}

export function BarChartWrapper({ 
  data, 
  title, 
  description,
  className 
}: BarChartWrapperProps) {
  const chartDescription = description || `Bar chart showing ${data.map(d => `${d.name}: ${d.students}`).join(', ')}`;
  
  return (
    <AccessibleChart title={title} description={chartDescription} className={className}>
      <ChartDataFallback 
        data={data.map(d => ({ name: d.name, value: d.students }))}
        title={title}
      />
    </AccessibleChart>
  );
}
