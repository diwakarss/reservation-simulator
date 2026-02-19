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

  return (
    <div className="w-full">
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        Income Per Capita {year !== undefined && `(Year ${year})`}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" horizontal />
          <XAxis
            type="number"
            stroke="#a7a7c4"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#a7a7c4"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#f0f0ff',
            }}
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
        <span className="text-xs text-muted-text italic">
          Monthly income in credits per capita
        </span>
      </div>
    </div>
  );
}

export default IncomeDistributionChart;
