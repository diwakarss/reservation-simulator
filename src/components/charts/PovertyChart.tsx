'use client';

/**
 * PovertyChart - Line chart showing poverty rates over time
 *
 * Tracks poverty percentage for each class tier over the simulation timeline.
 * Note: Lower values are better for poverty.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CLASS_COLORS, ClassTier, CLASS_TIER_ORDER } from '@/lib/simulation/types';
import type { ChartDataPoint } from '@/lib/simulation/types';
import { ChartLegend } from './ChartLegend';
import { ChartDataTable } from './ChartDataTable';
import {
  CHART_TOOLTIP_STYLE,
  CHART_LABEL_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_MARGIN,
} from './chartStyles';

interface PovertyChartProps {
  /** Data points with year and class values */
  data: ChartDataPoint[];
  /** Class display names for legend */
  classNames: Record<ClassTier, string>;
  /** Optional height */
  height?: number;
}

export function PovertyChart({
  data,
  classNames,
  height = 300,
}: PovertyChartProps) {
  const chartTitle = 'Poverty Rate Over Time';

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <ChartDataTable
        title={chartTitle}
        data={data}
        classNames={classNames}
        formatValue={(v) => v.toFixed(1)}
        unit="%"
      />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis dataKey="year" {...CHART_AXIS_STYLE} />
          <YAxis
            domain={[0, 100]}
            {...CHART_AXIS_STYLE}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_LABEL_STYLE}
            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
            labelFormatter={(year) => `Year ${year}`}
          />
          {CLASS_TIER_ORDER.map((tier) => (
            <Line
              key={tier}
              type="monotone"
              dataKey={tier}
              name={classNames[tier]}
              stroke={CLASS_COLORS[tier]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center">
        <span className="text-xs text-muted-text italic">
          Lower values indicate less poverty
        </span>
      </div>
      <ChartLegend classNames={classNames} />
    </div>
  );
}

export default PovertyChart;
