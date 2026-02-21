'use client';

/**
 * IncomeDistributionChart - Bar chart showing income per capita by class
 *
 * Shows the income distribution across classes at a specific point in time.
 * Uses horizontal bar chart to emphasize the income gap.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CLASS_COLORS, ClassTier } from '@/lib/simulation/types';
import {
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_STYLE,
  CHART_GRID_STYLE,
} from './chartStyles';

interface IncomeDataPoint {
  tier: ClassTier;
  displayName: string;
  income: number;
}

interface IncomeDistributionChartProps {
  /** Data with tier, displayName, and income */
  data: IncomeDataPoint[];
  /** Optional height */
  height?: number;
  /** Current year for display */
  year?: number;
}

export function IncomeDistributionChart({
  data,
  height = 300,
  year,
}: IncomeDistributionChartProps) {
  // Sort by income descending for better visualization
  const sortedData = [...data].sort((a, b) => b.income - a.income);

  const chartTitle = `Income Per Capita${year !== undefined ? ` (Year ${year})` : ''}`;

  return (
    <div className="w-full" role="figure" aria-label={chartTitle}>
      <h3 className="mb-4 font-orbitron text-base uppercase tracking-wide text-white">
        {chartTitle}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid {...CHART_GRID_STYLE} horizontal />
          <XAxis
            type="number"
            {...CHART_AXIS_STYLE}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            {...CHART_AXIS_STYLE}
            fontSize={11}
            width={90}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number) => [
              `${value.toLocaleString()} credits/month`,
              'Income',
            ]}
          />
          <Bar dataKey="income" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry) => (
              <Cell
                key={entry.tier}
                fill={CLASS_COLORS[entry.tier]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center">
        <span className="text-sm text-white/60 italic">
          Monthly income in credits per capita
        </span>
      </div>
    </div>
  );
}

export default IncomeDistributionChart;
