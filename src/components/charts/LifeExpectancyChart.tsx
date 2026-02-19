'use client';

/**
 * LifeExpectancyChart - Multi-line chart showing life expectancy over time
 *
 * Tracks average life expectancy in years for each class tier.
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

interface LifeExpectancyChartProps {
  /** Data points with year and class values */
  data: ChartDataPoint[];
  /** Class display names for legend */
  classNames: Record<ClassTier, string>;
  /** Optional height */
  height?: number;
}

export function LifeExpectancyChart({
  data,
  classNames,
  height = 300,
}: LifeExpectancyChartProps) {
  return (
    <div className="w-full">
      <h3 className="mb-4 font-orbitron text-sm uppercase tracking-wide text-white">
        Life Expectancy Over Time
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="year"
            stroke="#a7a7c4"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
          />
          <YAxis
            domain={[50, 85]}
            stroke="#a7a7c4"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#2a2a4a' }}
            tickFormatter={(value) => `${value}yr`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#f0f0ff',
            }}
            labelStyle={{ color: '#a7a7c4' }}
            formatter={(value: number) => [`${value.toFixed(1)} years`, '']}
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
      <ChartLegend classNames={classNames} />
    </div>
  );
}

export default LifeExpectancyChart;
