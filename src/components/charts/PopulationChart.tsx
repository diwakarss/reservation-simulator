'use client';

/**
 * PopulationChart - Stacked area chart showing population distribution
 *
 * Shows how the population is distributed across classes.
 * Note: Population percentages remain constant in this simulation model,
 * so this chart shows the stable distribution over time.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CLASS_COLORS, ClassTier, CLASS_TIER_ORDER } from '@/lib/simulation/types';
import type { ChartDataPoint } from '@/lib/simulation/types';
import { ChartLegend } from './ChartLegend';
import {
  CHART_TOOLTIP_STYLE,
  CHART_LABEL_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
  CHART_MARGIN,
} from './chartStyles';

interface PopulationChartProps {
  /** Data points with year and class population values */
  data: ChartDataPoint[];
  /** Class display names for legend */
  classNames: Record<ClassTier, string>;
  /** Optional height */
  height?: number;
}

export function PopulationChart({
  data,
  classNames,
  height = 300,
}: PopulationChartProps) {
  const chartTitle = 'Population Distribution';

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={CHART_MARGIN} stackOffset="expand">
          <CartesianGrid {...CHART_GRID_STYLE} />
          <XAxis dataKey="year" {...CHART_AXIS_STYLE} />
          <YAxis
            {...CHART_AXIS_STYLE}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_LABEL_STYLE}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
            labelFormatter={(year) => `Year ${year}`}
          />
          {/* Render in reverse order so upper is on top visually */}
          {[...CLASS_TIER_ORDER].reverse().map((tier) => (
            <Area
              key={tier}
              type="monotone"
              dataKey={tier}
              name={classNames[tier]}
              stackId="1"
              stroke={CLASS_COLORS[tier]}
              fill={CLASS_COLORS[tier]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend classNames={classNames} />
    </div>
  );
}

export default PopulationChart;
